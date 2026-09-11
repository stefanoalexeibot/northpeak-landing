"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface ChecklistItem {
  label: string;
  done: boolean;
  detail?: string;
}

interface Props {
  items: ChecklistItem[];
}

export default function OnboardingChecklist({ items }: Props) {
  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-northpeak-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-northpeak-green rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-mono text-northpeak-text-muted whitespace-nowrap">
          {completed}/{total}
        </span>
      </div>

      {/* Checklist items */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
              item.done
                ? "text-northpeak-text-muted"
                : "text-northpeak-text bg-northpeak-bg"
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-northpeak-green shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-northpeak-text-dim shrink-0" />
            )}
            <span className={item.done ? "line-through" : "font-medium"}>
              {item.label}
            </span>
            {item.detail && (
              <span className="text-xs text-northpeak-text-dim ml-auto">
                {item.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
