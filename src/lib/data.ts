export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  // Only populated when the category list comes from the live gallery API
  // (a per-category artwork count); the static fallback list here has none.
  count?: number;
};

export const categories: Category[] = [
  { slug: 'black-grey', name: 'Black & Grey', icon: '🖤', description: 'Deep shadow work and smooth gradients.' },
  { slug: 'realism', name: 'Realism', icon: '🎯', description: 'Hyper-detailed portraits and lifelike imagery.' },
  { slug: 'traditional', name: 'Traditional', icon: '⚓', description: 'Bold outlines, classic Americana motifs.' },
  { slug: 'neo-traditional', name: 'Neo Traditional', icon: '🌹', description: 'Bold traditional roots with modern color and detail.' },
  { slug: 'japanese', name: 'Japanese', icon: '⛩️', description: 'Irezumi-inspired large-scale narrative work.' },
  { slug: 'tribal', name: 'Tribal', icon: '🗿', description: 'Bold, graphic patterns rooted in tribal tradition.' },
  { slug: 'fine-line', name: 'Fine Line', icon: '✒️', description: 'Delicate single-needle detail work.' },
  { slug: 'minimalist', name: 'Minimalist', icon: '◻️', description: 'Clean, simple, and understated designs.' },
  { slug: 'lettering', name: 'Lettering', icon: '🖋️', description: 'Custom script, calligraphy, and typographic pieces.' },
  { slug: 'floral', name: 'Floral', icon: '🌸', description: 'Botanical designs built around flowers and foliage.' },
  { slug: 'geometric', name: 'Geometric', icon: '🔺', description: 'Precise linework, sacred geometry, and pattern work.' },
  { slug: 'color', name: 'Color Tattoos', icon: '🎨', description: 'Vivid full-color illustrative and painterly work.' },
];

export type Artwork = {
  id: string;
  category: string;
  imageUrl: string;
  title: string;
  style: string;
  placement: string;
  size: string;
  duration: string;
  priceMin: number;
  priceMax: number;
  description: string;
};

const placements = ['Forearm', 'Upper Arm', 'Shoulder', 'Back', 'Calf', 'Ribcage', 'Chest', 'Thigh'];
const sizes = ['Small (2-4 in)', 'Medium (5-8 in)', 'Large (9-14 in)', 'Full Sleeve'];

