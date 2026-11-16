import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Do not announce which framework runs the site
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nobody may put the site in a frame (stops "clickjacking" on buttons such as "Kustuta")
          { key: "X-Frame-Options", value: "DENY" },
          // Browsers must trust the declared file type (matters for the CSV download)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the full address only within the site, only the domain elsewhere
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site needs none of these browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
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
