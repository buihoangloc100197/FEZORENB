"use client";

import React from "react";

interface ZorenbLogoProps {
  size?: number;
  className?: string;
}

// Precomputed exact coordinates for 12 clock ticks to prevent SSR / Client float hydration mismatch
const TICKS = [
  { key: 0, x1: 40, y1: 13, x2: 40, y2: 9, strokeWidth: 2, opacity: 1 },
  { key: 1, x1: 54.25, y1: 15.32, x2: 55.25, y2: 13.59, strokeWidth: 1, opacity: 0.55 },
  { key: 2, x1: 64.68, y1: 25.75, x2: 66.41, y2: 24.75, strokeWidth: 1, opacity: 0.55 },
  { key: 3, x1: 67, y1: 40, x2: 71, y2: 40, strokeWidth: 2, opacity: 1 },
  { key: 4, x1: 64.68, y1: 54.25, x2: 66.41, y2: 55.25, strokeWidth: 1, opacity: 0.55 },
  { key: 5, x1: 54.25, y1: 64.68, x2: 55.25, y2: 66.41, strokeWidth: 1, opacity: 0.55 },
  { key: 6, x1: 40, y1: 67, x2: 40, y2: 71, strokeWidth: 2, opacity: 1 },
  { key: 7, x1: 25.75, y1: 64.68, x2: 24.75, y2: 66.41, strokeWidth: 1, opacity: 0.55 },
  { key: 8, x1: 15.32, y1: 54.25, x2: 13.59, y2: 55.25, strokeWidth: 1, opacity: 0.55 },
  { key: 9, x1: 13, y1: 40, x2: 9, y2: 40, strokeWidth: 2, opacity: 1 },
  { key: 10, x1: 15.32, y1: 25.75, x2: 13.59, y2: 24.75, strokeWidth: 1, opacity: 0.55 },
  { key: 11, x1: 25.75, y1: 15.32, x2: 24.75, y2: 13.59, strokeWidth: 1, opacity: 0.55 },
];

export default function ZorenbLogo({ size = 40, className = "" }: ZorenbLogoProps) {
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
      {TICKS.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#d4af37"
          strokeWidth={t.strokeWidth}
          strokeLinecap="round"
          opacity={t.opacity}
        />
      ))}
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
