import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { requireEnvVar } from "@/utils/env-reading.utils";

let transporter: Transporter | null = null;

// Gmail butuh "App Password" (bukan password akun): Akun Google → Keamanan → Sandi Aplikasi.
function getTransporter() {
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: requireEnvVar("GMAIL_USER"),
      pass: requireEnvVar("GMAIL_APP_PASSWORD"),
    },
  });
  return transporter;
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await getTransporter().sendMail({
    from: `"Si Penyu" <${requireEnvVar("GMAIL_USER")}>`,
    to,
    subject,
    html,
  });
}
