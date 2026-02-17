import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalNav from "@/components/portal/nav";
import PortalProviders from "./portal-providers";
import CursorGlow from "@/components/portal/cursor-glow";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";

export default async function PortalAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/portal/login");

  // Get user theme preference
  const { data: profile } = await supabase
    .from("profiles")
    .select("theme")
    .eq("id", user.id)
    .single();

  return (
    <PortalProviders clientId={client.id} initialTheme={profile?.theme || "dark"}>
      <div className="min-h-screen bg-northpeak-bg">
        <DotGrid />
        <AnimatedBackground />
        <CursorGlow />
        <PortalNav client={client} />
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </PortalProviders>
  );
}
