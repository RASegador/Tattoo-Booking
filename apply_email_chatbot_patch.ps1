# Obsidian Ink Studio — Email + Chatbot phase patch script
# Run this from the ROOT of your local Tattoo-Booking repo clone (where package.json lives).
$ErrorActionPreference = "Stop"
Write-Host "Applying email + chatbot patch..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "src\app" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\admin\bookings\[id]" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\bookings" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\chat" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\cron\daily-summary" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\cron\reminders" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\lib" | Out-Null

Write-Host "  writing src/lib/email.ts" -ForegroundColor DarkGray
$content_0 = @'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Obsidian Ink Studio <onboarding@resend.dev>';
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'ralph.segador03@gmail.com';

export type EmailResult = { success: boolean; error?: string };

export type BookingLike = {
  id?: number | string;
  booking_code?: string;
  bookingCode?: string;
  style?: string;
  size?: string;
  placement?: string;
  description?: string;
  date?: string;
  time?: string;
  full_name?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  notes?: string;
  status?: string;
  admin_notes?: string;
  adminNotes?: string;
  estimated_duration?: string;
  estimatedDuration?: string;
};

function code(b: BookingLike): string {
  return b.booking_code || b.bookingCode || 'N/A';
}
function name(b: BookingLike): string {
  return b.full_name || b.fullName || 'there';
}
function recipient(b: BookingLike): string {
  return b.email || '';
}

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="background-color:#050505; padding:32px 16px; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width:560px; margin:0 auto; background-color:#0e0e10; border:1px solid rgba(201,162,75,0.25); border-radius:8px; overflow:hidden;">
      <div style="padding:28px 32px; text-align:center; border-bottom:1px solid rgba(201,162,75,0.2); background:linear-gradient(180deg, rgba(201,162,75,0.08), transparent);">
        <div style="font-size:12px; letter-spacing:6px; color:#c9a24b; text-transform:uppercase; font-weight:600;">Obsidian Ink Studio</div>
        <div style="font-size:11px; letter-spacing:2px; color:rgba(255,255,255,0.4); margin-top:6px; text-transform:uppercase;">${title}</div>
      </div>
      <div style="padding:32px; color:rgba(255,255,255,0.85); font-size:14px; line-height:1.7;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.35); font-size:11px; letter-spacing:1px; text-align:center;">
        San Vicente, Camarines Norte, Philippines &middot; 0994 147 5924 &middot; ralph.segador03@gmail.com
      </div>
    </div>
  </div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0; color:rgba(255,255,255,0.45); font-size:12px; letter-spacing:1px; text-transform:uppercase; width:140px;">${label}</td>
    <td style="padding:6px 0; color:#fff; font-size:14px;">${value || '—'}</td>
  </tr>`;
}

function detailsTable(rows: string): string {
  return `<table style="width:100%; border-collapse:collapse; margin:16px 0;">${rows}</table>`;
}

function goldButton(href: string, label: string): string {
  return `<div style="text-align:center; margin:24px 0 8px;">
    <a href="${href}" style="display:inline-block; padding:12px 28px; border:1px solid #c9a24b; color:#c9a24b; text-decoration:none; font-size:12px; letter-spacing:2px; text-transform:uppercase;">${label}</a>
  </div>`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ink-tells-your-story.vercel.app';

export async function sendBookingConfirmationEmail(booking: BookingLike): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'Booking Request Received',
      `<p>Hi ${name(booking)},</p>
      <p>Thank you for requesting an appointment at Obsidian Ink Studio. We've received your booking request and our team will review it shortly.</p>
      ${detailsTable(
        detailRow('Booking Code', code(booking)) +
          detailRow('Style', booking.style || '') +
          detailRow('Size', booking.size || '') +
          detailRow('Placement', booking.placement || '') +
          detailRow('Date', booking.date || '') +
          detailRow('Time', booking.time || '') +
          detailRow('Status', 'Pending')
      )}
      <p>We'll notify you by email as soon as your appointment is confirmed. If you have any questions in the meantime, feel free to reply to this email.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Request Received — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendBookingConfirmationEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendBookingApprovedEmail(booking: BookingLike): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'Appointment Confirmed',
      `<p>Hi ${name(booking)},</p>
      <p>Great news — your appointment is <strong style="color:#c9a24b;">confirmed</strong>. We look forward to creating something incredible with you.</p>
      ${detailsTable(
        detailRow('Booking Code', code(booking)) +
          detailRow('Date', booking.date || '') +
          detailRow('Time', booking.time || '') +
          detailRow('Style', booking.style || '') +
          detailRow('Placement', booking.placement || '')
      )}
      <p>Reminder: a non-refundable deposit secures your slot and is deducted from your final price on the day of your session. Please arrive well-rested, hydrated, and having eaten a solid meal beforehand.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Appointment is Confirmed — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendBookingApprovedEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendBookingRejectedEmail(booking: BookingLike, reason?: string): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'About Your Booking Request',
      `<p>Hi ${name(booking)},</p>
      <p>Thank you for your interest in Obsidian Ink Studio. Unfortunately, we're unable to accommodate your booking request (${code(
        booking
      )}) at this time.</p>
      ${reason ? `<p style="color:rgba(255,255,255,0.7); font-style:italic;">"${reason}"</p>` : ''}
      <p>We'd love the opportunity to work with you — please feel free to submit a new booking request with an alternate date or details, and our team will be happy to help.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `About Your Booking Request — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendBookingRejectedEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendBookingRescheduledEmail(
  booking: BookingLike,
  oldDate: string,
  oldTime: string
): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'Appointment Rescheduled',
      `<p>Hi ${name(booking)},</p>
      <p>Your appointment (${code(booking)}) has been rescheduled. Here are the updated details:</p>
      ${detailsTable(
        detailRow('Previous Date', oldDate || '') +
          detailRow('Previous Time', oldTime || '') +
          detailRow('New Date', booking.date || '') +
          detailRow('New Time', booking.time || '')
      )}
      <p>If this new time doesn't work for you, please reply to this email or contact us directly and we'll help find another slot.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Appointment Rescheduled — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendBookingRescheduledEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendBookingCancelledEmail(booking: BookingLike): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'Booking Cancelled',
      `<p>Hi ${name(booking)},</p>
      <p>This confirms that your booking (${code(booking)}) scheduled for ${booking.date || ''} at ${
        booking.time || ''
      } has been cancelled.</p>
      <p>If this was a mistake, or you'd like to book a new appointment, we'd be glad to see you at the studio again.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Cancelled — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendBookingCancelledEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendAppointmentReminderEmail(booking: BookingLike): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'See You Tomorrow',
      `<p>Hi ${name(booking)},</p>
      <p>Just a friendly reminder that your appointment at Obsidian Ink Studio is <strong style="color:#c9a24b;">tomorrow</strong>.</p>
      ${detailsTable(
        detailRow('Booking Code', code(booking)) +
          detailRow('Date', booking.date || '') +
          detailRow('Time', booking.time || '') +
          detailRow('Placement', booking.placement || '')
      )}
      <p>Please get a full night's sleep, eat a solid meal beforehand, stay hydrated, and avoid alcohol for 24 hours prior. We can't wait to see you.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `See You Tomorrow — Your Appointment Reminder`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendAppointmentReminderEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendReviewRequestEmail(booking: BookingLike): Promise<EmailResult> {
  try {
    const to = recipient(booking);
    if (!to) return { success: false, error: 'No recipient email on booking' };
    const html = wrapper(
      'Thank You',
      `<p>Hi ${name(booking)},</p>
      <p>Thank you for trusting Obsidian Ink Studio with your latest piece. We hope you love wearing it as much as we loved creating it.</p>
      <p>If you have a moment, we'd be truly grateful if you shared your experience — it helps other clients discover the studio and helps us keep improving.</p>
      ${goldButton(`${SITE_URL}/#reviews`, 'Leave a Review')}
      <p>Remember to follow your aftercare guide closely over the next few weeks for the best healing results.</p>`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Thank You From Obsidian Ink Studio`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendReviewRequestEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendAdminNewBookingAlert(booking: BookingLike): Promise<EmailResult> {
  try {
    const html = wrapper(
      'New Booking Request',
      `<p>A new booking request has been submitted.</p>
      ${detailsTable(
        detailRow('Booking Code', code(booking)) +
          detailRow('Name', name(booking)) +
          detailRow('Mobile', booking.mobile || '') +
          detailRow('Email', booking.email || '') +
          detailRow('Style', booking.style || '') +
          detailRow('Size', booking.size || '') +
          detailRow('Placement', booking.placement || '') +
          detailRow('Date', booking.date || '') +
          detailRow('Time', booking.time || '')
      )}
      ${goldButton(`${SITE_URL}/admin/bookings`, 'Review in Admin Panel')}`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New Booking Request — ${code(booking)}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendAdminNewBookingAlert failed:', err);
    return { success: false, error: String(err) };
  }
}

export type DailySummaryStats = {
  date: string;
  totalToday: number;
  pending: number;
  confirmed: number;
  todaysAppointments: BookingLike[];
};

export async function sendAdminDailySummaryEmail(stats: DailySummaryStats): Promise<EmailResult> {
  try {
    const appointmentsHtml = stats.todaysAppointments.length
      ? stats.todaysAppointments
          .map((b) =>
            detailRow(b.time || '—', `${name(b)} — ${b.style || 'N/A'} (${code(b)})`)
          )
          .join('')
      : detailRow('—', 'No appointments scheduled for today');

    const html = wrapper(
      'Daily Summary',
      `<p>Here's the studio summary for <strong style="color:#c9a24b;">${stats.date}</strong>.</p>
      ${detailsTable(
        detailRow('Total Bookings Today', String(stats.totalToday)) +
          detailRow('Pending', String(stats.pending)) +
          detailRow('Confirmed', String(stats.confirmed))
      )}
      <p style="margin-top:24px; color:rgba(255,255,255,0.5); font-size:12px; letter-spacing:1px; text-transform:uppercase;">Today's Appointments</p>
      ${detailsTable(appointmentsHtml)}
      ${goldButton(`${SITE_URL}/admin/bookings`, 'Open Admin Panel')}`
    );
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Daily Summary — ${stats.date}`,
      html,
    });
    return { success: true, error: result.error ? String(result.error) : undefined };
  } catch (err) {
    console.error('sendAdminDailySummaryEmail failed:', err);
    return { success: false, error: String(err) };
  }
}
'@
Set-Content -LiteralPath "src\lib\email.ts" -Value $content_0 -Encoding utf8

Write-Host "  writing src/app/api/cron/reminders/route.ts" -ForegroundColor DarkGray
$content_1 = @'
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { sendAppointmentReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await ensureSchema();

    const bookings = await sql`
      SELECT * FROM bookings
      WHERE date = to_char(now() + interval '1 day', 'YYYY-MM-DD')
        AND status = 'Confirmed'
    `;

    let sent = 0;
    for (const booking of bookings) {
      const result = await sendAppointmentReminderEmail(booking);
      if (result.success) sent += 1;
    }

    return NextResponse.json({ sent });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send reminders', detail: String(err) }, { status: 500 });
  }
}
'@
Set-Content -LiteralPath "src\app\api\cron\reminders\route.ts" -Value $content_1 -Encoding utf8

Write-Host "  writing src/app/api/cron/daily-summary/route.ts" -ForegroundColor DarkGray
$content_2 = @'
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { sendAdminDailySummaryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await ensureSchema();

    const todaysAppointments = await sql`
      SELECT * FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD')
      ORDER BY time ASC
    `;

    const pendingRows = await sql`
      SELECT count(*)::int AS c FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD') AND status = 'Pending'
    `;
    const confirmedRows = await sql`
      SELECT count(*)::int AS c FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD') AND status = 'Confirmed'
    `;

    const dateRows = await sql`SELECT to_char(now(), 'YYYY-MM-DD') AS d`;
    const date = String(dateRows[0]?.d ?? '');

    const result = await sendAdminDailySummaryEmail({
      date,
      totalToday: todaysAppointments.length,
      pending: Number(pendingRows[0]?.c ?? 0),
      confirmed: Number(confirmedRows[0]?.c ?? 0),
      todaysAppointments,
    });

    return NextResponse.json({ ok: result.success });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send daily summary', detail: String(err) }, { status: 500 });
  }
}
'@
Set-Content -LiteralPath "src\app\api\cron\daily-summary\route.ts" -Value $content_2 -Encoding utf8

Write-Host "  writing src/app/api/chat/route.ts" -ForegroundColor DarkGray
$content_3 = @'
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are "Ink", the virtual studio assistant for Obsidian Ink Studio, a premium custom tattoo studio located in San Vicente, Camarines Norte, Philippines.

STUDIO FACTS
- Hours: Tuesday–Sunday, 11:00 AM–8:00 PM. Closed Mondays.
- Contact for human handoff: email ralph.segador03@gmail.com or call 0994 147 5924, or use the site's contact form.
- Booking happens on the site's booking page — you cannot actually submit or confirm a booking yourself, only guide the visitor there ("Book Appointment" button or /booking).

WHAT YOU HELP WITH
1. FAQs:
   - Booking process: visitors fill out the booking form with style, size, placement, date/time, and contact info; the studio reviews and confirms by email.
   - Aftercare: initial healing takes 2-3 weeks; full healing beneath the surface takes up to 4-6 months. Keep the tattoo clean and lightly moisturized, avoid direct sunlight, swimming, and tight clothing over the area for the first two weeks, and never pick at peeling or scabbing.
   - Deposit: a non-refundable deposit is required to confirm any booking. It secures the appointment slot and is deducted from the final price on the day of the session.
   - Cancellation policy: at least 48 hours notice is required to reschedule or cancel. Cancellations within 48 hours may forfeit the deposit.
2. Style recommendations: based on what the visitor describes (subject matter, mood, references), suggest suitable tattoo styles (e.g. fine line, minimalist, black & grey, realism, traditional, anime, cover-up, custom).
3. Size guidance, using these categories: Small (2-4 in), Medium (5-8 in), Large (9-14 in), Full Sleeve.
4. Pricing: give GUIDELINES only, as ranges, and always caveat that the final price is confirmed at consultation. Small minimalist pieces start around $150. Large-scale custom or realism work is quoted per session after a consultation. Never invent a specific final price — only ranges.
5. Structured quotation flow: when a visitor wants an estimate, walk through these questions one or two at a time (don't dump them all at once):
   (1) tattoo style
   (2) approximate size (Small/Medium/Large/Full Sleeve)
   (3) body placement
   (4) color preference (full color vs black & grey)
   (5) whether it's a cover-up
   (6) whether they have reference images (mention they can attach one using the paperclip/image button in this chat)
   (7) design complexity (simple / moderate / highly detailed)
   Once you have enough info, give:
   (8) an estimated price RANGE (guideline only, confirmed at consultation)
   (9) an estimated session duration, roughly 2-10 hours depending on size and complexity (small/simple pieces on the low end, full sleeves/highly detailed work on the high end)
   (10) offer to help them book by directing them to click "Book Appointment" or visit /booking

STYLE OF RESPONSE
- Keep responses SHORT: 2-4 sentences. This is a compact chat widget, not an essay.
- Warm, professional, premium-but-approachable tone matching a boutique tattoo studio.
- If the visitor asks something outside your scope, seems frustrated, or needs something you can't help with, offer a human handoff: suggest emailing ralph.segador03@gmail.com, calling 0994 147 5924, or using the contact form.
- Never claim you can actually book, confirm, or cancel an appointment — you can only guide the visitor to do it themselves on the site.
- If reference images are attached, look at them and comment briefly on style/placement/complexity to help with recommendations or the quote.`;

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (match) {
    return { mediaType: match[1], base64: match[2] };
  }
  return { mediaType: 'image/jpeg', base64: dataUrl };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'chat_unavailable' }, { status: 503 });
  }

  try {
    let body: { messages?: ChatMessage[]; images?: string[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const images = Array.isArray(body.images) ? body.images : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    type AnthropicMessage = {
      role: 'user' | 'assistant';
      content:
        | string
        | Array<
            | { type: 'text'; text: string }
            | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
          >;
    };

    const anthropicMessages: AnthropicMessage[] = messages.map((m, idx) => {
      const isLastUserMessage = idx === messages.length - 1 && m.role === 'user';
      if (isLastUserMessage && images.length > 0) {
        const content: AnthropicMessage['content'] = [{ type: 'text', text: m.content }];
        for (const dataUrl of images) {
          const { mediaType, base64 } = parseDataUrl(dataUrl);
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          });
        }
        return { role: m.role, content };
      }
      return { role: m.role, content: m.content };
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages as never,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const reply = textBlock && textBlock.type === 'text' ? textBlock.text : "I'm not sure how to respond to that — could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('chat route failed:', err);
    return NextResponse.json({ error: 'chat_unavailable' }, { status: 503 });
  }
}
'@
Set-Content -LiteralPath "src\app\api\chat\route.ts" -Value $content_3 -Encoding utf8

Write-Host "  writing src/components/ChatWidget.tsx" -ForegroundColor DarkGray
$content_4 = @'
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GREETING =
  "Hi, I'm Ink — the studio's virtual assistant. Ask me about styles, pricing, aftercare, or I can help estimate a quote for your next piece.";

const UNAVAILABLE_MESSAGE =
  "Live chat isn't available right now — email ralph.segador03@gmail.com or call 0994 147 5924 and we'll help directly.";

const QUICK_REPLIES = ['Get a quote', 'Aftercare tips', 'Book an appointment', 'Studio hours'];

const MAX_HISTORY = 20;

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const isFirstMessage = messages.length === 1;

  async function sendMessage(text: string, images: string[]) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextHistory = [...messages, userMessage].slice(-MAX_HISTORY);
    setMessages(nextHistory);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          images,
        }),
      });

      if (res.status === 503) {
        setMessages((prev) => [...prev, { role: 'assistant', content: UNAVAILABLE_MESSAGE }]);
        setUnavailable(true);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Something went wrong on my end — please try again in a moment." },
        ]);
        return;
      }

      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || "I'm not sure how to respond to that — could you rephrase?" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: UNAVAILABLE_MESSAGE },
      ]);
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const images = attachedImage ? [attachedImage] : [];
    void sendMessage(input, images);
  }

  function handleQuickReply(label: string) {
    void sendMessage(label, []);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-cursor-hover
        aria-label={open ? 'Close chat' : 'Open chat'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-[9000] flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-ink-charcoal text-gold shadow-[0_0_25px_rgba(201,162,75,0.25)]"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-panel fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-[9000] flex h-[70vh] max-h-[560px] w-auto sm:w-[380px] flex-col overflow-hidden rounded-2xl border border-gold/20"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-display text-sm tracking-[0.2em] text-gradient-gold uppercase">Ink</p>
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">Studio Assistant</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                data-cursor-hover
                aria-label="Close chat"
                className="text-white/50 hover:text-gold transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-crimson/25 border border-crimson/40 text-white'
                        : 'bg-white/5 border border-white/10 text-white/85'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  </div>
                </div>
              )}

              {isFirstMessage && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_REPLIES.map((label) => (
                    <button
                      key={label}
                      type="button"
                      data-cursor-hover
                      onClick={() => handleQuickReply(label)}
                      className="rounded-full border border-gold/30 px-3 py-1.5 text-xs uppercase tracking-wide text-gold hover:bg-gold hover:text-ink-black transition-all duration-300"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {attachedImage && (
              <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachedImage} alt="Attached reference" className="h-12 w-12 rounded-md object-cover border border-white/10" />
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => setAttachedImage(null)}
                  className="text-xs text-white/40 hover:text-crimson-light transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 border-t border-white/10 px-4 py-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                data-cursor-hover
                aria-label="Attach reference image"
                disabled={unavailable}
                onClick={() => fileInputRef.current?.click()}
                className="mb-1 flex-shrink-0 text-white/50 hover:text-gold transition-colors disabled:opacity-30"
              >
                <PaperclipIcon />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={unavailable}
                placeholder={unavailable ? 'Chat unavailable' : 'Ask about styles, pricing, aftercare…'}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 disabled:opacity-40"
              />
              <button
                type="button"
                data-cursor-hover
                aria-label="Send message"
                disabled={unavailable || loading || !input.trim()}
                onClick={handleSend}
                className="mb-1 flex-shrink-0 rounded-full border border-gold/50 p-2 text-gold hover:bg-gold hover:text-ink-black transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold"
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
'@
Set-Content -LiteralPath "src\components\ChatWidget.tsx" -Value $content_4 -Encoding utf8

Write-Host "  writing vercel.json" -ForegroundColor DarkGray
$content_5 = @'
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/daily-summary", "schedule": "0 8 * * *" }
  ]
}
'@
Set-Content -LiteralPath "vercel.json" -Value $content_5 -Encoding utf8

Write-Host "  writing package.json" -ForegroundColor DarkGray
$content_6 = @'
{
  "name": "ink-tells-your-story",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.32",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.3.19",
    "@neondatabase/serverless": "^0.10.4",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "resend": "^4.0.1",
    "@anthropic-ai/sdk": "^0.32.1"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.15",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "tailwindcss": "^3.4.7",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19"
  }
}
'@
Set-Content -LiteralPath "package.json" -Value $content_6 -Encoding utf8

