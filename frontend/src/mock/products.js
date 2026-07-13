/**
 * Mock product data — all products referenced across all 13 source pages
 * Images use Unsplash for realistic seafood photography
 */
export const PRODUCTS = [
  // ── Fish ──────────────────────────────────────────────────────────────
  {
    id: 'premium-atlantic-salmon',
    slug: 'premium-atlantic-salmon',
    category: 'fish',
    name: 'Premium Atlantic Salmon',
    tagline: 'Farm-raised in pristine Norwegian waters',
    description:
      'Our Premium Atlantic Salmon is carefully sourced from certified sustainable Norwegian farms. Rich in omega-3 fatty acids and with a buttery, melt-in-your-mouth texture, this salmon is perfect for grilling, pan-searing, or poaching. Cleaned, deboned, and skin-on for maximum flavor.',
    howToCook:
      'Pat dry, season with sea salt & pepper. Sear skin-down in a hot cast iron pan with butter for 4 minutes. Flip, cook 2 more minutes. Rest 1 minute. Finish with a squeeze of lemon. Pairs beautifully with asparagus and dill crème fraîche.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'premium', label: 'Premium' }],
    weights: [
      { label: '500g', price: 649, originalPrice: 799 },
      { label: '1kg', price: 1249, originalPrice: 1499 },
      { label: '2kg', price: 2399, originalPrice: 2999 },
    ],
    basePrice: 649,
    rating: 4.8,
    reviewCount: 2341,
    isBestSeller: true,
    catchTime: '3h ago',
    freshnessScore: 96,
    nutritionPer100g: { calories: 208, protein: '20g', fat: '13g', omega3: '2.2g' },
  },
  {
    id: 'silver-pomfret',
    slug: 'silver-pomfret',
    category: 'fish',
    name: 'Silver Pomfret',
    tagline: 'Kerala coast hand-line caught',
    description:
      'The Silver Pomfret (Paplet) is a coastal delicacy prized for its delicate, flaky white flesh and subtle flavor. Caught fresh off the Kerala coast by our partner fishing communities using traditional hand-line methods. Pre-cleaned, descaled, and ready to cook.',
    howToCook:
      'Score the fish 3 times on each side. Marinate in turmeric, chilli, and lemon for 20 minutes. Pan-fry in coconut oil over medium-high heat for 3–4 minutes each side until golden.',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&q=80',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'new', label: 'New Catch' }],
    weights: [
      { label: '500g', price: 449, originalPrice: 549 },
      { label: '1kg', price: 849, originalPrice: 999 },
    ],
    basePrice: 449,
    rating: 4.7,
    reviewCount: 1876,
    isBestSeller: true,
    catchTime: '5h ago',
    freshnessScore: 93,
  },
  {
    id: 'seer-fish-vanjaram',
    slug: 'seer-fish-vanjaram',
    category: 'fish',
    name: 'Premium Seer Fish (Vanjaram)',
    tagline: 'King of South Indian seafood',
    description:
      'Vanjaram (Seer Fish / King Mackerel) is revered as the king of South Indian seafood. Its firm, meaty steaks are perfect for Indian-style fry, masala preparations, or grilling. Steaks are cut thick to retain moisture and maximum flavor.',
    howToCook:
      'Marinate steaks in ginger-garlic paste, red chilli, turmeric, and tamarind for 30 minutes. Shallow-fry in a non-stick pan with sunflower oil for 4–5 minutes per side until beautifully crusted.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    ],
    badges: [{ type: 'hot', label: 'HOT DEAL' }, { type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '500g', price: 549, originalPrice: 699 },
      { label: '1kg', price: 1049, originalPrice: 1299 },
    ],
    basePrice: 549,
    rating: 4.9,
    reviewCount: 3102,
    isBestSeller: false,
    catchTime: '2h ago',
    freshnessScore: 98,
  },
  {
    id: 'hand-cleaned-squid',
    slug: 'hand-cleaned-squid',
    category: 'fish',
    name: 'Hand-Cleaned Squid',
    tagline: 'Ready-to-cook, cleaned by hand',
    description:
      'Our squid (Kanava) is meticulously hand-cleaned by our processing team — ink sac removed, tentacles separated, and body tube cleaned and scored for even cooking. No grit, no fuss. Ideal for calamari rings, stuffed squid, or Kerala-style squid pepper fry.',
    howToCook:
      'For crispy calamari: dust rings in seasoned flour, dip in beaten egg, coat in breadcrumbs. Deep-fry at 180°C for 90 seconds. Serve with aioli.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
    ],
    badges: [{ type: 'new', label: 'New Catch' }],
    weights: [
      { label: '300g', price: 279 },
      { label: '500g', price: 429 },
    ],
    basePrice: 279,
    rating: 4.6,
    reviewCount: 987,
    catchTime: '6h ago',
    freshnessScore: 91,
  },

  // ── Prawns & Shrimp ───────────────────────────────────────────────────
  {
    id: 'jumbo-tiger-prawns',
    slug: 'jumbo-tiger-prawns',
    category: 'prawns-shrimp',
    name: 'Jumbo Tiger Prawns',
    tagline: 'Gulf of Mannar, head-on, shell-on',
    description:
      "Our flagship Tiger Prawns (Penaeus monodon) are sourced daily from the Gulf of Mannar and the Palk Bay — India's finest tiger prawn territory. Jumbo-grade (16–20 count per kg), head-on and shell-on to lock in maximum sweetness and oceanic flavor. Each prawn is individually QC-checked for size, freshness, and texture before packing.",
    howToCook:
      'For a classic butter garlic preparation: melt 3 tbsp unsalted butter in a skillet over high heat. Add 4 garlic cloves (minced). Add prawns (shell-on), cook 2 minutes per side until shells are bright orange. Deglaze with white wine, finish with parsley and sea salt. Serve with crusty bread.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
    ],
    badges: [{ type: 'hot', label: 'HOT DEAL' }, { type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '500g', price: 599, originalPrice: 749 },
      { label: '1kg', price: 1149, originalPrice: 1399 },
      { label: '2kg', price: 2199, originalPrice: 2799 },
    ],
    basePrice: 599,
    rating: 4.9,
    reviewCount: 4523,
    isBestSeller: true,
    catchTime: '4h ago',
    freshnessScore: 94,
    nutritionPer100g: { calories: 99, protein: '24g', fat: '0.3g', omega3: '0.5g' },
    pairsWellWith: [
      { id: 'citrus-garlic-marinade', name: 'Citrus Garlic Marinade', price: 149, image: 'https://images.unsplash.com/photo-1587131782738-de30ea91a542?w=300&q=80' },
      { id: 'herb-infused-butter', name: 'Herb Infused Butter', price: 99, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80' },
      { id: 'konkan-masala-mix', name: 'Konkan Masala Mix', price: 79, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80' },
      { id: 'fresh-garnish-kit', name: 'Fresh Garnish Kit', price: 49, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80' },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Anjali Sharma',
        avatar: 'https://i.pravatar.cc/60?img=47',
        rating: 5,
        date: '2024-07-01',
        title: 'Best tiger prawns I\'ve ever had',
        body: 'The size was exactly as described — proper jumbo! Arrived packed beautifully with ice. Cooked them in garlic butter and they were absolutely divine. Will order every week.',
        verified: true,
        helpful: 142,
      },
      {
        id: 'r2',
        author: 'Karthik Rajan',
        avatar: 'https://i.pravatar.cc/60?img=12',
        rating: 5,
        date: '2024-06-28',
        title: 'Freshness guaranteed — literally',
        body: 'The freshness score on the app showed 94 and I could tell immediately. No fishy smell, firm texture. Made a prawn biryani for 8 people and everyone was asking where I got them from.',
        verified: true,
        helpful: 98,
      },
      {
        id: 'r3',
        author: 'Meera Pillai',
        avatar: 'https://i.pravatar.cc/60?img=32',
        rating: 4,
        date: '2024-06-20',
        title: 'Excellent quality, slight delay',
        body: 'Quality was top-notch as always. Slight delay in delivery this time but customer care was responsive and apologetic. 4 stars for the delay, 5 stars for the product.',
        verified: true,
        helpful: 56,
      },
    ],
    starBreakdown: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
  },
  {
    id: 'coastal-white-shrimp',
    slug: 'coastal-white-shrimp',
    category: 'prawns-shrimp',
    name: 'Coastal White Shrimp',
    tagline: 'Andhra coast, shell-on, fresh',
    description:
      'Coastal White Shrimp (Litopenaeus vannamei) from the Andhra coast. Clean, sweet, and firm — perfect for stir-fries, curries, and noodles. 30–40 count per kg, shell-on.',
    howToCook:
      'Shell and devein. Toss with olive oil, garlic, salt. Grill or sauté over high heat for 1–2 minutes per side until pink and opaque.',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'new', label: 'New Catch' }],
    weights: [
      { label: '500g', price: 349, originalPrice: 429 },
      { label: '1kg', price: 649, originalPrice: 799 },
    ],
    basePrice: 349,
    rating: 4.6,
    reviewCount: 1543,
    catchTime: '5h ago',
    freshnessScore: 91,
  },
  {
    id: 'sweet-water-prawns',
    slug: 'sweet-water-prawns',
    category: 'prawns-shrimp',
    name: 'Sweet Water Prawns',
    tagline: 'River-fresh, naturally sweet',
    description:
      'Freshwater Giant Prawns (Macrobrachium rosenbergii) from certified aquaculture farms in West Bengal. Their meat is naturally sweeter and firmer than sea prawns, making them ideal for bharva (stuffed), tandoori preparations, and Thai-inspired dishes.',
    howToCook:
      'Butterfly the prawns (shell-on). Marinate in tandoori spice mix with yogurt for 1 hour. Grill or broil 3–4 minutes per side.',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
    ],
    badges: [{ type: 'premium', label: 'Premium' }],
    weights: [
      { label: '500g', price: 449 },
      { label: '1kg', price: 849 },
    ],
    basePrice: 449,
    rating: 4.7,
    reviewCount: 876,
    catchTime: '8h ago',
    freshnessScore: 88,
  },

  // ── Crabs ─────────────────────────────────────────────────────────────
  {
    id: 'blue-swimmer-crab',
    slug: 'blue-swimmer-crab',
    category: 'crabs',
    name: 'Blue Swimmer Crab',
    tagline: 'Tamil Nadu coast, live-packed',
    description:
      'The Blue Swimmer Crab (Portunus pelagicus) is a prized delicacy along India\'s eastern coast. Our crabs are live-packed immediately post-catch and dispatched in insulated boxes to ensure maximum freshness. Expect sweet, succulent white crab meat with a delicate ocean flavour.',
    howToCook:
      'Steam for 15–18 minutes or boil in salted water. Serve with drawn butter and lemon. Alternatively, prepare crab masala with a base of onion, tomato, and coastal spices.',
    image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'hot', label: 'HOT DEAL' }],
    weights: [
      { label: '500g', price: 549, originalPrice: 699 },
      { label: '1kg', price: 1049, originalPrice: 1299 },
    ],
    basePrice: 549,
    rating: 4.8,
    reviewCount: 1234,
    isBestSeller: false,
    catchTime: '3h ago',
    freshnessScore: 95,
  },

  // ── Lobster ───────────────────────────────────────────────────────────
  {
    id: 'spiny-lobster-tails',
    slug: 'spiny-lobster-tails',
    category: 'lobster',
    name: 'Spiny Lobster Tails',
    tagline: 'Lakshadweep waters, meaty and sweet',
    description:
      'Indian Spiny Lobster (Panulirus polyphagus) tails from the pristine waters of Lakshadweep. Halved and cleaned, each tail is a generous 180–220g of premium, naturally sweet lobster meat. No claws — all tail — for effortless preparation.',
    howToCook:
      'Butterfly the tails (cut shell lengthwise). Brush with garlic-herb butter. Broil at 230°C for 8–10 minutes until shells are bright red and meat is opaque. Finish with truffle oil.',
    image: 'https://images.unsplash.com/photo-1553618551-fba689030290?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1553618551-fba689030290?w=600&q=80',
    ],
    badges: [{ type: 'premium', label: 'Premium' }, { type: 'limited', label: 'LIMITED TIME' }],
    weights: [
      { label: '2 tails (~400g)', price: 1299, originalPrice: 1599 },
      { label: '4 tails (~800g)', price: 2499, originalPrice: 2999 },
    ],
    basePrice: 1299,
    rating: 4.9,
    reviewCount: 743,
    isBestSeller: true,
    catchTime: '4h ago',
    freshnessScore: 97,
  },
]

export default PRODUCTS
