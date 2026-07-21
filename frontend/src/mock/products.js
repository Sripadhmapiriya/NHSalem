/**
 * Mock product data
 * Kept exactly ONE existing product entry ('seer-fish-vanjaram') as a reference design example 
 * so the product card layout/styling doesn't break, per user request.
 */
export const PRODUCTS = [
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
  }
];
