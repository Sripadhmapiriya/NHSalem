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
    image: '/images/crabs/blue-swimmer-crab.jpg',
    images: [
      '/images/crabs/blue-swimmer-crab.jpg',
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
    image: '/images/lobster/spiny-lobster-tails.png',
    images: [
      '/images/lobster/spiny-lobster-tails.png',
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
  {
    id: 'red-snapper-sankara',
    slug: 'red-snapper-sankara',
    category: 'fish',
    name: 'Fresh Red Snapper (Sankara)',
    tagline: 'Deep-sea caught, firm and flavorful',
    description:
      'Red Snapper (Sankara) is one of the most popular deep-sea fishes in coastal India. Prized for its sweet, mild flavor and firm, white flaky meat. Ideal for traditional spicy fish curries, pan-frying, or baking whole.',
    howToCook:
      'Make shallow cuts on the sides. Marinate with red chilli powder, turmeric, ginger-garlic paste, and lemon juice. Pan-fry in hot coconut oil for 4 minutes on each side.',
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '500g', price: 399, originalPrice: 499 },
      { label: '1kg', price: 749, originalPrice: 949 },
    ],
    basePrice: 399,
    rating: 4.7,
    reviewCount: 912,
    catchTime: '4h ago',
    freshnessScore: 94,
  },
  {
    id: 'premium-flower-prawns',
    slug: 'premium-flower-prawns',
    category: 'prawns-shrimp',
    name: 'Premium Flower Prawns',
    tagline: 'Tuticorin coast, tender and sweet',
    description:
      'Flower Prawns are known for their distinct striped shells and extremely tender, sweet meat. Harvested daily off the Tuticorin coast. These medium-to-large prawns are perfect for prawn masala, butter-garlic tossed, or crispy golden fry.',
    howToCook:
      'De-shell and devein, leaving the tail on. Sauté in hot butter with crushed garlic, green chillies, and a pinch of black pepper for 3 minutes until curled and pink.',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'premium', label: 'Premium' }],
    weights: [
      { label: '500g', price: 489, originalPrice: 599 },
      { label: '1kg', price: 929, originalPrice: 1149 },
    ],
    basePrice: 489,
    rating: 4.8,
    reviewCount: 654,
    catchTime: '5h ago',
    freshnessScore: 93,
  },
  {
    id: 'lagoon-mud-crab',
    slug: 'lagoon-mud-crab',
    category: 'crabs',
    name: 'Meaty Mud Crabs',
    tagline: 'Estuary-caught, massive and sweet',
    description:
      'Premium Mud Crabs (Scylla serrata) sourced from coastal estuaries and lagoons. These crabs are packed with sweet, dense body meat and large, meaty claws. Delivered live-packed to retain their coastal freshness.',
    howToCook:
      'Clean carefully and crack the claws slightly to let flavors penetrate. Cook in a fiery Chettinad-style crab masala curry with coconut, black pepper, and fennel seeds for 20 minutes.',
    image: '/images/crabs/lagoon-mud-crab.png',
    images: [
      '/images/crabs/lagoon-mud-crab.png',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }, { type: 'premium', label: 'Premium' }],
    weights: [
      { label: '500g', price: 699, originalPrice: 849 },
      { label: '1kg', price: 1299, originalPrice: 1599 },
    ],
    basePrice: 699,
    rating: 4.9,
    reviewCount: 432,
    catchTime: '3h ago',
    freshnessScore: 96,
  },
  {
    id: 'whole-rock-lobster',
    slug: 'whole-rock-lobster',
    category: 'lobster',
    name: 'Whole Rock Lobster',
    tagline: 'Deep-sea delicacy, grand feast',
    description:
      'Pristine Whole Rock Lobsters caught off the rocky southern coast. Renowned for their succulent, rich meat throughout the tail. Excellent as the centerpiece of a grand seafood feast, baked, grilled, or steamed whole.',
    howToCook:
      'Boil in salted water for 12-15 minutes, or split in half, baste with herb butter, and grill for 6 minutes per side. Serve with garlic butter sauce.',
    image: '/images/lobster/whole-rock-lobster.png',
    images: [
      '/images/lobster/whole-rock-lobster.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }, { type: 'limited', label: 'Limited Time' }],
    weights: [
      { label: '1 piece (~600g)', price: 1799, originalPrice: 2199 },
      { label: '2 pieces (~1.2kg)', price: 3399, originalPrice: 3999 },
    ],
    basePrice: 1799,
    rating: 4.9,
    reviewCount: 312,
    catchTime: '6h ago',
    freshnessScore: 95,
  },
  {
    id: 'peeled-karikkadi-prawns',
    slug: 'peeled-karikkadi-prawns',
    category: 'prawns-shrimp',
    name: 'Coastal Karikkadi Prawns (Peeled & Deveined)',
    tagline: 'Bite-sized, sweet, and shell-free',
    description:
      'Tiny, sweet wild-caught Karikkadi prawns from Kerala\'s coast. Meticulously peeled and deveined by hand, ready to toss directly into your curries, rice, or noodle preparations.',
    howToCook:
      'Sauté with onions, tomatoes, and ground spices for 3 minutes. Perfect for quick prawn fried rice or a traditional Kerala Prawn Roast.',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '250g', price: 169 },
      { label: '500g', price: 299, originalPrice: 349 },
    ],
    basePrice: 299,
    rating: 4.7,
    reviewCount: 412,
    catchTime: '6h ago',
    freshnessScore: 90,
  },
  {
    id: 'three-spot-crab',
    slug: 'three-spot-crab',
    category: 'crabs',
    name: 'Three-Spot Swimming Crab',
    tagline: 'Delicate sweet meat, coastal delicacy',
    description:
      'Wild-caught three-spot swimming crabs, known for their sweet and tender leg meat. Perfect for traditional spicy crab broths (Nandu Rasam) or coastal curry preparations.',
    howToCook:
      'Simmer in a spiced coconut-based curry or prepare a piping hot pepper soup. Cook for 12-15 minutes.',
    image: '/images/crabs/three-spot-crab.png',
    images: [
      '/images/crabs/three-spot-crab.png',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '500g', price: 429, originalPrice: 499 },
      { label: '1kg', price: 799, originalPrice: 949 },
    ],
    basePrice: 429,
    rating: 4.6,
    reviewCount: 312,
    catchTime: '4h ago',
    freshnessScore: 92,
  },
  {
    id: 'soft-shell-mangrove-crab',
    slug: 'soft-shell-mangrove-crab',
    category: 'crabs',
    name: 'Soft-Shell Mangrove Crab',
    tagline: '100% edible, crunchy when fried',
    description:
      'Highly prized soft-shell crabs harvested just after molting. 100% edible, shell and all. Delicate, sweet flavor that crisp up beautifully when fried whole.',
    howToCook:
      'Coat in a light tempura batter and deep-fry whole for 3-4 minutes until golden and crunchy. Serve with sweet chilli dip.',
    image: '/images/crabs/soft-shell-mangrove-crab.png',
    images: [
      '/images/crabs/soft-shell-mangrove-crab.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }],
    weights: [
      { label: '2 crabs (~300g)', price: 899, originalPrice: 1099 },
      { label: '4 crabs (~600g)', price: 1699, originalPrice: 1999 },
    ],
    basePrice: 899,
    rating: 4.8,
    reviewCount: 215,
    catchTime: '5h ago',
    freshnessScore: 94,
  },
  {
    id: 'red-claw-rock-crab',
    slug: 'red-claw-rock-crab',
    category: 'crabs',
    name: 'Red Claw Rock Crab',
    tagline: 'Firm sweet claw meat, hard-shell',
    description:
      'Hard-shell rock crabs caught along coastal reefs. Renowned for their exceptionally sweet, dense claw meat. Excellent for stir-fries, roasts, or crab cakes.',
    howToCook:
      'Crack claws slightly, stir-fry with ginger, garlic, spring onions, and soy sauce on high heat for 8 minutes.',
    image: '/images/crabs/red-claw-rock-crab.png',
    images: [
      '/images/crabs/red-claw-rock-crab.png',
    ],
    badges: [{ type: 'hot', label: 'HOT DEAL' }],
    weights: [
      { label: '500g', price: 519, originalPrice: 599 },
      { label: '1kg', price: 989, originalPrice: 1149 },
    ],
    basePrice: 519,
    rating: 4.7,
    reviewCount: 187,
    catchTime: '4h ago',
    freshnessScore: 93,
  },
  {
    id: 'premium-sand-lobster',
    slug: 'premium-sand-lobster',
    category: 'lobster',
    name: 'Premium Sand Lobster (Slipper)',
    tagline: 'Delicate tail meat, budget-friendly gourmet',
    description:
      'Slipper lobsters (Sand Lobsters) harvested off the Bay of Bengal. Packed with firm, sweet tail meat. Easier to prepare and shell than rock lobsters, offering a premium experience at a great value.',
    howToCook:
      'Cut tail in half, grill with lemon-herb butter for 5 minutes per side, or toss into a rich seafood thermidor sauce.',
    image: '/images/lobster/premium-sand-lobster.png',
    images: [
      '/images/lobster/premium-sand-lobster.png',
    ],
    badges: [{ type: 'fresh', label: 'Fresh Today' }],
    weights: [
      { label: '500g', price: 799, originalPrice: 949 },
      { label: '1kg', price: 1499, originalPrice: 1799 },
    ],
    basePrice: 799,
    rating: 4.7,
    reviewCount: 389,
    catchTime: '5h ago',
    freshnessScore: 91,
  },
  {
    id: 'tiger-rock-lobster',
    slug: 'tiger-rock-lobster',
    category: 'lobster',
    name: 'Premium Tiger Rock Lobster',
    tagline: 'Beautiful shell, massive sweet tail',
    description:
      'The king of Indian lobsters, the ornate Tiger Rock Lobster. Sourced from the deep waters of the Indian Ocean. Known for its majestic colored shell and massive, tender tail meat.',
    howToCook:
      'Steam whole for 15 minutes and serve with drawn butter, or cut open and broil basted in butter, garlic, and dill.',
    image: '/images/lobster/tiger-rock-lobster.png',
    images: [
      '/images/lobster/tiger-rock-lobster.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }, { type: 'limited', label: 'Limited Time' }],
    weights: [
      { label: '1 piece (~500g)', price: 1999, originalPrice: 2399 },
      { label: '2 pieces (~1kg)', price: 3799, originalPrice: 4499 },
    ],
    basePrice: 1999,
    rating: 4.9,
    reviewCount: 254,
    catchTime: '4h ago',
    freshnessScore: 96,
  },
  {
    id: 'bamboo-rock-lobster',
    slug: 'bamboo-rock-lobster',
    category: 'lobster',
    name: 'Indian Ocean Bamboo Lobster',
    tagline: 'Sweet tender meat, highly prized',
    description:
      'Bamboo lobsters (Panulirus versicolor) prized for their exceptionally sweet, delicate white flesh. Sourced from coral reefs off the southern coast. Hand-selected for premium quality.',
    howToCook:
      'Bake or grill split lobster tails for 8-10 minutes basted with lemon garlic butter. Excellent in cream-based pasta dishes.',
    image: '/images/lobster/bamboo-rock-lobster.png',
    images: [
      '/images/lobster/bamboo-rock-lobster.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }],
    weights: [
      { label: '1 piece (~450g)', price: 1699, originalPrice: 1999 },
      { label: '2 pieces (~900g)', price: 3199, originalPrice: 3799 },
    ],
    basePrice: 1699,
    rating: 4.8,
    reviewCount: 167,
    catchTime: '6h ago',
    freshnessScore: 94,
  },
  {
    id: 'dry-anchovies-nethili',
    slug: 'dry-anchovies-nethili',
    category: 'dry-fish',
    name: 'Premium Dried Anchovies (Nethili)',
    tagline: 'Sun-dried, crisp, and high in calcium',
    description:
      'Our Premium Dried Anchovies (Nethili Karuvadu) are sourced from coastal fisherwomen who sun-dry the fresh catch on clean raised nets. Lightly salted, fully cleaned, and free from any sand or dust. Excellent for deep-frying or preparing dry fish thokku.',
    howToCook:
      'Wash in warm water twice. Fry in hot oil with onions, garlic, and green chillies for 4 minutes, or simmer in a tamarind-based spicy curry.',
    image: '/images/dry-fish/premium-dried-anchovies.jpg',
    images: [
      '/images/dry-fish/premium-dried-anchovies.jpg',
    ],
    badges: [{ type: 'fresh', label: 'Sun Dried' }],
    weights: [
      { label: '100g', price: 99 },
      { label: '200g', price: 179, originalPrice: 199 },
    ],
    basePrice: 179,
    rating: 4.8,
    reviewCount: 512,
    catchTime: 'Dried 2 days ago',
    freshnessScore: 95,
  },
  {
    id: 'dry-sardines-chala',
    slug: 'dry-sardines-chala',
    category: 'dry-fish',
    name: 'Premium Dried Sardines (Chala)',
    tagline: 'Rich in Omega-3, traditionally salted',
    description:
      'Sardines (Chala Karuvadu) dried naturally under the sun to retain maximum nutritional value and classic pungent flavor. Rich in healthy fish oils. Packed hygienically in sealed bags.',
    howToCook:
      'Soak in warm water for 5 minutes to remove excess salt. Fry in oil with curry leaves and mustard seeds until crispy on both sides.',
    image: '/images/dry-fish/premium-dried-sardines.jpg',
    images: [
      '/images/dry-fish/premium-dried-sardines.jpg',
    ],
    badges: [{ type: 'hot', label: 'Best Seller' }],
    weights: [
      { label: '200g', price: 149, originalPrice: 179 },
      { label: '500g', price: 329, originalPrice: 399 },
    ],
    basePrice: 149,
    rating: 4.7,
    reviewCount: 389,
    catchTime: 'Dried 3 days ago',
    freshnessScore: 92,
  },
  {
    id: 'dry-mackerel-ayala',
    slug: 'dry-mackerel-ayala',
    category: 'dry-fish',
    name: 'Traditional Sun-Dried Mackerel (Ayala)',
    tagline: 'Whole dried, authentic coastal flavor',
    description:
      'Whole Indian Mackerels (Ayala Karuvadu) gutted, salted, and sun-dried to perfection along the southern coastline. A staple in coastal homes, offering a deep, savory, and bold flavor profile.',
    howToCook:
      'Soak in cold water for 10 minutes. Shallow-fry with red chilli powder and turmeric, or cook in a traditional earthenware pot with clay-cooked curry.',
    image: '/images/dry-fish/traditional-dried-mackerel.png',
    images: [
      '/images/dry-fish/traditional-dried-mackerel.png',
    ],
    badges: [{ type: 'fresh', label: 'Sun Dried' }],
    weights: [
      { label: '3 pieces (~250g)', price: 199, originalPrice: 249 },
      { label: '6 pieces (~500g)', price: 369, originalPrice: 449 },
    ],
    basePrice: 199,
    rating: 4.7,
    reviewCount: 278,
    catchTime: 'Dried 4 days ago',
    freshnessScore: 93,
  },
  {
    id: 'dry-seerfish-heads',
    slug: 'dry-seerfish-heads',
    category: 'dry-fish',
    name: 'Dried Seer Fish Heads (Vanjaram)',
    tagline: 'Rich flavor, perfect for traditional broths',
    description:
      'Carefully cured and dried Seer Fish (Vanjaram) heads. Highly sought after for adding rich, intense umami depth to dry fish gravies (Karuvadu Kuzhambu). Sourced from large kingfish catches.',
    howToCook:
      'Wash thoroughly and crack slightly. Add to boiling tamarind and coconut gravies, letting it simmer for 15 minutes to release all rich flavors.',
    image: '/images/dry-fish/premium-dried-seerfish-heads.png',
    images: [
      '/images/dry-fish/premium-dried-seerfish-heads.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }],
    weights: [
      { label: '2 heads (~300g)', price: 249, originalPrice: 299 },
      { label: '4 heads (~600g)', price: 479, originalPrice: 549 },
    ],
    basePrice: 249,
    rating: 4.9,
    reviewCount: 167,
    catchTime: 'Dried 2 days ago',
    freshnessScore: 96,
  },
  {
    id: 'dry-shark-sura',
    slug: 'dry-shark-sura',
    category: 'dry-fish',
    name: 'Sun-Dried Shark Meat (Sura Karuvadu)',
    tagline: 'Boneless chunks, perfect for puttu',
    description:
      'Sun-dried boneless chunks of premium shark meat (Sura Karuvadu). Highly popular for preparing "Sura Karuvadu Puttu" (scrambled dry shark dish). Cleaned, salted, and naturally cured.',
    howToCook:
      'Boil in water for 5 minutes, squeeze out water, shred the meat, and sauté with plenty of garlic, small onions, green chillies, and grated coconut.',
    image: '/images/dry-fish/traditional-dried-mackerel.png',
    images: [
      '/images/dry-fish/traditional-dried-mackerel.png',
    ],
    badges: [{ type: 'premium', label: 'Premium' }],
    weights: [
      { label: '100g', price: 160 },
      { label: '200g', price: 299, originalPrice: 349 },
    ],
    basePrice: 299,
    rating: 4.8,
    reviewCount: 224,
    catchTime: 'Dried 3 days ago',
    freshnessScore: 94,
  },
]

export default PRODUCTS


