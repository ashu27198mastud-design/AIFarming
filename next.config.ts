import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts', 'lucide-react'],
  },
};

export default nextConfig;
