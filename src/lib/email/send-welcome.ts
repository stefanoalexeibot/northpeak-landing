import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  clientName,
  temporaryPassword,
  portalUrl,
}: {
  to: string;
  clientName: string;
  temporaryPassword: string;
  portalUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NorthPeak Digital <onboarding@resend.dev>",
      to,
      subject: `Bienvenido a NorthPeak Digital, ${clientName}!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #05060A; color: #E8E9ED; padding: 40px 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00E5A0; font-size: 28px; margin: 0;">NorthPeak Digital</h1>
          </div>

          <h2 style="color: #E8E9ED; font-size: 22px;">Hola, ${clientName}!</h2>

          <p style="color: #7A7D8A; font-size: 15px; line-height: 1.6;">
            Tu cuenta en el portal de clientes de NorthPeak Digital ha sido creada exitosamente.
            Aquí están tus credenciales de acceso:
          </p>

          <div style="background-color: #0C0D12; border: 1px solid #161821; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #7A7D8A; font-size: 13px;">Email</p>
            <p style="margin: 0 0 16px 0; color: #E8E9ED; font-size: 15px; font-weight: 600;">${to}</p>
            <p style="margin: 0 0 8px 0; color: #7A7D8A; font-size: 13px;">Contraseña temporal</p>
            <p style="margin: 0; color: #00E5A0; font-size: 15px; font-weight: 600; font-family: monospace;">${temporaryPassword}</p>
          </div>

          <p style="color: #7A7D8A; font-size: 14px; line-height: 1.6;">
            Te recomendamos cambiar tu contraseña una vez que inicies sesión.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${portalUrl}" style="display: inline-block; background-color: #00E5A0; color: #05060A; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Acceder al portal
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #161821; margin: 32px 0;" />
          <p style="color: #4A4D5A; font-size: 12px; text-align: center;">
            NorthPeak Digital &mdash; Este email fue enviado automáticamente.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
