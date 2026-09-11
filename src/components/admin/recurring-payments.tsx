"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Plus, Trash2, RefreshCw } from "lucide-react";

interface RecurringPayment {
  id: string;
  client_id: string;
  monto: number;
  concepto: string;
  dia_cobro: number;
  activo: boolean;
  ultimo_cobro: string | null;
  created_at: string;
}

export default function RecurringPayments({ clientId }: { clientId: string }) {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    monto: "",
    concepto: "",
    dia_cobro: "1",
  });

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/pagos-recurrentes?client_id=${clientId}`);
      const data = await res.json();
      if (res.ok) setPayments(data);
    } catch {
      addToast("Error al cargar pagos recurrentes", "error");
    } finally {
      setLoading(false);
    }
  }, [clientId, addToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  async function handleCreate() {
    if (!form.monto || !form.concepto) {
      addToast("Completa monto y concepto", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pagos-recurrentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          monto: form.monto,
          concepto: form.concepto,
          dia_cobro: form.dia_cobro,
        }),
      });
      if (res.ok) {
        addToast("Pago recurrente creado", "success");
        setForm({ monto: "", concepto: "", dia_cobro: "1" });
        setShowForm(false);
        fetchPayments();
      } else {
        const json = await res.json();
        addToast(json.error || "Error al crear", "error");
      }
    } catch {
      addToast("Error de conexion", "error");
    }
    setSaving(false);
  }

  async function toggleActive(payment: RecurringPayment) {
    try {
      const res = await fetch("/api/admin/pagos-recurrentes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payment.id, activo: !payment.activo }),
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === payment.id ? { ...p, activo: !p.activo } : p))
        );
        addToast(payment.activo ? "Pago desactivado" : "Pago activado", "success");
      }
    } catch {
      addToast("Error al actualizar", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este pago recurrente?")) return;
    try {
      const res = await fetch("/api/admin/pagos-recurrentes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        addToast("Pago recurrente eliminado", "success");
      }
    } catch {
      addToast("Error al eliminar", "error");
    }
  }

  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-5 h-5 animate-spin text-[#7A7D8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#E8E9ED]">Pagos recurrentes</h3>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs border-[#1E2030] hover:bg-[#161821]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-lg border border-[#1E2030] bg-[#0C0D12] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#7A7D8A] mb-1.5">Concepto</Label>
              <Input
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                placeholder="Ej: Mantenimiento web mensual"
                className="h-9 bg-[#161821] border-[#1E2030] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#7A7D8A] mb-1.5">Monto (MXN)</Label>
                <Input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  placeholder="0.00"
                  className="h-9 bg-[#161821] border-[#1E2030] text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-[#7A7D8A] mb-1.5">Dia de cobro</Label>
                <select
                  value={form.dia_cobro}
                  onChange={(e) => setForm({ ...form, dia_cobro: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-[#1E2030] bg-[#161821] px-3 py-1 text-sm text-[#E8E9ED] focus:outline-none focus:ring-1 focus:ring-[#00E5A0]"
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-[#00E5A0] text-[#05060A] hover:bg-[#00E5A0]/90"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}

      {/* Payments list */}
      {payments.length === 0 && !showForm ? (
        <p className="text-sm text-[#7A7D8A] text-center py-6">
          Sin pagos recurrentes configurados
        </p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
                p.activo
                  ? "border-[#1E2030] bg-[#0C0D12]"
                  : "border-[#1E2030]/50 bg-[#0C0D12]/50 opacity-60"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#E8E9ED] truncate">
                    {p.concepto}
                  </span>
                  {!p.activo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7A7D8A]/20 text-[#7A7D8A]">
                      Pausado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[#00E5A0] font-mono font-semibold">
                    ${Number(p.monto).toLocaleString("es-MX")}
                  </span>
                  <span className="text-xs text-[#7A7D8A]">Dia {p.dia_cobro}</span>
                  {p.ultimo_cobro && (
                    <span className="text-xs text-[#7A7D8A]">
                      Ultimo: {new Date(p.ultimo_cobro).toLocaleDateString("es-MX")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    p.activo ? "bg-[#00E5A0]" : "bg-[#1E2030]"
                  )}
                  title={p.activo ? "Desactivar" : "Activar"}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5",
                      p.activo ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                    )}
                  />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-[#7A7D8A] hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
