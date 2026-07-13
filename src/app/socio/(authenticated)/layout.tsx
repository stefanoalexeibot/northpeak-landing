import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SocioAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/Socio/login");

  const adminSb = createAdminClient();
  const { data: Socio } = await adminSb
    .from("Socios")
    .select("id, nombre, activo")
    .eq("user_id", user.id)
    .single();

  if (!Socio || !Socio.activo) {
    redirect("/Socio/login");
  }

  return (
    <div className="min-h-screen bg-northpeak-bg">
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0 bg-northpeak-bg" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-amber-500/5 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
