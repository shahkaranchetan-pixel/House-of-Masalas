"use client";

import React from 'react';
import { APP_CONFIG } from '../constants/products';

interface OrderSuccessProps {
    orderRef: string;
    onContinue: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderRef, onContinue }) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center premium-shadow border-emerald-500/20 animate-in zoom-in duration-700">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                    <div className="text-7xl relative z-10 animate-bounce">📦</div>
                </div>

                <h2 className="text-3xl text-white font-serif mb-2 italic">Exquisite Choice</h2>
                <div className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Order Confirmed</div>

                <div className="bg-zinc-900 border border-emerald-500/10 rounded-2xl p-6 mb-10 text-left">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ref No.</span>
                        <span className="text-emerald-400 font-serif font-bold text-lg">{orderRef}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-[10px] shrink-0">✓</div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                <strong className="text-zinc-200">Chetan Shah</strong> will contact you shortly to confirm delivery schedules.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-[10px] shrink-0">✓</div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Payment details have been shared via the WhatsApp message.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                    Explore More Spices
                </button>

                <div className="mt-8 text-[9px] text-zinc-600 uppercase tracking-widest">
                    Your journey of flavor has begun.
                </div>
            </div>
        </div>
    );
};
