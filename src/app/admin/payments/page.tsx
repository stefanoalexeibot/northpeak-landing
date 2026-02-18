"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Check,
  Trash2,
  User,
  ImageIcon,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface PaymentRow {
  id: string;
  client_id: string;
  amount: number;
  concept: string;
  payment_method?: string;
  status: string;
  reference_number?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  comprobante_url?: string;
  pago_token?: string;
  clients: { id: string; name: string; company?: string } | null;
}

const METHOD_LABELS: Record<string, string> = {
  transfer: "Transferencia",
  card: "Tarjeta",
  cash: "Efectivo",
  other: "Otro",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pendiente",   className: "text-yellow-400 bg-yellow-400/10" },
  completed: { label: "Pagado",      className: "text-northpeak-green bg-northpeak-green/10" },
  failed:    { label: "Fallido",     className: "text-red-400 bg-red-400/10" },
  refunded:  { label: "Reembolsado", className: "text-blue-400 bg-blue-400/10" },
};

type Tab = "pending" | "comprobante" | "completed" | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "pending",     label: "Por cobrar" },
  { id: "comprobante", label: "Con comprobante" },
  { id: "completed",   label: "Completados" },
  { id: "all",         label: "Todos" },
];

export default function AdminPaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, clients(id, name, company)")
      .order("created_at", { ascending: false });
    setPayments((data ?? []) as unknown as PaymentRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function confirmPayment(id: string) {
    setConfirming(id);
    await fetch("/api/admin/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConfirming(null);
    loadPayments();
  }

  async function deletePayment(id: string) {
    if (!confirm("¿Eliminar este pago?")) return;
    setDeleting(id);
    await fetch("/api/admin/delete-payment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    loadPayments();
  }

  // ── Derived stats ─────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((s, p) => s + Number(p.amount), 0);

  const totalThisMonth = payments
    .filter(p => p.status === "completed" && p.paid_at && p.paid_at >= startOfMonth)
    .reduce((s, p) => s + Number(p.amount), 0);

  const withComprobante = payments.filter(
    p => p.status === "pending" && p.comprobante_url
  );

  // ── Filtered list ────────────────────────────────────────────
  const filtered = payments.filter(p => {
    if (tab === "pending")     return p.status === "pending";
    if (tab === "comprobante") return p.status === "pending" && !!p.comprobante_url;
    if (tab === "completed")   return p.status === "completed";
    return true;
  });

  // ── Badge counts ─────────────────────────────────────────────
  const counts: Record<Tab, number> = {
    pending:     payments.filter(p => p.status === "pending").length,
    comprobante: withComprobante.length,
    completed:   payments.filter(p => p.status === "completed").length,
    all:         payments.length,
  };

  // ── Overdue helper ───────────────────────────────────────────
  function isOverdue(p: PaymentRow) {
    if (!p.due_date || p.status === "completed") return false;
    const due = new Date(p.due_date + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return due < today;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Pagos
          </h1>
          <p className="text-northpeak-text-muted mt-1">
            Vista global de todos los cobros
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadPayments}
          className="text-northpeak-text-muted hover:text-northpeak-text"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-northpeak-text-muted">Por cobrar</p>
                <p className="text-xl font-bold text-yellow-400">
                  ${totalPending.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-northpeak-green/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-northpeak-green" />
              </div>
              <div>
                <p className="text-xs text-northpeak-text-muted">Cobrado este mes</p>
                <p className="text-xl font-bold text-northpeak-green">
                  ${totalThisMonth.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${withComprobante.length > 0 ? "bg-northpeak-card border-yellow-400/30" : "bg-northpeak-card border-northpeak-surface"}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${withComprobante.length > 0 ? "bg-yellow-400/10" : "bg-northpeak-surface"}`}>
                <ImageIcon className={`h-4 w-4 ${withComprobante.length > 0 ? "text-yellow-400" : "text-northpeak-text-muted"}`} />
              </div>
              <div>
                <p className="text-xs text-northpeak-text-muted">Esperando confirmar</p>
                <p className={`text-xl font-bold ${withComprobante.length > 0 ? "text-yellow-400" : "text-northpeak-text-muted"}`}>
                  {withComprobante.length} {withComprobante.length === 1 ? "pago" : "pagos"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + list */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-northpeak-green/10 text-northpeak-green"
                    : "text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface"
                }`}
              >
                {t.label}
                {counts[t.id] > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    tab === t.id
                      ? "bg-northpeak-green/20 text-northpeak-green"
                      : "bg-northpeak-surface text-northpeak-text-muted"
                  }`}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="h-px bg-northpeak-surface mt-3" />
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 text-northpeak-text-muted animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-10 w-10 text-northpeak-text-dim mb-3" />
              <p className="text-northpeak-text-muted text-sm">
                {tab === "comprobante"
                  ? "No hay pagos con comprobante pendiente de confirmar."
                  : "No hay pagos en esta categoría."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(pay => {
                const client = pay.clients;
                const overdueFlag = isOverdue(pay);
                const statusCfg = STATUS_CONFIG[pay.status] ?? STATUS_CONFIG.pending;
                const hasComprobante = !!pay.comprobante_url;

                return (
                  <div
                    key={pay.id}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                      hasComprobante && pay.status === "pending"
                        ? "bg-yellow-400/5 border border-yellow-400/15"
                        : "bg-northpeak-bg"
                    }`}
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {pay.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-northpeak-green" />
                      ) : overdueFlag ? (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Client name */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-northpeak-text truncate">
                          {client?.name ?? "Cliente"}
                        </span>
                        {client?.company && (
                          <span className="text-xs text-northpeak-text-dim truncate">
                            {client.company}
                          </span>
                        )}
                        {hasComprobante && pay.status === "pending" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 shrink-0">
                            Comprobante enviado
                          </span>
                        )}
                        {overdueFlag && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-400/10 text-red-400 shrink-0">
                            Vencido
                          </span>
                        )}
                      </div>

                      {/* Concept + meta */}
                      <p className="text-xs text-northpeak-text-muted truncate mt-0.5">
                        {pay.concept}
                        {pay.payment_method ? ` · ${METHOD_LABELS[pay.payment_method] ?? pay.payment_method}` : ""}
                        {pay.due_date ? ` · Vence ${new Date(pay.due_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}` : ""}
                        {pay.paid_at ? ` · Pagado ${new Date(pay.paid_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}` : ""}
                      </p>
                    </div>

                    {/* Amount + status */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-northpeak-text">
                        ${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Ver comprobante */}
                      {hasComprobante && (
                        <a
                          href={pay.comprobante_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver comprobante"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-northpeak-green hover:bg-northpeak-green/10 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      {/* Confirmar pago */}
                      {pay.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Confirmar pago recibido"
                          disabled={confirming === pay.id}
                          onClick={() => confirmPayment(pay.id)}
                          className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8"
                        >
                          {confirming === pay.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {/* Ir al cliente */}
                      {client && (
                        <Link href={`/admin/clients/${client.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver cliente"
                            className="text-northpeak-text-muted hover:text-northpeak-text h-8 w-8"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}

                      {/* Eliminar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar pago"
                        disabled={deleting === pay.id}
                        onClick={() => deletePayment(pay.id)}
                        className="text-northpeak-text-muted hover:text-red-400 h-8 w-8"
                      >
                        {deleting === pay.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
