/**
 * Admin-specific mock data
 * Extends the customer-facing mock data with admin view fields
 * (order management, customer list, B2B inquiries, promotions, reviews)
 */

// ── Extended Orders list (admin view) ─────────────────────────────────────────
export const ADMIN_ORDERS = [
  {
    id: 'NHS-77421',
    customer: { name: 'Karthik Rajan', email: 'karthik@example.com', phone: '+91 98765 43210' },
    status: 'out_for_delivery',
    placedAt: '2024-07-11T07:30:00Z',
    total: 2847,
    items: 3,
    city: 'Bangalore',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
  },
  {
    id: 'NHS-82103',
    customer: { name: 'Anjali Sharma', email: 'anjali@example.com', phone: '+91 91234 56789' },
    status: 'confirmed',
    placedAt: '2024-07-11T09:15:00Z',
    total: 1549,
    items: 2,
    city: 'Chennai',
    paymentMethod: 'Card',
    paymentStatus: 'paid',
  },
  {
    id: 'NHS-74982',
    customer: { name: 'Meera Pillai', email: 'meera@example.com', phone: '+91 87654 32100' },
    status: 'delivered',
    placedAt: '2024-07-10T16:00:00Z',
    total: 3299,
    items: 4,
    city: 'Kochi',
    paymentMethod: 'COD',
    paymentStatus: 'collected',
  },
  {
    id: 'NHS-91044',
    customer: { name: 'Ravi Shankar', email: 'ravi.s@example.com', phone: '+91 99000 11222' },
    status: 'packed',
    placedAt: '2024-07-11T05:45:00Z',
    total: 1199,
    items: 1,
    city: 'Hyderabad',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
  },
  {
    id: 'NHS-63827',
    customer: { name: 'Sunita Nair', email: 'sunita.n@example.com', phone: '+91 77889 00123' },
    status: 'cancelled',
    placedAt: '2024-07-10T11:30:00Z',
    total: 899,
    items: 2,
    city: 'Bangalore',
    paymentMethod: 'Card',
    paymentStatus: 'refunded',
  },
  {
    id: 'NHS-55219',
    customer: { name: 'Deepak Menon', email: 'deepak@example.com', phone: '+91 80000 44556' },
    status: 'delivered',
    placedAt: '2024-07-09T14:00:00Z',
    total: 5499,
    items: 6,
    city: 'Coimbatore',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
  },
  {
    id: 'NHS-48901',
    customer: { name: 'Priya Venkat', email: 'priya.v@example.com', phone: '+91 63344 55667' },
    status: 'confirmed',
    placedAt: '2024-07-11T10:05:00Z',
    total: 2199,
    items: 3,
    city: 'Madurai',
    paymentMethod: 'Card',
    paymentStatus: 'paid',
  },
  {
    id: 'NHS-39102',
    customer: { name: 'Arun Babu', email: 'arun.b@example.com', phone: '+91 94411 22334' },
    status: 'out_for_delivery',
    placedAt: '2024-07-11T06:00:00Z',
    total: 4298,
    items: 5,
    city: 'Chennai',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
  },
]

// ── Customers list ─────────────────────────────────────────────────────────────
export const ADMIN_CUSTOMERS = [
  { id: 'c1', name: 'Karthik Rajan',   email: 'karthik@example.com',   phone: '+91 98765 43210', city: 'Bangalore',  orders: 12, totalSpent: 18450, joinedAt: '2024-01-15', status: 'active', lastOrder: '2024-07-11' },
  { id: 'c2', name: 'Anjali Sharma',   email: 'anjali@example.com',    phone: '+91 91234 56789', city: 'Chennai',    orders: 8,  totalSpent: 11200, joinedAt: '2024-02-20', status: 'active', lastOrder: '2024-07-11' },
  { id: 'c3', name: 'Meera Pillai',    email: 'meera@example.com',     phone: '+91 87654 32100', city: 'Kochi',      orders: 21, totalSpent: 34800, joinedAt: '2023-11-10', status: 'active', lastOrder: '2024-07-10' },
  { id: 'c4', name: 'Ravi Shankar',    email: 'ravi.s@example.com',    phone: '+91 99000 11222', city: 'Hyderabad',  orders: 3,  totalSpent: 3600,  joinedAt: '2024-05-18', status: 'active', lastOrder: '2024-07-11' },
  { id: 'c5', name: 'Sunita Nair',     email: 'sunita.n@example.com',  phone: '+91 77889 00123', city: 'Bangalore',  orders: 5,  totalSpent: 6500,  joinedAt: '2024-03-02', status: 'inactive', lastOrder: '2024-07-10' },
  { id: 'c6', name: 'Deepak Menon',    email: 'deepak@example.com',    phone: '+91 80000 44556', city: 'Coimbatore', orders: 16, totalSpent: 27900, joinedAt: '2023-09-05', status: 'active', lastOrder: '2024-07-09' },
  { id: 'c7', name: 'Priya Venkat',    email: 'priya.v@example.com',   phone: '+91 63344 55667', city: 'Madurai',    orders: 7,  totalSpent: 9850,  joinedAt: '2024-04-11', status: 'active', lastOrder: '2024-07-11' },
  { id: 'c8', name: 'Arun Babu',       email: 'arun.b@example.com',    phone: '+91 94411 22334', city: 'Chennai',    orders: 19, totalSpent: 41200, joinedAt: '2023-08-22', status: 'active', lastOrder: '2024-07-11' },
  { id: 'c9', name: 'Lakshmi Kumar',   email: 'lakshmi@example.com',   phone: '+91 88776 55443', city: 'Mysore',     orders: 2,  totalSpent: 2100,  joinedAt: '2024-06-30', status: 'active', lastOrder: '2024-07-05' },
  { id: 'c10', name: 'Siva Prasad',    email: 'siva@example.com',      phone: '+91 72233 44556', city: 'Chennai',    orders: 0,  totalSpent: 0,     joinedAt: '2024-07-10', status: 'new', lastOrder: null },
]

