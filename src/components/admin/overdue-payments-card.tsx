"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface OverduePayment {
  id: string;
  client_id: string;
  client_name: string;
  concept: string;
  amount: number;
  due_date: string;
  days_overdue: number;
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

  return (
    <div className="space-y-2">
      {payments.map((pay) => (
        <Link
          key={pay.id}
          href={`/admin/clients/${pay.client_id}`}
          className="flex items-center gap-3 rounded-lg p-3 bg-northpeak-bg hover:bg-northpeak-surface transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400/10 shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-northpeak-text truncate">{pay.client_name}</p>
            <p className="text-xs text-northpeak-text-dim truncate">{pay.concept}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-northpeak-text">
              ${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-red-400 font-medium">
              {pay.days_overdue} día{pay.days_overdue !== 1 ? "s" : ""} vencido
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
