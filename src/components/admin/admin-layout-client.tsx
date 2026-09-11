"use client";

import CommandSearch from "@/components/admin/command-search";
import Breadcrumbs from "@/components/admin/breadcrumbs";
import { Toaster } from "sonner";

export default function AdminLayoutClient() {
  return (
    <>
      <CommandSearch />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0c0d12",
            border: "1px solid hsl(228 8% 14%)",
            color: "#e5e7eb",
          },
        }}
      />
    </>
  );
}

export { Breadcrumbs };
