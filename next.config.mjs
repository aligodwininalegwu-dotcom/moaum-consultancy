/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // The PDF letter routes read the crest image from disk at runtime.
  outputFileTracingIncludes: {
    "/api/letters/**": ["./src/server/letter-logo.png"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
