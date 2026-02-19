import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Star, TrendingUp, Globe, Zap } from "lucide-react";

interface Resultado {
  id: string;
  mes: string;
  categoria: string;
  descripcion: string;
  valor: number | null;
  unidad: string | null;
}

const CATEGORIA_CONFIG: Record<string, { label: string; icon: typeof TrendingUp; color: string; bg: string }> = {
  redes:    { label: "Redes sociales",      icon: Users,       color: "text-purple-400",           bg: "bg-purple-500/10" },
  gmb:      { label: "Google My Business",  icon: MapPin,      color: "text-blue-400",             bg: "bg-blue-500/10" },
  "reseñas":{ label: "Reseñas",             icon: Star,        color: "text-yellow-400",           bg: "bg-yellow-500/10" },
  leads:    { label: "Leads",               icon: TrendingUp,  color: "text-northpeak-green",      bg: "bg-northpeak-green/10" },
  web:      { label: "Web",                 icon: Globe,       color: "text-cyan-400",             bg: "bg-cyan-500/10" },
  otro:     { label: "Otro",               icon: Zap,         color: "text-northpeak-text-muted", bg: "bg-northpeak-surface" },
};

function formatMes(mesStr: string) {
  const [y, m] = mesStr.slice(0, 7).split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

export default async function ResultadosPage() {
  const { supabase, client } = await getClientData();

  const { data: resultados } = await supabase
    .from("resultados_cliente")
    .select("id, mes, categoria, descripcion, valor, unidad")
    .eq("client_id", client.id)
    .order("mes", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (resultados || []) as Resultado[];

  // Group by month
  const grouped = rows.reduce<Record<string, Resultado[]>>((acc, r) => {
    const key = r.mes.slice(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-northpeak-text font-heading">Resultados</h1>
        <p className="text-northpeak-text-muted text-sm mt-1">
          Aquí encontrarás los logros y avances registrados mes a mes por el equipo de NorthPeak.
        </p>
      </div>

      {months.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="py-16 text-center">
            <TrendingUp className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted font-medium">Aún no hay resultados registrados</p>
            <p className="text-northpeak-text-dim text-sm mt-1">
              El equipo de NorthPeak registrará tus logros aquí cada mes.
            </p>
          </CardContent>
        </Card>
      ) : (
        months.map(ym => (
          <div key={ym} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-northpeak-text capitalize">
                {formatMes(ym)}
              </h2>
              <div className="flex-1 h-px bg-northpeak-surface" />
              <span className="text-xs text-northpeak-text-dim">
                {grouped[ym].length} resultado{grouped[ym].length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {grouped[ym].map(r => {
                const cfg = CATEGORIA_CONFIG[r.categoria] || CATEGORIA_CONFIG.otro;
                const Icon = cfg.icon;
                return (
                  <Card key={r.id} className="bg-northpeak-card border-northpeak-surface">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${cfg.bg}`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${cfg.color}`}>
                            {cfg.label}
                          </p>
                          <p className="text-sm text-northpeak-text leading-snug">{r.descripcion}</p>
                          {r.valor !== null && (
                            <p className="text-xs text-northpeak-text-muted mt-1 font-mono">
                              {r.valor} {r.unidad || ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
