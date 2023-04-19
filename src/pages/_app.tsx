import { type AppType } from "next/app";
import { configureAbly } from "@ably-labs/react-hooks";
import { api } from "@/utils/api";
import { v4 as uuid } from "uuid";
import "@/styles/globals.css";
import { env } from "@/env.mjs";

const prefix = process.env.API_ROOT || "";

const clientId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

configureAbly({
  authUrl: `${prefix}/api/createTokenRequest?clientId=${clientId}`,
  clientId: clientId,
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
