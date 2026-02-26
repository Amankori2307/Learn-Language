import type { NextApiRequest, NextApiResponse } from "next";
import { getNestExpressApp } from "../../server/src/bootstrap/nest-app";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const proxyTarget = process.env.API_PROXY_TARGET?.trim();
  if (proxyTarget) {
    const segments = Array.isArray(req.query.path) ? req.query.path : [];
    const queryIndex = req.url?.indexOf("?") ?? -1;
    const query = queryIndex >= 0 ? req.url?.slice(queryIndex) : "";
    const targetUrl = `${proxyTarget.replace(/\/$/, "")}/api/${segments.join("/")}${query ?? ""}`;

    const method = req.method ?? "GET";
    const canHaveBody = method !== "GET" && method !== "HEAD";
    const bodyBuffer = canHaveBody ? await readRawBody(req) : undefined;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || key.toLowerCase() === "host") {
        continue;
      }
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: bodyBuffer ? new Uint8Array(bodyBuffer) : undefined,
      redirect: "manual",
    });

    res.status(upstream.status);
    const setCookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      res.setHeader("set-cookie", setCookies);
    }

    upstream.headers.forEach((value, key) => {
      const normalized = key.toLowerCase();
      if (normalized === "set-cookie" || normalized === "transfer-encoding") {
        return;
      }
      res.setHeader(key, value);
    });

    const payload = Buffer.from(await upstream.arrayBuffer());
    res.send(payload);
    return;
  }

  const nestExpressApp = await getNestExpressApp();
  return nestExpressApp(req as never, res as never);
}

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
