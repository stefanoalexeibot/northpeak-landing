"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

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
      </ToastProvider>
    </ThemeProvider>
  );
}
