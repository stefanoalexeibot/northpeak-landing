"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportClientsCsv } from "@/lib/admin/export-csv";

interface Props {
  clients: { name: string; email: string; company: string; phone?: string; created_at: string }[];
}

export default function ExportButton({ clients }: Props) {
  return (
    <Button
      variant="outline"
      className="border-northpeak-surface text-northpeak-text-muted"
      onClick={() => exportClientsCsv(clients)}
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </Button>
  );
}
