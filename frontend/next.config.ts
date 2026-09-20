import type { NextConfig } from "next";

const backendUrl = new URL(
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"
);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
      protocol: "https",
      hostname: "gyandeep.pythonanywhere.com",
      pathname: "/media/**",
    },
    {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;