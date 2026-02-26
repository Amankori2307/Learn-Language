import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import jwt from "jsonwebtoken";
import { authStorage } from "./auth.storage";
import { sendError } from "../../common/http";
import { resolveRoleFromEmail } from "./auth.roles";
import { AUTH_SESSION_RULES } from "./auth.constants";
import { UserClaims } from "./auth.types";

export type AuthRuntimeConfig = {
  provider: "google" | "dev";
  googleClientId?: string;
  googleClientSecret?: string;
  googleIssuerUrl: string;
  frontendBaseUrl?: string;
  jwtSecret: string;
  reviewerEmails: Set<string>;
  adminEmails: Set<string>;
};

let authConfig: AuthRuntimeConfig = {
  provider: "dev",
  googleIssuerUrl: "https://accounts.google.com",
  frontendBaseUrl: undefined,
  jwtSecret: "dev-jwt-secret-min-16",
  reviewerEmails: new Set<string>(),
  adminEmails: new Set<string>(),
};

type AuthJwtPayload = UserClaims & {
  exp?: number;
  iat?: number;
};

type PassportUser = {
  claims: UserClaims;
};

const AUTH_TOKEN_COOKIE = "learn_lang_auth";
const AUTH_TOKEN_TTL_MS = AUTH_SESSION_RULES.SESSION_TTL_MS;
const AUTH_TOKEN_TTL_SEC = Math.floor(AUTH_TOKEN_TTL_MS / 1000);
const OAUTH_SESSION_COOKIE = "learn_lang_oauth";
const OAUTH_SESSION_TTL_MS = 10 * 60 * 1000;
const AUTH_GOOGLE_ROUTE = "/auth/google";
const AUTH_GOOGLE_CALLBACK_ROUTE = "/auth/google/callback";
const AUTH_LOGOUT_ROUTE = "/auth/logout";

function getFrontendRedirectUrl(path = "/"): string {
  const base = authConfig.frontendBaseUrl?.trim();
  if (!base) {
    return path;
  }
  return new URL(path, base).toString();
}

function getFrontendAuthRedirectWithToken(token: string): string {
  const base = authConfig.frontendBaseUrl?.trim();
  if (!base) {
    return `/auth#token=${encodeURIComponent(token)}`;
  }

  const url = new URL("/auth", base);
  url.hash = `token=${encodeURIComponent(token)}`;
  return url.toString();
}

const getOidcConfig = memoize(
  async () => {
    if (!authConfig.googleIssuerUrl || !authConfig.googleClientId) {
      throw new Error("OIDC config is not available for current auth provider");
    }

    return await client.discovery(
      new URL(authConfig.googleIssuerUrl),
      authConfig.googleClientId,
      authConfig.googleClientSecret,
    );
  },
  { maxAge: AUTH_SESSION_RULES.OIDC_CONFIG_CACHE_MAX_AGE_MS }
);

function buildClaimsFromOidc(input: any): UserClaims {
  return {
    sub: String(input?.sub ?? ""),
    email: input?.email ?? null,
    first_name: input?.first_name ?? input?.given_name ?? null,
    last_name: input?.last_name ?? input?.family_name ?? null,
    given_name: input?.given_name ?? null,
    family_name: input?.family_name ?? null,
    profile_image_url: input?.profile_image_url ?? input?.picture ?? null,
    picture: input?.picture ?? null,
  };
}

function signAuthToken(claims: UserClaims): string {
  return jwt.sign(claims, authConfig.jwtSecret, {
    algorithm: "HS256",
    expiresIn: AUTH_TOKEN_TTL_SEC,
  });
}

function setAuthCookie(res: any, token: string) {
  res.cookie(AUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_TOKEN_TTL_MS,
    path: "/",
  });
}

