'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Compass, Shield, Clock } from 'lucide-react';

export default function BrandStory() {
  return (
    <section id="brand-story" className="py-24 sm:py-32 bg-[#faf9f6] text-zinc-900 relative overflow-hidden">
      {/* Editorial Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Tag */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9e7a1b] block mb-3">
            Di Sản &amp; Triết Lý Nghệ Thuật
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-zinc-950 uppercase leading-tight">
            Khi Thời Gian Trở Thành <br />
            <span className="italic font-serif text-[#b8860b]">Kiệt Tác Nghệ Thuật</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#b8860b] mx-auto mt-6" />
          <p className="mt-6 text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
            Tại xưởng chế tác FEZORENB, chúng tôi tin rằng sự xa xỉ đích thực không nằm ở sự phô trương ồn ào, mà kết tinh từ hàng trăm giờ mài giũa thầm lặng của những nghệ nhân xuất chúng, bảo tồn nguyên vẹn các kỹ thuật chế tác từ thế kỷ 18.
          </p>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetrical Editorial Visuals */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80"
                alt="Chế tác thủ công nghệ nhân Thụy Sĩ"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <p className="text-white text-xs font-serif tracking-wider uppercase">
                  Atelier Le Brassus, Thụy Sĩ
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl mt-8 sm:mt-12"
            >
              <Image
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
                alt="Thuộc da thảo mộc truyền thống Florence"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <p className="text-white text-xs font-serif tracking-wider uppercase">
                  Boutique Da Thuộc Florence, Ý
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Values & Proof of Excellence */}
          <div className="lg:col-span-5 space-y-8 lg:pl-6">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-100/60 border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-[#9e7a1b]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-zinc-900">
                    Hơn 300 Giờ Chế Tác Mỗi Tác Phẩm
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1.5 leading-relaxed">
                    Từng góc cạnh của lồng tourbillon hay đường may yên ngựa đều được hoàn thiện bằng kính lúp hiển vi, không dung sai cơ khí.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-100/60 border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-[#9e7a1b]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-zinc-900">
                    Bảo Chứng Thẩm Định Quốc Tế
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1.5 leading-relaxed">
                    Mỗi sản phẩm đi kèm chứng thư viện ngọc học Thụy Sĩ Gubelin và giám định đá quý GIA toàn cầu lưu trữ trên sổ cái bảo mật.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-100/60 border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-[#9e7a1b]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-zinc-900">
                    Đặc Quyền Hội Viên &amp; Hậu Mãi Trọn Đời
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1.5 leading-relaxed">
                    Chăm sóc bảo dưỡng định kỳ miễn phí, chuyên cơ vận chuyển bọc thép và lời mời tham dự tuần lễ dạ tiệc xa xỉ kín tại Geneva.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-zinc-950 text-amber-300 font-semibold text-xs tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/10"
              >
                Khám Phá Toàn Bộ Di Sản &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
