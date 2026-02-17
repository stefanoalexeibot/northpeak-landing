import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import InvoicePdfButton from "@/components/portal/invoice-pdf-button";

interface InvoiceContent {
  items: { concept: string; amount: number }[];
  discount: number;
  notes: string;
}

export default async function InvoicePage() {
  const { supabase, client } = await getClientData();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", client.id)
    .eq("type", "invoice")
    .single();

  const content: InvoiceContent | null = doc?.content
    ? (typeof doc.content === "string" ? JSON.parse(doc.content) : doc.content)
    : null;

  const subtotal = content?.items?.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const discount = content?.discount ?? 0;
  const total = subtotal - discount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">Nota de Venta</h1>
          <p className="text-northpeak-text-muted mt-1">Detalle de tu inversión con NorthPeak</p>
        </div>
        {content && content.items?.length > 0 && (
          <InvoicePdfButton
            title={doc?.title || "Nota de venta"}
            clientName={client.name}
            company={client.company}
            items={content.items}
            discount={content.discount ?? 0}
            notes={content.notes}
          />
        )}
      </div>

      {!content || !content.items?.length ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">Tu nota de venta aún no está disponible.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                <Receipt className="h-5 w-5 text-yellow-400" />
                {doc?.title || "Nota de venta"}
              </CardTitle>
              <div className="text-right">
                <p className="text-xs text-northpeak-text-dim">Cliente</p>
                <p className="text-sm text-northpeak-text">{client.name}</p>
                {client.company && <p className="text-xs text-northpeak-text-muted">{client.company}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Line items */}
            <div className="rounded-lg bg-northpeak-bg p-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 text-xs text-northpeak-text-muted font-medium uppercase tracking-wider mb-3">
                <span>Concepto</span>
                <span className="text-right">Monto</span>
              </div>
              <Separator className="bg-northpeak-surface mb-3" />
              {content.items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-4 py-2">
                  <span className="text-sm text-northpeak-text">{item.concept}</span>
                  <span className="text-sm text-northpeak-text font-mono text-right">
                    ${item.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <Separator className="bg-northpeak-surface my-3" />

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <span className="text-sm text-northpeak-text-muted">Subtotal</span>
                  <span className="text-sm font-mono text-northpeak-text text-right">
                    ${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <span className="text-sm text-northpeak-green">Descuento</span>
                    <span className="text-sm font-mono text-northpeak-green text-right">
                      -${discount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <Separator className="bg-northpeak-surface" />
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <span className="text-base font-semibold text-northpeak-text">Total</span>
                  <span className="text-base font-bold font-mono text-northpeak-green text-right">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {content.notes && (
              <div className="rounded-lg bg-northpeak-bg p-4">
                <p className="text-xs text-northpeak-text-muted uppercase tracking-wider mb-2">Notas</p>
                <p className="text-sm text-northpeak-text whitespace-pre-wrap">{content.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
