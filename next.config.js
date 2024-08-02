const nextConfig = {
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
}

module.exports = nextConfig