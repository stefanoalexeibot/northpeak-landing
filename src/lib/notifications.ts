import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationType } from "./types";

export async function createNotification(
  supabase: SupabaseClient,
  {
    type,
    title,
    description,
    clientId,
    link,
  }: {
    type: NotificationType;
    title: string;
    description?: string;
    clientId?: string;
    link?: string;
  }
) {
  const { error } = await supabase.from("notifications").insert({
    type,
    title,
    description: description || null,
    client_id: clientId || null,
    link: link || null,
  });

  if (error) {
    console.error("Error creating notification:", error);
  }

  return { error };
}
