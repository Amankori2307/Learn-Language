import type { NextApiRequest, NextApiResponse } from "next";
import { getNestExpressApp } from "../../server/src/bootstrap/nest-app";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nestExpressApp = await getNestExpressApp();
  return nestExpressApp(req as never, res as never);
}
