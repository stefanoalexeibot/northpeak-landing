/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      ...["luminosa", "forma", "alma"].map((template) => ({
        source: "/pilates/spgg/plantillas/" + template,
        destination: "/pilates/spgg/plantillas/" + template + "/index.html",
      })),
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
