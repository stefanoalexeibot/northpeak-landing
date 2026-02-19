"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2, MessageSquare } from "lucide-react";

export default function QuickCaptureForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), whatsapp: whatsapp.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-northpeak-green/30 bg-northpeak-green/8"
          >
            <CheckCircle className="h-5 w-5 text-northpeak-green shrink-0" />
            <div>
              <p className="font-semibold text-northpeak-text text-sm">¡Listo! Te contactamos en menos de 24h.</p>
              <p className="text-xs text-northpeak-text-muted mt-0.5">Revisa tu WhatsApp — te llegará un mensaje de NorthPeak.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-northpeak-card border border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-dim text-sm focus:outline-none focus:border-northpeak-green/40 transition-colors"
            />
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-northpeak-text-dim pointer-events-none" />
              <input
                type="tel"
                placeholder="WhatsApp (ej. 8121234567)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-northpeak-card border border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-dim text-sm focus:outline-none focus:border-northpeak-green/40 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm hover:bg-northpeak-green/90 transition-all disabled:opacity-70 shrink-0"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Que me contacten
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {status !== "success" && (
        <p className="mt-2 text-[11px] text-northpeak-text-dim">
          Respuesta en menos de 24h · Sin compromiso · Solo por WhatsApp
        </p>
      )}
      {status === "error" && (
        <p className="mt-1 text-[11px] text-red-400">Algo salió mal. Inténtalo de nuevo.</p>
      )}
    </div>
  );
}
