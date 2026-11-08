import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["text-fade-in"],
  // Writing now lives on the About page.
  async redirects() {
    return [{ source: "/writing", destination: "/about", permanent: false }];
  },
};

export default nextConfig;