// ── Admin Subscriptions ────────────────────────────────────────────────────────
export const ADMIN_SUBSCRIPTIONS = [
  { id: 's1', customer: 'Meera Pillai',  email: 'meera@example.com',   plan: 'Deep Sea Vault',      status: 'active',   nextDelivery: '2024-07-15', amount: 5499, startedAt: '2024-03-01' },
  { id: 's2', customer: 'Karthik Rajan', email: 'karthik@example.com', plan: 'Maritime Essential',   status: 'active',   nextDelivery: '2024-07-12', amount: 2799, startedAt: '2024-04-15' },
  { id: 's3', customer: 'Deepak Menon',  email: 'deepak@example.com',  plan: 'Maritime Essential',   status: 'paused',   nextDelivery: null,         amount: 2799, startedAt: '2024-01-10' },
  { id: 's4', customer: 'Anjali Sharma', email: 'anjali@example.com',  plan: 'Weekly Harvest',       status: 'active',   nextDelivery: '2024-07-13', amount: 1499, startedAt: '2024-05-20' },
  { id: 's5', customer: 'Priya Venkat',  email: 'priya.v@example.com', plan: 'Weekly Harvest',       status: 'cancelled',nextDelivery: null,         amount: 1499, startedAt: '2024-04-01' },
  { id: 's6', customer: 'Arun Babu',     email: 'arun.b@example.com',  plan: 'Deep Sea Vault',       status: 'active',   nextDelivery: '2024-07-14', amount: 5499, startedAt: '2023-11-01' },
]

// ── Promotions ─────────────────────────────────────────────────────────────────
export const ADMIN_PROMOTIONS = [
  { id: 'p1', code: 'WELCOME200',  type: 'flat',    value: 200, minOrder: 499,  uses: 342, limit: 1000, status: 'active',   expiresAt: '2024-12-31', description: '₹200 off first order' },
  { id: 'p2', code: 'FISH20',      type: 'percent', value: 20,  minOrder: 299,  uses: 187, limit: 500,  status: 'active',   expiresAt: '2024-08-31', description: '20% off all fish' },
  { id: 'p3', code: 'PRAWN15',     type: 'percent', value: 15,  minOrder: 399,  uses: 93,  limit: 300,  status: 'active',   expiresAt: '2024-08-15', description: '15% off prawns & shrimp' },
  { id: 'p4', code: 'NHSALEM10',   type: 'percent', value: 10,  minOrder: 0,    uses: 1240, limit: null, status: 'active',  expiresAt: '2025-01-01', description: '10% off everything' },
  { id: 'p5', code: 'FREEFISH',    type: 'flat',    value: 49,  minOrder: 199,  uses: 56,  limit: 200,  status: 'paused',   expiresAt: '2024-07-31', description: 'Free delivery' },
  { id: 'p6', code: 'MONSOON30',   type: 'percent', value: 30,  minOrder: 599,  uses: 0,   limit: 100,  status: 'scheduled',expiresAt: '2024-07-20', description: '30% off monsoon special' },
]

