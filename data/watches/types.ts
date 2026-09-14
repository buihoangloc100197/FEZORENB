import { Product } from '@/types/product';

export type WatchBrand =
  | 'Rolex'
  | 'Patek Philippe'
  | 'Audemars Piguet'
  | 'Richard Mille'
  | 'Vacheron Constantin'
  | 'A. Lange & Söhne'
  | 'Jaeger-LeCoultre'
  | 'Cartier'
  | 'Omega'
  | 'IWC Schaffhausen';

export type WatchComplication =
  | 'Tourbillon'
  | 'Chronograph'
  | 'Skeleton / Lộ Cơ'
  | 'Perpetual Calendar / Lịch Vạn Niên'
  | 'Diver / Lặn Biển'
  | 'Dual Time / GMT'
  | 'Flyback';

export interface Watch extends Product {
  brand: WatchBrand;
  reference: string;
  collectionName: string;
  caseSize: string; // e.g. "40mm", "41mm"
  caseThickness?: string;
  caseMaterial: string;
  bezelMaterial: string;
  dialDescription: string;
  braceletType: string;
  movementType: 'Automatic' | 'Manual-winding' | 'Tourbillon Automatic';
  caliber: string;
  powerReserve: string;
  waterResistance: string;
  complications: WatchComplication[];
  jewelsCount?: number;
  frequency?: string; // e.g. "28,800 vph (4 Hz)"
}
