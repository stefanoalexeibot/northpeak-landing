import { Resend } from "resend";

export async function sendPaymentReminder({
  to,
  clientName,
  concept,
  amount,
  dueDate,
  isOverdue,
  portalUrl,
}: {
  to: string;
  clientName: string;
  concept: string;
  amount: number;
  dueDate: string;
  isOverdue: boolean;
  portalUrl: string;
}) {
  if (!process.env.RESEND_API_KEY) return { success: false, error: "No RESEND_API_KEY" };

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const formattedAmount = `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
    const formattedDate = new Date(dueDate + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const subject = isOverdue
      ? `Pago vencido: ${concept} — ${formattedAmount}`
      : `Recordatorio de pago: ${concept} — ${formattedAmount}`;

    const statusText = isOverdue
      ? `<span style="color: #EF4444; font-weight: 600;">Vencido desde el ${formattedDate}</span>`
      : `<span style="color: #F59E0B; font-weight: 600;">Vence el ${formattedDate}</span>`;

    const { data, error } = await resend.emails.send({
      from: "NorthPeak Digital <hola@northpeakdigital.com.mx>",
      to,
      subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #05060A; color: #E8E9ED; padding: 40px 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00E5A0; font-size: 28px; margin: 0;">NorthPeak Digital</h1>
          </div>

          <h2 style="color: #E8E9ED; font-size: 22px;">Hola, ${clientName}</h2>

          <p style="color: #7A7D8A; font-size: 15px; line-height: 1.6;">
            ${isOverdue
              ? "Te notificamos que tienes un pago vencido. Por favor realiza tu pago a la brevedad."
              : "Este es un recordatorio amigable de que tienes un pago próximo a vencer."
            }
          </p>

          <div style="background-color: #0C0D12; border: 1px solid ${isOverdue ? "#EF4444" : "#161821"}; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #7A7D8A; font-size: 13px;">Concepto</p>
            <p style="margin: 0 0 16px 0; color: #E8E9ED; font-size: 15px; font-weight: 600;">${concept}</p>
            <p style="margin: 0 0 8px 0; color: #7A7D8A; font-size: 13px;">Monto</p>
            <p style="margin: 0 0 16px 0; color: #00E5A0; font-size: 20px; font-weight: 700;">${formattedAmount}</p>
            <p style="margin: 0 0 8px 0; color: #7A7D8A; font-size: 13px;">Estado</p>
            <p style="margin: 0;">${statusText}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${portalUrl}" style="display: inline-block; background-color: #00E5A0; color: #05060A; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Ver en mi portal
            </a>
          </div>

          <p style="color: #4A4D5A; font-size: 13px; line-height: 1.5;">
            Si ya realizaste el pago, ignora este mensaje. Para cualquier duda, responde a este correo.
          </p>

          <hr style="border: none; border-top: 1px solid #161821; margin: 32px 0;" />
          <p style="color: #4A4D5A; font-size: 12px; text-align: center;">
            NorthPeak Digital &mdash; Recordatorio automático.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending payment reminder:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return { success: false, error };
  }
}
