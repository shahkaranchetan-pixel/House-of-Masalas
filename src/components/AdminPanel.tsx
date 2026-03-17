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
        const headers = ["Order Ref", "Date", "Customer", "Phone", "Promo Code", "Subtotal", "Discount", "Total", "Payment"];
        const rows = allOrders.map(o => [
            o.id,
            new Date(o.date).toLocaleDateString(),
            o.customer.name,
            o.customer.phone,
            o.appliedPromoCode || "None",
            o.originalTotal || o.total,
            o.discountAmount || 0,
            o.total,
            o.paymentMethod
        ]);

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
        <div className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/40" />
                        <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Admin Panel</span>
                    </div>
                    <h2 className="text-5xl text-white font-serif italic tracking-tight">
                        Admin <span className="text-primary/30 not-italic font-sans">Dashboard</span>
                    </h2>
                    
                    <div className="flex gap-4 sm:gap-8 pt-6 overflow-x-auto hide-scrollbar">
                        {([["inventory", "Inventory"], ["promotions", "Offers"], ["reports", "Sales Reports"]] as const).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`text-xs sm:text-sm font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all duration-500 whitespace-nowrap
                                    ${activeTab === id ? "border-primary text-primary" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 h-fit">
                    {activeTab === "inventory" && (
                        <button onClick={handleAddClick} className="btn-primary-luxury text-[10px] sm:text-xs px-6 py-4 tracking-[0.2em]">+ Add Product</button>
                    )}
                    {activeTab === "promotions" && (
                        <button onClick={handleAddClick} className="btn-primary-luxury text-[10px] sm:text-xs px-6 py-4 tracking-[0.2em]">+ New Offer</button>
                    )}
                    {activeTab === "reports" && (
                        <button
                            onClick={downloadCSV}
                            disabled={allOrders.length === 0}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-white px-6 py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Export
                        </button>
                    )}
                    <button onClick={onBack} className="btn-secondary-luxury text-[10px] sm:text-xs px-6 py-4 tracking-[0.2em]">Exit Panel</button>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] p-8 min-h-[500px] border-white/5">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {catProducts.map(p => (
                                                <div key={p.id} className={`p-5 rounded-[2rem] border transition-all duration-500 flex items-center gap-5 ${editingId === p.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-zinc-950/30 hover:bg-zinc-950/60'}`}>
                                                    {editingId === p.id ? (
                                                        <div className="flex-1 flex flex-col gap-5 animate-in zoom-in duration-300">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input-premium py-3 text-sm" placeholder="Product Name" />
                                                                <input value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))} className="input-premium py-3 text-sm" placeholder="Quantity (e.g. 1kg)" />
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <div className="flex-1 flex items-center gap-3 bg-zinc-900 rounded-2xl px-5 border border-white/5">
                                                                    <span className="text-primary font-black text-sm">₹</span>
                                                                    <input type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} className="w-full bg-transparent text-white text-sm py-3 outline-none" placeholder="Price" />
                                                                </div>
                                                                <button onClick={saveEdit} className="btn-primary-luxury py-3 text-xs px-8">Save</button>
                                                                <button onClick={() => setEditingId(null)} className="text-zinc-600 hover:text-white text-[11px] font-black uppercase tracking-widest">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 bg-zinc-900/80 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xl border border-white/5">{getSpiceEmoji(p.name)}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-base font-bold text-white mb-1.5 truncate tracking-tight">{p.name}</div>
                                                                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">{p.qty} Packet</div>
                                                            </div>
                                                            <div className="flex items-center gap-5">
                                                                <span className="text-xl font-bold text-luxury-gold tracking-tighter">
                                                                    {p.price ? `₹${p.price}` : "—"}
                                                                </span>
                                                                <div className="flex items-center gap-3 border-l border-white/5 pl-5">
                                                                    <button onClick={() => startEdit(p)} className="p-3 text-zinc-600 hover:text-primary transition-all rounded-xl hover:bg-primary/5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg></button>
                                                                    <button onClick={() => onDeleteProduct(p.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
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
                                        <div className="flex items-center gap-6">
                                            <div className={`w-3 h-12 rounded-full shrink-0 ${promo.isActive ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`} />
                                            <div>
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h4 className="text-lg font-bold text-white tracking-tight">{promo.text}</h4>
                                                    <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full border border-primary/20 font-mono tracking-widest">{promo.code}</span>
                                                </div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {/* Discount value badge */}
                                                    <span className="bg-luxury-gold/10 text-luxury-gold text-[10px] font-black px-2 py-0.5 rounded-md border border-luxury-gold/20">
                                                        {promo.type === "percentage" ? `${promo.value}% off` : `₹${promo.value} off`}
                                                    </span>
                                                    {/* Scope badge */}
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase
                                                        ${promo.scope === "category"
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-400/20"
                                                            : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                                                        {promo.scope === "category" && promo.targetCategory ? promo.targetCategory : "All Items"}
                                                    </span>
                                                    {/* Min order badge */}
                                                    {(promo.minOrderValue || 0) > 0 && (
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">
                                                            Min. ₹{promo.minOrderValue}
                                                        </span>
                                                    )}
                                                    {/* Status */}
                                                    {(() => {
                                                        const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                                                        return (
                                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] 
                                                                ${isExpired ? 'text-red-500' : promo.isActive ? 'text-emerald-500/70' : 'text-zinc-700'}`}>
                                                                {isExpired ? '● Expired' : promo.isActive ? '● Active' : '○ Disabled'}
                                                            </span>
                                                        );
                                                    })()}
                                                    {/* Expiry */}
                                                    {promo.expiresAt && (
                                                        <span className={`text-[10px] font-black tracking-wider ${new Date(promo.expiresAt) < new Date() ? 'text-red-500 opacity-60' : 'text-orange-400'}`}>
                                                            ⏳ Ends: {new Date(promo.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 border-l border-white/5 pl-6 sm:pl-8 self-end sm:self-auto">
                                            <button onClick={() => onUpdatePromotion({ ...promo, isActive: !promo.isActive })} className={`p-3 rounded-2xl transition-all ${promo.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                            </button>
                                            <button onClick={() => startPromoEdit(promo)} className="p-3 text-zinc-600 hover:text-primary transition-all rounded-2xl hover:bg-primary/5"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg></button>
                                            <button onClick={() => onDeletePromotion(promo.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-all rounded-2xl hover:bg-red-500/5"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead className="hidden sm:table-header-group">
                                    <tr className="text-xs text-primary/40 uppercase tracking-[0.4em] font-black">
                                        <th className="px-6 pb-4">Order ID</th>
                                        <th className="px-6 pb-4">Order Date</th>
                                        <th className="px-6 pb-4">Customer Details</th>
                                        <th className="px-6 pb-4 text-right">Final Total</th>
                                        <th className="px-6 pb-4 text-center">Payment Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrders.map(o => (
                                        <tr key={o.id} className="bg-zinc-950/40 group hover:bg-zinc-950 transition-all duration-500">
                                            <td className="px-6 py-6 rounded-l-[2rem] border-y border-l border-white/5 group-hover:border-primary/20 transition-all">
                                                <div className="font-mono text-[10px] text-white font-black tracking-widest">{o.id}</div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 group-hover:border-primary/20 transition-all">
                                                <div className="text-[11px] text-zinc-400 font-bold uppercase">{new Date(o.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 group-hover:border-primary/20 transition-all">
                                                <div className="text-xs font-black text-white mb-1">{o.customer.name}</div>
                                                <div className="text-[9px] text-zinc-600 tracking-widest font-bold uppercase">{o.customer.phone}</div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 group-hover:border-primary/20 transition-all text-right">
                                                <div className="text-base font-bold text-luxury-gold tracking-tighter">₹{o.total}</div>
                                                {o.appliedPromoCode && <div className="text-[8px] text-primary font-black uppercase tracking-widest mt-1 opacity-60">{o.appliedPromoCode}</div>}
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
