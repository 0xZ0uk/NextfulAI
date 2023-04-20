import { type AppType } from "next/app";
import { configureAbly } from "@ably-labs/react-hooks";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { env } from "@/env.mjs";
import { Analytics } from "@vercel/analytics/react";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const prefix = env.NEXT_PUBLIC_API_ROOT || "/";

const clientId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

configureAbly({
  authUrl: `${prefix}api/createTokenRequest?clientId=${clientId}`,
  key: env.NEXT_PUBLIC_ABLY_API_KEY,
  clientId: clientId,
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