// Sourced from Unsplash (freely-licensed stock tattoo photography) per the studio's request to
// populate the gallery with real sample images ahead of the client replacing them with real
// studio photos via the admin upload UI. Five unique, verified images per category, no repeats
// across categories.
const categoryImages: Record<string, string[]> = {
  'black-grey': [
    'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd',
    'https://images.unsplash.com/photo-1605647533135-51b5906087d0',
    'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a',
    'https://images.unsplash.com/photo-1564426622559-5af68da63b96',
    'https://images.unsplash.com/photo-1627458514257-41d0ea46e326',
  ],
  realism: [
    'https://images.unsplash.com/photo-1562379825-415aea84ebcf',
    'https://images.unsplash.com/photo-1522687533888-1078974f88ec',
    'https://images.unsplash.com/photo-1704345911717-b9c422bf6ef0',
    'https://images.unsplash.com/photo-1513078094721-e7b6e0394a6a',
    'https://images.unsplash.com/photo-1542744383-8c330d91f4b1',
  ],
  traditional: [
    'https://images.unsplash.com/photo-1597852075234-fd721ac361d3',
    'https://images.unsplash.com/photo-1601848714157-d845bb5c11ff',
    'https://images.unsplash.com/photo-1479767574301-a01c78234a0c',
    'https://images.unsplash.com/photo-1543244128-30d70d41e2a9',
    'https://images.unsplash.com/photo-1454329030972-00583f5f051f',
  ],
  'neo-traditional': [
    'https://images.unsplash.com/photo-1712027858623-feaadeec9c0e',
    'https://images.unsplash.com/photo-1638458957842-d901372fed55',
    'https://images.unsplash.com/photo-1744946174053-2ced46e0c3d9',
    'https://images.unsplash.com/photo-1679621551238-9c83dd69bc7d',
    'https://images.unsplash.com/photo-1590281527363-ea3e251271ee',
  ],
  japanese: [
    'https://images.unsplash.com/photo-1723242017542-6273e0115435',
    'https://images.unsplash.com/photo-1579305626036-d173361705f6',
    'https://images.unsplash.com/photo-1759247943688-5d47a84dd615',
    'https://images.unsplash.com/photo-1659693707379-f7b696d92011',
    'https://images.unsplash.com/photo-1770112035323-b8da0cdefa00',
  ],
  tribal: [
    'https://images.unsplash.com/photo-1604374376934-2df6fad6519b',
    'https://images.unsplash.com/photo-1557130641-1b14718f096a',
    'https://images.unsplash.com/photo-1561377455-190afb395ed7',
    'https://images.unsplash.com/photo-1617573211120-1165b16c2900',
    'https://images.unsplash.com/photo-1580619065828-765503971ff4',
  ],
  'fine-line': [
    'https://images.unsplash.com/photo-1542727365-19732a80dcfd',
    'https://images.unsplash.com/photo-1547754145-ef9ff306e3f3',
    'https://images.unsplash.com/photo-1570168983832-8989dae1522e',
    'https://images.unsplash.com/photo-1607382007937-fe3a9d196b7a',
    'https://images.unsplash.com/photo-1643513456892-437e82e06f4a',
  ],
  minimalist: [
    'https://images.unsplash.com/photo-1759346771288-ac905d1b1abf',
    'https://images.unsplash.com/photo-1644436777128-630caff36c4d',
    'https://images.unsplash.com/photo-1778524863804-554d74e14227',
    'https://images.unsplash.com/photo-1621784178022-aae590591234',
    'https://images.unsplash.com/photo-1783916813254-69bb2debb1b7',
  ],
  lettering: [
    'https://images.unsplash.com/photo-1523346889551-06a8879f5c71',
    'https://images.unsplash.com/photo-1607281503082-f01fedd97a5b',
    'https://images.unsplash.com/photo-1508800716-b37c017b7a79',
    'https://images.unsplash.com/photo-1536942493149-0922f79832b9',
    'https://images.unsplash.com/photo-1595747101601-3ff53d64c7f4',
  ],
  floral: [
    'https://images.unsplash.com/photo-1596896734952-c4c1cd2efe0f',
    'https://images.unsplash.com/photo-1605594322009-69759282d5f3',
    'https://images.unsplash.com/photo-1626215549618-f2f2aaff7d87',
    'https://images.unsplash.com/photo-1455282186896-e873a355c0f5',
    'https://images.unsplash.com/photo-1584063075236-def84b83ddbd',
  ],
  geometric: [
    'https://images.unsplash.com/photo-1614174487989-10fc7b5382a9',
    'https://images.unsplash.com/photo-1595862645152-2f32bd80ce1d',
    'https://images.unsplash.com/photo-1588417490413-57973b627712',
    'https://images.unsplash.com/photo-1588417490421-63d4e4175f95',
    'https://images.unsplash.com/photo-1612911012211-d14e442e4739',
  ],
  color: [
    'https://images.unsplash.com/photo-1594091360183-4793f2dac6e6',
    'https://images.unsplash.com/photo-1712027858694-8ad107b64b88',
    'https://images.unsplash.com/photo-1562696676-727312caede0',
    'https://images.unsplash.com/photo-1595155286029-de862796d40a',
    'https://images.unsplash.com/photo-1713020744646-fdcb90ba3311',
  ],
};

export function getArtworksForCategory(slug: string): Artwork[] {
  const cat = categories.find((c) => c.slug === slug);
  const images = categoryImages[slug] ?? [];
  return images.map((imageUrl, i) => ({
    id: `${slug}-${i + 1}`,
    category: slug,
    imageUrl: `${imageUrl}?w=900&h=1200&fit=crop&q=80`,
    title: `${cat?.name ?? 'Custom'} Piece No. ${i + 1}`,
    style: cat?.name ?? 'Custom',
    placement: placements[i % placements.length],
    size: sizes[i % sizes.length],
    duration: `${2 + (i % 5)} hrs`,
    priceMin: 2500 + (i % 6) * 1500,
    priceMax: 6000 + (i % 6) * 2500,
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
    a: 'Pricing depends on size, placement, detail level, and estimated session duration. Small minimalist pieces start around ₱2,500, while large-scale custom or realism work is quoted per session after a consultation. You will see an estimated range before booking and a final quote after your design consultation.',
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