Write-Host "  writing src/app/api/bookings/route.ts" -ForegroundColor DarkGray
$content_7 = @'
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { generateBookingId } from '@/lib/bookings';
import { sendBookingConfirmationEmail, sendAdminNewBookingAlert } from '@/lib/email';

export const dynamic = 'force-dynamic';

type BookingRequestBody = {
  style?: string;
  size?: string;
  placement?: string;
  referenceImageNames?: string[];
  description?: string;
  date?: string;
  time?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  notes?: string;
  estimatedDuration?: string;
};

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();

    let body: BookingRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.fullName || !body.mobile || !body.date || !body.time) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    const bookingCode = generateBookingId();

    const rows = await sql`
      INSERT INTO bookings (
        booking_code, style, size, placement, reference_image_names, description,
        date, time, full_name, mobile, email, notes, status, estimated_duration
      )
      VALUES (
        ${bookingCode}, ${body.style ?? ''}, ${body.size ?? ''}, ${body.placement ?? ''},
        ${JSON.stringify(body.referenceImageNames ?? [])}::jsonb, ${body.description ?? ''},
        ${body.date}, ${body.time}, ${body.fullName}, ${body.mobile}, ${body.email ?? ''},
        ${body.notes ?? ''}, 'Pending', ${body.estimatedDuration ?? ''}
      )
      RETURNING *
    `;

    await logActivity(null, 'booking.created', `New booking ${bookingCode} from ${body.fullName}`);

    const createdBooking = rows[0];
    sendBookingConfirmationEmail(createdBooking).catch(() => {});
    sendAdminNewBookingAlert(createdBooking).catch(() => {});

    return NextResponse.json({ ok: true, booking: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create booking', detail: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ bookings: [] });
  }
}
'@
Set-Content -LiteralPath "src\app\api\bookings\route.ts" -Value $content_7 -Encoding utf8

