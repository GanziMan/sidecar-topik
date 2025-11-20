import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/question/2025/1/51",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
