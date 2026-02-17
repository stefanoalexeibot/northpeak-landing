import { createClient } from "@/lib/supabase/server";
import AdminMessageList from "@/components/admin/message-list";

export default async function AdminMessagesPage() {
  const supabase = createClient();

  // Get all clients that have messages
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, company, email")
    .order("name");

  // Get message counts per client
  const { data: messageCounts } = await supabase
    .from("messages")
    .select("client_id, read")
    .eq("read", false)
    .eq("sender_role", "client");

  const unreadByClient = new Map<string, number>();
  messageCounts?.forEach((m) => {
    unreadByClient.set(m.client_id, (unreadByClient.get(m.client_id) || 0) + 1);
  });

  // Get latest message per client
  const { data: latestMessages } = await supabase
    .from("messages")
    .select("client_id, content, created_at, sender_role")
    .order("created_at", { ascending: false });

  const lastMessageByClient = new Map<string, { content: string; created_at: string; sender_role: string }>();
  latestMessages?.forEach((m) => {
    if (!lastMessageByClient.has(m.client_id)) {
      lastMessageByClient.set(m.client_id, m);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Mensajes</h1>
        <p className="text-northpeak-text-muted mt-1">Comunicación con clientes</p>
      </div>

      <AdminMessageList
        clients={clients ?? []}
        unreadByClient={Object.fromEntries(unreadByClient)}
        lastMessageByClient={Object.fromEntries(lastMessageByClient)}
      />
    </div>
  );
}
