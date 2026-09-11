"use client";

import { useEffect } from "react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-lg font-heading font-bold text-northpeak-text">
                    Algo salió mal
                </h2>
                <p className="text-sm text-northpeak-text-muted">
                    Ocurrió un error inesperado. Intenta recargar la página.
                </p>
                <button
                    onClick={reset}
                    className="px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}
