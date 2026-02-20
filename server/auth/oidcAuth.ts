import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { getAuthConfig } from "../config";
import { sendError } from "../http";
import { resolveRoleFromEmail } from "./roles";

const authConfig = getAuthConfig();

const getOidcConfig = memoize(
  async () => {
    if (!authConfig.ISSUER_URL || !authConfig.CLIENT_ID) {
      throw new Error("OIDC config is not available for current auth provider");
    }

    return await client.discovery(
      new URL(authConfig.ISSUER_URL),
      authConfig.CLIENT_ID,
      authConfig.CLIENT_SECRET
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: authConfig.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: authConfig.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: "auto",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const email = claims["email"] as string | undefined;
  const role = resolveRoleFromEmail(email ?? null);

  await authStorage.upsertUser({
    id: claims["sub"],
    email,
    firstName: claims["first_name"] ?? claims["given_name"],
    lastName: claims["last_name"] ?? claims["family_name"],
    profileImageUrl: claims["profile_image_url"] ?? claims["picture"],
    role,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (authConfig.AUTH_PROVIDER === "dev") {
    app.get("/api/login", (_req, res) => res.redirect("/"));
    app.get("/api/callback", (_req, res) => res.redirect("/"));
    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });
    return;
  }

  const oidcConfig = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (req: any) => {
    const strategyName = `google:${req.hostname}`;
    if (!registeredStrategies.has(strategyName)) {
      const callbackURL = `${req.protocol}://${req.get("host")}/api/callback`;
      const scope = "openid email profile";

      const strategy = new Strategy(
        {
          name: strategyName,
          config: oidcConfig,
          scope,
          callbackURL,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req);
    const strategyName = `google:${req.hostname}`;
    const authOptions = {
      prompt: "consent",
      access_type: "offline",
      scope: ["openid", "email", "profile"],
    };

    passport.authenticate(strategyName, authOptions)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req);
    passport.authenticate(`google:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (authConfig.AUTH_PROVIDER === "dev") {
    (req as any).user = {
      claims: {
        sub: "dev-user",
        email: "dev@example.com",
        first_name: "Dev",
        last_name: "User",
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
    return;
  }

  try {
    const oidcConfig = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(oidcConfig, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
    return;
  }
};
