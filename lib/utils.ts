/**
 * Formats a number with commas for price display deterministically
 * across both Server-Side Rendering (SSR) and Client browsers,
 * preventing any React hydration mismatch errors.
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats price in Vietnamese Dong (VND)
 * Converts USD rates (approx 25,400) or displays VND amounts directly
 */
export function formatVND(price: number, currency?: string): string {
  if (typeof price !== 'number' || isNaN(price)) return '0 ₫';
  let vndValue = price;
  if (currency === 'VND') {
    vndValue = price;
  } else if (currency === '$' || currency === 'USD') {
    vndValue = Math.round(price * 25400);
  } else if (price <= 50000) {
    // Direct VND amounts like 30,000 VND test product
    vndValue = price;
  } else if (price < 10000000) {
    // Luxury watch USD prices like 34,500
    vndValue = Math.round(price * 25400);
  }
  return vndValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

/**
 * Returns raw numeric price in VND for calculations (Cart, PayOS, etc.)
 */
export function getPriceVND(product: { price: number; currency?: string; id?: string }): number {
  if (!product || typeof product.price !== 'number') return 0;
  if (product.currency === 'VND' || product.id?.includes('test') || product.price <= 50000) {
    return product.price;
  }
  return Math.round(product.price * 25400);
}