function clearAuthCookie(res: any) {
  res.clearCookie(AUTH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
}

function getAuthTokenFromRequest(req: any): string | null {
  const header = req.headers?.authorization;
  if (typeof header === "string" && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  const cookies = parseCookies(req.headers?.cookie);
  const cookieToken = cookies[AUTH_TOKEN_COOKIE];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  return null;
}

async function upsertUser(claims: any) {
  const email = claims["email"] as string | undefined;
  const role = resolveRoleFromEmail(email ?? null, {
    reviewerEmails: authConfig.reviewerEmails,
    adminEmails: authConfig.adminEmails,
  });

  await authStorage.upsertUser({
    id: claims["sub"],
    email,
    firstName: claims["first_name"] ?? claims["given_name"],
    lastName: claims["last_name"] ?? claims["family_name"],
    profileImageUrl: claims["profile_image_url"] ?? claims["picture"],
    role,
  });
}

export async function setupAuth(app: Express, config: AuthRuntimeConfig) {
  authConfig = config;
  app.set("trust proxy", 1);
  app.use(
    session({
      name: OAUTH_SESSION_COOKIE,
      secret: authConfig.jwtSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: OAUTH_SESSION_TTL_MS,
        path: "/",
      },
    }),
  );
  app.use(passport.initialize());

  if (authConfig.provider === "dev") {
    app.get(AUTH_GOOGLE_ROUTE, async (_req, res) => {
      const claims: UserClaims = {
        sub: "dev-user",
        email: "dev@example.com",
        first_name: "Dev",
        last_name: "User",
        given_name: "Dev",
        family_name: "User",
        profile_image_url: null,
        picture: null,
      };
      await upsertUser(claims);
      const signedToken = signAuthToken(claims);
      setAuthCookie(res, signedToken);
      res.redirect(getFrontendAuthRedirectWithToken(signedToken));
    });
    app.get(AUTH_GOOGLE_CALLBACK_ROUTE, (_req, res) => res.redirect(getFrontendRedirectUrl("/")));
    app.post(AUTH_LOGOUT_ROUTE, (_req, res) => {
      clearAuthCookie(res);
      res.status(204).send();
    });
    return;
  }

  const oidcConfig = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const claims = buildClaimsFromOidc(tokens.claims());
    await upsertUser(claims);
    const user: PassportUser = { claims };
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (req: any) => {
    const strategyName = `google:${req.hostname}`;
    if (!registeredStrategies.has(strategyName)) {
      const callbackURL = `${req.protocol}://${req.get("host")}${AUTH_GOOGLE_CALLBACK_ROUTE}`;
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

  app.get(AUTH_GOOGLE_ROUTE, (req, res, next) => {
    ensureStrategy(req);
    const strategyName = `google:${req.hostname}`;
    const authOptions = {
      prompt: "consent",
      access_type: "offline",
      scope: ["openid", "email", "profile"],
    };

    passport.authenticate(strategyName, { ...authOptions, session: false })(req, res, next);
  });

  app.get(AUTH_GOOGLE_CALLBACK_ROUTE, (req, res, next) => {
    ensureStrategy(req);
    const strategyName = `google:${req.hostname}`;
    passport.authenticate(
      strategyName,
      { session: false },
      (error: unknown, user: PassportUser | false) => {
      const oauthError = error as {
        code?: string;
        error?: string;
      } | null;

      if (oauthError?.code === "OAUTH_RESPONSE_BODY_ERROR" && oauthError?.error === "invalid_client") {
        return sendError(
          req,
          res,
          500,
          "INTERNAL_ERROR",
          "Google OAuth client credentials are invalid. Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and callback URI configuration.",
        );
      }

      if (error) {
        return next(error);
      }

      if (!user) {
        return res.redirect(AUTH_GOOGLE_ROUTE);
      }

      const signedToken = signAuthToken(user.claims);
      setAuthCookie(res, signedToken);
      return res.redirect(getFrontendAuthRedirectWithToken(signedToken));
    },
    )(req, res, next);
  });

  app.post(AUTH_LOGOUT_ROUTE, (_req, res) => {
    clearAuthCookie(res);
    res.status(204).send();
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (authConfig.provider === "dev") {
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

  const token = getAuthTokenFromRequest(req);
  if (!token) {
    return sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
  }

  try {
    const payload = jwt.verify(token, authConfig.jwtSecret) as AuthJwtPayload;
    if (!payload?.sub) {
      return sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
    }
    req.user = {
      claims: {
        sub: payload.sub,
        email: payload.email ?? null,
        first_name: payload.first_name ?? payload.given_name ?? null,
        last_name: payload.last_name ?? payload.family_name ?? null,
        given_name: payload.given_name ?? null,
        family_name: payload.family_name ?? null,
        profile_image_url: payload.profile_image_url ?? payload.picture ?? null,
        picture: payload.picture ?? null,
      },
      expires_at: payload.exp,
    };
    return next();
  } catch (_error) {
    return sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
  }
};
