import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/data/site";

const GREEN = rgb(10 / 255, 77 / 255, 60 / 255);
const GOLD = rgb(201 / 255, 162 / 255, 39 / 255);
const INK = rgb(0.13, 0.15, 0.14);
const MUTED = rgb(0.4, 0.43, 0.42);

type LetterInput = {
  title: string;
  reference: string;
  date: Date;
  recipient: { name: string; email: string; phone?: string | null };
  salutation: string;
  paragraphs: string[];
  details: [string, string][];
  closing: string;
  signatory: { name: string; role: string };
};

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCrest(page: PDFPage, x: number, y: number) {
  // Simplified shield mark matching the website crest.
  page.drawSvgPath("M24 2 L45 9 V27 C45 40 36 49 24 54 C12 49 3 40 3 27 V9 Z", {
    x,
    y,
    scale: 1.1,
    color: GREEN,
    borderColor: GOLD,
    borderWidth: 2,
  });
  page.drawCircle({ x: x + 26.4, y: y - 24.2, size: 6.5, color: GOLD });
  page.drawSvgPath("M11 31 C17 29 21 30 24 33 C27 30 31 29 37 31 V42 C31 40 27 41 24 44 C21 41 17 40 11 42 Z", {
    x,
    y,
    scale: 1.1,
    color: rgb(0.97, 0.95, 0.89),
  });
}

/**
 * The standard PDF fonts only cover WinAnsi (Latin-1-ish). Normalise common
 * characters and replace anything else, so user-typed text can't break a letter.
 */
function toWinAnsi(text: string) {
  return text
    .replace(/₦/g, "NGN ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .normalize("NFC")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function sanitize(input: LetterInput): LetterInput {
  return {
    ...input,
    title: toWinAnsi(input.title),
    reference: toWinAnsi(input.reference),
    recipient: {
      name: toWinAnsi(input.recipient.name),
      email: toWinAnsi(input.recipient.email),
      phone: input.recipient.phone ? toWinAnsi(input.recipient.phone) : input.recipient.phone,
    },
    salutation: toWinAnsi(input.salutation),
    paragraphs: input.paragraphs.map(toWinAnsi),
    details: input.details.map(([k, v]) => [toWinAnsi(k), toWinAnsi(v)]),
    closing: toWinAnsi(input.closing),
    signatory: { name: toWinAnsi(input.signatory.name), role: toWinAnsi(input.signatory.role) },
  };
}

/** Generates an official A4 letter (allocation / admission) as PDF bytes. */
export async function buildLetter(rawInput: LetterInput) {
  const input = sanitize(rawInput);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${input.title} — ${input.reference}`);
  pdf.setAuthor(`${site.unit}, ${site.university}`);
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 56;
  const contentWidth = width - margin * 2;

  // Letterhead
  page.drawRectangle({ x: 0, y: height - 118, width, height: 118, color: GREEN });
  page.drawRectangle({ x: 0, y: height - 122, width, height: 4, color: GOLD });
  drawCrest(page, margin - 4, height - 28);
  page.drawText(site.university.toUpperCase(), { x: margin + 62, y: height - 52, size: 13, font: serifBold, color: rgb(1, 1, 1) });
  page.drawText(`${site.unit.toUpperCase()} · MAKURDI, BENUE STATE`, { x: margin + 62, y: height - 70, size: 9, font: sansBold, color: GOLD });
  page.drawText(`"${site.motto}"`, { x: margin + 62, y: height - 88, size: 9.5, font: serifItalic, color: rgb(0.85, 0.9, 0.87) });

  let y = height - 160;
  page.drawText(`Ref: ${input.reference}`, { x: margin, y, size: 10, font: sansBold, color: INK });
  const dateText = input.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  page.drawText(dateText, { x: width - margin - sans.widthOfTextAtSize(dateText, 10), y, size: 10, font: sans, color: INK });

  y -= 34;
  for (const line of [input.recipient.name, input.recipient.email, input.recipient.phone ?? ""].filter(Boolean)) {
    page.drawText(line, { x: margin, y, size: 11, font: line === input.recipient.name ? serifBold : serif, color: INK });
    y -= 15;
  }

  y -= 18;
  page.drawText(input.title.toUpperCase(), { x: margin, y, size: 13, font: serifBold, color: GREEN });
  page.drawLine({ start: { x: margin, y: y - 6 }, end: { x: margin + serifBold.widthOfTextAtSize(input.title.toUpperCase(), 13), y: y - 6 }, thickness: 1.2, color: GOLD });

  y -= 32;
  page.drawText(input.salutation, { x: margin, y, size: 11.5, font: serif, color: INK });
  y -= 22;

  for (const para of input.paragraphs) {
    for (const line of wrap(para, serif, 11.5, contentWidth)) {
      page.drawText(line, { x: margin, y, size: 11.5, font: serif, color: INK });
      y -= 16;
    }
    y -= 8;
  }

  // Details box
  const boxHeight = input.details.length * 20 + 20;
  page.drawRectangle({ x: margin, y: y - boxHeight, width: contentWidth, height: boxHeight, color: rgb(0.95, 0.97, 0.96), borderColor: rgb(0.82, 0.88, 0.85), borderWidth: 0.8 });
  let dy = y - 24;
  for (const [k, v] of input.details) {
    page.drawText(k, { x: margin + 16, y: dy, size: 9.5, font: sansBold, color: MUTED });
    page.drawText(v, { x: margin + 170, y: dy, size: 10.5, font: sans, color: INK });
    dy -= 20;
  }
  y -= boxHeight + 26;

  for (const line of wrap(input.closing, serif, 11.5, contentWidth)) {
    page.drawText(line, { x: margin, y, size: 11.5, font: serif, color: INK });
    y -= 16;
  }

  y -= 50;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + 180, y }, thickness: 0.8, color: INK });
  page.drawText(input.signatory.name, { x: margin, y: y - 16, size: 11, font: serifBold, color: INK });
  page.drawText(input.signatory.role, { x: margin, y: y - 31, size: 10, font: serif, color: MUTED });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 44, color: rgb(0.95, 0.97, 0.96) });
  const footer = `${site.contact.email}  ·  ${site.contact.phone}  ·  Verify this letter online with reference ${input.reference}`;
  page.drawText(footer, { x: (width - sans.widthOfTextAtSize(footer, 8)) / 2, y: 18, size: 8, font: sans, color: MUTED });

  return pdf.save();
}

export function pdfResponse(bytes: Uint8Array, filename: string) {
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
