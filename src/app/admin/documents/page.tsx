"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  FileText,
  Download,
  Archive,
  CheckCircle,
  Loader2,
  Settings,
} from "lucide-react";
import {
  generateWelcomePDF,
  generateContractPDF,
  generateProposalPDF,
  generateQuotePDF,
  BUSINESS_TYPES,
  DEFAULT_CONFIG,
  type ClientFormData,
  type EditableConfig,
} from "@/lib/pdf";

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
}

export default function AdminDocumentsPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  // Client fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("Otro");
  const [zone, setZone] = useState("");
  const [startDate, setStartDate] = useState("");

  // Editable config
  const [config, setConfig] = useState<EditableConfig>({ ...DEFAULT_CONFIG });
  const [showConfig, setShowConfig] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfs, setPdfs] = useState<{ name: string; blob: Blob }[]>([]);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("id, name, email, company, phone")
        .order("name");
      setClients(data ?? []);
    }
    loadClients();
  }, []);

  function handleClientSelect(clientId: string) {
    setSelectedClientId(clientId);
    if (clientId) {
      const c = clients.find((cl) => cl.id === clientId);
      if (c) {
        setName(c.name);
        setEmail(c.email);
        setBusinessName(c.company || "");
        setPhone(c.phone || "");
      }
    }
  }

  function updateConfig(key: keyof EditableConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }

  function getFormData(): ClientFormData {
    return {
      name,
      businessName,
      phone,
      email,
      businessType,
      zone,
      startDate,
      clientId: selectedClientId || undefined,
      config,
    };
  }

  async function getQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `np-quote-counter-${year}`;
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    const next = current + 1;
    localStorage.setItem(key, String(next));
    return `NP-${year}-${String(next).padStart(3, "0")}`;
  }

  async function handleGenerate() {
    if (!name || !email || !startDate) return;
    setGenerating(true);
    setGenerated(false);
    setSaved(false);

    try {
      const data = getFormData();
      const quoteNumber = await getQuoteNumber();

      const welcome = generateWelcomePDF(data);
      const contract = generateContractPDF(data);
      const proposal = generateProposalPDF(data);
      const quote = generateQuotePDF(data, quoteNumber);

      const clientSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const newPdfs = [
        { name: `${clientSlug}-bienvenida.pdf`, blob: welcome.output("blob") },
        { name: `${clientSlug}-contrato.pdf`, blob: contract.output("blob") },
        { name: `${clientSlug}-propuesta.pdf`, blob: proposal.output("blob") },
        { name: `${clientSlug}-cotizacion-${quoteNumber}.pdf`, blob: quote.output("blob") },
      ];

      setPdfs(newPdfs);
      setGenerated(true);

      // Auto-save to Supabase if client is selected
      if (selectedClientId) {
        await saveToSupabase(newPdfs, selectedClientId);
      }
    } catch (err) {
      console.error("Error generating PDFs:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function saveToSupabase(pdfList: { name: string; blob: Blob }[], clientId: string) {
    setSaving(true);

    try {
      const docMappings = [
        { keyword: "bienvenida", type: "welcome", title: "Documento de Bienvenida" },
        { keyword: "contrato", type: "contract", title: "Contrato de Prestacion de Servicios" },
        { keyword: "propuesta", type: "welcome", title: "Propuesta Comercial" },
        { keyword: "cotizacion", type: "invoice", title: "Cotizacion" },
      ];

      for (const pdf of pdfList) {
        const path = `${clientId}/docs/${Date.now()}-${pdf.name}`;

        await supabase.storage.from("client-files").upload(path, pdf.blob, {
          contentType: "application/pdf",
          upsert: true,
        });

        const { data: urlData } = supabase.storage.from("client-files").getPublicUrl(path);

        const mapping = docMappings.find((m) => pdf.name.includes(m.keyword));

        await supabase.from("documents").insert({
          client_id: clientId,
          type: mapping?.type || "welcome",
          title: mapping?.title || "Documento",
          file_url: urlData.publicUrl,
        });
      }

      setSaved(true);
    } catch (err) {
      console.error("Error saving to Supabase:", err);
    } finally {
      setSaving(false);
    }
  }

  function downloadPdf(pdf: { name: string; blob: Blob }) {
    const url = URL.createObjectURL(pdf.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdf.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAllAsZip() {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    pdfs.forEach((pdf) => zip.file(pdf.name, pdf.blob));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `northpeak-documentos-${name.toLowerCase().replace(/\s+/g, "-")}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pdfLabels: Record<string, { label: string; color: string }> = {
    bienvenida: { label: "Bienvenida", color: "text-pink-400" },
    contrato: { label: "Contrato", color: "text-blue-400" },
    propuesta: { label: "Propuesta Comercial", color: "text-purple-400" },
    cotizacion: { label: "Cotizacion", color: "text-yellow-400" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Generar Documentos</h1>
        <p className="text-northpeak-text-muted mt-1">Genera los 4 PDFs del Piloto de Validacion para un cliente</p>
      </div>

      {/* Client data form */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading text-lg">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-northpeak-text">Cliente existente (opcional)</Label>
              <Select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
              >
                <option value="">-- Llenar manualmente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nombre completo *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Juan Perez" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Nombre del negocio *</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required placeholder="Mi Negocio" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="cliente@email.com" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Telefono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 812 000 0000" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-northpeak-text">Tipo de negocio</Label>
              <Select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="bg-northpeak-bg border-northpeak-surface text-northpeak-text">
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Zona / Colonia</Label>
              <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Cumbres, Monterrey" className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
            <div className="space-y-2">
              <Label className="text-northpeak-text">Fecha de inicio *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-northpeak-bg border-northpeak-surface text-northpeak-text" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable config */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowConfig(!showConfig)}
        >
          <CardTitle className="text-northpeak-text font-heading text-lg flex items-center gap-2">
            <Settings className="h-4 w-4 text-northpeak-text-muted" />
            Configuracion del documento
            <span className="text-xs text-northpeak-text-dim font-normal ml-2">
              {showConfig ? "(ocultar)" : "(editar precios, dias, IVA...)"}
            </span>
          </CardTitle>
        </CardHeader>
        {showConfig && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text">Precio del piloto (MXN)</Label>
                <Input
                  type="number"
                  value={config.pilotPrice}
                  onChange={(e) => updateConfig("pilotPrice", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Duracion (dias)</Label>
                <Input
                  type="number"
                  value={config.pilotDays}
                  onChange={(e) => updateConfig("pilotDays", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">IVA (%)</Label>
                <Input
                  type="number"
                  value={config.ivaPercent}
                  onChange={(e) => updateConfig("ivaPercent", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Presupuesto Ads min (MXN)</Label>
                <Input
                  type="number"
                  value={config.adBudgetMin}
                  onChange={(e) => updateConfig("adBudgetMin", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Presupuesto Ads max (MXN)</Label>
                <Input
                  type="number"
                  value={config.adBudgetMax}
                  onChange={(e) => updateConfig("adBudgetMax", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text">Vigencia cotizacion (dias)</Label>
                <Input
                  type="number"
                  value={config.quoteValidDays}
                  onChange={(e) => updateConfig("quoteValidDays", e.target.value)}
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>
            <p className="text-xs text-northpeak-text-dim">
              Estos valores se reflejan en los 4 PDFs: contrato, propuesta, cotizacion y bienvenida.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Generate button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={generating || !name || !email || !startDate}
          className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 h-12 px-8 text-base"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Generar 4 Documentos
            </>
          )}
        </Button>
        {selectedClientId && (
          <p className="text-xs text-northpeak-text-dim">
            Se guardaran automaticamente en el portal del cliente
          </p>
        )}
      </div>

      {/* Generated PDFs */}
      {generated && pdfs.length > 0 && (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-northpeak-text font-heading text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-northpeak-green" />
              Documentos generados
              {saving && <Loader2 className="h-4 w-4 animate-spin text-northpeak-text-muted" />}
              {saved && <span className="text-xs text-northpeak-green font-normal ml-2">Guardados en el portal del cliente</span>}
            </CardTitle>
            <Button
              onClick={downloadAllAsZip}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs"
            >
              <Archive className="h-3 w-3 mr-1" />
              Descargar ZIP
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pdfs.map((pdf) => {
                const key = Object.keys(pdfLabels).find((k) => pdf.name.includes(k));
                const meta = key ? pdfLabels[key] : { label: "Documento", color: "text-northpeak-text" };

                return (
                  <div
                    key={pdf.name}
                    className="flex items-center gap-3 rounded-lg bg-northpeak-bg p-4 cursor-pointer hover:bg-northpeak-surface transition-colors"
                    onClick={() => downloadPdf(pdf)}
                  >
                    <FileText className={`h-8 w-8 ${meta.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-northpeak-text">{meta.label}</p>
                      <p className="text-xs text-northpeak-text-dim truncate">{pdf.name}</p>
                    </div>
                    <Download className="h-4 w-4 text-northpeak-text-muted" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
