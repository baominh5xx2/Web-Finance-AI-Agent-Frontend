/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tắt cache trong development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules/,
        poll: 1000, // Check for changes every second
      };
    }
    return config;
  },
  // Tắt cache trang
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig
