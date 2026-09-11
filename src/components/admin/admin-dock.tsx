"use client";

import { useRouter } from "next/navigation";
import {
    Users, FileText, DollarSign, MessageSquare,
    Kanban, FolderOpen, CalendarDays, Settings,
} from "lucide-react";
import Dock from "@/components/reactbits/Dock";

export default function AdminDock() {
    const router = useRouter();

    const items = [
        { icon: Users, label: "Clientes", onClick: () => router.push("/admin/clients") },
        { icon: Kanban, label: "Pipeline", onClick: () => router.push("/admin/pipeline") },
        { icon: DollarSign, label: "Pagos", onClick: () => router.push("/admin/payments") },
        { icon: FileText, label: "Documentos", onClick: () => router.push("/admin/documents") },
        { icon: MessageSquare, label: "Mensajes", onClick: () => router.push("/admin/messages") },
        { icon: FolderOpen, label: "Proyectos", onClick: () => router.push("/admin/clients") },
        { icon: CalendarDays, label: "Calendario", onClick: () => router.push("/admin/calendar") },
        { icon: Settings, label: "Configuración", onClick: () => router.push("/admin/settings") },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Dock items={items} baseSize={44} hoverScale={1.4} />
        </div>
    );
}
