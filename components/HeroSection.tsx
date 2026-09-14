'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown, Volume2, VolumeX, Sparkles } from 'lucide-react';
import ThreeBadge from './ThreeBadge';

export default function HeroSection() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Video with AutoPlay, Loop, Muted */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80"
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-[0.6] contrast-[1.1]"
      >
        {/* Cinematic Luxury Horology & Craft Video */}
        <source
          src="https://cdn.pixabay.com/video/2020/05/25/40131-424930034_large.mp4"
          type="video/mp4"
        />
        {/* Fallback video */}
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-watch-mechanism-41525-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Luxury Cinematic Multi-Layer Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-black/40 to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center justify-center pt-16 sm:pt-20">
        {/* Three.js 3D Emblem Floating Accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-2"
        >
          <ThreeBadge />
        </motion.div>

        {/* Small Luxury Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/30 bg-black/50 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold-200 font-medium">
            Bộ Sưu Tập Di Sản 2026
          </span>
        </motion.div>

        {/* Grand Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-3xl sm:text-5xl md:text-7xl font-light tracking-[0.08em] text-zinc-100 uppercase max-w-4xl leading-tight"
        >
          Đỉnh Cao <span className="italic font-serif text-[#e5c158]">Kỹ Nghệ</span> &amp; Nghệ Thuật Chế Tác
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-6 text-xs sm:text-sm md:text-base text-zinc-300 font-light tracking-wide max-w-2xl leading-relaxed"
        >
          Khám phá những kiệt tác độc bản được tôi luyện qua hàng ngàn giờ bởi bàn tay nghệ nhân Thụy Sĩ và Ý. Tuyên ngôn của sự thanh lịch vượt thời gian.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Tailwind Luxury Primary Button */}
          <button
            onClick={scrollToCollection}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3e3a3] to-[#c59b27] text-zinc-950 font-semibold text-xs tracking-[0.2em] uppercase shadow-lg shadow-gold-400/25 hover:shadow-gold-400/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Khám Phá Tuyệt Tác
          </button>

          {/* Secondary Outline Button */}
          <Link
            href="/products"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-zinc-700 hover:border-gold-400/60 bg-black/40 backdrop-blur-md text-zinc-200 hover:text-gold-200 font-medium text-xs tracking-[0.2em] uppercase transition-all"
          >
            Toàn Bộ Danh Mục
          </Link>
        </motion.div>
      </div>

      {/* Audio Toggle Button (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-20">
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 backdrop-blur-md text-[10px] tracking-wider uppercase transition-all"
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-gold-400" />}
          <span>{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>
    </section>
  );
}
