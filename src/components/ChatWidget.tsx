'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GREETING =
  "Hi, I'm Ink â€” the studio's virtual assistant. Ask me about styles, pricing, aftercare, or I can help estimate a quote for your next piece.";

const UNAVAILABLE_MESSAGE =
  "Live chat isn't available right now â€” email ralph.segador03@gmail.com or call 0994 147 5924 and we'll help directly.";

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
          { role: 'assistant', content: "Something went wrong on my end â€” please try again in a moment." },
        ]);
        return;
      }

      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || "I'm not sure how to respond to that â€” could you rephrase?" },
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
                placeholder={unavailable ? 'Chat unavailable' : 'Ask about styles, pricing, aftercareâ€¦'}
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