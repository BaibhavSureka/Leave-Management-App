import nodemailer from "nodemailer"

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) return
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject,
    html,
  })
}

export async function sendSlack({ text }) {
  if (!process.env.SLACK_WEBHOOK_URL) return
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  })
}
