/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
      {
        source: "/privacidad",
        destination: "/privacidad.html",
      },
    ];
  },
};

export default nextConfig;
