"use client";

import React from 'react';
import { APP_CONFIG } from '../constants/products';

interface OrderSuccessProps {
    orderRef: string;
    onContinue: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderRef, onContinue }) => {
    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6">
            <div className="max-w-lg w-full glass-card rounded-[3rem] p-12 text-center animate-in zoom-in slide-in-from-bottom-12 duration-1000 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-bg opacity-10" />
                
                <div className="relative mb-10 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <div className="w-full h-full bg-zinc-900 rounded-[2rem] border border-white/5 flex items-center justify-center text-5xl relative z-10 shadow-2xl">
                        ✨
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-[1px] w-6 bg-primary/30" />
                        <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Success</span>
                        <span className="h-[1px] w-6 bg-primary/30" />
                    </div>
                    <h2 className="text-4xl text-white font-serif italic">Order Placed!</h2>
                </div>

                <div className="bg-zinc-950/80 border border-white/5 rounded-[2rem] p-8 mb-12 text-left relative group">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Order Ref.</span>
                        <span className="text-luxury-gold font-mono font-bold text-lg tracking-widest">{orderRef}</span>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] shrink-0 font-black border border-primary/20">1</div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                <strong className="text-white">What's Next:</strong> {APP_CONFIG.OWNER} will contact you via phone/WhatsApp soon to confirm delivery.
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] shrink-0 font-black border border-primary/20">2</div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                A copy of your order has been sent to us for processing.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full btn-primary-luxury py-5"
                >
                    Continue Shopping
                </button>

                <div className="mt-10 text-[9px] text-zinc-700 uppercase tracking-[0.5em] font-black">
                    Authentic Homemade Spices — Best Quality Guaranteed
                </div>
            </div>
        </div>
    );
};
