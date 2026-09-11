"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Lock, User, Camera, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const { addToast } = useToast();

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!client) return;
      setClientId(client.id);
      setName(client.name || "");
      setPhone(client.phone || "");
      setCompany(client.company || "");
      setPhotoUrl(client.photo_url || "");
    }
    load();
  }, [supabase]);

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
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      addToast(error.message, "error");
    } else {
      addToast("Contraseña actualizada correctamente", "success");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("clients")
      .update({ name, phone, company })
      .eq("id", clientId);
    if (error) {
      addToast("Error al guardar el perfil", "error");
    } else {
      addToast("Perfil actualizado correctamente", "success");
    }
    setSavingProfile(false);
  }

  async function handlePhotoUpload(file: File) {
    if (!clientId) return;
    setUploadingPhoto(true);

    const ext = file.name.split(".").pop();
    const path = `${clientId}/profile-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("client-files")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      addToast("Error al subir la foto", "error");
      setUploadingPhoto(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("client-files")
      .getPublicUrl(path);

    const { error: dbError } = await supabase
      .from("clients")
      .update({ photo_url: urlData.publicUrl })
      .eq("id", clientId);

    if (dbError) {
      addToast("Error al actualizar la foto", "error");
    } else {
      setPhotoUrl(urlData.publicUrl);
      addToast("Foto actualizada", "success");
    }
    setUploadingPhoto(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Configuración</h1>
        <p className="text-northpeak-text-muted mt-1">Administra tu cuenta</p>
      </div>

      {/* Profile section */}
      <Card className="bg-northpeak-card border-northpeak-surface max-w-lg">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
            <User className="h-5 w-5 text-northpeak-green" />
            Mi perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Photo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Foto de perfil"
                  className="h-16 w-16 rounded-full object-cover border-2 border-northpeak-surface"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-northpeak-surface flex items-center justify-center">
                  <User className="h-8 w-8 text-northpeak-text-dim" />
                </div>
              )}
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-northpeak-green text-northpeak-bg flex items-center justify-center hover:bg-northpeak-green/90 transition-colors"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
              />
            </div>
            <div>
              <p className="text-sm text-northpeak-text font-medium">{name || "Tu nombre"}</p>
              <p className="text-xs text-northpeak-text-muted">{company || "Tu empresa"}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Teléfono</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 ..."
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Empresa</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de tu empresa"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              />
            </div>
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              {savingProfile ? "Guardando..." : "Guardar perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password section */}
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
              disabled={savingPassword}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              {savingPassword ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
