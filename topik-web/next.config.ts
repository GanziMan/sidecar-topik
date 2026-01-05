import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // eslint 무시
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qyztgmuupnjuhwrboaei.supabase.co",
      },
    ],
  },
};

export default nextConfig;
