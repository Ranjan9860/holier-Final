import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.71", "127.0.0.1", "192.168.1.116", "*.test"],
  images: {
    maximumRedirects: 0,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.ims.test",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
