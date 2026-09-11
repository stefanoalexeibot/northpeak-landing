"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  label: string;
  done: boolean;
  done_at: string | null;
  sort_order: number;
}

export default function ClientTasksChecklist({ clientId }: { clientId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/client-tasks?client_id=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  async function toggleTask(task: Task) {
    setToggling(task.id);
    const res = await fetch("/api/admin/client-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
    setToggling(null);
  }

  async function addTask() {
    if (!newLabel.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/client-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, label: newLabel }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewLabel("");
      setShowAdd(false);
    }
    setAdding(false);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch("/api/admin/client-tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-northpeak-text-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-northpeak-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-northpeak-green rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-northpeak-text-muted whitespace-nowrap">
          {done}/{total}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              task.done
                ? "text-northpeak-text-muted"
                : "text-northpeak-text bg-northpeak-bg"
            )}
          >
            <button
              onClick={() => toggleTask(task)}
              disabled={toggling === task.id}
              className="shrink-0 focus:outline-none"
            >
              {toggling === task.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-northpeak-text-dim" />
              ) : task.done ? (
                <CheckCircle2 className="h-4 w-4 text-northpeak-green" />
              ) : (
                <Circle className="h-4 w-4 text-northpeak-text-dim hover:text-northpeak-green transition-colors" />
              )}
            </button>

            <span className={cn("flex-1", task.done && "line-through")}>
              {task.label}
            </span>

            {task.done && task.done_at && (
              <span className="text-[10px] text-northpeak-text-dim shrink-0">
                {new Date(task.done_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}

            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-northpeak-text-dim hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add task */}
      {showAdd ? (
        <div className="flex gap-2 pt-1">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nueva tarea..."
            className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            onClick={addTask}
            disabled={adding || !newLabel.trim()}
            className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 h-8 text-xs px-3 shrink-0"
          >
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Agregar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowAdd(false); setNewLabel(""); }}
            className="text-northpeak-text-muted h-8 text-xs px-2 shrink-0"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-northpeak-text-dim hover:text-northpeak-text transition-colors pt-1 pl-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar tarea
        </button>
      )}
    </div>
  );
}
