"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { Client, Document, Project, MediaFile } from "@/lib/types";
import {
  Plus, Upload, FileText, Trash2, Download, Eye, Mail, CreditCard, CheckCircle, Clock, PenLine, Search, ExternalLink, Link2, Copy, Check,
} from "lucide-react";
import type { Payment } from "@/lib/types";
import ProjectTemplates from "@/components/admin/project-templates";
import DuplicateProject from "@/components/admin/duplicate-project";
import ClientActivityTimeline from "@/components/admin/client-activity-timeline";
import AIContentGenerator from "@/components/admin/ai-content-generator";
import AIStrategyCard from "@/components/admin/ai-strategy-card";
import TareasList from "@/components/admin/tareas-list";
import RecurringPayments from "@/components/admin/recurring-payments";
import ComboboxInput from "@/components/ui/combobox-input";
import { CONCEPTOS_PAGO } from "@/lib/suggestions";

interface AnalisisDigital {
  id: string;
  nombre_negocio: string;
  giro: string;
  zona?: string;
  score: number;
  nivel: string;
  report_url: string;
  created_at: string;
  oportunidades?: { titulo: string; canal: string; impacto: string }[];
}

interface Props {
  client: Client;
  documents: Document[];
  projects: (Project & { deliverables: { id: string; name: string; status: string; order_index: number }[] })[];
  media: MediaFile[];
  payments?: Payment[];
  analyses?: AnalisisDigital[];
}

