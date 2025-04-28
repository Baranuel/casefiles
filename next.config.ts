import type { NextConfig } from "next";
import { loadEnvConfig } from '@next/env'
 
const projectDir = process.cwd()
loadEnvConfig(projectDir)

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
  }
};

export default nextConfig;
