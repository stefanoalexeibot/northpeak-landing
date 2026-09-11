import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import TestimonialActions from "./testimonial-actions";

export default async function AdminTestimonialsPage() {
  const supabase = createAdminClient();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*, clients(name, company)")
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">Reseñas</h1>
        <p className="text-northpeak-text-muted mt-1">Gestiona las reseñas de clientes</p>
      </div>

      {!testimonials || testimonials.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <p className="text-northpeak-text-muted">No hay reseñas todavía.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <Card key={t.id} className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-text-dim"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-northpeak-text-dim">
                        {new Date(t.submitted_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    <h3 className="font-medium text-northpeak-text">{t.title}</h3>
                    <p className="text-sm text-northpeak-text-muted mt-1">{t.content}</p>
                    <p className="text-xs text-northpeak-text-dim mt-2">
                      — {(t.clients as { name: string; company?: string })?.name}{(t.clients as { name: string; company?: string })?.company ? `, ${(t.clients as { name: string; company?: string }).company}` : ""}
                    </p>
                  </div>
                  <TestimonialActions
                    id={t.id}
                    isApproved={t.is_approved}
                    isPublished={t.is_published}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
