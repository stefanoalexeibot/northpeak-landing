"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gift, Send } from "lucide-react";

interface Referral {
  id: string;
  referred_name: string;
  referred_email: string;
  referred_company?: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  converted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  converted: "Convertido",
  rejected: "Rechazado",
};

export default function ReferralsPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!client) return;
      setClientId(client.id);

      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      setReferrals(data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;
    setSending(true);
    setSuccess(false);

    const { data } = await supabase.from("referrals").insert({
      client_id: clientId,
      referred_name: name,
      referred_email: email,
      referred_phone: phone || null,
      referred_company: company || null,
      notes: notes || null,
    }).select().single();

    if (data) {
      setReferrals(prev => [data, ...prev]);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setNotes("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Programa de Referidos</h1>
        <p className="text-northpeak-text-muted mt-1">Refiere a alguien y ambos ganan</p>
      </div>

      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-400" />
            Referir a alguien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Nombre *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nombre del referido" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@ejemplo.com" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Teléfono</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 123 456 7890" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Empresa</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa del referido" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Notas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Comentarios adicionales..." className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={sending} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Enviando..." : "Enviar referido"}
              </Button>
              {success && <span className="text-sm text-northpeak-green">Referido enviado correctamente</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader>
            <CardTitle className="text-northpeak-text font-heading">Tus referidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between rounded-lg bg-northpeak-bg p-3">
                  <div>
                    <p className="text-sm font-medium text-northpeak-text">{ref.referred_name}</p>
                    <p className="text-xs text-northpeak-text-muted">{ref.referred_email}</p>
                  </div>
                  <Badge className={statusColors[ref.status]}>
                    {statusLabels[ref.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