// ── Reviews list ───────────────────────────────────────────────────────────────
export const ADMIN_REVIEWS = [
  { id: 'rv1', author: 'Anjali Sharma',  product: 'Jumbo Tiger Prawns',         rating: 5, date: '2024-07-01', title: 'Best tiger prawns!',             body: 'The size was exactly as described. Arrived packed beautifully with ice.', status: 'published', verified: true },
  { id: 'rv2', author: 'Karthik Rajan', product: 'Jumbo Tiger Prawns',         rating: 5, date: '2024-06-28', title: 'Freshness guaranteed',            body: 'No fishy smell, firm texture. Made prawn biryani for 8 people.', status: 'published', verified: true },
  { id: 'rv3', author: 'Meera Pillai',  product: 'Jumbo Tiger Prawns',         rating: 4, date: '2024-06-20', title: 'Excellent quality, slight delay', body: 'Quality was top-notch. Slight delivery delay but CS was responsive.', status: 'published', verified: true },
  { id: 'rv4', author: 'Unknown User',  product: 'Premium Atlantic Salmon',    rating: 2, date: '2024-07-09', title: 'Not as described',                body: 'Size was smaller than expected. Not happy with the packaging.', status: 'flagged',   verified: false },
  { id: 'rv5', author: 'Deepak Menon',  product: 'Spiny Lobster Tails',        rating: 5, date: '2024-07-08', title: 'Incredible quality',              body: 'Best lobster I have had outside a restaurant. Absolutely fresh.', status: 'pending',   verified: true },
  { id: 'rv6', author: 'Ravi Shankar',  product: 'Blue Swimmer Crab',          rating: 3, date: '2024-07-05', title: 'Decent but pricey',              body: 'Good quality but felt a bit overpriced for the quantity received.', status: 'pending',   verified: true },
  { id: 'rv7', author: 'Priya Venkat',  product: 'Silver Pomfret',             rating: 5, date: '2024-07-03', title: 'Absolutely fresh!',               body: 'The freshness score was 93 and I could tell right away. Perfect.', status: 'published', verified: true },
  { id: 'rv8', author: 'Spam Bot',      product: 'Premium Seer Fish (Vanjaram)',rating: 1, date: '2024-07-10', title: 'Terrible!!!',                   body: 'Buy cheap fish from the market instead. This is overpriced scam!!', status: 'flagged',   verified: false },
]

// ── B2B / Wholesale Inquiries ──────────────────────────────────────────────────
export const ADMIN_WHOLESALE = [
  { id: 'b1', businessName: 'The Sea Kitchen',       contact: 'Rajesh Kumar',  email: 'rajesh@seakitchen.in',      industry: 'Restaurant',    city: 'Bangalore', enquiryDate: '2024-07-10', qty: '50kg/week',  status: 'new',         notes: '' },
  { id: 'b2', businessName: 'Coastal Caterers',      contact: 'Sunita Rao',    email: 'sunita@coastalcater.com',   industry: 'Catering',      city: 'Chennai',   enquiryDate: '2024-07-09', qty: '100kg/week', status: 'contacted',   notes: 'Called on 09 Jul, requested quote.' },
  { id: 'b3', businessName: 'FreshMart Superstore',  contact: 'Vijay Menon',   email: 'vijay@freshmart.in',        industry: 'Retail',        city: 'Kochi',     enquiryDate: '2024-07-08', qty: '200kg/week', status: 'negotiating', notes: 'Draft contract sent.' },
  { id: 'b4', businessName: 'Hotel Leela Palace',    contact: 'Priya Sharma',  email: 'priya.s@leela.com',         industry: 'Hospitality',   city: 'Bangalore', enquiryDate: '2024-07-07', qty: '30kg/week',  status: 'converted',   notes: 'Signed 6-month contract.' },
  { id: 'b5', businessName: 'Cloud Nine Kitchen',    contact: 'Arun Das',      email: 'arun@cloudnine.in',         industry: 'Cloud Kitchen', city: 'Hyderabad', enquiryDate: '2024-07-06', qty: '25kg/week',  status: 'closed',      notes: 'Chose competitor due to pricing.' },
  { id: 'b6', businessName: 'Spice Route Hotels',    contact: 'Meera Joseph',  email: 'meera@spiceroute.com',      industry: 'Hospitality',   city: 'Madurai',   enquiryDate: '2024-07-11', qty: '60kg/week',  status: 'new',         notes: '' },
]

// ── Dashboard KPIs ─────────────────────────────────────────────────────────────
export const ADMIN_KPI = {
  todayRevenue:    42850,
  todayOrders:     34,
  activeCustomers: 1284,
  pendingOrders:   8,
  revenueGrowth:   '+12.4%',
  orderGrowth:     '+8.2%',
  customerGrowth:  '+3.1%',
  pendingChange:   '-2',
  weeklyRevenue: [28000, 34000, 29000, 41000, 38000, 45000, 42850],
  weeklyOrders:  [18, 22, 20, 28, 25, 31, 34],
  topProducts: [
    { name: 'Jumbo Tiger Prawns', sales: 142, revenue: 163258 },
    { name: 'Premium Seer Fish',  sales: 98,  revenue: 53802 },
    { name: 'Atlantic Salmon',    sales: 87,  revenue: 56463 },
    { name: 'Blue Swimmer Crab',  sales: 76,  revenue: 41724 },
    { name: 'Spiny Lobster Tails',sales: 43,  revenue: 55857 },
  ],
  orderStatusBreakdown: {
    confirmed: 12,
    packed: 6,
    out_for_delivery: 8,
    delivered: 182,
    cancelled: 7,
  },
}

export default ADMIN_KPI
