"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";

interface Props {
  onSave: (signatureData: string) => void;
  saving?: boolean;
}

export default function SignaturePad({ onSave, saving }: Props) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  function handleClear() {
    sigRef.current?.clear();
    setIsEmpty(true);
  }

  function handleSave() {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const data = sigRef.current.toDataURL("image/png");
      onSave(data);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-dashed border-northpeak-surface bg-white overflow-hidden">
        <SignatureCanvas
          ref={sigRef}
          penColor="#05060A"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: 200 },
          }}
          onBegin={() => setIsEmpty(false)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-northpeak-surface text-northpeak-text-muted"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isEmpty || saving}
          className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
        >
          <Check className="h-4 w-4 mr-2" />
          {saving ? "Firmando..." : "Firmar contrato"}
        </Button>
      </div>
    </div>
  );
}
