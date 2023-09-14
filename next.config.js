/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {domains: ['cdn.akamai.steamstatic.com']},
  devIndicators: {buildActivity: true}
}

module.exports = nextConfig
