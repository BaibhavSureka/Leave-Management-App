import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    // Email sending skipped - SMTP not configured properly
    console.log(`Would send email to ${to}: ${subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
}

export async function sendSlack({ text }) {
  if (
    !process.env.SLACK_WEBHOOK_URL ||
    process.env.SLACK_WEBHOOK_URL.includes("your/slack/webhook")
  ) {
    console.log("Slack notification skipped - webhook not configured");
    console.log(`Would send Slack message: ${text}`);
    return;
  }

  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log(`Slack notification sent: ${text}`);
    return response;
  } catch (error) {
    console.error("Slack notification failed:", error.message);
    throw error;
  }
}
