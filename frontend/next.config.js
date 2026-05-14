/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Image optimization configuration
   * Allows Next.js to serve images from the backend server
   */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },

  /**
   * Disable ESLint during build
   * Remove in production or fix all lint warnings
   */
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["lucide-react"],
};

module.exports = nextConfig;
