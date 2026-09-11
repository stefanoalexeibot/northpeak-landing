"use client";

import Link from "next/link";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverduePayment {
  id: string;
  client_id: string;
  client_name: string;
  concept: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  phone?: string;
}

interface Props {
  payments: OverduePayment[];
}

export default function OverduePaymentsCard({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <p className="text-northpeak-text-muted text-sm py-4">No hay pagos vencidos.</p>
    );
  }

  function sendReminder(pay: OverduePayment) {
    const msg = `Hola ${pay.client_name}, te recordamos que tienes un pago pendiente:\n\n*${pay.concept}*\nMonto: $${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}\nVencido hace ${pay.days_overdue} día${pay.days_overdue !== 1 ? "s" : ""}.\n\nPor favor, realiza tu pago a la brevedad. Cualquier duda, estamos al pendiente.\n\n— NorthPeak Digital`;
    const waUrl = `https://wa.me/${pay.phone ? pay.phone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <div className="space-y-2">
      {payments.map((pay) => (
        <div
          key={pay.id}
          className="flex items-center gap-3 rounded-lg p-3 bg-northpeak-bg hover:bg-northpeak-surface transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400/10 shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <Link href={`/admin/clients/${pay.client_id}`} className="flex-1 min-w-0">
            <p className="text-sm font-medium text-northpeak-text truncate">{pay.client_name}</p>
            <p className="text-xs text-northpeak-text-dim truncate">{pay.concept}</p>
          </Link>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-northpeak-text">
              ${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-red-400 font-medium">
              {pay.days_overdue} día{pay.days_overdue !== 1 ? "s" : ""} vencido
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendReminder(pay)}
            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 shrink-0"
            title="Enviar recordatorio por WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
