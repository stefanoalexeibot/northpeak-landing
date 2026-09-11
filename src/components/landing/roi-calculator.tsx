"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, DollarSign, Zap } from "lucide-react";

// ── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <label className="text-sm text-northpeak-text-muted leading-tight">{label}</label>
        <span className="font-mono font-bold text-xl text-northpeak-green shrink-0 tabular-nums">
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="np-slider w-full h-1 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, #00E5A0 0%, #00E5A0 ${pct}%, #161821 ${pct}%, #161821 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-northpeak-text-dim font-mono">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function RoiCalculator() {
  const [invest, setInvest] = useState(8000);
  const [ticket, setTicket] = useState(800);
  const [margin, setMargin] = useState(40);

  const profitPerClient = ticket * (margin / 100);
  const clientsToBreakeven = profitPerClient > 0 ? Math.ceil(invest / profitPerClient) : 0;
  const estimatedClients = Math.round(clientsToBreakeven * 2);
  const estimatedRevenue = estimatedClients * ticket;
  const estimatedNetProfit = estimatedRevenue * (margin / 100) - invest;
  const estimatedROI = invest > 0 ? Math.round((estimatedNetProfit / invest) * 100) : 0;

  const f$ = (v: number) => "$" + Math.round(v).toLocaleString("es-MX");
  const fPct = (v: number) => v + "%";

  const isPositive = estimatedROI >= 0;
  const barInvest = invest;
  const barReturn = Math.max(estimatedNetProfit, 0);
  const barTotal = barInvest + barReturn || 1;

  return (
    <div className="space-y-10">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Slider label="Inversión mensual en marketing" value={invest} min={2000} max={30000} step={500} format={f$} onChange={setInvest} />
        <Slider label="Ticket promedio por cliente" value={ticket} min={200} max={10000} step={100} format={f$} onChange={setTicket} />
        <Slider label="Margen de utilidad neta" value={margin} min={10} max={80} step={5} format={fPct} onChange={setMargin} />
      </div>

      {/* Divider with label */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-northpeak-surface" />
        <span className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase">Proyección mensual</span>
        <div className="flex-1 h-px bg-northpeak-surface" />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Clientes para recuperar */}
        <div className="rounded-xl border border-northpeak-surface bg-northpeak-bg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-northpeak-text-dim" />
            <span className="text-xs text-northpeak-text-muted uppercase tracking-wider font-mono">Para recuperar</span>
          </div>
          <p className="font-mono font-bold text-4xl text-northpeak-text leading-none mb-1">{clientsToBreakeven}</p>
          <p className="text-xs text-northpeak-text-muted">clientes nuevos al mes</p>
        </div>

        {/* Clientes estimados */}
        <div className="rounded-xl border border-northpeak-green/30 bg-northpeak-green/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-northpeak-green" />
            <span className="text-xs text-northpeak-green uppercase tracking-wider font-mono">Con NorthPeak</span>
          </div>
          <p className="font-mono font-bold text-4xl text-northpeak-green leading-none mb-1">{estimatedClients}</p>
          <p className="text-xs text-northpeak-text-muted">clientes nuevos estimados</p>
        </div>

        {/* Ganancia neta */}
        <div className="rounded-xl border border-northpeak-surface bg-northpeak-bg p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-northpeak-text-dim" />
            <span className="text-xs text-northpeak-text-muted uppercase tracking-wider font-mono">Ganancia neta</span>
          </div>
          <p className={`font-mono font-bold text-4xl leading-none mb-1 ${isPositive ? "text-northpeak-green" : "text-red-400"}`}>
            {f$(Math.max(estimatedNetProfit, 0))}
          </p>
          <p className="text-xs text-northpeak-text-muted">al mes</p>
        </div>
      </div>

      {/* ROI hero + bar */}
      <div className="rounded-2xl border border-northpeak-surface bg-northpeak-bg p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className={`h-5 w-5 ${isPositive ? "text-northpeak-green" : "text-red-400"}`} />
            <div>
              <p className="text-xs text-northpeak-text-muted font-mono uppercase tracking-wider mb-0.5">Retorno sobre inversión</p>
              <p className={`font-heading font-extrabold text-4xl sm:text-5xl leading-none ${isPositive ? "text-northpeak-green" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{estimatedROI}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-northpeak-text-dim mb-1">Inversión: <span className="font-mono text-northpeak-text">{f$(invest)}</span></p>
            <p className="text-xs text-northpeak-text-dim">Retorno: <span className="font-mono text-northpeak-green">{f$(estimatedNetProfit)}</span></p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="space-y-1.5">
          <div className="h-3 rounded-full bg-northpeak-surface overflow-hidden flex">
            <div
              className="h-full bg-northpeak-text-dim/40 transition-all duration-500"
              style={{ width: `${(barInvest / barTotal) * 100}%` }}
            />
            {barReturn > 0 && (
              <div
                className="h-full bg-northpeak-green transition-all duration-500"
                style={{ width: `${(barReturn / barTotal) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-northpeak-text-dim">
              <span className="h-2 w-2 rounded-full bg-northpeak-text-dim/40 inline-block" />
              Inversión {f$(invest)}
            </span>
            {barReturn > 0 && (
              <span className="flex items-center gap-1.5 text-northpeak-green">
                <span className="h-2 w-2 rounded-full bg-northpeak-green inline-block" />
                Ganancia {f$(barReturn)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-northpeak-text-dim leading-relaxed max-w-sm">
          * Basado en el promedio de resultados de clientes NorthPeak. Resultados reales varían según industria y mercado.
        </p>
        <Link
          href="/analizar"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,229,160,0.2)]"
        >
          Obtener análisis personalizado
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
