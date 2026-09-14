/**
 * Formats a number with commas for price display deterministically
 * across both Server-Side Rendering (SSR) and Client browsers,
 * preventing any React hydration mismatch errors.
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
