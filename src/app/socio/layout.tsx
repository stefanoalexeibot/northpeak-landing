import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Socio — NorthPeak Digital",
  description: "Portal exclusivo para Socios de NorthPeak Digital",
};

export default function SocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
