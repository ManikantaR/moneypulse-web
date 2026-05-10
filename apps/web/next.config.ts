import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
    resolveAlias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
};

export default nextConfig;
