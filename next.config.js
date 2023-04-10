/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['content.hillview.tv', "google.com"]
  }
}

module.exports = nextConfig
