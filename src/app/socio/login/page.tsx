"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Handshake, AlertCircle } from "lucide-react";

export default function SocioLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    // Verify that this user is a Socio
    const { data: Socio } = await supabase
      .from("socios")
      .select("id, activo")
      .eq("user_id", data.user.id)
      .single();

    if (!Socio) {
      await supabase.auth.signOut();
      setError("No tienes acceso como Socio. Contacta al administrador.");
      setLoading(false);
      return;
    }

    if (!Socio.activo) {
      await supabase.auth.signOut();
      setError("Tu cuenta está desactivada. Contacta al administrador.");
      setLoading(false);
      return;
    }

    window.location.href = "/socio/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-northpeak-bg px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-northpeak-green/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NorthPeak Digital" className="h-9 mb-4" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Handshake className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Portal Socio</span>
          </div>
        </div>

        <Card className="bg-northpeak-card border-northpeak-surface shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading text-2xl text-northpeak-text">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-northpeak-text-muted">
              Accede a tu panel de comisiones y prospectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-northpeak-text text-sm">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-muted/50 focus:ring-amber-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-northpeak-text text-sm">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-muted/50 focus:ring-amber-500/30"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verificando...</>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-northpeak-surface">
              <p className="text-center text-xs text-northpeak-text-muted">
                ¿No tienes acceso? Contacta a tu administrador de NorthPeak.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
