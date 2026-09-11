"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserPlus, Mail, Pen, CreditCard, MessageSquare, Gift, Star, Upload, FolderOpen,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  icon: typeof UserPlus;
  color: string;
  bg: string;
  label: string;
  date: string;
}

export default function ClientActivityTimeline({ clientId, createdAt, welcomeEmailSentAt }: {
  clientId: string;
  createdAt: string;
  welcomeEmailSentAt?: string;
}) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const items: TimelineEvent[] = [];

      // Client created
      items.push({
        id: "created",
        icon: UserPlus,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        label: "Cliente creado",
        date: createdAt,
      });

      // Welcome email
      if (welcomeEmailSentAt) {
        items.push({
          id: "welcome-email",
          icon: Mail,
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          label: "Email de bienvenida enviado",
          date: welcomeEmailSentAt,
        });
      }

      // Signed contracts
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, signed_at")
        .eq("client_id", clientId)
        .eq("signed", true)
        .not("signed_at", "is", null);

      docs?.forEach((d) => {
        items.push({
          id: `doc-${d.id}`,
          icon: Pen,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          label: `Contrato firmado: "${d.title}"`,
          date: d.signed_at!,
        });
      });

      // Payments
      const { data: pays } = await supabase
        .from("payments")
        .select("id, concept, amount, status, created_at")
        .eq("client_id", clientId);

      pays?.forEach((p) => {
        const amount = Number(p.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 });
        items.push({
          id: `pay-${p.id}`,
          icon: CreditCard,
          color: "text-northpeak-green",
          bg: "bg-northpeak-green/10",
          label: `Pago: ${p.concept} — $${amount} (${p.status === "completed" ? "pagado" : p.status})`,
          date: p.created_at,
        });
      });

      // Messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_role, created_at")
        .eq("client_id", clientId);

      msgs?.forEach((m) => {
        items.push({
          id: `msg-${m.id}`,
          icon: MessageSquare,
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          label: m.sender_role === "client" ? "Mensaje enviado por el cliente" : "Mensaje enviado por admin",
          date: m.created_at,
        });
      });

      // Referrals
      const { data: refs } = await supabase
        .from("referrals")
        .select("id, referred_name, created_at")
        .eq("client_id", clientId);

      refs?.forEach((r) => {
        items.push({
          id: `ref-${r.id}`,
          icon: Gift,
          color: "text-orange-400",
          bg: "bg-orange-400/10",
          label: `Referido enviado: ${r.referred_name}`,
          date: r.created_at,
        });
      });

      // Testimonials
      const { data: tests } = await supabase
        .from("testimonials")
        .select("id, title, submitted_at")
        .eq("client_id", clientId);

      tests?.forEach((t) => {
        items.push({
          id: `test-${t.id}`,
          icon: Star,
          color: "text-yellow-400",
          bg: "bg-yellow-400/10",
          label: `Reseña: "${t.title}"`,
          date: t.submitted_at,
        });
      });

      // File uploads
      const { data: files } = await supabase
        .from("media")
        .select("id, name, uploaded_by, created_at")
        .eq("client_id", clientId);

      files?.forEach((f) => {
        items.push({
          id: `file-${f.id}`,
          icon: Upload,
          color: "text-indigo-400",
          bg: "bg-indigo-400/10",
          label: `Archivo ${f.uploaded_by === "client" ? "subido por cliente" : "subido"}: ${f.name}`,
          date: f.created_at,
        });
      });

      // Projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, status, created_at")
        .eq("client_id", clientId);

      projects?.forEach((p) => {
        items.push({
          id: `proj-${p.id}`,
          icon: FolderOpen,
          color: "text-teal-400",
          bg: "bg-teal-400/10",
          label: `Proyecto creado: "${p.name}"`,
          date: p.created_at,
        });
      });

      // Sort chronologically (oldest first)
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(items);
      setLoading(false);
    }

    load();
  }, [clientId, createdAt, welcomeEmailSentAt]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-northpeak-surface shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-northpeak-surface" />
              <div className="h-2 w-1/4 rounded bg-northpeak-surface" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-northpeak-text-muted text-sm py-4">Sin actividad registrada.</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-northpeak-surface" />

      <div className="space-y-4">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative flex items-start gap-3">
              <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${event.bg} shrink-0 -ml-6`}>
                <Icon className={`h-4 w-4 ${event.color}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-northpeak-text">{event.label}</p>
                <p className="text-xs text-northpeak-text-dim mt-0.5">
                  {new Date(event.date).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
