import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "alejandro@northpeakdigital.com";

export async function notifyAdmin({ subject, body }: { subject: string; body: string }) {
  if (!process.env.RESEND_API_KEY) return { success: false, error: "No RESEND_API_KEY" };

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "NorthPeak Digital <hola@northpeakdigital.com.mx>",
      to: ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #05060A; color: #E8E9ED; padding: 40px 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00E5A0; font-size: 28px; margin: 0;">NorthPeak Digital</h1>
          </div>
          <div style="color: #E8E9ED; font-size: 15px; line-height: 1.6;">
            ${body}
          </div>
          <hr style="border: none; border-top: 1px solid #161821; margin: 32px 0;" />
          <p style="color: #4A4D5A; font-size: 12px; text-align: center;">
            NorthPeak Digital &mdash; Notificación automática del portal.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error notifying admin:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error notifying admin:", error);
    return { success: false, error };
  }
}
