import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminLayoutClient from "@/components/admin/admin-layout-client";
import { ToastProvider } from "@/components/ui/toast";

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
    .single();

  if (!profile || profile.role !== "admin") redirect("/portal/dashboard");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-northpeak-bg">
        <AdminSidebar />
        <AdminLayoutClient />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
