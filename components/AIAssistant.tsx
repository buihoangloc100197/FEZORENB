'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, ShieldAlert, Bot, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ALL_WATCHES } from '@/data/watches';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Kính chào Quý khách. Tôi là **Quản Gia Đồng Hồ AI** của FEZORENB (vận hành bởi công nghệ Google AI Studio).\n\nTôi luôn sẵn sàng tư vấn kỹ nghệ Haute Horlogerie (Rolex, Patek, AP, Richard Mille) hoặc hỗ trợ Quý khách **soạn thảo Bản Nháp Đơn Hàng** nhanh chóng mà không can thiệp vào dữ liệu cá nhân.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'Rất tiếc, đã có sự cố kết nối tới xưởng chế tác.',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Quản gia AI hiện đang bận đón tiếp khách quý. Xin vui lòng thử lại sau giây lát.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddDaytona = () => {
    const daytona = ALL_WATCHES.find((w) => w.id.includes('daytona')) || ALL_WATCHES[0];
    addItem(daytona);
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-0.5 rounded-full overflow-hidden shadow-2xl shadow-gold-400/20 hover:scale-105 active:scale-95 transition-all"
          aria-label="Mở Quản Gia AI Đồng Hồ"
        >
          {/* Animated Gold Border Gradient */}
          <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] via-[#f7e4a4] to-[#a37d1d] animate-spin-slow"></span>
          <div className="relative px-4 py-3 bg-[#0e0e12] rounded-full flex items-center gap-2.5 text-zinc-100 group-hover:bg-[#15151c] transition-colors">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs font-serif uppercase tracking-widest font-medium hidden sm:inline text-gold-200">
              Quản Gia AI
            </span>
          </div>
        </button>
      </div>

      {/* Luxury Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[80vh] bg-[#0c0c10]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-zinc-100"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#121218] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-zinc-100 font-medium">
                      Quản Gia AI Đồng Hồ
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Google AI
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Tư vấn &amp; Hỗ trợ soạn đơn nháp độc lập
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Security Guard Notice */}
            <div className="bg-zinc-900/60 px-4 py-1.5 border-b border-zinc-850 flex items-center gap-2 text-[10px] text-zinc-400">
              <ShieldAlert className="w-3.5 h-3.5 text-gold-400/80 flex-shrink-0" />
              <span>Chế độ an ninh: AI không can thiệp hay sửa đổi database người dùng.</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-zinc-950 font-medium rounded-tr-none'
                        : 'bg-[#15151e] border border-zinc-800 text-zinc-200 rounded-tl-none space-y-2'
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* If message mentions draft order, show one-click action for client cart */}
                    {msg.sender === 'ai' && msg.text.includes('BẢN NHÁP ĐƠN HÀNG') && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-700/60">
                        <button
                          onClick={handleQuickAddDaytona}
                          className="w-full py-2 px-3 rounded-lg bg-gold-400 text-zinc-950 font-semibold text-[11px] uppercase tracking-wider hover:bg-gold-300 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-gold-400/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt Mẫu Này Vào Tủ Đồ Ngay</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#15151e] border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-[#101016] border-t border-zinc-850 flex gap-2 overflow-x-auto scrollbar-none">
              {[
                '📋 Lên bản nháp đơn hàng',
                '👑 Tư vấn Rolex Daytona',
                '💎 Patek Philippe Nautilus',
                '⚙️ Giải thích Tourbillon',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-3 py-1 rounded-full text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-gold-300 hover:border-gold-400/40 transition-colors flex-shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-[#121218] border-t border-zinc-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về đồng hồ hoặc tạo đơn nháp..."
                className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-gold-400/60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-zinc-950 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
