import { ALL_WATCHES, WATCH_BRANDS, Watch } from './watches';

export const LUXURY_PRODUCTS: Watch[] = ALL_WATCHES;

export const CATEGORIES = WATCH_BRANDS.map((b) => ({
  id: b.id,
  label: b.label,
}));

export * from './watches';
