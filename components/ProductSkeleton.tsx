'use client';

import React from 'react';

interface ProductSkeletonProps {
  count?: number;
  theme?: 'dark' | 'light';
}

export default function ProductSkeleton({ count = 4, theme = 'dark' }: ProductSkeletonProps) {
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex flex-col rounded-xl overflow-hidden border p-4 transition-all ${
            isDark
              ? 'bg-[#121216] border-[#22222a]'
              : 'bg-white border-zinc-200/80 shadow-sm'
          }`}
        >
          {/* Image Placeholder with Aspect 3:4 and Shimmer Wave */}
          <div
            className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden ${
              isDark ? 'bg-zinc-800/60 animate-shimmer' : 'bg-zinc-100 animate-shimmer-light'
            }`}
          >
            {/* Top Badge placeholder */}
            <div
              className={`absolute top-3 left-3 w-20 h-5 rounded-full ${
                isDark ? 'bg-zinc-700/50' : 'bg-zinc-200'
              }`}
            />
          </div>

          {/* Text Placeholders */}
          <div className="mt-4 space-y-2.5">
            {/* Category tag */}
            <div
              className={`w-24 h-3 rounded ${
                isDark ? 'bg-zinc-800 animate-shimmer' : 'bg-zinc-200 animate-shimmer-light'
              }`}
            />

            {/* Product Name */}
            <div
              className={`w-4/5 h-4 rounded ${
                isDark ? 'bg-zinc-800 animate-shimmer' : 'bg-zinc-200 animate-shimmer-light'
              }`}
            />

            {/* Subtitle */}
            <div
              className={`w-3/5 h-3 rounded ${
                isDark ? 'bg-zinc-800/80 animate-shimmer' : 'bg-zinc-100 animate-shimmer-light'
              }`}
            />

            {/* Price & Action button */}
            <div className="pt-3 flex items-center justify-between border-t border-dashed mt-2 border-zinc-800/50">
              <div
                className={`w-16 h-5 rounded ${
                  isDark ? 'bg-zinc-800 animate-shimmer' : 'bg-zinc-200 animate-shimmer-light'
                }`}
              />
              <div
                className={`w-24 h-8 rounded-full ${
                  isDark ? 'bg-zinc-800 animate-shimmer' : 'bg-zinc-200 animate-shimmer-light'
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
