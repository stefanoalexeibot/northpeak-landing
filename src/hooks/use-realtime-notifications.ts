"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export function useRealtimeNotifications(clientId: string) {
  const { addToast } = useToast();

  const handleInsert = useCallback(
    (table: string) => {
      switch (table) {
        case "media":
          addToast("Nuevo archivo disponible", "info");
          break;
        case "messages":
          addToast("Nuevo mensaje recibido", "info");
          break;
        case "projects":
          addToast("Actualización de proyecto", "info");
          break;
      }
    },
    [addToast]
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("portal-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "media", filter: `client_id=eq.${clientId}` },
        () => handleInsert("media")
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          if (payload.new && (payload.new as Record<string, unknown>).sender_role === "admin") {
            handleInsert("messages");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `client_id=eq.${clientId}` },
        () => handleInsert("projects")
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, handleInsert]);
}
