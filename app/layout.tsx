import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import AIAssistant from '@/components/AIAssistant';

const luxuryFont = Montserrat({
  variable: '--font-luxury',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ZORENB | Haute Horlogerie',
  description: 'Thương hiệu đồng hồ cơ học độc bản và kỹ nghệ haute horlogerie đỉnh cao thế giới.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${luxuryFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0b0b0c] text-zinc-100 selection:bg-gold-400/30 selection:text-gold-200">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">{children}</main>
            <AIAssistant />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

