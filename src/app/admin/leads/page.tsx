import { createClient } from "@/lib/supabase/server";
import { Zap, MessageSquare, Phone, Calendar, Globe } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  landing: "Landing page",
  analizar: "Analizador",
  referral: "Referido",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Monterrey",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const total = leads?.length ?? 0;
  const today = leads?.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length ?? 0;

  const thisWeek = leads?.filter((l) => {
    const d = new Date(l.created_at);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length ?? 0;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Zap className="h-5 w-5 text-northpeak-green" />
          <h1 className="text-2xl font-heading font-bold text-northpeak-text">Leads</h1>
        </div>
        <p className="text-northpeak-text-muted text-sm">
          Prospectos que dejaron su contacto en la landing page.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total leads", value: total, color: "text-northpeak-text" },
          { label: "Esta semana", value: thisWeek, color: "text-blue-400" },
          { label: "Hoy", value: today, color: "text-northpeak-green" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5">
            <p className={`font-heading font-bold text-3xl ${s.color} leading-none mb-1`}>{s.value}</p>
            <p className="text-xs text-northpeak-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {!leads || leads.length === 0 ? (
        <div className="rounded-xl border border-northpeak-surface bg-northpeak-card p-16 text-center">
          <Zap className="h-8 w-8 text-northpeak-text-dim mx-auto mb-3" />
          <p className="text-northpeak-text-muted">Aún no hay leads registrados.</p>
          <p className="text-northpeak-text-dim text-sm mt-1">Los prospectos que llenen el form de la landing aparecerán aquí.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-northpeak-surface bg-northpeak-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_120px_140px_100px] gap-4 px-5 py-3 border-b border-northpeak-surface bg-northpeak-bg">
            {["Nombre", "WhatsApp", "Fuente", "Fecha", ""].map((h) => (
              <p key={h} className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase">{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-northpeak-surface">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-[1fr_1fr_120px_140px_100px] gap-4 px-5 py-4 items-center hover:bg-northpeak-surface/30 transition-colors"
              >
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-northpeak-green/10 border border-northpeak-green/20">
                    <span className="font-bold text-xs text-northpeak-green">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-northpeak-text truncate">{lead.name}</p>
                </div>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/52${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors group"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 group-hover:text-northpeak-green" />
                  {lead.whatsapp}
                </a>

                {/* Source */}
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-northpeak-text-dim shrink-0" />
                  <span className="text-xs text-northpeak-text-muted">
                    {SOURCE_LABELS[lead.source] ?? lead.source}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-northpeak-text-muted">{formatDate(lead.created_at)}</p>
                  <p className="text-[10px] text-northpeak-text-dim mt-0.5">{timeAgo(lead.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/52${lead.whatsapp.replace(/\D/g, "")}?text=Hola ${encodeURIComponent(lead.name)}, te contactamos de NorthPeak 👋`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    WA
                  </a>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-northpeak-surface text-northpeak-text-dim text-xs">
                    <Calendar className="h-3 w-3" />
                    Nuevo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
