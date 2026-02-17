"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Lock } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const { addToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      addToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("Las contraseñas no coinciden", "error");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      addToast(error.message, "error");
    } else {
      addToast("Contraseña actualizada correctamente", "success");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Configuración</h1>
        <p className="text-northpeak-text-muted mt-1">Administra tu cuenta</p>
      </div>

      <Card className="bg-northpeak-card border-northpeak-surface max-w-lg">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
            <Lock className="h-5 w-5 text-northpeak-green" />
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nueva contraseña</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Confirmar contraseña</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              {saving ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
