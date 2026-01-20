import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: true,
// });

// module.exports = withBundleAnalyzer(nextConfig);

// "build": "next build --webpack",
