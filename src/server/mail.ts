import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/data/site";
import { STATUS_LABEL } from "@/lib/constants";

/**
 * Email delivery. Configure SMTP_* in .env (Gmail app password, Zoho, Resend
 * SMTP, etc.). Without SMTP_HOST, messages are logged to the server console
 * instead, so every flow still works in development.
 */

let transporter: Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      })
    : null;
  return transporter;
}

const FROM = process.env.MAIL_FROM ?? `"${site.name}" <no-reply@moaum.edu.ng>`;
const UNIT_INBOX = process.env.MAIL_UNIT_INBOX ?? site.contact.email;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Branded HTML shell shared by every message. */
function layout(heading: string, bodyHtml: string, cta?: { label: string; path: string }) {
  const button = cta
    ? `<p style="margin:28px 0 8px"><a href="${site.url}${cta.path}" style="background:#C9A227;color:#062e25;padding:12px 22px;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block">${escape(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f6f5;font-family:Segoe UI,Arial,sans-serif;color:#13201c">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0A4D3C;padding:22px 28px;border-bottom:4px solid #C9A227">
<div style="color:#ffffff;font-size:18px;font-weight:700">MOAUM <span style="color:#E0C056">Consultancy</span></div>
<div style="color:#a3d8c5;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:4px">${escape(site.university)}</div>
</td></tr>
<tr><td style="padding:28px">
<h1 style="font-size:20px;margin:0 0 16px;color:#0A4D3C">${escape(heading)}</h1>
${bodyHtml}${button}
</td></tr>
<tr><td style="background:#f3f6f5;padding:16px 28px;font-size:12px;color:#5d6b66">
${escape(site.unit)} · ${escape(site.contact.email)} · ${escape(site.contact.phone)}<br>This is an automated message; replies go to the Unit's inbox.
</td></tr></table></td></tr></table></body></html>`;
}

const p = (text: string) => `<p style="margin:0 0 12px;line-height:1.6;font-size:15px">${text}</p>`;
const detail = (rows: [string, string][]) =>
  `<table cellpadding="0" cellspacing="0" style="width:100%;background:#f3f6f5;border-radius:10px;margin:8px 0 12px">${rows
    .map(([k, v]) => `<tr><td style="padding:8px 14px;font-size:13px;color:#5d6b66;width:40%">${escape(k)}</td><td style="padding:8px 14px;font-size:14px;font-weight:600">${escape(v)}</td></tr>`)
    .join("")}</table>`;

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/**
 * Sends an email without ever throwing: a mail outage must not undo or fail
 * the application, registration or review that triggered it.
 */
export async function sendMail({ to, subject, html, replyTo }: Mail) {
  const t = getTransporter();
  if (!t) {
    console.info(`[mail:dev] To: ${to} | Subject: ${subject} (set SMTP_HOST to send real email)`);
    return;
  }
  try {
    await t.sendMail({ from: FROM, to, subject, html, replyTo: replyTo ?? UNIT_INBOX });
  } catch (err) {
    console.error(`[mail] Failed to send "${subject}" to ${to}:`, err);
  }
}

/** Checks the SMTP login (used by `npm run mail:test`). Throws on failure. */
export async function verifyMailConnection() {
  const t = getTransporter();
  if (!t) throw new Error("SMTP_HOST is not set in .env, so emails are only logged.");
  await t.verify();
}

/* ── Templates ────────────────────────────────────────────────────── */

