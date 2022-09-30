const withAnalyzer = require("@next/bundle-analyzer")({
  enabled:
    process.env.ANALYZE === "true" && process.env.NODE_ENV !== "production",
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
    domains: ["lh3.googleusercontent.com", "platform-lookaside.fbsbx.com"],
    minimumCacheTTL: 9999999,
  },
};
    //set header first to allow request or origin domain (value can be different)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS, DELETE');

//---- other code

 //Preflight CORS handler
    if(req.method === 'OPTIONS') {
        return res.status(200).json(({
            body: "OK"
        }))
    }
module.exports = withSuperjson()(req, res); withAnalyzer(nextConfig);