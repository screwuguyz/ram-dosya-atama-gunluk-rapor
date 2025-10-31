// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Build sırasında lint hatalarını yok say
    // dirs: ["app", "components", "lib"], // istersen sadece bu klasörleri lintle
  },
};

export default nextConfig;
