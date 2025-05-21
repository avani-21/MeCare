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
  output:'standalone'
};

export default nextConfig;
