'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Calendar from './Calendar';
import { Booking, generateBookingId, saveBooking, TIME_SLOTS } from '@/lib/bookings';
import { categories } from '@/lib/data';

const STYLES = categories.map((c) => c.name);
const SIZES = ['Small (2-4 in)', 'Medium (5-8 in)', 'Large (9-14 in)', 'Full Sleeve'];
const PLACEMENTS = ['Forearm', 'Upper Arm', 'Shoulder', 'Back', 'Calf', 'Ribcage', 'Chest', 'Thigh', 'Hand', 'Neck'];

const STEP_LABELS = [
  'Style', 'Size', 'Placement', 'References', 'Idea', 'Date', 'Time', 'Contact', 'Review',
];

type FormState = {
  style: string;
  size: string;
  placement: string;
  referenceFiles: File[];
  description: string;
  date: string | null;
  time: string | null;
  fullName: string;
  mobile: string;
  email: string;
  notes: string;
  agreed: boolean;
};

const initialState: FormState = {
  style: '',
  size: '',
  placement: '',
  referenceFiles: [],
  description: '',
  date: null,
  time: null,
  fullName: '',
  mobile: '',
  email: '',
  notes: '',
  agreed: false,
};

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          data-cursor-hover
          className={`px-4 py-4 rounded-xl border text-sm text-center transition-all ${
            value === opt
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-white/15 text-white/70 hover:border-white/40'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const totalSteps = STEP_LABELS.length;

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!form.style;
      case 1: return !!form.size;
      case 2: return !!form.placement;
      case 3: return true;
      case 4: return form.description.trim().length > 0;
      case 5: return !!form.date;
      case 6: return !!form.time;
      case 7: return form.fullName.trim().length > 1 && form.mobile.trim().length > 6;
      case 8: return form.agreed;
      default: return true;
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setForm((f) => ({ ...f, referenceFiles: [...f.referenceFiles, ...Array.from(files)].slice(0, 6) }));
  };

  const submitBooking = async () => {
    setSubmitting(true);

    const estimatedDuration = form.size === 'Full Sleeve' ? '6-10 hrs (multi-session)' : '2-5 hrs';
    const requestBody = {
      style: form.style,
      size: form.size,
      placement: form.placement,
      referenceImageNames: form.referenceFiles.map((f) => f.name),
      description: form.description,
      date: form.date!,
      time: form.time!,
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      notes: form.notes,
      estimatedDuration,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const json = await res.json();

      if (res.ok && json?.booking) {
        const b = json.booking;
        const mapped: Booking = {
          id: b.booking_code,
          style: b.style,
          size: b.size,
          placement: b.placement,
          referenceImageNames: b.reference_image_names ?? requestBody.referenceImageNames,
          description: b.description,
          date: b.date,
          time: b.time,
          fullName: b.full_name,
          mobile: b.mobile,
          email: b.email,
          notes: b.notes,
          status: b.status ?? 'Pending',
          createdAt: b.created_at,
          estimatedDuration: b.estimated_duration ?? estimatedDuration,
        };
        saveBooking(mapped);
        setSubmitting(false);
        setSubmitted(mapped);
        return;
      }
    } catch {
      // fall through to local-only fallback below
    }

    // Fallback: server failed or returned an error — keep the wizard working locally.
    const booking: Booking = {
      id: generateBookingId(),
      style: form.style,
      size: form.size,
      placement: form.placement,
      referenceImageNames: form.referenceFiles.map((f) => f.name),
      description: form.description,
      date: form.date!,
      time: form.time!,
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      notes: form.notes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      estimatedDuration,
    };
    saveBooking(booking);
    setSubmitting(false);
    setSubmitted(booking);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <p className="text-6xl mb-6">✦</p>
          <h2 className="font-display text-3xl mb-3">Booking Request Received</h2>
          <p className="text-white/60 mb-8">
            Thank you, {submitted.fullName.split(' ')[0]}. Your request is <span className="text-gold">Pending</span> confirmation.
            We&rsquo;ll reach out at {submitted.mobile} within 24 hours to confirm your deposit and session.
          </p>
          <div className="glass-panel rounded-xl p-6 text-left space-y-3 border border-white/10 mb-8">
            <div className="flex justify-between text-sm"><span className="text-white/40">Booking ID</span><span className="text-gold font-mono">{submitted.id}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Style</span><span>{submitted.style}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Placement</span><span>{submitted.placement}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Date &amp; Time</span><span>{submitted.date} · {submitted.time}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Est. Duration</span><span>{submitted.estimatedDuration}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Status</span><span className="text-gold">{submitted.status}</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/admin" className="px-6 py-3 border border-white/20 text-sm uppercase tracking-wide hover:border-gold hover:text-gold transition-colors" data-cursor-hover>
              View Booking History
            </a>
            <button
              onClick={() => { setSubmitted(null); setForm(initialState); setStep(0); }}
              data-cursor-hover
              className="px-6 py-3 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-wide transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* progress */}
      <div className="mb-10">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span className="text-gold">{STEP_LABELS[step]}</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-crimson to-gold"
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-white/10 min-h-[420px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1"
          >
            {step === 0 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Select Your Tattoo Style</h3>
                <OptionGrid options={STYLES} value={form.style} onChange={(v) => setForm((f) => ({ ...f, style: v }))} />
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Select Tattoo Size</h3>
                <OptionGrid options={SIZES} value={form.size} onChange={(v) => setForm((f) => ({ ...f, size: v }))} />
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Select Body Placement</h3>
                <OptionGrid options={PLACEMENTS} value={form.placement} onChange={(v) => setForm((f) => ({ ...f, placement: v }))} />
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 className="font-display text-2xl mb-3">Upload Reference Images</h3>
                <p className="text-white/50 text-sm mb-6">Optional — up to 6 images to help us understand your vision.</p>
                <label
                  data-cursor-hover
                  className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl py-12 cursor-pointer hover:border-gold/50 transition-colors"
                >
                  <span className="text-3xl mb-2">⬆</span>
                  <span className="text-sm text-white/60">Click to upload or drag files here</span>
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
                </label>
                {form.referenceFiles.length > 0 && (
                  <ul className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/50">
                    {form.referenceFiles.map((f, i) => (
                      <li key={i} className="truncate bg-white/5 rounded px-2 py-1.5">{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {step === 4 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Describe Your Tattoo Idea</h3>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={8}
                  placeholder="Tell us about the concept, meaning, references, colors, or anything else that helps us design your piece..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors resize-none"
                />
              </div>
            )}
            {step === 5 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Choose Preferred Date</h3>
                <Calendar selected={form.date} onSelect={(d) => setForm((f) => ({ ...f, date: d }))} />
              </div>
            )}
            {step === 6 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Select Available Time</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, time: t }))}
                      data-cursor-hover
                      className={`px-4 py-4 rounded-xl border text-sm transition-all ${
                        form.time === t ? 'border-gold bg-gold/10 text-gold' : 'border-white/15 text-white/70 hover:border-white/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {form.date && <p className="text-xs text-white/40 mt-4">Selected date: {form.date}</p>}
              </div>
            )}
            {step === 7 && (
              <div className="space-y-5">
                <h3 className="font-display text-2xl mb-2">Your Contact Details</h3>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Mobile Number</label>
                  <input
                    value={form.mobile}
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Email Address (optional)</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    type="email"
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            )}
            {step === 8 && (
              <div>
                <h3 className="font-display text-2xl mb-6">Review Your Booking</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Style</span><span>{form.style}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Size</span><span>{form.size}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Placement</span><span>{form.placement}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">References</span><span>{form.referenceFiles.length || 0} file(s)</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Date &amp; Time</span><span>{form.date} · {form.time}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Name</span><span>{form.fullName}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/40">Mobile</span><span>{form.mobile}</span></div>
                  <div className="text-white/40">Idea Description</div>
                  <p className="text-white/70 bg-white/5 rounded-lg p-3">{form.description}</p>
                </div>
                <label className="flex items-start gap-3 text-xs text-white/50 cursor-pointer" data-cursor-hover>
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
                    className="mt-0.5 accent-gold"
                  />
                  I agree to the studio&rsquo;s Terms &amp; Conditions, cancellation policy, and consent to age verification at the appointment.
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-8 mt-auto">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            data-cursor-hover
            className="px-6 py-3 text-sm uppercase tracking-wide text-white/50 hover:text-white disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canProceed()}
              data-cursor-hover
              className="px-8 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-40 disabled:cursor-not-allowed text-sm uppercase tracking-wide transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={submitBooking}
              disabled={!canProceed() || submitting}
              data-cursor-hover
              className="px-8 py-3 bg-gold text-ink-black hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed text-sm uppercase tracking-wide font-medium transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Booking Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
