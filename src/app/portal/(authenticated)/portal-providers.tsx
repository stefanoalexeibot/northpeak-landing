"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { Toaster } from "sonner";

function RealtimeListener({ clientId }: { clientId: string }) {
  useRealtimeNotifications(clientId);
  return null;
}

export default function PortalProviders({
  children,
  clientId,
  initialTheme,
}: {
  children: React.ReactNode;
  clientId: string;
  initialTheme?: string;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>
        <RealtimeListener clientId={clientId} />
        {children}
        <Toaster
          position="bottom-right"
          theme={initialTheme === "light" ? "light" : "dark"}
          toastOptions={{
            style: {
              background: initialTheme === "light" ? "#ffffff" : "#0c0d12",
              border: `1px solid ${initialTheme === "light" ? "#E0E1E6" : "hsl(228 8% 14%)"}`,
              color: initialTheme === "light" ? "#1A1C24" : "#e5e7eb",
            },
          }}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}

