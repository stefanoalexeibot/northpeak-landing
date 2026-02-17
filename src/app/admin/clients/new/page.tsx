"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el cliente");
      }

      router.push("/admin/clients");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear el cliente";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-text">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">Nuevo cliente</h1>
          <p className="text-northpeak-text-muted mt-1">Crea una cuenta de acceso para el cliente</p>
        </div>
      </div>

      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Nombre completo *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Empresa</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Mi Empresa S.A."
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Correo electrónico *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="cliente@email.com"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Teléfono</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 123 456 7890"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-northpeak-text">Contraseña de acceso *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
              >
                {loading ? "Creando..." : "Crear cliente"}
              </Button>
              <Link href="/admin/clients">
                <Button type="button" variant="outline" className="border-northpeak-surface text-northpeak-text-muted">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
