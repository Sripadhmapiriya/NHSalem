export const ORDERS = {
  'NHS-77421': {
    id: 'NHS-77421',
    status: 'out_for_delivery',
    placedAt: '2024-07-11T07:30:00Z',
    estimatedDelivery: '2024-07-11T11:00:00Z',
    eta: 'Arriving in 45 min',
    address: {
      name: 'Karthik Rajan',
      line1: '42, Gandhi Nagar, 3rd Cross',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
    },
    items: [
      {
        id: 'jumbo-tiger-prawns',
        name: 'Jumbo Tiger Prawns',
        weight: '1kg',
        quantity: 2,
        price: 1149,
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&q=80',
      },
      {
        id: 'seer-fish-vanjaram',
        name: 'Premium Seer Fish (Vanjaram)',
        weight: '500g',
        quantity: 1,
        price: 549,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
      },
    ],
    subtotal: 2847,
    shipping: 0,
    total: 2847,
    freshnessScore: 94,
    catchTime: '4h ago',
    agent: {
      name: 'Ravi Kumar',
      phone: '+91 90000 12345',
      avatar: 'https://i.pravatar.cc/80?img=15',
    },
    stages: [
      { id: 'confirmed', label: 'Confirmed', icon: 'check_circle', completedAt: '2024-07-11T07:31:00Z' },
      { id: 'packed', label: 'Packed on Ice', icon: 'ac_unit', completedAt: '2024-07-11T08:15:00Z' },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: 'local_shipping', completedAt: '2024-07-11T09:00:00Z' },
      { id: 'delivered', label: 'Delivered', icon: 'home', completedAt: null },
    ],
  },
}

export default ORDERS
