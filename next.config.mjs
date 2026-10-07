/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["pdf-parse"]
};

export default nextConfig;
