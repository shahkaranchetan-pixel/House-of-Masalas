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
                <a href={`tel:${APP_CONFIG.PHONE}`} className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-zinc-700 transition-all uppercase tracking-wider">
                    Call for Price
                </a>
            );
        }
        if (inCart) {
            return (
                <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 gold-border">
                    <button
                        onClick={() => onUpdateQty(product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-primary hover:text-white transition-colors font-bold"
                    >
                        −
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold text-white">{inCart.qty_in_cart}</span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-7 h-7 flex items-center justify-center text-primary hover:text-white transition-colors font-bold"
                    >
                        +
                    </button>
                </div>
            );
        }
        return (
            <button
                onClick={() => onAddToCart(product)}
                className="bg-primary hover:bg-primary-hover text-black px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold transition-all shadow-md active:scale-95 uppercase tracking-wider"
            >
                Add to Cart
            </button>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-8">
            {categoriesToRender.map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
                return (
                    <div key={cat} className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-xl text-white font-serif flex items-center gap-2">
                                <span className="text-primary opacity-50 text-sm">#</span>
                                {cat}
                            </h2>
                            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-extrabold">
                                {catProducts.length} Items
                            </span>
                        </div>

                        {displayMode === "list" && (
                            <div className="space-y-2">
                                {catProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-surface/50 gold-border hover:bg-surface/80 transition-all premium-shadow"
                                    >
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-300 shrink-0">
                                            {getSpiceEmoji(product.name)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 pr-4 leading-tight">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-2.5 shrink-0 sm:mt-0">
                                                    <span className="text-[9px] text-zinc-600 font-extrabold bg-zinc-800/50 px-1.5 py-0.5 rounded uppercase tracking-wider">{product.qty}</span>
                                                    <span className="text-base font-extrabold text-primary font-serif">
                                                        {product.price ? `₹${product.price}` : "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-1.5 sm:mt-0">
                                                <AddButton product={product} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {displayMode === "icon" && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {catProducts.map((product) => {
                                    const inCart = cart.find(i => i.id === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className="group flex flex-col rounded-2xl bg-surface/50 gold-border overflow-hidden hover:bg-surface/80 transition-all premium-shadow"
                                        >
                                            <div className="relative h-24 flex items-center justify-center bg-zinc-900/50 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                                                <span className="text-4xl group-hover:scale-110 transition-transform duration-500 z-10 filter drop-shadow-xl">{getSpiceEmoji(product.name)}</span>
                                                {inCart && (
                                                    <div className="absolute top-2 right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-extrabold shadow-lg animate-in zoom-in border border-primary">
                                                        {inCart.qty_in_cart}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3.5 flex flex-col flex-1">
                                                <div className="flex-1 mb-3">
                                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-extrabold block mb-0.5">{product.qty}</span>
                                                    <h3 className="text-xs font-semibold text-white line-clamp-2 leading-relaxed h-8">
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3 mt-auto">
                                                    <span className="text-base font-extrabold text-primary font-serif">
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
