"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Star, MessageSquareHeart } from "lucide-react";

export default function TestimonialPage() {
  const supabase = createClient();
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<{ rating: number; title: string; content: string; is_approved: boolean; submitted_at: string } | null>(null);
  const [clientId, setClientId] = useState<string>("");

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

      const { data: testimonial } = await supabase
        .from("testimonials")
        .select("*")
        .eq("client_id", client.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (testimonial) {
        setExisting(testimonial);
        setRating(testimonial.rating);
        setTitle(testimonial.title);
        setContent(testimonial.content);
      }
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content || !clientId) return;

    setSaving(true);
    const { error } = await supabase.from("testimonials").insert({
      client_id: clientId,
      rating,
      title,
      content,
    });

    if (error) {
      addToast(error.message, "error");
    } else {
      addToast("Reseña enviada. Gracias por tu feedback!", "success");
      // Notify admin
      fetch("/api/portal/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "testimonial_submitted",
          title: `Nueva reseña: "${title}"`,
          description: `Calificación: ${rating}/5`,
        }),
      }).catch(() => {});
      // Reload to show existing
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("client_id", clientId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setExisting(data);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Tu reseña</h1>
        <p className="text-northpeak-text-muted mt-1">Comparte tu experiencia con NorthPeak</p>
      </div>

      {existing && (
        <Card className="bg-northpeak-card border-northpeak-green/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-5 w-5 ${s <= existing.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-text-dim"}`} />
              ))}
            </div>
            <h3 className="text-lg font-medium text-northpeak-text">{existing.title}</h3>
            <p className="text-sm text-northpeak-text-muted mt-1">{existing.content}</p>
            <p className="text-xs text-northpeak-text-dim mt-3">
              {existing.is_approved ? "Aprobada" : "Pendiente de aprobación"} — {new Date(existing.submitted_at).toLocaleDateString("es-MX")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-northpeak-card border-northpeak-surface max-w-lg">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-northpeak-green" />
            {existing ? "Enviar nueva reseña" : "Escribe tu reseña"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Calificación</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-colors"
                  >
                    <Star className={`h-7 w-7 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-text-dim hover:text-yellow-400/50"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Excelente servicio"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Tu experiencia</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cuéntanos sobre tu experiencia trabajando con NorthPeak..."
                rows={4}
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !title || !content}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              {saving ? "Enviando..." : "Enviar reseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
