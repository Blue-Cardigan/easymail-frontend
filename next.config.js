/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    domains: ['resend.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false

    // Add this condition to handle client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      }
    }

    return config
  },
  async rewrites() {
    return [
      {
        source: '/auth/v1/:path*',
        destination: 'https://smjqzxxrfbybbwosytpx.supabase.co/auth/v1/:path*',
      },
    ]
  }
}

module.exports = nextConfig