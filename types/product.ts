export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'horology' | 'leather' | 'jewelry' | 'couture' | 'eyewear';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: [string, string, ...string[]]; // Primary image and secondary hover image
  description: string;
  details: string[];
  specs: { [key: string]: string };
  tag?: 'Limited Edition' | 'Curated' | 'New Arrival' | 'Heritage' | 'Bespoke';
  isNew?: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  brand?: string;
  reference?: string;
  caliber?: string;
  caseSize?: string;
  complications?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
