"use client";

import { useRouter } from "next/navigation";
import FileUpload from "@/components/portal/file-upload";

export default function FilesClient({ clientId }: { clientId: string }) {
  const router = useRouter();
  return <FileUpload clientId={clientId} onUploaded={() => router.refresh()} />;
}
