"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, Users, X } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  company: string;
  email: string;
}

export default function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allClients, setAllClients] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load all clients once on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("clients")
        .select("id, name, company, email")
        .order("name");
      setAllClients(data ?? []);
    }
    load();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter results
  useEffect(() => {
    if (!query.trim()) {
      setResults(allClients.slice(0, 8));
    } else {
      const q = query.toLowerCase();
      const filtered = allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 8));
    }
    setSelectedIndex(0);
  }, [query, allClients]);

  const navigateTo = useCallback(
    (clientId: string) => {
      setOpen(false);
      router.push(`/admin/clients/${clientId}`);
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateTo(results[selectedIndex].id);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-northpeak-card border border-northpeak-surface rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-northpeak-surface">
          <Search className="h-4 w-4 text-northpeak-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes por nombre, empresa o email..."
            className="flex-1 bg-transparent py-4 text-sm text-northpeak-text placeholder:text-northpeak-text-dim outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-northpeak-text-dim hover:text-northpeak-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="text-sm text-northpeak-text-muted text-center py-8">
              No se encontraron resultados
            </p>
          ) : (
            results.map((client, i) => (
              <button
                key={client.id}
                onClick={() => navigateTo(client.id)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-northpeak-green/10"
                    : "hover:bg-northpeak-surface"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-northpeak-surface text-northpeak-green font-bold text-sm shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-northpeak-text truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-northpeak-text-muted truncate">
                    {client.company ? `${client.company} — ` : ""}{client.email}
                  </p>
                </div>
                <Users className="h-3.5 w-3.5 text-northpeak-text-dim shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-northpeak-surface text-[10px] text-northpeak-text-dim">
          <span>
            <kbd className="px-1 py-0.5 bg-northpeak-bg rounded font-mono">↑↓</kbd> navegar
            <span className="mx-2">·</span>
            <kbd className="px-1 py-0.5 bg-northpeak-bg rounded font-mono">Enter</kbd> abrir
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-northpeak-bg rounded font-mono">Esc</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}

// Export a hook-style opener for the Quick Actions button
export function useCommandSearch() {
  const [, setForceRender] = useState(0);

  const open = useCallback(() => {
    // Dispatch keyboard event to open the search
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
    );
    setForceRender((n) => n + 1);
  }, []);

  return { open };
}
