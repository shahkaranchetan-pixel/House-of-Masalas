"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { ProductList } from '../components/ProductList';
import { CheckoutForm } from '../components/CheckoutForm';
import { AdminPanel } from '../components/AdminPanel';
import { OrderSuccess } from '../components/OrderSuccess';
import { INITIAL_PRODUCTS, APP_CONFIG } from '../constants/products';
import { Product, CartItem, DisplayMode, ViewState, Order, CustomerInfo, PaymentMethod, Promotion, PromotionWithCalc } from '../types';
import * as actions from '../app/actions';

interface MasalaAppProps {
    initialProducts: Product[];
    initialPromos: Promotion[];
    initialOrders: Order[];
}

export default function MasalaApp({ initialProducts, initialPromos, initialOrders }: MasalaAppProps) {
    const [view, setView] = useState<ViewState>("shop");
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [search, setSearch] = useState<string>("");
    const [displayMode, setDisplayMode] = useState<DisplayMode>("list");
    const [orderPlacedRef, setOrderPlacedRef] = useState<string | null>(null);
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromos);



    const [userSelectedPromoId, setUserSelectedPromoId] = useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("masala_selected_promo");
            return saved ? Number(saved) : null;
        }
        return null;
    });

    // PERSISTENCE: We now use server actions instead of useEffect for local storage syncing

    // Persist selected promo to localStorage
    React.useEffect(() => {
        if (userSelectedPromoId) {
            localStorage.setItem("masala_selected_promo", userSelectedPromoId.toString());
        } else {
            localStorage.removeItem("masala_selected_promo");
        }
    }, [userSelectedPromoId]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCat = activeCategory === "All" || p.category === activeCategory;
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [products, activeCategory, search]);

    const { discountAmount, finalTotal, subtotal, appliedPromo, allValidPromos, allLockedPromos, bestPromoId } = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty_in_cart, 0);
        const activePromos = promotions.filter(p => {
            if (!p.isActive) return false;
            if (p.expiresAt && new Date(p.expiresAt).getTime() < Date.now()) return false;
            return true;
        });

        const promoWithCalc: PromotionWithCalc[] = activePromos.map(promo => {
            let discount = 0;
            const minOrder = promo.minOrderValue || 0;
            const amountNeeded = Math.max(0, minOrder - subtotal);

            if (subtotal >= minOrder) {
                if (promo.scope === "all") {
                    discount = promo.type === "percentage"
                        ? Math.round((subtotal * promo.value) / 100)
                        : promo.value;
                } else if (promo.scope === "category" && promo.targetCategory) {
                    const categoryTotal = cart
                        .filter(item => item.category === promo.targetCategory)
                        .reduce((sum, item) => sum + (item.price || 0) * item.qty_in_cart, 0);
                    if (categoryTotal > 0) {
                        discount = promo.type === "percentage"
                            ? Math.round((categoryTotal * promo.value) / 100)
                            : promo.value;
                    }
                }
            }
            return { ...promo, calculatedDiscount: discount, amountNeeded };
        });

        const validPromos = promoWithCalc.filter(p => p.calculatedDiscount > 0);
        const lockedPromos = promoWithCalc.filter(p => p.calculatedDiscount === 0);

        // Sort by discount descending to find the best
        const sorted = [...validPromos].sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);
        const best = sorted[0] || null;

        // FIX Bug 1: ONLY apply discount if user EXPLICITLY selected a promo — no auto-apply
        const selectedRaw = userSelectedPromoId
            ? promoWithCalc.find(p => p.id === userSelectedPromoId)
            : null;

        // Only effective when it yields a positive discount (cart meets minimum)
        const effectiveSelected = selectedRaw && selectedRaw.calculatedDiscount > 0 ? selectedRaw : null;
        const effectiveDiscount = effectiveSelected?.calculatedDiscount || 0;

        return {
            discountAmount: effectiveDiscount,
            subtotal,
            finalTotal: Math.max(0, subtotal - effectiveDiscount),
            appliedPromo: effectiveSelected,
            allValidPromos: validPromos,
            allLockedPromos: lockedPromos,
            bestPromoId: best?.id || null,
        };
    }, [cart, promotions, userSelectedPromoId]);

    const cartTotal = finalTotal;

    const cartCount = useMemo(() =>
        cart.reduce((sum, item) => sum + item.qty_in_cart, 0)
        , [cart]);

    const addToCart = (product: Product) => {
        if (!product.price) return;
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, qty_in_cart: i.qty_in_cart + 1 } : i);
            }
            return [...prev, { ...product, qty_in_cart: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev =>
            prev.map(i => i.id === id ? { ...i, qty_in_cart: Math.max(0, i.qty_in_cart + delta) } : i)
                .filter(i => i.qty_in_cart > 0)
        );
    };

    const removeItem = (id: number) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    // FIX Bug 3: Validate minimum order value before accepting code
    const applyPromoCode = (code: string): { success: boolean; error?: string } => {
        const promo = promotions.find(p => p.isActive && p.code.toUpperCase() === code.trim().toUpperCase());
        if (!promo) {
            return { success: false, error: "Invalid or inactive promo code." };
        }
        const currentSubtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty_in_cart, 0);
        const minOrder = promo.minOrderValue || 0;
        if (currentSubtotal < minOrder) {
            const needed = minOrder - currentSubtotal;
            // FIX: Still record selection so we can show "add more" UI
            setUserSelectedPromoId(promo.id);
            return { success: false, error: `Add ₹${needed} more to activate this offer!` };
        }
        setUserSelectedPromoId(promo.id);
        return { success: true };
    };

    const handleOrderPlaced = (ref: string, customer: CustomerInfo, total: number, paymentMethod: PaymentMethod) => {
        const subtotalVal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty_in_cart, 0);
        const newOrder: Order = {
            id: ref,
            date: new Date().toISOString(),
            customer,
            items: [...cart],
            total: finalTotal,
            originalTotal: subtotalVal,
            discountAmount: discountAmount,
            appliedPromoCode: appliedPromo?.code || null,
            paymentMethod
        };
        setOrders(prev => [newOrder, ...prev]);
        setOrderPlacedRef(ref);
        setCart([]);
        setUserSelectedPromoId(null);
        
        // Save to Database
        actions.storeOrder(newOrder);
    };

    const addProduct = () => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newProd: Product = { id: newId, name: "New Product", qty: "1 Kg", price: 0, category: "Masalas" };
        setProducts(prev => [newProd, ...prev]);
        actions.addProduct(newProd);
    };

    const updateProduct = (updated: Product) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        actions.updateProduct(updated);
    };

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        actions.deleteProduct(id);
    };

    const addPromotion = () => {
        const newId = Math.max(...promotions.map(p => p.id), 0) + 1;
        const newPromo: Promotion = {
            id: newId,
            text: "New Promotion",
            isActive: true,
            type: "percentage",
            value: 10,
            scope: "all",
            code: `PROMO${newId}`
        };
        setPromotions(prev => [newPromo, ...prev]);
        actions.addPromotion(newPromo);
    };

    const updatePromotion = (updated: Promotion) => {
        setPromotions(prev => prev.map(p => p.id === updated.id ? updated : p));
        actions.updatePromotion(updated);
    };

    const deletePromotion = (id: number) => {
        setPromotions(prev => prev.filter(p => p.id !== id));
        actions.deletePromotion(id);
    };

    const handleContinue = () => {
        setOrderPlacedRef(null);
        setView("shop");
    };

    // FIX Bug 6: Clipboard copy with mobile fallback
    const copyToClipboard = (text: string, onSuccess?: () => void) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
                const input = document.createElement('input');
                input.value = text;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                onSuccess?.();
            });
        } else {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            onSuccess?.();
        }
    };

    const categories = ["All", "Masalas", "Masala Powders"];
    const activePromotions = promotions.filter(p => {
        if (!p.isActive) return false;
        if (p.expiresAt && new Date(p.expiresAt).getTime() < Date.now()) return false;
        return true;
    });

    if (orderPlacedRef) {
        return <OrderSuccess orderRef={orderPlacedRef} onContinue={handleContinue} />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground tracking-tight selection:bg-primary/30">
            <Header
                cartCount={cartCount}
                cartTotal={cartTotal}
                onViewCart={() => setView("checkout")}
                onAdminClick={() => setView("admin")}
            />

            <main className="flex-1">
                {view === "shop" && (
                    <div className="max-w-7xl mx-auto px-4 mt-8 sm:mt-12">

                        {/* ── Active Offers Section (replaces marquee) ── */}


                        {/* Filter Bar */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-center">
                            <div className="lg:col-span-8 relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary/50 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                                <input
                                    placeholder="Search our heritage collection..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-[2rem] pl-14 pr-6 py-4 sm:py-5 text-base sm:text-lg text-white placeholder:text-zinc-700 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shimmer-bg"
                                />
                            </div>

                            <div className="lg:col-span-4 flex justify-between lg:justify-end items-center gap-4">
                                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                                    {[
                                        { mode: "list", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg> },
                                        { mode: "icon", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg> }
                                    ].map(({ mode, icon }) => (
                                        <button
                                            key={mode}
                                            onClick={() => setDisplayMode(mode as DisplayMode)}
                                            className={`p-3 rounded-xl transition-all duration-500 ${displayMode === mode ? "bg-primary text-black shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 sm:gap-8 mb-16">
                            <div className="flex items-center gap-4">
                                <span className="text-xs sm:text-sm font-black text-primary uppercase tracking-[0.5em]">Collections</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                            </div>
                            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`group relative px-6 sm:px-10 py-4 rounded-2xl transition-all duration-500 whitespace-nowrap shrink-0 overflow-hidden
                                            ${activeCategory === cat
                                                ? "text-black font-black shadow-2xl shadow-primary/20 scale-[1.02]"
                                                : "text-zinc-500 hover:text-white"}`}
                                    >
                                        {activeCategory === cat && (
                                            <div className="absolute inset-0 bg-primary animate-in fade-in zoom-in duration-500" />
                                        )}
                                        <span className="relative z-10 text-[11px] sm:text-xs uppercase tracking-wide sm:tracking-widest font-black">{cat}</span>
                                        {activeCategory !== cat && (
                                            <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:bg-white/5 transition-colors" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ProductList
                            products={filteredProducts}
                            cart={cart}
                            displayMode={displayMode}
                            activeCategory={activeCategory}
                            onAddToCart={addToCart}
                            onUpdateQty={updateQty}
                        />

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-24 animate-in fade-in duration-700">
                                <div className="text-6xl mb-6 opacity-20">🧂</div>
                                <h3 className="text-xl text-zinc-400 font-serif italic">The spice you seek is missing...</h3>
                                <button onClick={() => setSearch("")} className="mt-4 text-primary font-medium hover:underline px-4 py-2 bg-primary/5 rounded-lg">Clear Search</button>
                            </div>
                        )}
                    </div>
                )}

                {view === "checkout" && (
                    <CheckoutForm
                        cart={cart}
                        cartTotal={cartTotal}
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        appliedPromoCode={appliedPromo?.code || null}
                        allValidPromos={allValidPromos}
                        allLockedPromos={allLockedPromos}
                        bestPromoId={bestPromoId}
                        selectedPromoId={userSelectedPromoId}
                        onSelectPromo={(id) => setUserSelectedPromoId(id === userSelectedPromoId ? null : id)}
                        onApplyCode={applyPromoCode}
                        onUpdateQty={updateQty}
                        onRemoveItem={removeItem}
                        onBack={() => setView("shop")}
                        onOrderPlaced={handleOrderPlaced}
                    />
                )}

                {view === "admin" && (
                    <AdminPanel
                        products={products}
                        orders={orders}
                        promotions={promotions}
                        onAddProduct={addProduct}
                        onUpdateProduct={updateProduct}
                        onDeleteProduct={deleteProduct}
                        onAddPromotion={addPromotion}
                        onUpdatePromotion={updatePromotion}
                        onDeletePromotion={deletePromotion}
                        onBack={() => setView("shop")}
                    />
                )}

                {/* Mobile Sticky Bottom Cart */}
                {view === "shop" && cartCount > 0 && (
                    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-700">
                        <button
                            onClick={() => setView("checkout")}
                            className="w-full bg-primary text-black rounded-3xl p-3.5 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.98] transition-all border border-white/20"
                        >
                            <div className="flex items-center gap-4 pl-2">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] uppercase font-black tracking-[0.2em] opacity-60 mb-1">
                                        {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                                    </span>
                                    <span className="text-base font-bold tracking-tight">
                                        ₹{cartTotal}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-black/5 px-4 py-2 rounded-2xl">
                                <span className="text-[11px] font-black uppercase tracking-widest">Proceed</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                    </div>
                )}
            </main>

            <footer className="border-t border-white/5 py-12 mt-12 bg-zinc-950/50 pb-28 sm:pb-12">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h4 className="text-gold text-lg mb-2 font-serif">{APP_CONFIG.OWNER}</h4>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6 font-medium">House of Masala — Curated Spices Hub</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs text-zinc-600 font-medium italic">
                        <span>Free Home Delivery</span>
                        <span className="hidden sm:inline opacity-20">•</span>
                        <span>Premium Quality Guaranteed</span>
                        <span className="hidden sm:inline opacity-20">•</span>
                        <span>Contact: {APP_CONFIG.PHONE}</span>
                    </div>
                    <div className="mt-12 text-[9px] text-zinc-800 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {APP_CONFIG.OWNER} • Exceptional Taste
                    </div>
                </div>
            </footer>
        </div>
    );
}
