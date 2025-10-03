/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Match tất cả API routes
        source: '/api/:1*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },  // Dev: *; Prod: specific origins
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, sentry-trace, x-sentry-id' },  // Thêm sentry-trace và x-sentry-id
          { key: 'Access-Control-Allow-Credentials', value: 'true' },  // Nếu dùng auth/cookies
        ],
      },
    ];
  },
}

module.exports = nextConfig