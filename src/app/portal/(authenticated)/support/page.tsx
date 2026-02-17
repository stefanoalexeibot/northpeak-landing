"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
}

export default function SupportPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!client) return;
      setClientId(client.id);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true });

      setMessages(data ?? []);

      // Mark admin messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("client_id", client.id)
        .eq("sender_role", "admin")
        .eq("read", false);

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || !clientId) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("messages").insert({
      client_id: clientId,
      sender_id: user.id,
      sender_role: "client",
      content: newMessage.trim(),
    }).select().single();

    if (data) {
      setMessages(prev => [...prev, data]);
    }

    setNewMessage("");
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Soporte</h1>
        <p className="text-northpeak-text-muted mt-1">Habla con el equipo de NorthPeak</p>
      </div>

      <Card className="bg-northpeak-card border-northpeak-surface overflow-hidden">
        <div className="h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-northpeak-text-muted text-sm">Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <MessageSquare className="h-12 w-12 text-northpeak-text-dim" />
                <p className="text-northpeak-text-muted text-sm">Inicia una conversación con el equipo</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_role === "client" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender_role === "client"
                      ? "bg-northpeak-green text-northpeak-bg rounded-br-sm"
                      : "bg-northpeak-surface text-northpeak-text rounded-bl-sm"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender_role === "client" ? "text-northpeak-bg/60" : "text-northpeak-text-dim"
                    }`}>
                      {new Date(msg.created_at).toLocaleString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-northpeak-surface flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
