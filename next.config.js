/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['content.hillview.tv', "google.com"]
  }
}

module.exports = nextConfig
