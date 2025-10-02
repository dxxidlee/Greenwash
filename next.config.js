/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/Greenwash',
  assetPrefix: '/Greenwash/',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
