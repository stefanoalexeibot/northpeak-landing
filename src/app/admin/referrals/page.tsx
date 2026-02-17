import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import ReferralStatusUpdater from "@/components/admin/referral-status-updater";

export default async function AdminReferralsPage() {
  const supabase = createClient();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("*, clients(name, company)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">Referidos</h1>
        <p className="text-northpeak-text-muted mt-1">Gestión del programa de referidos</p>
      </div>

      {!referrals || referrals.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <p className="text-northpeak-text-muted">No hay referidos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref) => (
            <Card key={ref.id} className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-northpeak-text">{ref.referred_name}</p>
                    <p className="text-sm text-northpeak-text-muted">{ref.referred_email}</p>
                    {ref.referred_phone && (
                      <p className="text-sm text-northpeak-text-dim">{ref.referred_phone}</p>
                    )}
                    {ref.referred_company && (
                      <p className="text-sm text-northpeak-text-dim">{ref.referred_company}</p>
                    )}
                    {ref.notes && (
                      <p className="text-xs text-northpeak-text-dim mt-1">{ref.notes}</p>
                    )}
                    <p className="text-xs text-northpeak-text-dim mt-2">
                      Referido por: <span className="text-northpeak-text-muted">{(ref.clients as { name: string })?.name}</span>
                    </p>
                  </div>
                  <ReferralStatusUpdater id={ref.id} currentStatus={ref.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
