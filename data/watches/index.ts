import { Watch, WatchBrand, WatchComplication } from './types';
import { ROLEX_WATCHES } from './rolex';
import { PATEK_PHILIPPE_WATCHES } from './patek-philippe';
import { AUDEMARS_PIGUET_WATCHES } from './audemars-piguet';
import { RICHARD_MILLE_WATCHES } from './richard-mille';
import { VACHERON_CONSTANTIN_WATCHES } from './vacheron-constantin';
import { A_LANGE_SOHNE_WATCHES } from './a-lange-sohne';
import { JAEGER_LECOULTRE_WATCHES } from './jaeger-lecoultre';
import { CARTIER_WATCHES } from './cartier';
import { OMEGA_WATCHES } from './omega';
import { IWC_WATCHES } from './iwc';

export * from './types';
export * from './rolex';
export * from './patek-philippe';
export * from './audemars-piguet';
export * from './richard-mille';
export * from './vacheron-constantin';
export * from './a-lange-sohne';
export * from './jaeger-lecoultre';
export * from './cartier';
export * from './omega';
export * from './iwc';

export const ALL_WATCHES: Watch[] = [
  ...PATEK_PHILIPPE_WATCHES,
  ...ROLEX_WATCHES,
  ...AUDEMARS_PIGUET_WATCHES,
  ...VACHERON_CONSTANTIN_WATCHES,
  ...A_LANGE_SOHNE_WATCHES,
  ...RICHARD_MILLE_WATCHES,
  ...JAEGER_LECOULTRE_WATCHES,
  ...CARTIER_WATCHES,
  ...OMEGA_WATCHES,
  ...IWC_WATCHES,
];

export const WATCH_BRANDS: { id: string; name: WatchBrand | 'All'; label: string; origin: string; count: number }[] = [
  { id: 'all', name: 'All', label: 'Tất Cả Tuyệt Tác', origin: 'Thụy Sĩ & Quốc Tế', count: ALL_WATCHES.length },
  { id: 'patek-philippe', name: 'Patek Philippe', label: 'Patek Philippe', origin: 'Geneva, Thụy Sĩ', count: PATEK_PHILIPPE_WATCHES.length },
  { id: 'rolex', name: 'Rolex', label: 'Rolex', origin: 'Geneva, Thụy Sĩ', count: ROLEX_WATCHES.length },
  { id: 'audemars-piguet', name: 'Audemars Piguet', label: 'Audemars Piguet', origin: 'Le Brassus, Thụy Sĩ', count: AUDEMARS_PIGUET_WATCHES.length },
  { id: 'vacheron-constantin', name: 'Vacheron Constantin', label: 'Vacheron Constantin', origin: 'Geneva, Thụy Sĩ', count: VACHERON_CONSTANTIN_WATCHES.length },
  { id: 'a-lange-sohne', name: 'A. Lange & Söhne', label: 'A. Lange & Söhne', origin: 'Glashütte, Đức', count: A_LANGE_SOHNE_WATCHES.length },
  { id: 'richard-mille', name: 'Richard Mille', label: 'Richard Mille', origin: 'Les Breuleux, Thụy Sĩ', count: RICHARD_MILLE_WATCHES.length },
  { id: 'jaeger-lecoultre', name: 'Jaeger-LeCoultre', label: 'Jaeger-LeCoultre', origin: 'Le Sentier, Thụy Sĩ', count: JAEGER_LECOULTRE_WATCHES.length },
  { id: 'cartier', name: 'Cartier', label: 'Cartier', origin: 'Paris & Thụy Sĩ', count: CARTIER_WATCHES.length },
  { id: 'omega', name: 'Omega', label: 'Omega', origin: 'Biel/Bienne, Thụy Sĩ', count: OMEGA_WATCHES.length },
  { id: 'iwc', name: 'IWC Schaffhausen', label: 'IWC Schaffhausen', origin: 'Schaffhausen, Thụy Sĩ', count: IWC_WATCHES.length },
];

export const WATCH_COMPLICATIONS: { id: string; label: string; value: WatchComplication | 'all' }[] = [
  { id: 'all', label: 'Tất Cả Cỗ Máy', value: 'all' },
  { id: 'tourbillon', label: 'Tourbillon', value: 'Tourbillon' },
  { id: 'chronograph', label: 'Chronograph', value: 'Chronograph' },
  { id: 'skeleton', label: 'Lộ Cơ Skeleton', value: 'Skeleton / Lộ Cơ' },
  { id: 'perpetual-calendar', label: 'Lịch Vạn Niên', value: 'Perpetual Calendar / Lịch Vạn Niên' },
  { id: 'diver', label: 'Lặn Biển Diver', value: 'Diver / Lặn Biển' },
  { id: 'flyback', label: 'Bấm Giờ Flyback', value: 'Flyback' },
  { id: 'dual-time', label: 'Múi Giờ GMT', value: 'Dual Time / GMT' },
];

export function getWatchById(id: string): Watch | undefined {
  return ALL_WATCHES.find((w) => w.id === id);
}

export function getWatchesByBrand(brand: WatchBrand): Watch[] {
  return ALL_WATCHES.filter((w) => w.brand === brand);
}
