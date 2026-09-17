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
 * Converts USD rates (approx 25,400) if price < 1,000,000
 */
export function formatVND(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '0 ₫';
  const vndValue = price < 1000000 ? Math.round(price * 25400) : price;
  return vndValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}
