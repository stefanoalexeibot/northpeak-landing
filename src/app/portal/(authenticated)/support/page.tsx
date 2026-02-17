"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Send, MessageSquare, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_role: string;
  attachment_url?: string;
  attachment_name?: string;
  created_at: string;
}

export default function SupportPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!newMessage.trim() && !attachment) || !clientId) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    // Upload attachment if present
    if (attachment) {
      const ext = attachment.name.split(".").pop();
      const path = `${clientId}/chat/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("client-files")
        .upload(path, attachment);

      if (uploadError) {
        addToast("Error al subir el archivo", "error");
        setSending(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("client-files")
        .getPublicUrl(path);

      attachmentUrl = urlData.publicUrl;
      attachmentName = attachment.name;
    }

    const insertData: Record<string, unknown> = {
      client_id: clientId,
      sender_id: user.id,
      sender_role: "client",
      content: newMessage.trim() || (attachmentName ? `Archivo: ${attachmentName}` : ""),
    };
    if (attachmentUrl) {
      insertData.attachment_url = attachmentUrl;
      insertData.attachment_name = attachmentName;
    }

    const { data } = await supabase.from("messages").insert(insertData).select().single();

    if (data) {
      setMessages(prev => [...prev, data]);
      // Notify admin
      fetch("/api/portal/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message_received",
          title: "Nuevo mensaje de soporte",
          description: (newMessage.trim() || attachmentName || "").slice(0, 100),
        }),
      }).catch(() => {});
    }

    setNewMessage("");
    setAttachment(null);
    setSending(false);
  }

  function isImage(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
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
                    {/* Attachment */}
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {isImage(msg.attachment_url) ? (
                          <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.attachment_url}
                              alt={msg.attachment_name || "Imagen"}
                              className="max-w-full max-h-48 rounded-lg"
                            />
                          </a>
                        ) : (
                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 rounded-lg p-2 ${
                              msg.sender_role === "client"
                                ? "bg-northpeak-bg/20"
                                : "bg-northpeak-bg/40"
                            }`}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="text-xs truncate">{msg.attachment_name || "Archivo"}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {msg.content && !(msg.content.startsWith("Archivo:") && msg.attachment_url) && (
                      <p>{msg.content}</p>
                    )}
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

          {/* Attachment preview */}
          {attachment && (
            <div className="px-4 py-2 border-t border-northpeak-surface flex items-center gap-2 bg-northpeak-bg/50">
              {attachment.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-northpeak-green shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-northpeak-green shrink-0" />
              )}
              <span className="text-xs text-northpeak-text truncate flex-1">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="text-northpeak-text-dim hover:text-red-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="p-4 border-t border-northpeak-surface flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 25 * 1024 * 1024) {
                    addToast("El archivo no puede superar 25MB", "error");
                    return;
                  }
                  setAttachment(file);
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-northpeak-text-muted hover:text-northpeak-green shrink-0"
              title="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !attachment)}
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
