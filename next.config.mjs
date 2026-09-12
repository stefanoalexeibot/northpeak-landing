/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/pilates/spgg/diagnostico",
        destination: "/pilates/spgg/diagnostico/index.html",
      },
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
