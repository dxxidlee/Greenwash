/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    externalDir: true
  },
  output: 'export',
  trailingSlash: true,
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/breakroom-vr/**', '**/huescan-camera/**']
    }
    return config
  }
}

module.exports = nextConfig
