import { env } from "@/env.mjs";
import Ably from "ably/promises";
import type { NextApiRequest, NextApiResponse } from "next";

const options: Ably.Types.ClientOptions = { key: env.NEXT_PUBLIC_ABLY_API_KEY };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new Ably.Realtime(options);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: req.query.clientId as string,
  });
  res.status(200).json(tokenRequestData);
}
