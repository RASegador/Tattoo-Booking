export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  count: number;
};

export const categories: Category[] = [
  { slug: 'black-grey', name: 'Black & Grey', icon: '🖤', description: 'Deep shadow work and smooth gradients.', count: 12 },
  { slug: 'realism', name: 'Realism', icon: '🎯', description: 'Hyper-detailed portraits and lifelike imagery.', count: 9 },
  { slug: 'anime', name: 'Anime', icon: '⛩️', description: 'Bold linework inspired by Japanese animation.', count: 10 },
  { slug: 'traditional', name: 'Traditional', icon: '⚓', description: 'Bold outlines, classic Americana motifs.', count: 8 },
  { slug: 'fine-line', name: 'Fine Line', icon: '✒️', description: 'Delicate single-needle detail work.', count: 11 },
  { slug: 'minimalist', name: 'Minimalist', icon: '◻️', description: 'Clean, simple, and understated designs.', count: 7 },
  { slug: 'cover-ups', name: 'Cover Ups', icon: '🔥', description: 'Transforming old ink into new art.', count: 6 },
  { slug: 'custom', name: 'Custom Designs', icon: '✨', description: 'One-of-a-kind concepts built from scratch.', count: 9 },
];

export type Artwork = {
  id: string;
  category: string;
  seed: string;
  title: string;
  style: string;
  placement: string;
  size: string;
  duration: string;
  price: string;
  description: string;
};

const placements = ['Forearm', 'Upper Arm', 'Shoulder', 'Back', 'Calf', 'Ribcage', 'Chest', 'Thigh'];
const sizes = ['Small (2-4 in)', 'Medium (5-8 in)', 'Large (9-14 in)', 'Full Sleeve'];

export function getArtworksForCategory(slug: string): Artwork[] {
  const cat = categories.find((c) => c.slug === slug);
  const count = cat?.count ?? 8;
  return Array.from({ length: count }).map((_, i) => ({
    id: `${slug}-${i + 1}`,
    category: slug,
    seed: `${slug}-${i + 1}-tattoo`,
    title: `${cat?.name ?? 'Custom'} Piece No. ${i + 1}`,
    style: cat?.name ?? 'Custom',
    placement: placements[i % placements.length],
    size: sizes[i % sizes.length],
    duration: `${2 + (i % 5)} hrs`,
    price: `$${150 + (i % 6) * 80} - $${300 + (i % 6) * 120}`,
    description:
      'Hand-drawn custom piece designed in close collaboration with the client, executed with premium pigments and precision needle work for lasting vibrancy.',
  }));
}

export type Review = {
  id: string;
  name: string;
  avatarSeed: string;
  rating: number;
  tattooSeed: string;
  text: string;
  date: string;
  verified: boolean;
};

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Maria Santos',
    avatarSeed: 'maria-santos',
    rating: 5,
    tattooSeed: 'review-1-tattoo',
    text: 'The attention to detail was unreal. My realism portrait healed perfectly and still looks incredible two years later.',
    date: 'March 2026',
    verified: true,
  },
  {
    id: 'r2',
    name: 'James Cruz',
    avatarSeed: 'james-cruz',
    rating: 5,
    tattooSeed: 'review-2-tattoo',
    text: 'Booked through the site, uploaded my reference, and the whole process from consult to needle was seamless. Studio has a vibe like nowhere else.',
    date: 'February 2026',
    verified: true,
  },
  {
    id: 'r3',
    name: 'Ava Reyes',
    avatarSeed: 'ava-reyes',
    rating: 5,
    tattooSeed: 'review-3-tattoo',
    text: 'My fine line piece is so delicate and precise. Aftercare instructions were thorough and the healing was smooth.',
    date: 'January 2026',
    verified: true,
  },
  {
    id: 'r4',
    name: 'Daniel Kim',
    avatarSeed: 'daniel-kim',
    rating: 4,
    tattooSeed: 'review-4-tattoo',
    text: 'Excellent cover up work — you genuinely cannot tell there was an old tattoo underneath. Incredible craftsmanship.',
    date: 'December 2025',
    verified: true,
  },
  {
    id: 'r5',
    name: 'Sophia Bautista',
    avatarSeed: 'sophia-bautista',
    rating: 5,
    tattooSeed: 'review-5-tattoo',
    text: 'The studio itself feels like an art gallery. Super clean, professional, and the artist really listened to what I wanted.',
    date: 'November 2025',
    verified: true,
  },
  {
    id: 'r6',
    name: 'Liam Torres',
    avatarSeed: 'liam-torres',
    rating: 5,
    tattooSeed: 'review-6-tattoo',
    text: 'Traditional style sleeve turned out better than I imagined. Booking, deposit, and reminders were all handled online effortlessly.',
    date: 'October 2025',
    verified: true,
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: 'Does getting a tattoo hurt?',
    a: 'Discomfort varies by placement and individual pain tolerance. Areas with more bone or thin skin (ribs, spine, feet) tend to be more sensitive, while fleshier areas like the outer arm or calf are typically more comfortable. Most clients describe it as a manageable, consistent scratching sensation rather than sharp pain.',
  },
  {
    q: 'How is pricing determined?',
    a: 'Pricing depends on size, placement, detail level, and estimated session duration. Small minimalist pieces start around $150, while large-scale custom or realism work is quoted per session after a consultation. You will see an estimated range before booking and a final quote after your design consultation.',
  },
  {
    q: 'What does the healing process look like?',
    a: 'Initial healing takes 2-3 weeks, with full healing beneath the surface taking up to 4-6 months. You will receive a digital aftercare guide after your session, plus reminders at key healing milestones through your booking confirmation.',
  },
  {
    q: 'Do you require a deposit?',
    a: 'Yes, a non-refundable deposit is required to confirm any booking. This secures your appointment slot and is deducted from the final price of your tattoo on the day of your session.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'We ask for at least 48 hours notice to reschedule or cancel. Cancellations within 48 hours of the appointment may forfeit the deposit. You can manage rescheduling directly from your booking confirmation.',
  },
  {
    q: 'How should I prepare for my appointment?',
    a: 'Get a full night of sleep, eat a solid meal beforehand, stay hydrated, and avoid alcohol for 24 hours prior. Wear clothing that gives easy access to the tattoo placement area.',
  },
  {
    q: 'How do I care for my tattoo afterward?',
    a: 'Keep the piece clean and lightly moisturized, avoid direct sunlight, swimming, and tight clothing over the area for the first two weeks, and never pick at any peeling or scabbing.',
  },
];
