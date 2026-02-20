import Link from "next/link";
import { FileSearch, Plus } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon: Icon = FileSearch,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Illustrated icon */}
            <div className="relative mb-6">
                <div className="absolute inset-0 blur-2xl bg-northpeak-green/10 rounded-full" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-northpeak-surface bg-northpeak-card shadow-lg">
                    <Icon className="h-8 w-8 text-northpeak-text-dim" />
                </div>
            </div>

            <h3 className="font-heading font-bold text-xl text-northpeak-text mb-2">
                {title}
            </h3>
            <p className="text-sm text-northpeak-text-muted max-w-sm mb-6 leading-relaxed">
                {description}
            </p>

            {actionLabel && (actionHref || onAction) && (
                actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" />
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" />
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
}
