"use client";

import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../constants/products';

interface HeaderProps {
    cartCount: number;
    cartTotal: number;
    onViewCart: () => void;
    onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, cartTotal, onViewCart, onAdminClick }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-8`}>
                <div className={`glass-card rounded-[2rem] px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-2xl translate-y-2' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                        {/* Brand Section */}
                        <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl animate-spice-spin border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    🌶️
                                </div>
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl sm:text-2xl font-serif italic text-white tracking-tight leading-none">
                                    House of <span className="text-primary group-hover:text-white transition-colors duration-500">Masalas</span>
                                </h1>
                                <span className="text-[11px] sm:text-xs text-primary font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-1.5 opacity-70">
                                    Heritage Excellence
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Admin Action */}
                        <button
                            onClick={onAdminClick}
                            className="hidden sm:flex p-2.5 rounded-xl border border-white/5 text-zinc-600 hover:text-primary hover:border-primary/30 transition-all duration-500 bg-zinc-900/50"
                            title="Management Suite"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>

                        <div className="h-6 w-[1px] bg-white/5 hidden sm:block" />

                        <button
                            onClick={onViewCart}
                            className="group relative flex items-center gap-3 sm:gap-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-white/5 hover:border-primary/40 transition-all duration-500 shadow-xl"
                        >
                            <div className={`relative ${cartCount > 0 ? 'animate-bounce' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-[10px] sm:text-[11px] text-zinc-500 font-black uppercase tracking-widest hidden xs:block">Your Selection</span>
                                <span className="text-xs sm:text-base font-bold text-white tracking-widest sm:tracking-tighter">
                                    {cartTotal > 0 ? `₹${cartTotal}` : "Shop Now"}
                                </span>
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
