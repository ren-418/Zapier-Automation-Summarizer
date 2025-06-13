import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  dev: {
    allowedDevOrigins: ['http://10.8.2.197:3000']
  }
};

export default nextConfig;
