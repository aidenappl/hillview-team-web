/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['content.hillview.tv']
  }
}

module.exports = nextConfig
