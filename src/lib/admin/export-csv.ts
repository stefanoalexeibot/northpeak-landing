export function exportClientsCsv(clients: { name: string; email: string; company: string; phone?: string; created_at: string }[]) {
  const headers = ["Nombre", "Email", "Empresa", "Teléfono", "Fecha de registro"];
  const rows = clients.map(c => [
    c.name,
    c.email,
    c.company,
    c.phone || "",
    new Date(c.created_at).toLocaleDateString("es-MX"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clientes-northpeak-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
