import { createClient } from "./server";
import { redirect } from "next/navigation";

export async function getClientData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/portal/login");

  return { supabase, user, client };
}
