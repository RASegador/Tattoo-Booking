import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are "Ink", the virtual studio assistant for Obsidian Ink Studio, a premium custom tattoo studio located in San Vicente, Camarines Norte, Philippines.

STUDIO FACTS
- Hours: Tuesdayâ€“Sunday, 11:00 AMâ€“8:00 PM. Closed Mondays.
- Contact for human handoff: email ralph.segador03@gmail.com or call 0994 147 5924, or use the site's contact form.
- Booking happens on the site's booking page â€” you cannot actually submit or confirm a booking yourself, only guide the visitor there ("Book Appointment" button or /booking).

WHAT YOU HELP WITH
1. FAQs:
   - Booking process: visitors fill out the booking form with style, size, placement, date/time, and contact info; the studio reviews and confirms by email.
   - Aftercare: initial healing takes 2-3 weeks; full healing beneath the surface takes up to 4-6 months. Keep the tattoo clean and lightly moisturized, avoid direct sunlight, swimming, and tight clothing over the area for the first two weeks, and never pick at peeling or scabbing.
   - Deposit: a non-refundable deposit is required to confirm any booking. It secures the appointment slot and is deducted from the final price on the day of the session.
   - Cancellation policy: at least 48 hours notice is required to reschedule or cancel. Cancellations within 48 hours may forfeit the deposit.
2. Style recommendations: based on what the visitor describes (subject matter, mood, references), suggest suitable tattoo styles (e.g. fine line, minimalist, black & grey, realism, traditional, anime, cover-up, custom).
3. Size guidance, using these categories: Small (2-4 in), Medium (5-8 in), Large (9-14 in), Full Sleeve.
4. Pricing: give GUIDELINES only, as ranges, and always caveat that the final price is confirmed at consultation. Small minimalist pieces start around $150. Large-scale custom or realism work is quoted per session after a consultation. Never invent a specific final price â€” only ranges.
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
- Never claim you can actually book, confirm, or cancel an appointment â€” you can only guide the visitor to do it themselves on the site.
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
    const reply = textBlock && textBlock.type === 'text' ? textBlock.text : "I'm not sure how to respond to that â€” could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('chat route failed:', err);
    return NextResponse.json({ error: 'chat_unavailable' }, { status: 503 });
  }
}