"use client";

import React, { useState } from 'react';
import { Product, Order, Promotion, PromotionType, PromotionScope } from '../types';
import { getSpiceEmoji } from '../utils/emoji';
import { APP_CONFIG } from '../constants/products';

interface AdminPanelProps {
    products: Product[];
    orders: Order[];
    promotions: Promotion[];
    onAddProduct: () => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onAddPromotion: () => void;
    onUpdatePromotion: (promotion: Promotion) => void;
    onDeletePromotion: (id: number) => void;
    onBack: () => void;
}

export const AdminPanel = (props: AdminPanelProps) => {
    const { 
        products, 
        orders: allOrders = [], 
        promotions = [],
        onAddProduct, 
        onUpdateProduct, 
        onDeleteProduct, 
        onAddPromotion,
        onUpdatePromotion,
        onDeletePromotion,
        onBack 
    } = props;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
    const [editPromoForm, setEditPromoForm] = useState<Partial<Promotion>>({});
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"inventory" | "reports" | "promotions">("inventory");
    const [prevProductsLength, setPrevProductsLength] = useState(products.length);
    const [prevPromosLength, setPrevPromosLength] = useState(promotions.length);

    React.useEffect(() => {
        if (products.length > prevProductsLength) {
            const firstProd = products[0];
            if (firstProd && firstProd.name === "New Product") {
                setEditingId(firstProd.id);
                setEditForm(firstProd);
            }
        }
        setPrevProductsLength(products.length);
    }, [products.length]);

    React.useEffect(() => {
        if (promotions.length > prevPromosLength) {
            const firstPromo = promotions[0];
            if (firstPromo && (firstPromo.text === "New Promotion" || firstPromo.text === "")) {
                setEditingPromoId(firstPromo.id);
                setEditPromoForm(firstPromo);
            }
        }
        setPrevPromosLength(promotions.length);
    }, [promotions.length]);

    const handleAddClick = () => {
        if (activeTab === "inventory") {
            setSearch("");
            onAddProduct();
        } else if (activeTab === "promotions") {
            onAddPromotion();
        }
    };

    const handleLogin = () => {
        if (password === APP_CONFIG.ADMIN_PASSWORD) {
            setIsLoggedIn(true);
            setError("");
        } else {
            setError("Access Protocol Failed.");
        }
    };

    const downloadCSV = () => {
        const headers = ["Order Ref", "Date", "Customer", "Phone", "Item Name", "Item Qty", "Item Rate", "Item Total", "Order Subtotal", "Order Discount", "Order Total", "Promo Code", "Payment"];
        const rows: any[] = [];
        
        allOrders.forEach(o => {
            o.items.forEach(i => {
                rows.push([
                    o.id,
                    new Date(o.date).toLocaleDateString(),
                    o.customer.name,
                    o.customer.phone,
                    i.name,
                    i.qty_in_cart,
                    i.price || 0,
                    (i.price || 0) * i.qty_in_cart,
                    o.originalTotal || o.total,
                    o.discountAmount || 0,
                    o.total,
                    o.appliedPromoCode || "None",
                    o.paymentMethod
                ]);
            });
        });

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `heritage_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setEditForm(product);
    };

    const saveEdit = () => {
        if (editingId && editForm.name) {
            onUpdateProduct(editForm as Product);
            setEditingId(null);
        }
    };

    const startPromoEdit = (promo: Promotion) => {
        setEditingPromoId(promo.id);
        setEditPromoForm(promo);
    };

    const savePromoEdit = () => {
        if (editingPromoId && editPromoForm.text !== undefined) {
            onUpdatePromotion(editPromoForm as Promotion);
            setEditingPromoId(null);
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    if (!isLoggedIn) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full glass-card rounded-[3rem] p-12 text-center animate-in zoom-in slide-in-from-bottom-10 duration-1000">
                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 border border-white/5 shadow-2xl">
                        🔐
                    </div>
                    <div className="space-y-2 mb-10">
                        <span className="text-[10px] text-primary/60 font-black uppercase tracking-[0.4em]">Internal Access</span>
                        <h1 className="text-4xl text-white font-serif italic">Admin Login</h1>
                    </div>

                    <div className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                className="input-premium text-center font-mono tracking-[0.5em] py-5 text-lg"
                            />
                            {error && <div className="text-red-500 text-[11px] font-black uppercase tracking-widest animate-pulse">{error}</div>}
                        </div>
                        
                        <button
                            onClick={handleLogin}
                            className="w-full btn-primary-luxury py-5 shadow-primary/10 text-sm"
                        >
                            Login to Dashboard
                        </button>
                        
                        <button
                            onClick={onBack}
                            className="w-full text-zinc-600 hover:text-white text-xs uppercase tracking-[0.3em] font-black transition-all pt-6"
                        >
                            ← Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-12 gap-6 lg:gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/40" />
                        <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Admin Panel</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl text-white font-serif italic tracking-tight">
                        Admin <span className="text-primary/30 not-italic font-sans">Dashboard</span>
                    </h2>
                    
                    <div className="flex gap-4 sm:gap-8 pt-4 lg:pt-6 overflow-x-auto hide-scrollbar border-b border-white/5 lg:border-none">
                        {([["inventory", "Inventory"], ["promotions", "Offers"], ["reports", "Sales Reports"]] as const).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-[0.3em] pb-3 lg:pb-4 border-b-2 transition-all duration-500 whitespace-nowrap
                                    ${activeTab === id ? "border-primary text-primary" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:flex lg:gap-4 gap-3 h-fit">
                    {activeTab === "inventory" && (
                        <button onClick={handleAddClick} className="btn-primary-luxury text-[10px] sm:text-xs px-4 lg:px-6 py-3 lg:py-4 tracking-[0.15em] lg:tracking-[0.2em]">+ Add Product</button>
                    )}
                    {activeTab === "promotions" && (
                        <button onClick={handleAddClick} className="btn-primary-luxury text-[10px] sm:text-xs px-4 lg:px-6 py-3 lg:py-4 tracking-[0.15em] lg:tracking-[0.2em]">+ New Offer</button>
                    )}
                    {activeTab === "reports" && (
                        <button
                            onClick={downloadCSV}
                            disabled={allOrders.length === 0}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lg:w-4 lg:h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Export
                        </button>
                    )}
                    <button onClick={onBack} className="btn-secondary-luxury text-[10px] sm:text-xs px-4 lg:px-6 py-3 lg:py-4 tracking-[0.15em] lg:tracking-[0.2em] flex items-center justify-center">Exit Panel</button>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] p-5 lg:p-8 min-h-[500px] border-white/5">
                {activeTab === "inventory" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="relative group max-w-md">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary/50 group-focus-within:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input-premium pl-14 py-3 text-xs tracking-wider"
                            />
                        </div>

                        <div className="space-y-12">
                            {["Masalas", "Masala Powders"].map(cat => {
                                const catProducts = filtered.filter(p => p.category === cat);
                                if (catProducts.length === 0) return null;
                                return (
                                    <div key={cat} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-zinc-500 font-serif italic text-xl uppercase tracking-widest">{cat}</h3>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {catProducts.map(p => (
                                                <div key={p.id} className={`p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] border transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-5 ${editingId === p.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-zinc-950/30 hover:bg-zinc-950/60'}`}>
                                                    {editingId === p.id ? (
                                                        <div className="flex-1 flex flex-col gap-4 lg:gap-5 animate-in zoom-in duration-300">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input-premium py-2 lg:py-3 text-xs lg:text-sm" placeholder="Product Name" />
                                                                <input value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))} className="input-premium py-2 lg:py-3 text-xs lg:text-sm" placeholder="Quantity (e.g. 1kg)" />
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                                                                <div className="flex-1 flex items-center gap-3 bg-zinc-900 rounded-xl lg:rounded-2xl px-4 lg:px-5 border border-white/5">
                                                                    <span className="text-primary font-black text-xs lg:text-sm">₹</span>
                                                                    <input type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} className="w-full bg-transparent text-white text-xs lg:text-sm py-2 lg:py-3 outline-none" placeholder="Price" />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={saveEdit} className="btn-primary-luxury flex-1 py-3 lg:py-3 text-[10px] lg:text-xs px-6 lg:px-8">Save</button>
                                                                    <button onClick={() => setEditingId(null)} className="flex-1 text-zinc-600 hover:text-white text-[10px] lg:text-[11px] font-black uppercase tracking-widest px-4">Cancel</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-900/80 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl shrink-0 shadow-2xl border border-white/5">{getSpiceEmoji(p.name)}</div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm lg:text-base font-bold text-white mb-0.5 lg:mb-1 truncate tracking-tight">{p.name}</div>
                                                                    <div className="text-[9px] lg:text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">{p.qty} Packet</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-5">
                                                                <span className="text-lg lg:text-xl font-bold text-luxury-gold tracking-tighter">
                                                                    {p.price ? `₹${p.price}` : "—"}
                                                                </span>
                                                                <div className="flex items-center gap-2 lg:gap-3">
                                                                    <button onClick={() => startEdit(p)} className="p-2 lg:p-3 text-zinc-600 hover:text-primary transition-all rounded-lg lg:rounded-xl hover:bg-primary/5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-[18px] lg:h-[18px]"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                                    </button>
                                                                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 lg:p-3 text-zinc-800 hover:text-red-500 transition-all rounded-lg lg:rounded-xl hover:bg-red-500/5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-[18px] lg:h-[18px]"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "promotions" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                        {promotions.map(promo => (
                            <div key={promo.id} className={`rounded-[2.5rem] border transition-all duration-700 overflow-hidden ${editingPromoId === promo.id ? 'border-primary/30' : 'border-white/5 bg-zinc-950/30'}`}>
                                {editingPromoId === promo.id ? (
                                    <div className="p-10 space-y-10 animate-in zoom-in duration-300">
                                        {/* Row 1: Title, Code, Min Order */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Display Title</label>
                                                <input value={editPromoForm.text ?? ""} onChange={e => setEditPromoForm(f => ({ ...f, text: e.target.value }))} className="input-premium text-xs" placeholder="e.g. 10% Off All" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Promo Code</label>
                                                <input value={editPromoForm.code ?? ""} onChange={e => setEditPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-premium font-mono tracking-widest text-xs" placeholder="e.g. SAVE10" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Min. Order (₹)</label>
                                                <input type="number" min={0} value={editPromoForm.minOrderValue ?? 0} onChange={e => setEditPromoForm(f => ({ ...f, minOrderValue: Number(e.target.value) }))} className="input-premium text-xs" placeholder="0 = no minimum" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Valid Until (Optional)</label>
                                                <input
                                                    type="datetime-local"
                                                    value={editPromoForm.expiresAt ? new Date(new Date(editPromoForm.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                                    onChange={e => {
                                                        const dateVal = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                                        setEditPromoForm(f => ({ ...f, expiresAt: dateVal }));
                                                    }}
                                                    className="input-premium text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Discount Type, Value, Scope */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Discount Type</label>
                                                <select
                                                    value={editPromoForm.type ?? "percentage"}
                                                    onChange={e => setEditPromoForm(f => ({ ...f, type: e.target.value as PromotionType }))}
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                                >
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed">Fixed Amount (₹)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">
                                                    {editPromoForm.type === "fixed" ? "Discount Amount (₹)" : "Discount Value (%)"}
                                                </label>
                                                <div className="flex items-center bg-zinc-900 border border-white/10 rounded-2xl px-5 overflow-hidden">
                                                    <span className="text-primary font-black text-sm shrink-0">
                                                        {editPromoForm.type === "fixed" ? "₹" : "%"}
                                                    </span>
                                                    <input
                                                        type="number" min={0}
                                                        value={editPromoForm.value ?? 0}
                                                        onChange={e => setEditPromoForm(f => ({ ...f, value: Number(e.target.value) }))}
                                                        className="w-full bg-transparent text-white text-xs py-4 pl-3 outline-none"
                                                        placeholder={editPromoForm.type === "fixed" ? "e.g. 50" : "e.g. 10"}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Applies To</label>
                                                <select
                                                    value={editPromoForm.scope ?? "all"}
                                                    onChange={e => setEditPromoForm(f => ({ ...f, scope: e.target.value as PromotionScope, targetCategory: e.target.value === "all" ? undefined : f.targetCategory }))}
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                                >
                                                    <option value="all">All Products</option>
                                                    <option value="category">Category Only</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 3: Target Category (conditional) */}
                                        {editPromoForm.scope === "category" && (
                                            <div className="space-y-3 animate-in fade-in duration-300">
                                                <label className="text-[11px] text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Target Category</label>
                                                <select
                                                    value={editPromoForm.targetCategory ?? "Masalas"}
                                                    onChange={e => setEditPromoForm(f => ({ ...f, targetCategory: e.target.value }))}
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                                >
                                                    <option value="Masalas">Masalas</option>
                                                    <option value="Masala Powders">Masala Powders</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-2 border-t border-white/5">
                                            <button onClick={savePromoEdit} className="btn-primary-luxury px-8 text-xs tracking-[0.2em]">Save Offer</button>
                                            <button onClick={() => setEditingPromoId(null)} className="text-zinc-600 hover:text-white text-[11px] font-black uppercase tracking-widest px-4">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-zinc-950/60 transition-all duration-500">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:bg-zinc-950/60 transition-all duration-500">
                                            <div className="flex items-start lg:items-center gap-4 lg:gap-6 w-full">
                                                <div className={`w-1.5 lg:w-3 h-16 lg:h-12 rounded-full shrink-0 mt-1 lg:mt-0 ${promo.isActive ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`} />
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 lg:mb-2">
                                                        <h4 className="text-base lg:text-lg font-bold text-white tracking-tight">{promo.text}</h4>
                                                        <span className="w-fit bg-primary/10 text-primary text-[10px] lg:text-xs font-black px-3 py-1 rounded-full border border-primary/20 font-mono tracking-widest">{promo.code}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                                                        {/* Discount value badge */}
                                                        <span className="bg-luxury-gold/10 text-luxury-gold text-[9px] lg:text-[10px] font-black px-2 py-0.5 rounded-md border border-luxury-gold/20">
                                                            {promo.type === "percentage" ? `${promo.value}% off` : `₹${promo.value} off`}
                                                        </span>
                                                        {/* Scope badge */}
                                                        <span className={`text-[9px] lg:text-[10px] font-black px-2 py-0.5 rounded-md border uppercase
                                                            ${promo.scope === "category"
                                                                ? "bg-blue-500/10 text-blue-400 border-blue-400/20"
                                                                : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                                                            {promo.scope === "category" && promo.targetCategory ? promo.targetCategory : "All Items"}
                                                        </span>
                                                        {/* Status */}
                                                        {(() => {
                                                            const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                                                            return (
                                                                <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] 
                                                                    ${isExpired ? 'text-red-500' : promo.isActive ? 'text-emerald-500/70' : 'text-zinc-700'}`}>
                                                                    {isExpired ? '● Expired' : promo.isActive ? '● Active' : '○ Disabled'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1.5 mt-3 lg:mt-2">
                                                        {/* Min order badge */}
                                                        {(promo.minOrderValue || 0) > 0 && (
                                                            <span className="text-[9px] lg:text-[10px] font-black text-zinc-600 uppercase tracking-wider">
                                                                Min. Order: ₹{promo.minOrderValue}
                                                            </span>
                                                        )}
                                                        {/* Expiry */}
                                                        {promo.expiresAt && (
                                                            <span className={`text-[9px] lg:text-[10px] font-black tracking-wider ${new Date(promo.expiresAt) < new Date() ? 'text-red-500 opacity-60' : 'text-orange-400'}`}>
                                                                ⏳ Ends: {new Date(promo.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 lg:gap-3 lg:border-l border-white/5 lg:pl-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                                                <button onClick={() => onUpdatePromotion({ ...promo, isActive: !promo.isActive })} className={`flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl lg:rounded-2xl transition-all border sm:border-none ${promo.isActive ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-zinc-600 border-white/5 hover:text-white hover:bg-white/5'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-5 lg:h-5"><rect width="18" height="12" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                    <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">{promo.isActive ? 'Deactivate' : 'Activate'}</span>
                                                </button>
                                                <button onClick={() => startPromoEdit(promo)} className="flex-1 sm:flex-none flex items-center justify-center p-3 text-zinc-600 hover:text-primary transition-all rounded-xl lg:rounded-2xl border border-white/5 sm:border-none hover:bg-primary/5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-5 lg:h-5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Edit</span>
                                                </button>
                                                <button onClick={() => onDeletePromotion(promo.id)} className="flex-1 sm:flex-none flex items-center justify-center p-3 text-zinc-800 hover:text-red-500 transition-all rounded-xl lg:rounded-2xl border border-white/5 sm:border-none hover:bg-red-500/5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-5 lg:h-5"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">{allOrders.length} Orders Recorded</span>
                        </div>
                        <div className="lg:overflow-x-auto">
                            {/* Mobile Card Layout */}
                            <div className="lg:hidden space-y-6">
                                {allOrders.map(o => (
                                    <div key={o.id} className="bg-zinc-950/40 rounded-[2rem] border border-white/5 p-6 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="font-mono text-[10px] text-primary font-black tracking-widest">{o.id}</div>
                                                <div className="text-[11px] text-zinc-500 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border
                                                ${o.paymentMethod === "upi" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-zinc-800 text-zinc-600 bg-zinc-900/50"}`}>
                                                {o.paymentMethod}
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 space-y-1">
                                            <div className="text-sm font-black text-white">{o.customer.name}</div>
                                            <div className="text-[11px] text-zinc-600 font-bold">{o.customer.phone}</div>
                                        </div>

                                        <div className="space-y-3">
                                            {o.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-white/5 last:border-0 pb-3">
                                                    <div className="flex-1 pr-4">
                                                        <div className="font-medium text-white line-clamp-1">{item.name}</div>
                                                        <div className="text-zinc-600 mt-1">{item.qty_in_cart} x ₹{item.price}</div>
                                                    </div>
                                                    <div className="font-bold text-luxury-gold">₹{(item.price || 0) * item.qty_in_cart}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                            <div className="space-y-1">
                                                {o.appliedPromoCode && <div className="text-[9px] text-primary font-black uppercase tracking-widest opacity-60">Code: {o.appliedPromoCode}</div>}
                                                <div className="text-[10px] text-zinc-600 font-black uppercase">Sub: ₹{o.originalTotal || o.total + (o.discountAmount || 0)}</div>
                                                {o.discountAmount > 0 && <div className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">− ₹{o.discountAmount}</div>}
                                            </div>
                                            <div className="text-2xl font-bold text-luxury-gold tracking-tighter">₹{o.total}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table Layout */}
                            <table className="hidden lg:table w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-xs text-primary/40 uppercase tracking-[0.4em] font-black">
                                        <th className="px-6 pb-4">ID / Date / Customer</th>
                                        <th className="px-6 pb-4">Ordered Items Breakdown</th>
                                        <th className="px-6 pb-4 text-right">Order Summary</th>
                                        <th className="px-6 pb-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrders.map(o => (
                                        <tr key={o.id} className="bg-zinc-950/40 group hover:bg-zinc-950 transition-all duration-500">
                                            <td className="px-6 py-6 rounded-l-[2rem] border-y border-l border-white/5 group-hover:border-primary/20 transition-all space-y-2">
                                                <div className="font-mono text-[9px] text-primary font-black tracking-widest">{o.id}</div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</div>
                                                <div className="pt-2 border-t border-white/5">
                                                    <div className="text-xs font-black text-white">{o.customer.name}</div>
                                                    <div className="text-[9px] text-zinc-600 font-bold">{o.customer.phone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 group-hover:border-primary/20 transition-all min-w-[300px]">
                                                <div className="space-y-2">
                                                    {o.items.map((item, idx) => (
                                                        <div key={idx} className="grid grid-cols-12 gap-2 text-[10px] items-center py-2 border-b border-white/5 last:border-0">
                                                            <div className="col-span-6 font-medium text-white truncate px-1">{item.name}</div>
                                                            <div className="col-span-2 text-zinc-500 text-center">{item.qty_in_cart} Qty</div>
                                                            <div className="col-span-2 text-zinc-500 text-right">₹{item.price}</div>
                                                            <div className="col-span-2 font-bold text-luxury-gold text-right">₹{(item.price || 0) * item.qty_in_cart}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 group-hover:border-primary/20 transition-all text-right">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-zinc-600 font-black uppercase tracking-wider">Sub: ₹{o.originalTotal || o.total + (o.discountAmount || 0)}</div>
                                                    {o.discountAmount > 0 && <div className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">− ₹{o.discountAmount}</div>}
                                                    <div className="text-xl font-bold text-luxury-gold tracking-tighter pt-1 border-t border-white/10 mt-1">₹{o.total}</div>
                                                    {o.appliedPromoCode && <div className="text-[9px] text-primary font-black uppercase tracking-widest mt-1 opacity-60">Code: {o.appliedPromoCode}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 rounded-r-[2rem] border-y border-r border-white/5 group-hover:border-primary/20 transition-all text-center">
                                                <span className={`inline-block text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border
                                                    ${o.paymentMethod === "upi" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "border-zinc-800 text-zinc-600 bg-zinc-900/50"}`}>
                                                    {o.paymentMethod}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
