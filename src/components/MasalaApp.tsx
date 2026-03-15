"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { ProductList } from '../components/ProductList';
import { CheckoutForm } from '../components/CheckoutForm';
import { AdminPanel } from '../components/AdminPanel';
import { OrderSuccess } from '../components/OrderSuccess';
import { INITIAL_PRODUCTS, APP_CONFIG } from '../constants/products';
import { Product, CartItem, DisplayMode, ViewState, Order, CustomerInfo, PaymentMethod, Promotion, PromotionWithCalc } from '../types';

export default function MasalaApp() {
    const [view, setView] = useState<ViewState>("shop");
    const [products, setProducts] = useState<Product[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("masala_products");
            return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
        }
        return INITIAL_PRODUCTS;
    });
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("masala_orders");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [search, setSearch] = useState<string>("");
    const [displayMode, setDisplayMode] = useState<DisplayMode>("list");
    const [orderPlacedRef, setOrderPlacedRef] = useState<string | null>(null);
    const [promotions, setPromotions] = useState<Promotion[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("masala_promotions");
            if (saved) {
                // Migrate old promos that may lack type/scope/value fields from earlier versions
                const parsed = JSON.parse(saved) as Partial<Promotion>[];
                const migrated = parsed.map(p => ({
                    id: p.id ?? 0,
                    text: p.text ?? "",
                    code: p.code ?? "",
                    isActive: p.isActive ?? true,
                    type: p.type ?? "percentage",
                    scope: p.scope ?? "all",
                    value: p.value ?? 10,
                    minOrderValue: p.minOrderValue,
                    targetCategory: p.targetCategory,
                } as Promotion));
                // Re-persist migrated data immediately so future loads are clean
                localStorage.setItem("masala_promotions", JSON.stringify(migrated));
                return migrated;
            }
        }
        return [];
    });



    const [userSelectedPromoId, setUserSelectedPromoId] = useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("masala_selected_promo");
            return saved ? Number(saved) : null;
        }
        return null;
    });

    // Persist orders to localStorage
    React.useEffect(() => {
        localStorage.setItem("masala_orders", JSON.stringify(orders));
    }, [orders]);

    // Persist promotions to localStorage
    React.useEffect(() => {
        localStorage.setItem("masala_promotions", JSON.stringify(promotions));
    }, [promotions]);

    // Persist products to localStorage
    React.useEffect(() => {
        localStorage.setItem("masala_products", JSON.stringify(products));
    }, [products]);

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
        const activePromos = promotions.filter(p => p.isActive);

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
        // FIX Bug 2: Clear persistent promo selection after order is placed
        setUserSelectedPromoId(null);
    };

    const addProduct = () => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newProd: Product = { id: newId, name: "New Product", qty: "1 Kg", price: 0, category: "Masalas" };
        setProducts(prev => [newProd, ...prev]);
    };

    const updateProduct = (updated: Product) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
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
    };

    const updatePromotion = (updated: Promotion) => {
        setPromotions(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const deletePromotion = (id: number) => {
        setPromotions(prev => prev.filter(p => p.id !== id));
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
    const activePromotions = promotions.filter(p => p.isActive);

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
                        {activePromotions.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="h-[1px] w-8 bg-primary/40" />
                                    <span className="text-xs sm:text-sm font-black text-primary uppercase tracking-[0.5em]">Active Offers</span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{activePromotions.length} Live</span>
                                </div>

                                {/* FIX D4: Horizontal scrollable offer cards — all visible */}
                                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                                    {activePromotions.map(promo => {
                                        const scopeLabel = promo.scope === "category" && promo.targetCategory
                                            ? promo.targetCategory
                                            : "All Items";
                                        const discountLabel = (promo.type ?? "percentage") === "percentage"
                                            ? `${promo.value}% Off`
                                            : `₹${promo.value} Off`;
                                        const isSelected = userSelectedPromoId === promo.id;

                                        return (
                                            <div
                                                key={promo.id}
                                                className={`group shrink-0 rounded-[2rem] border p-6 cursor-pointer transition-all duration-500 min-w-[220px] max-w-[260px] relative overflow-hidden flex flex-col gap-4
                                                    ${isSelected
                                                        ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20"
                                                        : "glass-card border-white/10 hover:border-primary/40 hover:bg-primary/5"}`}
                                            >
                                                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

                                                {/* FIX D5: Scope badge */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border
                                                        ${promo.scope === "category"
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-400/20"
                                                            : "bg-primary/10 text-primary border-primary/20"}`}>
                                                        {scopeLabel}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                                        Active
                                                    </span>
                                                </div>

                                                {/* FIX D2: Big discount display */}
                                                <div>
                                                    <div className="text-3xl font-bold text-luxury-gold tracking-tighter leading-none mb-1">
                                                        {discountLabel}
                                                    </div>
                                                    <div className="text-sm font-bold text-white">{promo.text}</div>
                                                </div>

                                                {/* Code + Min Order */}
                                                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-mono text-primary font-bold text-sm tracking-widest">{promo.code}</div>
                                                        {/* FIX D3: Minimum order hint */}
                                                        {(promo.minOrderValue || 0) > 0 && (
                                                            <div className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mt-1">
                                                                Min. ₹{promo.minOrderValue}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {/* Copy option */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(promo.code, () => {
                                                                    const el = e.currentTarget;
                                                                    el.innerText = "✓";
                                                                    setTimeout(() => el.innerText = "Copy", 1500);
                                                                });
                                                            }}
                                                            className="text-[9px] font-black text-zinc-600 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all"
                                                        >
                                                            Copy
                                                        </button>
                                                        {/* FIX R6: One-click apply + navigate to checkout */}
                                                        <button
                                                            onClick={() => {
                                                                setUserSelectedPromoId(promo.id);
                                                                setView("checkout");
                                                            }}
                                                            className="text-[9px] font-black text-black bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-primary/20 group-hover:shadow-primary/40"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
                            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`group relative px-10 py-4 rounded-2xl transition-all duration-500 whitespace-nowrap overflow-hidden
                                            ${activeCategory === cat
                                                ? "text-black font-black shadow-2xl shadow-primary/20"
                                                : "text-zinc-500 hover:text-white"}`}
                                    >
                                        {activeCategory === cat && (
                                            <div className="absolute inset-0 bg-primary animate-in fade-in zoom-in duration-500" />
                                        )}
                                        <span className="relative z-10 text-xs sm:text-sm uppercase tracking-widest font-black">{cat}</span>
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
            </main>

            <footer className="border-t border-white/5 py-12 mt-12 bg-zinc-950/50">
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
