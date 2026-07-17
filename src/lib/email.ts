import { Resend } from 'resend';
import { sql } from './db';

let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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
  artist_id?: number | string | null;
  artist_name?: string;
  artistName?: string;
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
function artistName(b: BookingLike): string {
  return b.artist_name || b.artistName || '';
}
function designSummary(b: BookingLike): string {
  return [b.style, b.size, b.placement].filter(Boolean).join(' · ') || '—';
}

type StudioInfo = {
  address: string;
  prep_instructions: string;
  contact_email: string;
  contact_phone: string;
};

const DEFAULT_STUDIO_INFO: StudioInfo = {
  address: 'San Vicente, Camarines Norte, Philippines',
  prep_instructions:
    'Please arrive well-rested and hydrated, and eat a solid meal beforehand. Avoid alcohol and blood-thinning medication for at least 24 hours prior to your session, and wear comfortable clothing that allows easy access to the tattoo placement area.',
  contact_email: 'ralph.segador03@gmail.com',
  contact_phone: '0994 147 5924',
};

async function getStudioInfo(): Promise<StudioInfo> {
  try {
    const rows = await sql`SELECT content FROM site_content WHERE section_key = 'studio_info' LIMIT 1`;
    const content = rows[0]?.content as Partial<StudioInfo> | undefined;
    return { ...DEFAULT_STUDIO_INFO, ...(content || {}) };
  } catch {
    return DEFAULT_STUDIO_INFO;
  }
}

function contactInfoLine(info: StudioInfo): string {
  return `<p style="color:rgba(255,255,255,0.6); font-size:13px;">Questions? Reach us at <a href="mailto:${info.contact_email}" style="color:#c9a24b; text-decoration:none;">${info.contact_email}</a> or ${info.contact_phone}.</p>`;
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
          (artistName(booking) ? detailRow('Artist', artistName(booking)) : '') +
          detailRow('Style', booking.style || '') +
          detailRow('Size', booking.size || '') +
          detailRow('Placement', booking.placement || '') +
          detailRow('Date', booking.date || '') +
          detailRow('Time', booking.time || '') +
          detailRow('Status', 'Pending')
      )}
      <p>We'll notify you by email as soon as your appointment is confirmed. If you have any questions in the meantime, feel free to reply to this email.</p>`
    );
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const studioInfo = await getStudioInfo();
    const html = wrapper(
      'Appointment Confirmed',
      `<p>Hi ${name(booking)},</p>
      <p>Great news — your appointment is <strong style="color:#c9a24b;">confirmed</strong>. We look forward to creating something incredible with you.</p>
      ${detailsTable(
        detailRow('Booking Code', code(booking)) +
          detailRow('Client Name', name(booking)) +
          detailRow('Artist', artistName(booking) || 'To be assigned') +
          detailRow('Appointment Date', booking.date || '') +
          detailRow('Appointment Time', booking.time || '') +
          detailRow('Tattoo Design', designSummary(booking)) +
          detailRow('Studio Address', studioInfo.address)
      )}
      <p style="margin-top:20px; color:rgba(255,255,255,0.5); font-size:12px; letter-spacing:1px; text-transform:uppercase;">Preparation Instructions</p>
      <p>${studioInfo.prep_instructions}</p>
      <p>Reminder: a non-refundable deposit secures your slot and is deducted from your final price on the day of your session.</p>
      ${contactInfoLine(studioInfo)}`
    );
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const studioInfo = await getStudioInfo();
    const html = wrapper(
      'About Your Booking Request',
      `<p>Hi ${name(booking)},</p>
      ${detailsTable(detailRow('Booking Code', code(booking)) + detailRow('Booking Status', 'Declined'))}
      <p>Thank you for your interest in Obsidian Ink Studio. Unfortunately, we're unable to accommodate your booking request at this time.</p>
      ${reason ? `<p style="color:rgba(255,255,255,0.7); font-style:italic;">"${reason}"</p>` : ''}
      <p style="margin-top:20px; color:rgba(255,255,255,0.5); font-size:12px; letter-spacing:1px; text-transform:uppercase;">How to Rebook</p>
      <p>We'd genuinely love the opportunity to work with you. Simply submit a new booking request through our website with an alternate date or details, and our team will review it right away.</p>
      ${contactInfoLine(studioInfo)}`
    );
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
    const client = getResendClient();
    if (!client) return { success: false, error: 'RESEND_API_KEY not set' };
    const result = await client.emails.send({
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