export const mail = {
  shopApplicationReceived(to: string, name: string, a: { reference: string; businessName: string; campus: string }) {
    return sendMail({
      to,
      subject: `Application received: ${a.reference}`,
      html: layout(
        "We have received your shop application",
        p(`Dear ${escape(name)},`) +
          p("Thank you for applying for a commercial space. The Shop Allocation Committee will screen your application, usually within 10 working days.") +
          detail([["Reference", a.reference], ["Business", a.businessName], ["Campus", a.campus]]) +
          p("Keep your reference number. You can use it to track your application at any time."),
        { label: "Track my application", path: "/dashboard/applications" },
      ),
    });
  },

  shopApplicationUpdated(to: string, name: string, a: { reference: string; businessName: string; status: string; note?: string | null; shopCode?: string }) {
    const status = STATUS_LABEL[a.status] ?? a.status;
    const lead =
      a.status === "ALLOCATED"
        ? `Congratulations! Shop <strong>${escape(a.shopCode ?? "")}</strong> has been allocated to you. Your allocation letter is ready to download. Please present it at the Bursary within 14 days.`
        : a.status === "REJECTED"
          ? "After careful review, the committee was unable to approve your application this time."
          : `Your application status is now <strong>${escape(status)}</strong>.`;
    return sendMail({
      to,
      subject: `Shop application ${a.reference}: ${status}`,
      html: layout(
        `Application update: ${status}`,
        p(`Dear ${escape(name)},`) +
          p(lead) +
          detail([["Reference", a.reference], ["Business", a.businessName], ["Status", status], ...(a.shopCode ? [["Allocated shop", a.shopCode] as [string, string]] : [])]) +
          (a.note ? p(`<strong>Note from the committee:</strong> ${escape(a.note)}`) : ""),
        { label: a.status === "ALLOCATED" ? "Download allocation letter" : "View my application", path: "/dashboard/applications" },
      ),
    });
  },

  registrationReceived(to: string, name: string, r: { reference: string; programme: string; fee: string }) {
    return sendMail({
      to,
      subject: `Registration received: ${r.programme}`,
      html: layout(
        "Your registration is received",
        p(`Dear ${escape(name)},`) +
          p(`Thank you for registering for <strong>${escape(r.programme)}</strong>. To secure your seat, please complete payment.`) +
          detail([["Reference", r.reference], ["Programme", r.programme], ["Fee", r.fee]]) +
          p("You can pay online from your dashboard, or by bank transfer using your reference as the narration and then submitting the transaction reference."),
        { label: "Complete payment", path: "/dashboard/registrations" },
      ),
    });
  },

  registrationUpdated(to: string, name: string, r: { reference: string; programme: string; status: string; paymentStatus: string; note?: string | null }) {
    const status = STATUS_LABEL[r.status] ?? r.status;
    const confirmed = r.status === "CONFIRMED" || r.status === "COMPLETED";
    return sendMail({
      to,
      subject: `${r.programme}: ${status}`,
      html: layout(
        confirmed ? "Your seat is confirmed" : `Registration update: ${status}`,
        p(`Dear ${escape(name)},`) +
          p(
            confirmed
              ? `Your registration for <strong>${escape(r.programme)}</strong> is confirmed. Your admission letter is ready to download from your dashboard.`
              : `There is an update on your registration for <strong>${escape(r.programme)}</strong>.`,
          ) +
          detail([["Reference", r.reference], ["Status", status], ["Payment", STATUS_LABEL[r.paymentStatus] ?? r.paymentStatus]]) +
          (r.note ? p(`<strong>Note:</strong> ${escape(r.note)}`) : ""),
        { label: confirmed ? "Download admission letter" : "View registration", path: "/dashboard/registrations" },
      ),
    });
  },

  contactAcknowledgement(to: string, name: string, subject: string) {
    return sendMail({
      to,
      subject: `We received your message: ${subject}`,
      html: layout(
        "Thank you for contacting us",
        p(`Dear ${escape(name)},`) +
          p(`We have received your message “${escape(subject)}”. A member of the Consultancy Unit will respond within two working days.`),
      ),
    });
  },

  contactToUnit(m: { name: string; email: string; phone?: string | null; category: string; subject: string; message: string }) {
    return sendMail({
      to: UNIT_INBOX,
      replyTo: m.email,
      subject: `[Website · ${m.category}] ${m.subject}`,
      html: layout(
        `New enquiry: ${m.category}`,
        detail([["From", m.name], ["Email", m.email], ["Phone", m.phone || "—"], ["Service", m.category]]) +
          p(escape(m.message).replace(/\n/g, "<br>")),
        { label: "Open messages", path: "/admin/messages" },
      ),
    });
  },
};
