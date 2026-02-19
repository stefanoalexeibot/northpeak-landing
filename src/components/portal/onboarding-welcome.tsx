"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, FileText, FileSearch, FolderOpen, MessageSquare, ChevronRight, Sparkles } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Firma tu contrato",
    description: "Revisa y firma el contrato de servicios para formalizar tu proyecto.",
    href: "/portal/contract",
    Icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    num: "02",
    title: "Revisa tu propuesta",
    description: "Consulta la propuesta comercial con el detalle de lo que vamos a trabajar.",
    href: "/portal/propuesta",
    Icon: FileSearch,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    num: "03",
    title: "Conoce tu proyecto",
    description: "Ve el avance de tus entregables y aprueba el contenido antes de publicar.",
    href: "/portal/projects",
    Icon: FolderOpen,
    color: "text-northpeak-green",
    bg: "bg-northpeak-green/10",
  },
  {
    num: "04",
    title: "Di hola al equipo",
    description: "Tu equipo de NorthPeak está disponible aquí para resolver cualquier duda.",
    href: "/portal/support",
    Icon: MessageSquare,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

export default function OnboardingWelcome({ clientId }: { clientId: string }) {
  const key = `np_onboarding_v1_${clientId}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(key)) setVisible(true);
  }, [key]);

  function dismiss() {
    localStorage.setItem(key, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative rounded-2xl border border-northpeak-green/20 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-northpeak-green/5 via-northpeak-card to-northpeak-card pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-northpeak-green/15 border border-northpeak-green/20">
              <Sparkles className="h-4 w-4 text-northpeak-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-northpeak-text">Bienvenido a tu portal</p>
              <p className="text-xs text-northpeak-text-muted mt-0.5">Completa estos pasos para empezar</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-northpeak-text-dim hover:text-northpeak-text transition-colors p-1 rounded-md hover:bg-northpeak-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step) => (
            <Link
              key={step.num}
              href={step.href}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-northpeak-surface bg-northpeak-bg hover:border-northpeak-green/30 hover:bg-northpeak-card transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-northpeak-text-dim tracking-widest">{step.num}</span>
                <ChevronRight className="h-3.5 w-3.5 text-northpeak-text-dim group-hover:text-northpeak-green group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${step.bg}`}>
                <step.Icon className={`h-4 w-4 ${step.color}`} />
              </div>

              <div>
                <p className="text-sm font-semibold text-northpeak-text leading-snug">{step.title}</p>
                <p className="text-xs text-northpeak-text-muted mt-1 leading-snug">{step.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Dismiss */}
        <div className="mt-4 pt-4 border-t border-northpeak-surface/50 flex justify-end">
          <button
            onClick={dismiss}
            className="text-xs text-northpeak-text-dim hover:text-northpeak-text-muted transition-colors"
          >
            Entendido, lo veo después
          </button>
        </div>
      </div>
    </div>
  );
}
