"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const segmentLabels: Record<string, string> = {
    admin: "Admin",
    clients: "Clientes",
    payments: "Pagos",
    leads: "Leads",
    calendar: "Calendario",
    documents: "Documentos",
    referrals: "Referidos",
    messages: "Mensajes",
    testimonials: "Reseñas",
    analizador: "Analizador",
    pipeline: "Pipeline",
    ventas: "Ventas",
    propuestas: "Propuestas",
    vendedores: "Vendedores",
    catalogo: "Catálogo",
    cotizador: "Cotizador",
    reports: "Reportes",
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    // Don't render on dashboard root
    if (segments.length <= 1) return null;

    const crumbs = segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = segmentLabels[seg] || decodeURIComponent(seg);
        const isLast = i === segments.length - 1;
        return { href, label, isLast, isUuid: /^[0-9a-f-]{36}$/.test(seg) };
    });

    return (
        <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-1.5 text-xs text-northpeak-text-muted mb-4 overflow-x-auto"
        >
            <Link
                href="/admin"
                className="flex items-center gap-1 hover:text-northpeak-text transition-colors shrink-0"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>

            {crumbs.slice(1).map((crumb) => (
                <span key={crumb.href} className="flex items-center gap-1.5 shrink-0">
                    <ChevronRight className="h-3 w-3 text-northpeak-text-dim" />
                    {crumb.isLast ? (
                        <span className="text-northpeak-text font-medium truncate max-w-[200px]">
                            {crumb.isUuid ? "Detalle" : crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="hover:text-northpeak-text transition-colors truncate max-w-[200px]"
                        >
                            {crumb.isUuid ? "Detalle" : crumb.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
