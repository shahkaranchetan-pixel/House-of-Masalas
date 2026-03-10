"use client";

import React, { useState } from 'react';
import { Product, Order } from '../types';
import { getSpiceEmoji } from '../utils/emoji';
import { APP_CONFIG } from '../constants/products';

interface AdminPanelProps {
    products: Product[];
    orders: Order[];
    onAddProduct: () => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onBack: () => void;
}

export const AdminPanel = (props: AdminPanelProps) => {
    const { products, orders: allOrders = [], onAddProduct, onUpdateProduct, onDeleteProduct, onBack } = props;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"inventory" | "reports">("inventory");

    const handleLogin = () => {
        if (password === APP_CONFIG.ADMIN_PASSWORD) {
            setIsLoggedIn(true);
            setError("");
        } else {
            setError("Incorrect password.");
        }
    };

    const downloadCSV = () => {
        const headers = ["Order Ref", "Date", "Customer", "Phone", "Total", "Payment"];
        const rows = allOrders.map(o => [
            o.id,
            new Date(o.date).toLocaleDateString(),
            o.customer.name,
            o.customer.phone,
            o.total,
            o.paymentMethod
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `masala_orders_${new Date().toISOString().slice(0, 10)}.csv`);
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

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    if (!isLoggedIn) {
        // ... login render same ...
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full glass-panel rounded-3xl p-12 text-center premium-shadow border-primary/20 animate-in zoom-in duration-500">
                    <div className="text-6xl mb-8 filter drop-shadow-xl">🗝️</div>
                    <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Secured Access</h2>
                    <h1 className="text-3xl text-white font-serif mb-8">Admin Portal</h1>

                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Authorization Key"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLogin()}
                            className="w-full p-4 rounded-xl bg-surface gold-border text-white text-center focus:ring-2 ring-primary/20 transition-all outline-none"
                        />
                        {error && <div className="text-red-400 text-xs font-medium">{error}</div>}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            Verify Identity
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full mt-4 text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
                        >
                            ← Return to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl text-white font-serif flex items-center gap-2 mb-0.5">
                        <span className="opacity-30 text-base">#</span> Management Center
                    </h2>
                    <div className="flex gap-4 mt-2">
                        {([["inventory", "Inventory"], ["reports", "Order Reports"]] as const).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`text-[10px] font-extrabold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all
                                    ${activeTab === id ? "border-primary text-primary" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    {activeTab === "inventory" ? (
                        <button onClick={onAddProduct} className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-95">+ Add Spice</button>
                    ) : (
                        <button
                            onClick={downloadCSV}
                            disabled={allOrders.length === 0}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-95"
                        >
                            Export CSV 📥
                        </button>
                    )}
                    <button onClick={onBack} className="text-zinc-500 hover:text-white px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase transition-colors tracking-widest border border-white/5">← Exit</button>
                </div>
            </div>

            {activeTab === "inventory" ? (
                <>
                    <div className="relative mb-8">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            placeholder="Search by name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border-none bg-zinc-900 text-white text-sm focus:ring-1 ring-primary/20 transition-all placeholder:text-zinc-800 font-medium"
                        />
                    </div>

                    <div className="space-y-8">
                        {["Masalas", "Masala Powders"].map(cat => {
                            const catProducts = filtered.filter(p => p.category === cat);
                            if (catProducts.length === 0) return null;
                            return (
                                <div key={cat} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-zinc-500 font-serif mb-4 flex items-center gap-2 text-sm">
                                        <span className="w-6 h-px bg-zinc-800" />
                                        {cat}
                                    </h3>
                                    <div className="space-y-1.5">
                                        {catProducts.map(p => (
                                            <div key={p.id} className="p-2.5 rounded-xl bg-surface/50 gold-border flex items-center gap-3 transition-colors">
                                                {editingId === p.id ? (
                                                    <div className="flex-1 flex flex-wrap gap-3 items-center animate-in zoom-in duration-200">
                                                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="flex-1 min-w-[150px] bg-zinc-900 text-white px-3 py-1.5 rounded-md text-xs border-primary/30 focus:border-primary outline-none border transition-colors" />
                                                        <input value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))} placeholder="Qty" className="w-20 bg-zinc-900 text-white px-3 py-1.5 rounded-md text-xs border-zinc-800 outline-none border" />
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-primary font-bold text-xs">₹</span>
                                                            <input type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} placeholder="Price" className="w-20 bg-zinc-900 text-white px-3 py-1.5 rounded-md text-xs border-zinc-800 outline-none border" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={saveEdit} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md font-bold text-[10px] transition-colors uppercase tracking-wider">Save</button>
                                                            <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-xl shrink-0">{getSpiceEmoji(p.name)}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-white mb-0.5 truncate">{p.name}</div>
                                                            <div className="text-[9px] text-zinc-700 uppercase tracking-widest font-extrabold">{p.qty}</div>
                                                        </div>
                                                        <div className="text-base font-bold text-primary font-serif shrink-0 mx-3">
                                                            {p.price ? `₹${p.price}` : "—"}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button onClick={() => startEdit(p)} className="p-1.5 text-zinc-600 hover:text-primary transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                            </button>
                                                            <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 text-zinc-800 hover:text-red-500 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                            </button>
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
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-x-auto">
                    {allOrders.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/40 rounded-3xl gold-border">
                            <div className="text-4xl mb-4 opacity-20">📑</div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">No orders recorded yet</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] text-zinc-600 uppercase tracking-widest font-extrabold">
                                    <th className="px-4 py-2">Reference</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Customer</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                    <th className="px-4 py-2 text-center">Via</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.map(o => (
                                    <tr key={o.id} className="bg-surface/50 gold-border group hover:bg-surface transition-colors">
                                        <td className="px-4 py-3 rounded-l-xl font-mono text-[10px] text-zinc-400 font-bold">{o.id}</td>
                                        <td className="px-4 py-3 text-xs text-white/70">{new Date(o.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs font-bold text-white">{o.customer.name}</div>
                                            <div className="text-[10px] text-zinc-600">{o.customer.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-primary font-bold font-serif text-sm">₹{o.total}</td>
                                        <td className="px-4 py-3 rounded-r-xl text-center">
                                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter border
                                                ${o.paymentMethod === "upi" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-zinc-700 text-zinc-500"}`}>
                                                {o.paymentMethod}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};
