import { registerAs } from "@nestjs/config";

export const feedbackConfig = registerAs("feedback", () => ({
  emailTo: process.env.FEEDBACK_EMAIL_TO ?? "amankori2307@gmail.com",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? "Learn Language <no-reply@learn-language.local>",
}));