Write-Host "  writing src/app/api/admin/bookings/[id]/route.ts" -ForegroundColor DarkGray
$content_8 = @'
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import {
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendBookingRescheduledEmail,
  sendReviewRequestEmail,
  sendBookingCancelledEmail,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

type BookingRow = {
  id: number;
  status: string;
  date: string;
  time: string;
  admin_notes: string | null;
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
  }

  let body: { status?: string; admin_notes?: string; date?: string; time?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM bookings WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as BookingRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const nextStatus = body.status ?? existing.status;
  const nextDate = body.date ?? existing.date;
  const nextTime = body.time ?? existing.time;

  if (body.status === 'Confirmed') {
    const conflictRows = await sql`
      SELECT id FROM bookings
      WHERE date = ${nextDate} AND time = ${nextTime} AND status = 'Confirmed' AND id != ${id}
      LIMIT 1
    `;
    if (conflictRows.length > 0) {
      return NextResponse.json({ error: 'Time slot already confirmed for another booking' }, { status: 409 });
    }
  }

  const updated = await sql`
    UPDATE bookings SET
      status = ${nextStatus},
      admin_notes = ${body.admin_notes ?? existing.admin_notes},
      date = ${nextDate},
      time = ${nextTime},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  if (body.status && body.status !== existing.status) {
    await logActivity(session?.email, 'booking.status_change', `Booking #${id} status changed from ${existing.status} to ${body.status}`);
  } else {
    await logActivity(session?.email, 'booking.updated', `Booking #${id} updated`);
  }

  const updatedBooking = updated[0];
  const statusChanged = Boolean(body.status) && body.status !== existing.status;

  if (statusChanged && body.status === 'Confirmed') {
    sendBookingApprovedEmail(updatedBooking).catch(() => {});
  } else if (statusChanged && body.status === 'Cancelled') {
    sendBookingRejectedEmail(updatedBooking, updatedBooking?.admin_notes || undefined).catch(() => {});
  } else if (statusChanged && body.status === 'Completed') {
    sendReviewRequestEmail(updatedBooking).catch(() => {});
  }

  const dateChanged = Boolean(body.date) && body.date !== existing.date;
  const timeChanged = Boolean(body.time) && body.time !== existing.time;
  if (!statusChanged && (dateChanged || timeChanged)) {
    sendBookingRescheduledEmail(updatedBooking, existing.date, existing.time).catch(() => {});
  }

  return NextResponse.json({ booking: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
  }

  const updated = await sql`
    UPDATE bookings SET status = 'Cancelled', updated_at = now() WHERE id = ${id} RETURNING *
  `;

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'booking.cancelled', `Booking #${id} cancelled`);

  sendBookingCancelledEmail(updated[0]).catch(() => {});

  return NextResponse.json({ booking: updated[0] });
}
'@
Set-Content -LiteralPath "src\app\api\admin\bookings\[id]\route.ts" -Value $content_8 -Encoding utf8

