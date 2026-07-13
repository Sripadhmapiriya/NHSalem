/**
 * Mock coupons for checkout validation
 */
export const COUPONS = {
  WELCOME200: { discount: 200, type: 'flat', description: '₹200 off your first order', minOrder: 499 },
  FISH20: { discount: 20, type: 'percent', description: '20% off — valid on all fish', minOrder: 299 },
  PRAWN15: { discount: 15, type: 'percent', description: '15% off Prawns & Shrimp', minOrder: 399 },
  NHSALEM10: { discount: 10, type: 'percent', description: '10% off everything', minOrder: 0 },
  FREEFISH: { discount: 49, type: 'flat', description: 'Free delivery on this order', minOrder: 199 },
}

export default COUPONS
