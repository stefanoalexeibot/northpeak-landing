"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface ClientInfo {
  id: string;
  name: string;
  company: string;
  email: string;
}

interface MessageData {
  content: string;
  created_at: string;
  sender_role: string;
}

interface Props {
  clients: ClientInfo[];
  unreadByClient: Record<string, number>;
  lastMessageByClient: Record<string, MessageData>;
}

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
  read: boolean;
}

export default function AdminMessageList({ clients, unreadByClient, lastMessageByClient }: Props) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [quickReplyClient, setQuickReplyClient] = useState<string | null>(null);
  const [quickReplyText, setQuickReplyText] = useState("");
  const [quickReplySending, setQuickReplySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickReplyRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient();

  async function sendQuickReply(clientId: string) {
    if (!quickReplyText.trim()) return;
    setQuickReplySending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("messages").insert({
      client_id: clientId,
      sender_id: user.id,
      sender_role: "admin",
      content: quickReplyText.trim(),
    });

    setQuickReplyText("");
    setQuickReplyClient(null);
    setQuickReplySending(false);
  }

  // Filter clients that have messages
  const clientsWithMessages = clients.filter(c => lastMessageByClient[c.id]);
  const clientsWithoutMessages = clients.filter(c => !lastMessageByClient[c.id]);

  useEffect(() => {
    if (!selectedClient) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", selectedClient)
        .order("created_at", { ascending: true });

      setMessages(data ?? []);

      // Mark client messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("client_id", selectedClient)
        .eq("sender_role", "client")
        .eq("read", false);
    }

    loadMessages();
  }, [selectedClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || !selectedClient) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("messages").insert({
      client_id: selectedClient,
      sender_id: user.id,
      sender_role: "admin",
      content: newMessage.trim(),
    }).select().single();

    if (data) {
      setMessages(prev => [...prev, data]);
    }

    setNewMessage("");
    setSending(false);
  }

  const selectedClientInfo = clients.find(c => c.id === selectedClient);

  if (selectedClient && selectedClientInfo) {
    return (
      <Card className="bg-northpeak-card border-northpeak-surface">
        <div className="flex items-center gap-3 p-4 border-b border-northpeak-surface">
          <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)} className="text-northpeak-text-muted hover:text-northpeak-text h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="font-medium text-northpeak-text">{selectedClientInfo.name}</p>
            <p className="text-xs text-northpeak-text-muted">{selectedClientInfo.company || selectedClientInfo.email}</p>
          </div>
        </div>

        <div className="h-[60vh] sm:h-96 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-northpeak-text-muted text-sm py-8">No hay mensajes con este cliente.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  msg.sender_role === "admin"
                    ? "bg-northpeak-green/10 text-northpeak-green"
                    : "bg-northpeak-surface text-northpeak-text"
                }`}>
                  <p>{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">
                    {new Date(msg.created_at).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
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
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {clients.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <p className="text-northpeak-text-muted">No hay clientes.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {clientsWithMessages.map((client) => {
            const unread = unreadByClient[client.id] || 0;
            const lastMsg = lastMessageByClient[client.id];
            const isQuickReply = quickReplyClient === client.id;
            return (
              <Card
                key={client.id}
                className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedClient(client.id)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-northpeak-green/10 text-northpeak-green font-bold shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-northpeak-text">{client.name}</p>
                      {lastMsg && (
                        <p className="text-xs text-northpeak-text-muted truncate">
                          {lastMsg.sender_role === "admin" ? "Tú: " : ""}{lastMsg.content}
                        </p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-northpeak-green text-[10px] font-bold text-northpeak-bg px-1">
                        {unread}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickReplyClient(isQuickReply ? null : client.id);
                        setQuickReplyText("");
                        setTimeout(() => quickReplyRef.current?.focus(), 50);
                      }}
                      className="text-northpeak-text-dim hover:text-northpeak-text p-1"
                      title="Respuesta rápida"
                    >
                      {isQuickReply ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Quick reply inline */}
                  {isQuickReply && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-northpeak-surface">
                      <Input
                        ref={quickReplyRef}
                        value={quickReplyText}
                        onChange={(e) => setQuickReplyText(e.target.value)}
                        placeholder="Respuesta rápida..."
                        className="bg-northpeak-bg border-northpeak-surface text-northpeak-text text-sm"
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendQuickReply(client.id)}
                      />
                      <Button
                        onClick={() => sendQuickReply(client.id)}
                        disabled={quickReplySending || !quickReplyText.trim()}
                        className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {clientsWithoutMessages.length > 0 && (
            <>
              <p className="text-xs text-northpeak-text-dim pt-4 pb-1">Sin mensajes</p>
              {clientsWithoutMessages.map((client) => (
                <Card
                  key={client.id}
                  className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer opacity-60"
                  onClick={() => setSelectedClient(client.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-northpeak-surface text-northpeak-text-muted font-bold shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-northpeak-text">{client.name}</p>
                      <p className="text-xs text-northpeak-text-dim">{client.email}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
