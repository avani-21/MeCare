import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: {
  //   buildActivity: false, 
  // }
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
