"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { ProductList } from '../components/ProductList';
import { CheckoutForm } from '../components/CheckoutForm';
import { AdminPanel } from '../components/AdminPanel';
import { OrderSuccess } from '../components/OrderSuccess';
import { INITIAL_PRODUCTS, APP_CONFIG } from '../constants/products';
import { Product, CartItem, DisplayMode, ViewState, Order, CustomerInfo, PaymentMethod, Promotion } from '../types';

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
            return saved ? JSON.parse(saved) : [];
        }
        return [];
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

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCat = activeCategory === "All" || p.category === activeCategory;
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [products, activeCategory, search]);

    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.price || 0) * item.qty_in_cart, 0)
        , [cart]);

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

    const handleOrderPlaced = (ref: string, customer: CustomerInfo, total: number, paymentMethod: PaymentMethod) => {
        const newOrder: Order = {
            id: ref,
            date: new Date().toISOString(),
            customer,
            items: [...cart],
            total,
            paymentMethod
        };
        setOrders(prev => [newOrder, ...prev]);
        setOrderPlacedRef(ref);
        setCart([]);
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
        const newPromo: Promotion = { id: newId, text: "New Promotion", isActive: true };
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

    const categories = ["All", "Masalas", "Masala Powders"];

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
                    <div className="max-w-6xl mx-auto px-4 mt-4 sm:mt-6">
                        {/* Promotions Banner */}
                        {promotions.filter(p => p.isActive).length > 0 && (
                            <div className="mb-6 overflow-hidden bg-primary/10 border border-primary/20 rounded-2xl py-3 px-4">
                                <div className="flex gap-8 animate-marquee whitespace-nowrap">
                                    {promotions.filter(p => p.isActive).map(p => (
                                        <span key={p.id} className="text-primary font-bold text-sm tracking-wide flex items-center gap-2">
                                            <span className="text-lg">✨</span> {p.text}
                                        </span>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {promotions.filter(p => p.isActive).map(p => (
                                        <span key={`dup-${p.id}`} className="text-primary font-bold text-sm tracking-wide flex items-center gap-2">
                                            <span className="text-lg">✨</span> {p.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Search + View Toggle */}
                        <div className="flex gap-2.5 mb-5 items-center bg-surface/30 p-1.5 rounded-xl gold-border shadow-inner">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                                <input
                                    placeholder="Search collection..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-none bg-zinc-900/40 text-white text-sm focus:ring-1 ring-primary/20 transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="flex bg-zinc-900/60 p-0.5 rounded-lg gold-border">
                                {[
                                    { mode: "list", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg> },
                                    { mode: "icon", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg> }
                                ].map(({ mode, icon }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setDisplayMode(mode as DisplayMode)}
                                        className={`p-2 rounded-md transition-all ${displayMode === mode ? "bg-primary text-black shadow-md" : "text-zinc-600 hover:text-zinc-400"}`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Navigation - Horizontal Scroll */}
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-6 mb-2 border-b border-white/5">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full border whitespace-nowrap text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300
                    ${activeCategory === cat
                                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5"
                                            : "border-white/5 bg-zinc-900/40 text-zinc-600 hover:text-zinc-400 hover:border-white/10"}`}
                                >
                                    {cat}
                                </button>
                            ))}
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
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6 font-medium">House of Masala - Curated Spieces Hub</p>
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
