import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The demo reads from SQLite on every request; keep rendering fully dynamic.
  cacheComponents: false,
  // The app lives in a sub-folder of a larger repo; point tracing at this folder.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
