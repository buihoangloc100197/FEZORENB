import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import BrandStory from '@/components/BrandStory';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section with Video Background & 3D Interactive Three.js */}
      <HeroSection />

      {/* 2. Scroll-Triggered Stagger Product Showcase (Dark Obsidian Luxury) */}
      <ProductSection />

      {/* 3. Alternating Light Contrast Section: Brand Story & Artisan Heritage (Pearl Ivory) */}
      <BrandStory />

      {/* 4. Luxury Dark Footer with VIP Newsletter */}
      <Footer />
    </>
  );
}