Write-Host "  writing src/app/layout.tsx" -ForegroundColor DarkGray
$content_9 = @'
import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import LoaderIntro from '@/components/LoaderIntro';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmokeBackground from '@/components/SmokeBackground';
import ChatWidget from '@/components/ChatWidget';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '500', '600', '700', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ink-tells-your-story.vercel.app'),
  title: 'Obsidian Ink Studio — Premium Custom Tattoo Art & Booking',
  description:
    'Obsidian Ink Studio is a high-end tattoo gallery and booking experience. Explore black & grey, realism, anime, traditional, fine line, minimalist, cover-up, and custom tattoo portfolios, then book your session online.',
  keywords: [
    'tattoo studio',
    'custom tattoo',
    'realism tattoo',
    'fine line tattoo',
    'tattoo booking',
    'tattoo portfolio',
    'cover up tattoo',
  ],
  openGraph: {
    title: 'Obsidian Ink Studio — Ink That Tells Your Story',
    description: 'A cinematic digital gallery and booking experience for premium custom tattoo art.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-ink-black text-white overflow-x-hidden">
        <LoaderIntro />
        <CustomCursor />
        <SmokeBackground />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
'@
Set-Content -LiteralPath "src\app\layout.tsx" -Value $content_9 -Encoding utf8

Write-Host "All 10 files written successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  git add -A"
Write-Host '  git commit -m "Add email notifications and AI chatbot"'
Write-Host "  git push"
