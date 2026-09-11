import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminLayoutClient from "@/components/admin/admin-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import Breadcrumbs from "@/components/admin/breadcrumbs";
import PageTransition from "@/components/admin/page-transition";
import AdminDock from "@/components/admin/admin-dock";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") redirect("/portal/dashboard");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-northpeak-bg">
        <AdminSidebar />
        <AdminLayoutClient />
        <main className="flex-1 pt-14 px-4 pb-24 lg:pt-0 lg:ml-64 lg:p-8 lg:pb-24">
          <Breadcrumbs />
          <PageTransition>{children}</PageTransition>
        </main>
        <AdminDock />
      </div>
    </ToastProvider>
  );
}

