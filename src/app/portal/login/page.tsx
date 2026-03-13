"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Check role to redirect
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setError("Error al obtener perfil: " + profileError.message);
      setLoading(false);
      return;
    }

    if (profile?.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/portal/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-northpeak-bg px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NorthPeak Digital" className="h-10" />
        </div>

        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl text-northpeak-text">
              Portal de Clientes
            </CardTitle>
            <CardDescription className="text-northpeak-text-muted">
              Ingresa con tus credenciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-northpeak-text">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-dim"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-northpeak-text">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text placeholder:text-northpeak-text-dim"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-northpeak-green text-northpeak-bg font-semibold hover:bg-northpeak-green/90"
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-northpeak-text-dim mt-6">
          &copy; {new Date().getFullYear()} NorthPeak Digital. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
