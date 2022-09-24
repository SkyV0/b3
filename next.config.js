const withAnalyzer = require("@next/bundle-analyzer")({
  enabled:
    process.env.ANALYZE === "true" && process.env.NODE_ENV !== "development",
});
const { withSuperjson } = require("next-superjson");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  images: {
    domains: [],
    minimumCacheTTL: 9999999,
  },
};

module.exports = withSuperjson()(withAnalyzer(nextConfig));
