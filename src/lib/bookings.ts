export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type Booking = {
  id: string;
  style: string;
  size: string;
  placement: string;
  referenceImageNames: string[];
  description: string;
  date: string; // YYYY-MM-DD
  time: string;
  fullName: string;
  mobile: string;
  email: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  estimatedDuration: string;
  artistId?: number | null;
  artistName?: string;
};

const STORAGE_KEY = 'ink_studio_bookings_v1';

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking) {
  if (typeof window === 'undefined') return;
  const existing = getBookings();
  existing.unshift(booking);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  if (typeof window === 'undefined') return;
  const existing = getBookings().map((b) => (b.id === id ? { ...b, status } : b));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function generateBookingId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `INK-${stamp}${rand}`;
}

// Fully booked dates are simulated for demo purposes (deterministic by day-of-month)
export function isFullyBooked(dateStr: string): boolean {
  const day = new Date(dateStr + 'T00:00:00').getDate();
  return day % 7 === 0;
}

export const TIME_SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
