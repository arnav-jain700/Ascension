export interface GSTCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  total: number;
}

export interface GSTRates {
  cgst: number; // Central GST rate (usually 9%)
  sgst: number; // State GST rate (usually 9%)
  igst: number; // Integrated GST rate (usually 18%)
}

// GST rates for different product categories
export const GST_RATES: Record<string, GSTRates> = {
  // Clothing and apparel
  clothing: { cgst: 9, sgst: 9, igst: 18 },
  // Footwear
  footwear: { cgst: 9, sgst: 9, igst: 18 },
  // Accessories
  accessories: { cgst: 9, sgst: 9, igst: 18 },
  // Default rate for other categories
  default: { cgst: 9, sgst: 9, igst: 18 }
};

// Indian states with their codes for tax calculation
export const INDIAN_STATES = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', igst: true },
  { code: 'AP', name: 'Andhra Pradesh', igst: true },
  { code: 'AR', name: 'Arunachal Pradesh', igst: true },
  { code: 'AS', name: 'Assam', igst: true },
  { code: 'BR', name: 'Bihar', igst: true },
  { code: 'CH', name: 'Chandigarh', igst: true },
  { code: 'CT', name: 'Dadra and Nagar Haveli', igst: true },
  { code: 'DN', name: 'Daman and Diu', igst: true },
  { code: 'DL', name: 'Delhi', igst: true },
  { code: 'GA', name: 'Goa', igst: true },
  { code: 'GJ', name: 'Gujarat', igst: true },
  { code: 'HR', name: 'Haryana', igst: true },
  { code: 'HP', name: 'Himachal Pradesh', igst: true },
  { code: 'JK', name: 'Jammu and Kashmir', igst: true },
  { code: 'JH', name: 'Jharkhand', igst: true },
  { code: 'KA', name: 'Karnataka', igst: true },
  { code: 'KL', name: 'Kerala', igst: true },
  { code: 'LA', name: 'Ladakh', igst: true },
  { code: 'LD', name: 'Lakshadweep', igst: true },
  { code: 'MP', name: 'Madhya Pradesh', igst: true },
  { code: 'MH', name: 'Maharashtra', igst: true },
  { code: 'MN', name: 'Manipur', igst: true },
  { code: 'ML', name: 'Meghalaya', igst: true },
  { code: 'MZ', name: 'Mizoram', igst: true },
  { code: 'NL', name: 'Nagaland', igst: true },
  { code: 'OD', name: 'Odisha', igst: true },
  { code: 'PB', name: 'Punjab', igst: true },
  { code: 'PY', name: 'Pondicherry', igst: true },
  { code: 'RJ', name: 'Rajasthan', igst: true },
  { code: 'SK', name: 'Sikkim', igst: true },
  { code: 'TN', name: 'Tamil Nadu', igst: true },
  { code: 'TR', name: 'Tripura', igst: true },
  { code: 'TS', name: 'Telangana', igst: false }, // Same state as seller
  { code: 'UP', name: 'Uttar Pradesh', igst: true },
  { code: 'UT', name: 'Uttarakhand', igst: true },
  { code: 'WB', name: 'West Bengal', igst: true }
];

// Seller's location (can be configured)
export const SELLER_STATE = 'TS'; // Telangana

/**
 * Calculate GST based on customer's shipping state
 */
export function calculateGST(
  subtotal: number,
  customerState: string,
  category: string = 'default'
): GSTCalculation {
  const rates = GST_RATES[category] || GST_RATES.default;
  
  // Check if customer is in same state as seller
  const customerStateInfo = INDIAN_STATES.find(state => state.code === customerState);
  const isSameState = customerStateInfo?.code === SELLER_STATE;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (isSameState) {
    // Same state: Apply CGST + SGST
    cgst = (subtotal * rates.cgst) / 100;
    sgst = (subtotal * rates.sgst) / 100;
  } else {
    // Different state: Apply IGST
    igst = (subtotal * rates.igst) / 100;
  }
  
  const totalGST = cgst + sgst + igst;
  const total = subtotal + totalGST;
  
  return {
    subtotal,
    cgst,
    sgst,
    igst,
    totalGST,
    total
  };
}

/**
 * Get tax breakdown for display
 */
export function getTaxBreakdown(calculation: GSTCalculation) {
  const breakdown = [];
  
  if (calculation.cgst > 0) {
    breakdown.push({
      name: 'CGST',
      amount: calculation.cgst,
      rate: '9%'
    });
  }
  
  if (calculation.sgst > 0) {
    breakdown.push({
      name: 'SGST', 
      amount: calculation.sgst,
      rate: '9%'
    });
  }
  
  if (calculation.igst > 0) {
    breakdown.push({
      name: 'IGST',
      amount: calculation.igst,
      rate: '18%'
    });
  }
  
  return breakdown;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}
