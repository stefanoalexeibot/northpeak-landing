"use client";

import { useState } from "react";
import { TrendingUp, Users, DollarSign } from "lucide-react";

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
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-northpeak-text-muted">{label}</label>
        <span className="text-sm font-mono font-bold text-northpeak-green">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00E5A0 0%, #00E5A0 ${((value - min) / (max - min)) * 100}%, #161821 ${((value - min) / (max - min)) * 100}%, #161821 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-northpeak-text-dim">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [invest, setInvest] = useState(8000);
  const [ticket, setTicket] = useState(800);
  const [margin, setMargin] = useState(40);

  const profitPerClient = ticket * (margin / 100);
  const clientsToBreakeven = profitPerClient > 0 ? Math.ceil(invest / profitPerClient) : 0;
  // Conservative estimate: NorthPeak delivers ~2x break-even clients on average
  const estimatedClients = Math.round(clientsToBreakeven * 2);
  const estimatedRevenue = estimatedClients * ticket;
  const estimatedNetProfit = estimatedRevenue * (margin / 100) - invest;
  const estimatedROI = invest > 0 ? Math.round((estimatedNetProfit / invest) * 100) : 0;

  const fmt$ = (v: number) =>
    "$" + v.toLocaleString("es-MX", { maximumFractionDigits: 0 });
  const fmtPct = (v: number) => v + "%";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Inputs */}
      <div className="space-y-6">
        <Slider
          label="Inversión mensual en marketing"
          value={invest}
          min={3000}
          max={30000}
          step={500}
          format={fmt$}
          onChange={setInvest}
        />
        <Slider
          label="Ticket promedio por cliente"
          value={ticket}
          min={200}
          max={10000}
          step={100}
          format={fmt$}
          onChange={setTicket}
        />
        <Slider
          label="Margen de utilidad neta"
          value={margin}
          min={10}
          max={80}
          step={5}
          format={fmtPct}
          onChange={setMargin}
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-northpeak-surface border border-northpeak-surface p-5 space-y-4">
          <p className="text-xs text-northpeak-text-muted uppercase tracking-widest font-mono">
            Proyección mensual
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-northpeak-green/10 shrink-0">
              <Users className="h-4 w-4 text-northpeak-green" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-northpeak-text">
                {estimatedClients} clientes
              </p>
              <p className="text-xs text-northpeak-text-muted">
                nuevos por mes (necesitas {clientsToBreakeven} para recuperar)
              </p>
            </div>
          </div>

          <div className="h-px bg-northpeak-surface" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 shrink-0">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-northpeak-text">
                {fmt$(estimatedRevenue)}
              </p>
              <p className="text-xs text-northpeak-text-muted">en ventas generadas al mes</p>
            </div>
          </div>

          <div className="h-px bg-northpeak-surface" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-northpeak-green/10 shrink-0">
              <TrendingUp className="h-4 w-4 text-northpeak-green" />
            </div>
            <div>
              <p className={`text-2xl font-heading font-bold ${estimatedROI >= 0 ? "text-northpeak-green" : "text-red-400"}`}>
                {estimatedROI >= 0 ? "+" : ""}{estimatedROI}% ROI
              </p>
              <p className="text-xs text-northpeak-text-muted">
                {fmt$(estimatedNetProfit)} de ganancia neta proyectada
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-northpeak-text-dim leading-relaxed px-1">
          * Basado en el promedio de resultados de clientes NorthPeak. Los resultados reales varían
          según industria, mercado y ejecución.
        </p>
      </div>
    </div>
  );
}