export default function ClientDetailTabs({ client, documents, projects, media, payments = [], analyses = [] }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  // --- Info tab state ---
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company);
  const [phone, setPhone] = useState(client.phone || "");
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // --- Payment dialog ---
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payConcept, setPayConcept] = useState("");
  const [payMethod, setPayMethod] = useState("transfer");
  const [payStatus, setPayStatus] = useState("pending");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payDueDate, setPayDueDate] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // --- Document upload ---
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [docType, setDocType] = useState<string>("contract");
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // --- Project dialog ---
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projStatus, setProjStatus] = useState("planning");
  const [savingProject, setSavingProject] = useState(false);

  // --- Deliverable dialog ---
  const [showDeliverableDialog, setShowDeliverableDialog] = useState(false);
  const [delProjectId, setDelProjectId] = useState("");
  const [delName, setDelName] = useState("");
  const [savingDeliverable, setSavingDeliverable] = useState(false);

  // --- Media upload ---
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // --- Pago link dialog ---
  const [showPagoLinkDialog, setShowPagoLinkDialog] = useState(false);
  const [pagoLinkPaymentId, setPagoLinkPaymentId] = useState("");
  const [pagoLinkBanco, setPagoLinkBanco] = useState("");
  const [pagoLinkClabe, setPagoLinkClabe] = useState("");
  const [pagoLinkTitular, setPagoLinkTitular] = useState("");
  const [pagoLinkReferencia, setPagoLinkReferencia] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- Invoice dialog ---
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([{ concept: "", amount: "" }]);
  const [invoiceDiscount, setInvoiceDiscount] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);

  async function resendWelcomeEmail() {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/resend-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al enviar email");
      } else {
        alert("Email enviado correctamente");
        router.refresh();
      }
    } catch {
      alert("Error al enviar email");
    }
    setSendingEmail(false);
  }

  async function saveInfo() {
    setSaving(true);
    await supabase.from("clients").update({ name, company, phone: phone || null }).eq("id", client.id);
    setSaving(false);
    router.refresh();
  }

  async function createPayment() {
    if (!payAmount || !payConcept) return;
    setSavingPayment(true);
    const { error } = await supabase.from("payments").insert({
      client_id: client.id,
      amount: parseFloat(payAmount),
      concept: payConcept,
      payment_method: payMethod,
      status: payStatus,
      reference_number: payRef || null,
      notes: payNotes || null,
      due_date: payDueDate || null,
      paid_at: payStatus === "completed" ? new Date().toISOString() : null,
    });
    setSavingPayment(false);
    if (error) {
      addToast(`Error al registrar pago: ${error.message}`, "error");
      return;
    }
    addToast("Pago registrado exitosamente", "success");
    setShowPaymentDialog(false);
    setPayAmount("");
    setPayConcept("");
    setPayRef("");
    setPayNotes("");
    setPayDueDate("");
    router.refresh();
  }

  async function deletePayment(id: string) {
    const res = await fetch("/api/admin/delete-payment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      addToast(data.error || "Error al eliminar pago", "error");
      return;
    }
    router.refresh();
  }

  async function uploadDocument() {
    if (!docTitle) return;
    setUploadingDoc(true);

    let fileUrl = null;
    if (docFile) {
      const ext = docFile.name.split(".").pop();
      const path = `${client.id}/docs/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("client-files").upload(path, docFile);
      if (!error) {
        const { data } = supabase.storage.from("client-files").getPublicUrl(path);
        fileUrl = data.publicUrl;
      }
    }

    await supabase.from("documents").insert({
      client_id: client.id,
      type: docType,
      title: docTitle,
      file_url: fileUrl,
    });

    setShowDocDialog(false);
    setDocTitle("");
    setDocFile(null);
    setUploadingDoc(false);
    router.refresh();
  }

  async function saveInvoice() {
    setSavingInvoice(true);
    const items = invoiceItems.filter(i => i.concept && i.amount);
    const content = {
      items: items.map(i => ({ concept: i.concept, amount: parseFloat(i.amount) })),
      discount: invoiceDiscount ? parseFloat(invoiceDiscount) : 0,
      notes: invoiceNotes,
    };

    // Upsert invoice document
    const existing = documents.find(d => d.type === "invoice");
    if (existing) {
      await supabase.from("documents").update({ content, title: "Nota de venta" }).eq("id", existing.id);
    } else {
      await supabase.from("documents").insert({
        client_id: client.id,
        type: "invoice",
        title: "Nota de venta",
        content,
      });
    }

    setShowInvoiceDialog(false);
    setSavingInvoice(false);
    router.refresh();
  }

  async function createProject() {
    setSavingProject(true);
    await supabase.from("projects").insert({
      client_id: client.id,
      name: projName,
      description: projDesc || null,
      status: projStatus,
    });
    setShowProjectDialog(false);
    setProjName("");
    setProjDesc("");
    setSavingProject(false);
    router.refresh();
  }

  async function addDeliverable() {
    if (!delProjectId || !delName) return;
    setSavingDeliverable(true);
    const proj = projects.find(p => p.id === delProjectId);
    const maxOrder = proj?.deliverables?.reduce((m, d) => Math.max(m, d.order_index), -1) ?? -1;
    await supabase.from("deliverables").insert({
      project_id: delProjectId,
      name: delName,
      order_index: maxOrder + 1,
    });
    setShowDeliverableDialog(false);
    setDelName("");
    setSavingDeliverable(false);
    router.refresh();
  }

  async function updateDeliverableStatus(id: string, status: string) {
    await supabase.from("deliverables").update({ status }).eq("id", id);
    router.refresh();
  }

  async function updateProjectStatus(id: string, status: string) {
    await supabase.from("projects").update({ status }).eq("id", id);
    router.refresh();
  }

  async function uploadMedia() {
    if (!mediaFile) return;
    setUploadingMedia(true);

    const ext = mediaFile.name.split(".").pop();
    const path = `${client.id}/media/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("client-files").upload(path, mediaFile);

    if (!error) {
      const { data } = supabase.storage.from("client-files").getPublicUrl(path);
      await supabase.from("media").insert({
        client_id: client.id,
        name: mediaFile.name,
        file_url: data.publicUrl,
        file_type: mediaFile.type,
        file_size: mediaFile.size,
      });
    }

    setMediaFile(null);
    setUploadingMedia(false);
    router.refresh();
  }

  async function deleteDocument(id: string) {
    const res = await fetch("/api/admin/delete-document", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      addToast(data.error || "Error al eliminar documento", "error");
      return;
    }
    router.refresh();
  }

  async function confirmPayment(paymentId: string) {
    const res = await fetch("/api/admin/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId }),
    });
    if (!res.ok) {
      const data = await res.json();
      addToast(data.error || "Error al confirmar pago", "error");
      return;
    }
    addToast("Pago confirmado como recibido", "success");
    router.refresh();
  }

  async function deleteMedia(id: string) {
    const res = await fetch("/api/admin/delete-media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      addToast(data.error || "Error al eliminar archivo", "error");
      return;
    }
    router.refresh();
  }

  async function deleteProject(id: string) {
    const res = await fetch("/api/admin/delete-project", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      addToast(data.error || "Error al eliminar proyecto", "error");
      return;
    }
    router.refresh();
  }

  function openPagoLink(paymentId: string) {
    setPagoLinkPaymentId(paymentId);
    setPagoLinkBanco("NU MEXICO");
    setPagoLinkClabe("638180010141018767");
    setPagoLinkTitular("JOSE ALEJANDRO LUNA DE LEON");
    setPagoLinkReferencia("");
    setGeneratedLink(null);
    setCopiedLink(false);
    setShowPagoLinkDialog(true);
  }

  async function generatePagoLink() {
    if (!pagoLinkBanco || !pagoLinkClabe || !pagoLinkTitular) {
      addToast("Completa banco, CLABE y titular", "error");
      return;
    }
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/admin/pago-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: pagoLinkPaymentId,
          datos_bancarios: {
            banco: pagoLinkBanco,
            clabe: pagoLinkClabe,
            titular: pagoLinkTitular,
            ...(pagoLinkReferencia ? { referencia: pagoLinkReferencia } : {}),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedLink(`${window.location.origin}/pago/${data.token}`);
      } else {
        addToast(data.error || "Error al generar enlace", "error");
      }
    } catch {
      addToast("Error de conexión", "error");
    }
    setGeneratingLink(false);
  }

  async function copyPagoLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // Load invoice data for editing
  function openInvoiceEditor() {
    const existing = documents.find(d => d.type === "invoice");
    if (existing?.content) {
      const c = typeof existing.content === "string" ? JSON.parse(existing.content) : existing.content;
      setInvoiceItems(
        c.items?.length ? c.items.map((i: { concept: string; amount: number }) => ({ concept: i.concept, amount: String(i.amount) })) : [{ concept: "", amount: "" }]
      );
      setInvoiceDiscount(c.discount ? String(c.discount) : "");
      setInvoiceNotes(c.notes || "");
    } else {
      setInvoiceItems([{ concept: "", amount: "" }]);
      setInvoiceDiscount("");
      setInvoiceNotes("");
    }
    setShowInvoiceDialog(true);
  }

  return (
    <>
      <Tabs defaultValue="info">
        <TabsList className="bg-northpeak-surface w-full overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="info" className="data-[state=active]:bg-northpeak-card">Info</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-northpeak-card">Documentos</TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-northpeak-card">Proyectos</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-northpeak-card">Archivos</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-northpeak-card">Pagos</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-northpeak-card">Actividad</TabsTrigger>
          <TabsTrigger value="analyses" className="data-[state=active]:bg-northpeak-card">Análisis</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-northpeak-card">IA</TabsTrigger>
        </TabsList>

        {/* INFO TAB */}
        <TabsContent value="info">
          <div className="space-y-4">
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-northpeak-text">Nombre</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-northpeak-text">Empresa</Label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-northpeak-text-muted">Email</Label>
                    <Input value={client.email} disabled className="bg-northpeak-bg border-northpeak-surface text-northpeak-text-dim" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-northpeak-text">Teléfono</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveInfo} disabled={saving} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button onClick={resendWelcomeEmail} disabled={sendingEmail} variant="outline" className="border-northpeak-surface text-northpeak-text-muted">
                    <Mail className="h-4 w-4 mr-2" />
                    {sendingEmail ? "Enviando..." : "Reenviar email"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-6">
                <TareasList clientId={client.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-northpeak-text font-heading">Documentos</CardTitle>
              <div className="flex gap-2">
                <Button onClick={openInvoiceEditor} variant="outline" className="border-northpeak-surface text-northpeak-text-muted text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Nota de venta
                </Button>
                <Button onClick={() => setShowDocDialog(true)} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Subir documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-northpeak-text-muted text-sm">No hay documentos.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="rounded-lg bg-northpeak-bg">
                      <div className="flex items-center gap-3 p-3">
                        <FileText className="h-5 w-5 text-northpeak-green shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">{doc.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-northpeak-text-dim capitalize">{doc.type === "invoice" ? "Nota de venta" : doc.type === "contract" ? "Contrato" : "Bienvenida"}</p>
                            {doc.type === "contract" && (
                              doc.signed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-northpeak-green bg-northpeak-green/10 px-1.5 py-0.5 rounded-full">
                                  <CheckCircle className="h-3 w-3" />
                                  Firmado {doc.signed_at && `— ${new Date(doc.signed_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  Pendiente de firma
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.id)} className="text-northpeak-text-muted hover:text-red-400 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {doc.type === "contract" && doc.signed && doc.signature_data && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="flex items-center gap-2 mb-2">
                            <PenLine className="h-3.5 w-3.5 text-northpeak-text-dim" />
                            <span className="text-xs text-northpeak-text-dim">Firma del cliente</span>
                          </div>
                          <div className="rounded-md bg-white p-3 inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={doc.signature_data} alt="Firma" className="h-16" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-northpeak-text font-heading">Proyectos</CardTitle>
              <div className="flex gap-2">
                <ProjectTemplates clientId={client.id} />
                <Button onClick={() => setShowProjectDialog(true)} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Nuevo proyecto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-northpeak-text-muted text-sm">No hay proyectos.</p>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="rounded-lg bg-northpeak-bg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-northpeak-text">{proj.name}</p>
                        {proj.description && <p className="text-xs text-northpeak-text-muted mt-0.5">{proj.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={proj.status}
                          onChange={(e) => updateProjectStatus(proj.id, e.target.value)}
                          className="bg-northpeak-card border-northpeak-surface text-northpeak-text text-xs h-8 w-36"
                        >
                          <option value="planning">Planeación</option>
                          <option value="in_progress">En progreso</option>
                          <option value="review">Revisión</option>
                          <option value="completed">Completado</option>
                          <option value="paused">Pausado</option>
                        </Select>
                        <DuplicateProject project={proj} clientId={client.id} />
                        <Button variant="ghost" size="icon" onClick={() => deleteProject(proj.id)} className="text-northpeak-text-muted hover:text-red-400 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Deliverables */}
                    <div className="space-y-1.5 pl-2">
                      {proj.deliverables
                        ?.sort((a, b) => a.order_index - b.order_index)
                        .map((del) => (
                          <div key={del.id} className="flex items-center gap-2">
                            <Select
                              value={del.status}
                              onChange={(e) => updateDeliverableStatus(del.id, e.target.value)}
                              className="bg-northpeak-card border-northpeak-surface text-xs h-7 w-28 text-northpeak-text"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="in_progress">En progreso</option>
                              <option value="review">Revisión</option>
                              <option value="completed">Completado</option>
                            </Select>
                            <span className="text-sm text-northpeak-text">{del.name}</span>
                          </div>
                        ))}
                      <Button
                        variant="ghost"
                        className="text-xs text-northpeak-text-muted hover:text-northpeak-green h-7 px-2"
                        onClick={() => { setDelProjectId(proj.id); setShowDeliverableDialog(true); }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar entregable
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments">
          <div className="space-y-4">
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-northpeak-text font-heading">Pagos</CardTitle>
                <Button onClick={() => setShowPaymentDialog(true)} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Registrar pago
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-northpeak-text-muted text-sm">No hay pagos registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((pay) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = pay.due_date ? new Date(pay.due_date + "T00:00:00") : null;
                      const isOverdue = dueDate && dueDate < today && pay.status !== "completed";
                      const isUpcoming = dueDate && !isOverdue && dueDate.getTime() - today.getTime() < 7 * 86400000 && pay.status !== "completed";
                      return (
                      <div key={pay.id} className="flex items-center gap-3 rounded-lg p-3 bg-northpeak-bg">
                        <CreditCard className="h-5 w-5 text-northpeak-green shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">{pay.concept}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-northpeak-text-dim">
                              {pay.payment_method === "transfer" ? "Transferencia" : pay.payment_method === "card" ? "Tarjeta" : pay.payment_method === "cash" ? "Efectivo" : pay.payment_method === "other" ? "Otro" : pay.payment_method}
                              {pay.reference_number ? ` — ${pay.reference_number}` : ""}
                            </p>
                            {pay.due_date && (
                              <span className="text-xs text-northpeak-text-dim">
                                Vence: {new Date(pay.due_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                                Vencido
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="text-[10px] font-medium text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
                                Próximo
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-northpeak-text">${Number(pay.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                          <span className={`text-xs font-medium ${pay.status === "completed" ? "text-northpeak-green" : pay.status === "failed" ? "text-red-400" : "text-yellow-400"}`}>
                            {pay.status === "completed" ? "Pagado" : pay.status === "pending" ? "Pendiente" : pay.status === "failed" ? "Fallido" : "Reembolsado"}
                          </span>
                        </div>
                        {pay.comprobante_url && (
                          <a
                            href={pay.comprobante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver comprobante"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-northpeak-green hover:bg-northpeak-green/10 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {pay.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPagoLink(pay.id)}
                              title="Generar link de pago"
                              className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8"
                            >
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmPayment(pay.id)}
                              title="Confirmar pago recibido"
                              className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deletePayment(pay.id)} className="text-northpeak-text-muted hover:text-red-400 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-6">
                <RecurringPayments clientId={client.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading">Timeline de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientActivityTimeline
                clientId={client.id}
                createdAt={client.created_at}
                welcomeEmailSentAt={client.welcome_email_sent_at}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYSES TAB */}
        <TabsContent value="analyses">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-northpeak-text font-heading">Análisis digital</CardTitle>
              <a href={`/admin/analizador?client_id=${client.id}&client_name=${encodeURIComponent(client.name)}`}>
                <Button className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  Nuevo análisis
                </Button>
              </a>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <p className="text-northpeak-text-muted text-sm">No hay análisis vinculados a este cliente.</p>
              ) : (
                <div className="space-y-2">
                  {analyses.map((a) => {
                    const nivelColor =
                      a.nivel === "CRITICO" ? "text-red-400 bg-red-400/10" :
                      a.nivel === "BAJO" ? "text-yellow-400 bg-yellow-400/10" :
                      a.nivel === "MEDIO" ? "text-blue-400 bg-blue-400/10" :
                      "text-northpeak-green bg-northpeak-green/10";
                    return (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg p-3 bg-northpeak-bg">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-northpeak-surface shrink-0">
                          <span className="text-lg font-bold text-northpeak-text">{a.score}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">{a.nombre_negocio}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-northpeak-text-dim">{a.giro}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${nivelColor}`}>{a.nivel}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-northpeak-text-dim">
                            {new Date(a.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <a href={`/api/admin/analisis/${a.id}`} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI TAB */}
        <TabsContent value="ai">
          <div className="space-y-4">
            <AIContentGenerator
              clientName={client.name}
              company={client.company}
              giro={analyses[0]?.giro || ""}
              zona={analyses[0]?.zona || ""}
              score={analyses[0]?.score}
              oportunidades={analyses[0]?.oportunidades?.map((o) => o.titulo)}
            />
            <AIStrategyCard
              clientId={client.id}
              analisis={analyses[0] ? {
                id: analyses[0].id,
                nombre_negocio: analyses[0].nombre_negocio,
                giro: analyses[0].giro,
                zona: analyses[0].zona,
                score: analyses[0].score,
                nivel: analyses[0].nivel,
                oportunidades: analyses[0].oportunidades,
              } : null}
            />
          </div>
        </TabsContent>

        {/* FILES TAB */}
        <TabsContent value="files">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-northpeak-text font-heading">Archivos</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setMediaFile(f); }
                  }}
                />
                {mediaFile && (
                  <Button onClick={uploadMedia} disabled={uploadingMedia} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs">
                    {uploadingMedia ? "Subiendo..." : "Confirmar subida"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-northpeak-surface text-northpeak-text-muted text-xs"
                  onClick={() => document.getElementById("media-upload")?.click()}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {mediaFile ? mediaFile.name : "Seleccionar archivo"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {media.length === 0 ? (
                <p className="text-northpeak-text-muted text-sm">No hay archivos.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {media.map((file) => (
                    <div key={file.id} className="rounded-lg bg-northpeak-bg p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-northpeak-surface shrink-0">
                        {file.file_type.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={file.file_url} alt={file.name} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <FileText className="h-5 w-5 text-northpeak-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-northpeak-text truncate">{file.name}</p>
                        <p className="text-xs text-northpeak-text-dim">
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <a href={file.file_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" onClick={() => deleteMedia(file.id)} className="text-northpeak-text-muted hover:text-red-400 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* UPLOAD DOCUMENT DIALOG */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Subir documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Tipo</Label>
              <Select value={docType} onChange={(e) => setDocType(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text">
                <option value="contract">Contrato</option>
                <option value="welcome">Bienvenida</option>
                <option value="invoice">Nota de venta</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Título</Label>
              <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Contrato de servicios" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Archivo (PDF)</Label>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
            <Button onClick={uploadDocument} disabled={uploadingDoc || !docTitle} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              {uploadingDoc ? "Subiendo..." : "Subir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW PROJECT DIALOG */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nombre</Label>
              <Input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="Rediseño web" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Descripción</Label>
              <Textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="Descripción del proyecto..." className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Estado</Label>
              <Select value={projStatus} onChange={(e) => setProjStatus(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text">
                <option value="planning">Planeación</option>
                <option value="in_progress">En progreso</option>
                <option value="review">Revisión</option>
                <option value="completed">Completado</option>
                <option value="paused">Pausado</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
            <Button onClick={createProject} disabled={savingProject || !projName} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              {savingProject ? "Creando..." : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD DELIVERABLE DIALOG */}
      <Dialog open={showDeliverableDialog} onOpenChange={setShowDeliverableDialog}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Agregar entregable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nombre del entregable</Label>
              <Input value={delName} onChange={(e) => setDelName(e.target.value)} placeholder="Diseño de homepage" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliverableDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
            <Button onClick={addDeliverable} disabled={savingDeliverable || !delName} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              {savingDeliverable ? "Agregando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT DIALOG */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Registrar pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Monto ($)</Label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Método</Label>
                <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text">
                  <option value="transfer">Transferencia</option>
                  <option value="card">Tarjeta</option>
                  <option value="cash">Efectivo</option>
                  <option value="other">Otro</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Concepto</Label>
              <ComboboxInput
                value={payConcept}
                onChange={setPayConcept}
                options={CONCEPTOS_PAGO}
                placeholder="Pago mensual de servicios"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Estado</Label>
                <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text">
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Referencia</Label>
                <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Opcional" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Fecha de vencimiento</Label>
                <Input type="date" value={payDueDate} onChange={(e) => setPayDueDate(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Notas</Label>
              <Textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Notas opcionales..." className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
            <Button onClick={createPayment} disabled={savingPayment || !payAmount || !payConcept} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              {savingPayment ? "Guardando..." : "Registrar pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAGO LINK DIALOG */}
      <Dialog open={showPagoLinkDialog} onOpenChange={(open) => { setShowPagoLinkDialog(open); if (!open) setGeneratedLink(null); }}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-md">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Generar link de pago</DialogTitle>
          </DialogHeader>
          {!generatedLink ? (
            <div className="space-y-4">
              <p className="text-xs text-northpeak-text-muted">El cliente verá estos datos bancarios en su enlace de pago.</p>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Banco *</Label>
                <Input value={pagoLinkBanco} onChange={(e) => setPagoLinkBanco(e.target.value)} placeholder="Ej: BBVA, Banorte, HSBC" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">CLABE interbancaria *</Label>
                <Input value={pagoLinkClabe} onChange={(e) => setPagoLinkClabe(e.target.value)} placeholder="18 dígitos" maxLength={18} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Titular de la cuenta *</Label>
                <Input value={pagoLinkTitular} onChange={(e) => setPagoLinkTitular(e.target.value)} placeholder="Nombre del titular" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Referencia (opcional)</Label>
                <Input value={pagoLinkReferencia} onChange={(e) => setPagoLinkReferencia(e.target.value)} placeholder="Ej: NP-2024-001" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPagoLinkDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
                <Button onClick={generatePagoLink} disabled={generatingLink || !pagoLinkBanco || !pagoLinkClabe || !pagoLinkTitular} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                  <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  {generatingLink ? "Generando..." : "Generar enlace"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-northpeak-bg p-4 space-y-2">
                <p className="text-xs text-northpeak-text-muted">Enlace generado — comparte con el cliente:</p>
                <p className="text-sm font-mono text-northpeak-green break-all">{generatedLink}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyPagoLink} className="flex-1 bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  {copiedLink ? "Copiado" : "Copiar enlace"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(generatedLink, "_blank")}
                  className="border-northpeak-surface text-northpeak-text-muted hover:bg-northpeak-surface"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setShowPagoLinkDialog(false)} className="w-full text-northpeak-text-muted">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* INVOICE EDITOR DIALOG */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Editor de nota de venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Conceptos</Label>
              {invoiceItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item.concept}
                    onChange={(e) => {
                      const items = [...invoiceItems];
                      items[i].concept = e.target.value;
                      setInvoiceItems(items);
                    }}
                    placeholder="Concepto"
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text flex-1"
                  />
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={(e) => {
                      const items = [...invoiceItems];
                      items[i].amount = e.target.value;
                      setInvoiceItems(items);
                    }}
                    placeholder="Monto"
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text w-32"
                  />
                  {invoiceItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setInvoiceItems(invoiceItems.filter((_, j) => j !== i))}
                      className="text-red-400 h-10 w-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={() => setInvoiceItems([...invoiceItems, { concept: "", amount: "" }])}
                className="text-northpeak-green text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar concepto
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Descuento ($)</Label>
              <Input
                type="number"
                value={invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(e.target.value)}
                placeholder="0"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text w-48"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Notas</Label>
              <Textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Notas adicionales..."
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)} className="border-northpeak-surface text-northpeak-text-muted">Cancelar</Button>
            <Button onClick={saveInvoice} disabled={savingInvoice} className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              {savingInvoice ? "Guardando..." : "Guardar nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
