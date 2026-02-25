import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ecosistema Digital — NorthPeak",
    description:
        "Agente IA + Portal de clientes + Publicidad inteligente + CRM automatizado. El ecosistema completo para que tu negocio venda en piloto automático.",
    openGraph: {
        title: "Ecosistema Digital · NorthPeak",
        description:
            "Conoce las 4 piezas del ecosistema NorthPeak: Agente IA, Portal de clientes, Métricas reales y automatización completa. Live en 7 días.",
        url: "https://www.northpeakdigital.com.mx/ecosistema",
        siteName: "NorthPeak Digital",
        locale: "es_MX",
        type: "website",
        images: [
            {
                url: "https://www.northpeakdigital.com.mx/og-ecosistema.png",
                width: 1200,
                height: 630,
                alt: "Ecosistema Digital NorthPeak",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Ecosistema Digital · NorthPeak",
        description:
            "Agente IA + Portal + Publicidad inteligente · Live en 7 días · northpeakdigital.com.mx",
    },
    alternates: {
        canonical: "https://www.northpeakdigital.com.mx/ecosistema",
    },
};

export default function EcosistemaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
