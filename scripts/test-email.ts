/**
 * Sends one sample notification to check the SMTP settings in .env.
 *   npm run mail:test                 → sends to SMTP_USER
 *   npm run mail:test -- you@x.com    → sends to another address
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  // Imported after .env is loaded, since the mailer reads it at first use.
  const { verifyMailConnection, mail } = await import("../src/server/mail");
  const to = process.argv[2] ?? process.env.SMTP_USER;
  if (!to) throw new Error("No recipient: pass an address or set SMTP_USER in .env.");
  if (process.env.SMTP_HOST && !process.env.SMTP_PASSWORD) {
    console.error("✖ SMTP_PASSWORD is empty in .env. Paste your Gmail App Password between the quotes and save.");
    process.exit(1);
  }

  console.log(`Checking login to ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}…`);
  try {
    await verifyMailConnection();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\n✖ Could not log in to the mail server.");
    if (/535|Username and Password not accepted|Invalid login|BadCredentials/i.test(msg)) {
      console.error("  Gmail rejected the login. Check that SMTP_PASSWORD is an App Password (not your normal");
      console.error("  Gmail password) and that 2-Step Verification is on: https://myaccount.google.com/apppasswords");
    } else if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET/i.test(msg)) {
      console.error("  Network problem reaching the mail server. Check the internet connection and SMTP_HOST/SMTP_PORT.");
    } else {
      console.error(`  ${msg}`);
    }
    process.exit(1);
  }

  console.log("✔ Login OK. Sending a sample email…");
  await mail.shopApplicationUpdated(to, "Test Recipient", {
    reference: "MOAUM-SA-2026-TEST1",
    businessName: "Sample Business (test email)",
    status: "ALLOCATED",
    shopCode: "WC-A01",
    note: "This is a test message from the MOAUM Consultancy portal. No action is needed.",
  });
  console.log(`✔ Sent to ${to}. Check the inbox (and the Spam folder the first time).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
