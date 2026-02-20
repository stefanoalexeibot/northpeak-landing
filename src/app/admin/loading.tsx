import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="space-y-6">
            {/* Page header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>

            {/* Table rows */}
            <div className="rounded-xl border border-northpeak-surface bg-northpeak-card overflow-hidden">
                <div className="px-5 py-4 border-b border-northpeak-surface">
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="divide-y divide-northpeak-surface">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
