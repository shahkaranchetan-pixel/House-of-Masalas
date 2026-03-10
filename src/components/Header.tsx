"use client";

import React from 'react';
import { APP_CONFIG } from '../constants/products';

interface HeaderProps {
    cartCount: number;
    cartTotal: number;
    onViewCart: () => void;
    onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, cartTotal, onViewCart, onAdminClick }) => {
    return (
        <header className="sticky top-0 z-50 glass-panel border-b border-primary/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="text-2xl sm:text-3xl filter drop-shadow-md cursor-pointer hover:rotate-12 transition-transform">🌶️</div>
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-xl font-bold text-gold tracking-tight leading-none mb-0.5">
                                {APP_CONFIG.OWNER}
                            </h1>
                            <span className="text-[8px] sm:text-[9px] text-zinc-500 tracking-[0.2em] uppercase font-extrabold">
                                Premium Spices
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={onAdminClick}
                            className="flex text-zinc-500 hover:text-primary p-1.5 transition-colors"
                            title="Admin Panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>

                        <button
                            onClick={onViewCart}
                            className={`relative flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-300 font-medium
                ${cartCount > 0
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                        >
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-black text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-lg border border-primary animate-in zoom-in">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-extrabold">
                                {cartCount > 0 ? `₹${cartTotal}` : "Cart"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Delivery Bar */}
            <div className="bg-primary/5 border-t border-primary/5 py-1 overflow-hidden whitespace-nowrap">
                <div className="flex justify-center items-center gap-6 animate-marquee sm:animate-none">
                    <span className="text-[9px] sm:text-[10px] text-primary/70 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                        ✨ Quality Assured
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-primary/70 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                        🚚 Free Home Delivery
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-primary/70 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                        📞 {APP_CONFIG.PHONE}
                    </span>
                </div>
            </div>
        </header>
    );
};
