import "../styles/globals.css";
import type { AppProps } from "next/app";
import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import type { AppRouter } from "./api/trpc/[trpc]";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = process.env.RAILWAY_STATIC_URL
      ? `https://${process.env.RAILWAY_STATIC_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";
    return { url, fetch };
  },
  ssr: false,
})(MyApp);
