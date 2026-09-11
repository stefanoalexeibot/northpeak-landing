"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";

export default function ClientStatusSelect({ clientId, currentStatus }: { clientId: string; currentStatus?: string }) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const supabase = createClient();
    await supabase.from("clients").update({ status: e.target.value }).eq("id", clientId);
    router.refresh();
  }

  return (
    <Select
      value={currentStatus || "active"}
      onChange={handleChange}
      className="bg-northpeak-card border-northpeak-surface text-northpeak-text text-xs h-8 w-36"
    >
      <option value="active">Activo</option>
      <option value="paused">Pausado</option>
      <option value="completed">Completado</option>
    </Select>
  );
}
