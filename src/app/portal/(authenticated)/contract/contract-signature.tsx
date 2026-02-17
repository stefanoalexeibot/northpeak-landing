"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignaturePad from "@/components/portal/signature-pad";
import { useToast } from "@/components/ui/toast";
import { CheckCircle } from "lucide-react";

interface Props {
  documentId: string;
  signed?: boolean;
  signatureData?: string;
  signedAt?: string;
}

export default function ContractSignature({ documentId, signed, signatureData, signedAt }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSign(data: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/sign-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, signatureData: data }),
      });
      if (res.ok) {
        addToast("Contrato firmado exitosamente", "success");
        router.refresh();
      } else {
        const err = await res.json();
        addToast(err.error || "Error al firmar", "error");
      }
    } catch {
      addToast("Error al firmar el contrato", "error");
    }
    setSaving(false);
  }

  if (signed && signatureData) {
    return (
      <div className="mt-6 pt-6 border-t border-northpeak-surface">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-northpeak-green" />
          <h3 className="text-sm font-medium text-northpeak-text">Firma digital</h3>
          {signedAt && (
            <span className="text-xs text-northpeak-text-dim">
              — {new Date(signedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signatureData} alt="Firma" className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-northpeak-surface">
      <h3 className="text-sm font-medium text-northpeak-text mb-3">Firmar contrato</h3>
      <SignaturePad onSave={handleSign} saving={saving} />
    </div>
  );
}
