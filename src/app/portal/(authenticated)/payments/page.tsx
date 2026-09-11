import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-northpeak-green" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-400" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    default:
      return <CreditCard className="h-5 w-5 text-northpeak-text-muted" />;
  }
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

const methodLabels: Record<string, string> = {
  transfer: "Transferencia",
  card: "Tarjeta",
  cash: "Efectivo",
  other: "Otro",
};

export default async function PaymentsPage() {
  const { supabase, client } = await getClientData();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const total = payments
    ?.filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const pending = payments
    ?.filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const pendingWithLink = payments?.filter(p => p.status === "pending" && p.pago_token) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Pagos</h1>
        <p className="text-northpeak-text-muted mt-1">Historial de pagos y facturación</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <p className="text-sm text-northpeak-text-muted">Total pagado</p>
            <p className="text-2xl font-bold text-northpeak-green mt-1">
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <p className="text-sm text-northpeak-text-muted">Pendiente</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              ${pending.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pagos pendientes con link de pago */}
      {pendingWithLink.length > 0 && (
        <div className="space-y-3">
          {pendingWithLink.map((pay) => (
            <Card key={pay.id} className="bg-northpeak-card border-yellow-400/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 shrink-0">
                      <CreditCard className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-northpeak-text truncate">{pay.concept}</p>
                      <p className="text-xs text-northpeak-text-muted">Pago pendiente</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-northpeak-text">
                      ${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-northpeak-text-muted">MXN</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/pago/${pay.pago_token}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-northpeak-green text-northpeak-bg font-semibold text-sm py-2.5 hover:bg-northpeak-green/90 transition-colors"
                  >
                    Ver datos de pago y notificar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!payments || payments.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">No hay pagos registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader>
            <CardTitle className="text-northpeak-text font-heading">Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((pay) => (
                <div key={pay.id} className="flex items-center gap-4 rounded-lg p-4 bg-northpeak-bg">
                  <StatusIcon status={pay.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-northpeak-text">{pay.concept}</p>
                    <p className="text-xs text-northpeak-text-dim">
                      {pay.payment_method ? `${methodLabels[pay.payment_method] ?? pay.payment_method} — ` : ""}
                      {new Date(pay.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-northpeak-text">
                      ${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-xs font-medium ${pay.status === "completed" ? "text-northpeak-green" : pay.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>
                      {statusLabels[pay.status] || pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
