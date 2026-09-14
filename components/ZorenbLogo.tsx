"use client";

import React from "react";

interface ZorenbLogoProps {
  size?: number;
  className?: string;
}

export default function ZorenbLogo({ size = 40, className = "" }: ZorenbLogoProps) {
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ZORENB logo"
    >
      <defs>
        <linearGradient id="goldRingZ" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7e4a4" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a37d1d" />
        </linearGradient>
        <linearGradient id="goldFillZ" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7e4a4" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#c59b27" />
        </linearGradient>
        <linearGradient id="bgCircleZ" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1410" />
          <stop offset="100%" stopColor="#0b0b0c" />
        </linearGradient>
        <filter id="glowZ">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#goldRingZ)" />
      <circle cx="40" cy="40" r="33" fill="url(#bgCircleZ)" />
      <circle cx="40" cy="40" r="33" fill="none" stroke="url(#goldFillZ)" strokeWidth="0.8" />
      {ticks.map((i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const isMain = i % 3 === 0;
        const r1 = isMain ? 27 : 28.5;
        const r2 = isMain ? 31 : 30.5;
        return (
          <line
            key={i}
            x1={40 + r1 * Math.cos(angle)}
            y1={40 + r1 * Math.sin(angle)}
            x2={40 + r2 * Math.cos(angle)}
            y2={40 + r2 * Math.sin(angle)}
            stroke="#d4af37"
            strokeWidth={isMain ? 2 : 1}
            strokeLinecap="round"
            opacity={isMain ? 1 : 0.55}
          />
        );
      })}
      <text
        x="40"
        y="52"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="32"
        fontWeight="700"
        fontStyle="italic"
        fill="url(#goldFillZ)"
        filter="url(#glowZ)"
      >Z</text>
    </svg>
  );
}
