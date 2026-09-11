"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  ArrowUpRight, 
  Users, 
  Clock, 
  CheckCircle2, 
  Plus
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalSocios: number;
  totalProspectos: number;
  totalGanados: number;
  comisionesPendientes: number;
  comisionesCobradas: number;
}

interface LatestItem {
  id: string;
  nombre: string;
  socioNombre: string;
  monto: number;
  fecha: string;
}

export default function ComisionistaDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestProspectos, setLatestProspectos] = useState<LatestItem[]>([]);
  const [latestComisiones, setLatestComisiones] = useState<LatestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/comisionista/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setLatestProspectos(data.latestProspectos);
          setLatestComisiones(data.latestComisiones);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Control general de tus socios comerciales, leads y comisiones.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/comisionista/prospectos"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Prospecto
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/45 text-xs font-semibold uppercase tracking-wider">Socios Comerciales</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats?.totalSocios || 0}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/10">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-white/30">
            <Link href="/comisionista/socios" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
              Gestionar socios <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/45 text-xs font-semibold uppercase tracking-wider">Total Prospectos</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats?.totalProspectos || 0}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/10">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-white/30">
            <span className="text-emerald-400 font-semibold">{stats?.totalGanados || 0}</span> cerrados ganados
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/45 text-xs font-semibold uppercase tracking-wider">Comisiones Pendientes</p>
              <h3 className="text-3xl font-bold mt-2 text-amber-400">{formatCurrency(stats?.comisionesPendientes || 0)}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-white/30">Cuentas por cobrar acumuladas</p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/45 text-xs font-semibold uppercase tracking-wider">Comisiones Cobradas</p>
              <h3 className="text-3xl font-bold mt-2 text-emerald-400">{formatCurrency(stats?.comisionesCobradas || 0)}</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-white/30">Historial pagado con éxito</p>
        </div>
      </div>

      {/* Grid: Latest Prospectos & Latest Comisiones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Prospectos */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Últimos Prospectos Generados</h2>
            <Link href="/comisionista/prospectos" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {latestProspectos.length === 0 ? (
            <div className="text-center py-10 text-white/35 text-sm">No has registrado prospectos aún.</div>
          ) : (
            <div className="space-y-4">
              {latestProspectos.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{item.nombre}</h4>
                    <p className="text-xs text-white/40 mt-0.5">Socio: {item.socioNombre}</p>
                  </div>
                  <span className="text-xs text-white/30">{new Date(item.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Comisiones */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recibo de Comisiones</h2>
            <Link href="/comisionista/comisiones" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {latestComisiones.length === 0 ? (
            <div className="text-center py-10 text-white/35 text-sm">No hay registros de comisiones recientes.</div>
          ) : (
            <div className="space-y-4">
              {latestComisiones.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{item.nombre}</h4>
                    <p className="text-xs text-white/40 mt-0.5">Socio: {item.socioNombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-amber-400">{formatCurrency(item.monto)}</p>
                    <span className="text-[10px] text-white/30">{new Date(item.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
