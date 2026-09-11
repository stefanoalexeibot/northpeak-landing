import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ComisionistaSidebar } from "./_sidebar";

export default async function ComisionistaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/comisionista/login");
  }

  // Check if role is comisionista
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "comisionista") {
    // Sign out unauthorized users from this view
    await supabase.auth.signOut();
    redirect("/comisionista/login");
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      <ComisionistaSidebar email={user.email || ""} />
      <main className="flex-1 ml-60 min-h-screen relative p-8">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/2 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
