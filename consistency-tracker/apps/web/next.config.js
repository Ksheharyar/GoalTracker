/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.goaltracker.tech',
          },
        ],
        destination: 'https://goaltracker.tech/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
