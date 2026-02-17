import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NorthPeak Digital — Portal",
  description: "Portal de clientes NorthPeak Digital",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
