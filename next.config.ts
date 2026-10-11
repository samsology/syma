import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-*',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/manage-curriculum',
        destination: '/admin/curriculum',
        permanent: false,
      },
      {
        source: '/curriculum',
        destination: '/admin/curriculum',
        permanent: false,
      },
      {
        source: '/student/dashboard',
        destination: '/student',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
