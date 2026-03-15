"use client";

import React from 'react';
import { Product, DisplayMode, CartItem } from '../types';
import { getSpiceEmoji } from '../utils/emoji';
import { APP_CONFIG } from '../constants/products';

interface ProductListProps {
    products: Product[];
    cart: CartItem[];
    displayMode: DisplayMode;
    activeCategory: string;
    onAddToCart: (product: Product) => void;
    onUpdateQty: (id: number, delta: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
    products,
    cart,
    displayMode,
    activeCategory,
    onAddToCart,
    onUpdateQty,
}) => {
    const categoriesToRender = activeCategory === "All" ? ["Masalas", "Masala Powders"] : [activeCategory];

    const AddButton = ({ product }: { product: Product }) => {
        const inCart = cart.find(i => i.id === product.id);
        if (!product.price) {
            return (
                <a href={`tel:${APP_CONFIG.PHONE}`} className="bg-zinc-800 text-zinc-300 px-6 py-3 rounded-xl text-xs font-black hover:bg-zinc-700 transition-all uppercase tracking-[0.2em] border border-white/5 whitespace-nowrap">
                    Enquire
                </a>
            );
        }
        if (inCart) {
            return (
                <div className="flex items-center bg-zinc-900/80 rounded-xl p-1 border border-primary/20 backdrop-blur-sm">
                    <button
                        onClick={() => onUpdateQty(product.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-primary hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold"
                    >
                        −
                    </button>
                    <span className="w-10 text-center text-sm font-black text-white">{inCart.qty_in_cart}</span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-10 h-10 flex items-center justify-center text-primary hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold text-xl"
                    >
                        +
                    </button>
                </div>
            );
        }
        return (
            <button
                onClick={() => onAddToCart(product)}
                className="bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-xl text-xs sm:text-sm font-black tracking-widest transition-all shadow-xl active:scale-95 uppercase group-hover:shadow-primary/25 whitespace-nowrap"
            >
                Add to Cart
            </button>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-8">
            {categoriesToRender.map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
                return (
                    <div key={cat} className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-[1px] w-12 bg-primary/40" />
                                    <span className="text-xs text-primary font-black uppercase tracking-[0.4em]">{catProducts.length} Selections</span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl text-white font-serif italic tracking-tight leading-none">
                                    {cat} <span className="text-primary/30 not-italic font-sans">Series</span>
                                </h1>
                            </div>
                        </div>

                        {displayMode === "list" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {catProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative flex items-center gap-4 p-4 rounded-3xl glass-card reveal-scale"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:rotate-6 transition-all duration-500 shrink-0 border border-white/5 shadow-2xl relative">
                                            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10">{getSpiceEmoji(product.name)}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 h-full flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] sm:text-xs text-zinc-500 font-black uppercase tracking-widest mb-1.5">{product.qty} Packet</span>
                                                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xl sm:text-2xl font-bold text-luxury-gold tracking-tighter block mb-1 leading-none">
                                                        {product.price ? `₹${product.price}` : "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center gap-4 mt-2">
                                                <AddButton product={product} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {displayMode === "icon" && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                {catProducts.map((product) => {
                                    const inCart = cart.find(i => i.id === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className="group flex flex-col rounded-[2.5rem] glass-card overflow-hidden reveal-scale"
                                        >
                                            <div className="relative h-32 sm:h-40 flex items-center justify-center bg-gradient-to-b from-zinc-900/50 to-transparent">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-5xl sm:text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 z-10">{getSpiceEmoji(product.name)}</span>
                                                {inCart && (
                                                    <div className="absolute top-4 right-4 bg-primary text-black rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-2xl animate-in zoom-in border-2 border-background">
                                                        {inCart.qty_in_cart}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="mb-6">
                                                    <span className="text-[11px] text-primary/60 uppercase tracking-[0.3em] font-black block mb-2">{product.qty} Selection</span>
                                                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight h-12 line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-6 border-t border-white/5 mt-auto">
                                                    <span className="text-2xl font-bold text-luxury-gold tracking-tighter shrink-0">
                                                        {product.price ? `₹${product.price}` : "—"}
                                                    </span>
                                                    <AddButton product={product} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
