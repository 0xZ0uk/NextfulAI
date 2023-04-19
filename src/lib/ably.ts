import { env } from "@/env.mjs";
import * as Ably from "ably";

export const ably = new Ably.Realtime({
  key: env.NEXT_PUBLIC_ABLY_API_KEY,
});
