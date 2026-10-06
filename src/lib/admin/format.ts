import { site } from "@/content/site";

/*
 * Dates are shown in the business's own time zone, not the server's (UTC) or
 * the viewer's, so "received 9:14 am" means the same thing to everyone.
 */
const dateTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: site.timeZone,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const dayOnly = new Intl.DateTimeFormat("en-AU", {
  timeZone: site.timeZone,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: site.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeOnly = new Intl.DateTimeFormat("en-AU", {
  timeZone: site.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

/** "Today, 9:14 am", "Yesterday, 4:02 pm" or "3 Oct 2026". */
export function formatReceived(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const key = dayKey.format(date);
  if (key === dayKey.format(now)) return `Today, ${timeOnly.format(date)}`;
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (key === dayKey.format(yesterday)) return `Yesterday, ${timeOnly.format(date)}`;
  return dayOnly.format(date);
}

/**
 * Makes a value safe to put in a CSV cell.
 * Spreadsheet programs run cells that start with = + - @ as formulas, so a
 * malicious enquiry could execute code when staff open the export. A leading
 * apostrophe makes the program treat the cell as plain text.
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  // The byte-order mark makes Excel read the file as UTF-8.
  return `﻿${lines.join("\r\n")}\r\n`;
}
