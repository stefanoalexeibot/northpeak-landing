import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Digital Gratuito | NorthPeak Digital",
  description:
    "Analiza la presencia digital de tu negocio en 3 minutos. Obtén un reporte personalizado con las áreas de mejora más importantes.",
};

export default function AnalizarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
