import type { NextApiRequest, NextApiResponse } from "next";
import { getExpressApp } from "../../server/express-app";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expressApp = await getExpressApp();
  return expressApp(req as never, res as never);
}

