"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";

export default function ReferralStatusUpdater({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(status: string) {
    await supabase.from("referrals").update({ status }).eq("id", id);
    router.refresh();
  }

  return (
    <Select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-northpeak-bg border-northpeak-surface text-northpeak-text text-xs h-8 w-36"
    >
      <option value="pending">Pendiente</option>
      <option value="contacted">Contactado</option>
      <option value="converted">Convertido</option>
      <option value="rejected">Rechazado</option>
    </Select>
  );
}
