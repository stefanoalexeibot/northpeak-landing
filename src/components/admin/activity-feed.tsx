"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  MessageSquare, CreditCard, Gift, Star,
  UserPlus, Pen,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "message" | "payment" | "referral" | "document_signed" | "testimonial" | "new_client";
  description: string;
  clientName: string;
  clientId: string;
  timestamp: string;
}

const iconMap = {
  message: { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  payment: { icon: CreditCard, color: "text-northpeak-green", bg: "bg-northpeak-green/10" },
  referral: { icon: Gift, color: "text-orange-400", bg: "bg-orange-400/10" },
  document_signed: { icon: Pen, color: "text-blue-400", bg: "bg-blue-400/10" },
  testimonial: { icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  new_client: { icon: UserPlus, color: "text-purple-400", bg: "bg-purple-400/10" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const items: ActivityItem[] = [];

      // Recent messages from clients
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, content, created_at, client_id, clients(name)")
        .eq("sender_role", "client")
        .order("created_at", { ascending: false })
        .limit(10);

      msgs?.forEach((m) => {
        const clientName = (m.clients as unknown as { name: string } | null)?.name || "Cliente";
        items.push({
          id: `msg-${m.id}`,
          type: "message",
          description: `${clientName} envió un mensaje`,
          clientName,
          clientId: m.client_id,
          timestamp: m.created_at,
        });
      });

      // Recent payments
      const { data: pays } = await supabase
        .from("payments")
        .select("id, amount, status, created_at, client_id, clients(name)")
        .order("created_at", { ascending: false })
        .limit(10);

      pays?.forEach((p) => {
        const clientName = (p.clients as unknown as { name: string } | null)?.name || "Cliente";
        const amount = Number(p.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 });
        items.push({
          id: `pay-${p.id}`,
          type: "payment",
          description: `${clientName} — $${amount} (${p.status === "completed" ? "pagado" : p.status})`,
          clientName,
          clientId: p.client_id,
          timestamp: p.created_at,
        });
      });

      // Recent referrals
      const { data: refs } = await supabase
        .from("referrals")
        .select("id, referred_name, created_at, client_id, clients(name)")
        .order("created_at", { ascending: false })
        .limit(10);

      refs?.forEach((r) => {
        const clientName = (r.clients as unknown as { name: string } | null)?.name || "Cliente";
        items.push({
          id: `ref-${r.id}`,
          type: "referral",
          description: `${clientName} refirió a ${r.referred_name}`,
          clientName,
          clientId: r.client_id,
          timestamp: r.created_at,
        });
      });

      // Recent signed documents
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, signed_at, client_id, clients(name)")
        .eq("signed", true)
        .not("signed_at", "is", null)
        .order("signed_at", { ascending: false })
        .limit(10);

      docs?.forEach((d) => {
        const clientName = (d.clients as unknown as { name: string } | null)?.name || "Cliente";
        items.push({
          id: `doc-${d.id}`,
          type: "document_signed",
          description: `${clientName} firmó "${d.title}"`,
          clientName,
          clientId: d.client_id,
          timestamp: d.signed_at!,
        });
      });

      // Recent testimonials
      const { data: tests } = await supabase
        .from("testimonials")
        .select("id, title, submitted_at, client_id, clients(name)")
        .order("submitted_at", { ascending: false })
        .limit(5);

      tests?.forEach((t) => {
        const clientName = (t.clients as unknown as { name: string } | null)?.name || "Cliente";
        items.push({
          id: `test-${t.id}`,
          type: "testimonial",
          description: `${clientName} dejó una reseña: "${t.title}"`,
          clientName,
          clientId: t.client_id,
          timestamp: t.submitted_at,
        });
      });

      // Recent clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      clients?.forEach((c) => {
        items.push({
          id: `client-${c.id}`,
          type: "new_client",
          description: `Nuevo cliente: ${c.name}`,
          clientName: c.name,
          clientId: c.id,
          timestamp: c.created_at,
        });
      });

      // Sort by timestamp descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(items.slice(0, 20));
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-northpeak-surface" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-northpeak-surface" />
              <div className="h-2 w-1/4 rounded bg-northpeak-surface" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-northpeak-text-muted text-sm py-4">No hay actividad reciente.</p>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const { icon: Icon, color, bg } = iconMap[activity.type];
        return (
          <Link
            key={activity.id}
            href={`/admin/clients/${activity.clientId}`}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-northpeak-surface transition-colors"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-northpeak-text truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-northpeak-text-dim whitespace-nowrap">
              {timeAgo(activity.timestamp)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
