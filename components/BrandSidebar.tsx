'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, ShieldCheck, Watch } from 'lucide-react';

export interface BrandInfo {
  id: string;
  name: string;
  country: string;
  founded: string;
  tagline: string;
  iconicModel: string;
}

export const TOP_10_WATCH_BRANDS: BrandInfo[] = [
  {
    id: 'patek-philippe',
    name: 'Patek Philippe',
    country: 'Geneva, Thụy Sĩ',
    founded: '1839',
    tagline: 'Đỉnh cao gia truyền & Grand Complications quý tộc',
    iconicModel: 'Nautilus & Aquanaut',
  },
  {
    id: 'rolex',
    name: 'Rolex',
    country: 'Geneva, Thụy Sĩ',
    founded: '1905',
    tagline: 'Biểu tượng tối thượng của quyền lực & chuẩn xác',
    iconicModel: 'Cosmograph Daytona & Submariner',
  },
  {
    id: 'audemars-piguet',
    name: 'Audemars Piguet',
    country: 'Le Brassus, Thụy Sĩ',
    founded: '1875',
    tagline: 'Khai sinh kỷ nguyên thể thao xa xỉ với vành bát giác',
    iconicModel: 'Royal Oak & Royal Oak Offshore',
  },
  {
    id: 'vacheron-constantin',
    name: 'Vacheron Constantin',
    country: 'Geneva, Thụy Sĩ',
    founded: '1755',
    tagline: 'Di sản chế tác cơ khí liên tục lâu đời nhất lịch sử',
    iconicModel: 'Overseas & Patrimony',
  },
  {
    id: 'a-lange-sohne',
    name: 'A. Lange & Söhne',
    country: 'Glashütte, Đức',
    founded: '1845',
    tagline: 'Nghệ thuật chạm khắc cơ khí bậc thầy phong cách Saxon',
    iconicModel: 'Lange 1 & Datograph',
  },
  {
    id: 'richard-mille',
    name: 'Richard Mille',
    country: 'Les Breuleux, Thụy Sĩ',
    founded: '2001',
    tagline: 'Cỗ máy đua F1 trên cổ tay với vật liệu nano tương lai',
    iconicModel: 'RM 011 & RM 50-03 Tourbillon',
  },
  {
    id: 'jaeger-lecoultre',
    name: 'Jaeger-LeCoultre',
    country: 'Le Sentier, Thụy Sĩ',
    founded: '1833',
    tagline: 'Bậc thầy cung cấp bộ máy cho toàn bộ đế chế đồng hồ',
    iconicModel: 'Reverso lật xoay & Master Ultra Thin',
  },
  {
    id: 'cartier',
    name: 'Cartier',
    country: 'Paris & Thụy Sĩ',
    founded: '1847',
    tagline: 'Khai sinh đồng hồ đeo tay đầu tiên & thẩm mỹ vương giả',
    iconicModel: 'Santos de Cartier & Tank Louis',
  },
  {
    id: 'omega',
    name: 'Omega',
    country: 'Biel/Bienne, Thụy Sĩ',
    founded: '1848',
    tagline: 'Huyền thoại Moonwatch chinh phục Mặt Trăng và James Bond',
    iconicModel: 'Speedmaster & Seamaster 300M',
  },
  {
    id: 'iwc-schaffhausen',
    name: 'IWC Schaffhausen',
    country: 'Schaffhausen, Thụy Sĩ',
    founded: '1868',
    tagline: 'Đỉnh cao kỹ nghệ phi công & lịch vạn niên thiên văn học',
    iconicModel: 'Big Pilot & Portugieser',
  },
];

interface BrandSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrand?: (brandId: string) => void;
}

export default function BrandSidebar({ isOpen, onClose, onSelectBrand }: BrandSidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Top Dropdown / Sliding Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="w-screen max-w-lg bg-[#0a0a0d] border-r border-[#24242e] shadow-2xl flex flex-col justify-between text-zinc-100"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-[#1f1f27] flex items-center justify-between bg-[#101015]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
                    <Watch className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-serif tracking-widest uppercase text-zinc-100 font-semibold">
                        Thương Hiệu Tinh Hoa
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-300 border border-gold-400/30 font-mono font-bold">
                        Top 10 Thế Giới
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      Tuyển tập 10 biểu tượng Haute Horlogerie lừng danh nhất
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  aria-label="Đóng bảng thương hiệu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 10 Brands List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#1a1a22] scrollbar-thin">
                {TOP_10_WATCH_BRANDS.map((brand, index) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      if (onSelectBrand) {
                        onSelectBrand(brand.id);
                      } else {
                        onClose();
                      }
                    }}
                    className="w-full text-left py-4 flex items-center justify-between group hover:pl-2 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Brand Number Badge */}
                      <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 group-hover:text-gold-400 group-hover:border-gold-400/40 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-sm font-semibold tracking-wider text-zinc-100 group-hover:text-gold-300 transition-colors uppercase">
                            {brand.name}
                          </h3>
                          <span className="text-[10px] text-zinc-500 font-light">
                            • Est. {brand.founded}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-1">
                          {brand.tagline}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gold-400/80 font-mono">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Mẫu kinh điển: {brand.iconicModel}</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-[#1f1f27] bg-[#101015] space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>100% Đồng hồ được thẩm định bởi Hiệp hội Đồng hồ Thụy Sĩ (FH).</span>
                </div>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-zinc-950 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20 hover:brightness-110 transition-all"
                >
                  <span>Chiêm Ngưỡng Toàn Bộ 10 Thương Hiệu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
