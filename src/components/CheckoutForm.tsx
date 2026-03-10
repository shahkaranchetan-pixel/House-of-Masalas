"use client";

import React, { useState } from 'react';
import { CartItem, CustomerInfo, PaymentMethod, Order } from '../types';
import { getSpiceEmoji } from '../utils/emoji';
import { APP_CONFIG } from '../constants/products';

interface CheckoutFormProps {
    cart: CartItem[];
    cartTotal: number;
    onUpdateQty: (id: number, delta: number) => void;
    onRemoveItem: (id: number) => void;
    onBack: () => void;
    onOrderPlaced: (ref: string, customer: CustomerInfo, total: number, paymentMethod: PaymentMethod) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
    cart,
    cartTotal,
    onUpdateQty,
    onRemoveItem,
    onBack,
    onOrderPlaced,
}) => {
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "", address: "" });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const orderRef = useState(() => "ORD" + Date.now().toString().slice(-6))[0];

    const placeOrder = () => {
        const itemLines = cart.map(item =>
            `  • ${item.name} (${item.qty}) x${item.qty_in_cart} = ₹${(item.price || 0) * item.qty_in_cart}`
        ).join("\n");

        const message =
            `🌶️ *NEW ORDER — Chetan Shah Masalas*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 *Order Ref:* ${orderRef}\n\n` +
            `👤 *Customer Details*\n` +
            `  Name: ${customerInfo.name}\n` +
            `  Phone: ${customerInfo.phone}\n` +
            `  Address: ${customerInfo.address}\n\n` +
            `🛒 *Items Ordered*\n${itemLines}\n\n` +
            `💰 *Total: ₹${cartTotal}*\n` +
            `💳 Payment: ${paymentMethod === "upi" ? "UPI (online)" : "Cash on Delivery"}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Please confirm & arrange delivery 🚚`;

        const whatsappURL = `https://wa.me/91${APP_CONFIG.PHONE}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank");
        onOrderPlaced(orderRef, customerInfo, cartTotal, paymentMethod);
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-6">
            <button onClick={onBack} className="text-primary hover:text-primary-hover flex items-center gap-2 text-xs font-bold mb-6 transition-colors uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Return to Shop
            </button>

            <h2 className="text-2xl text-white font-serif mb-6 flex items-center gap-2">
                <span className="opacity-30">#</span> Order Summary
            </h2>

            {/* Stepper */}
            <div className="flex gap-3 mb-8">
                {[{ n: 1, label: "Review" }, { n: 2, label: "Details" }, { n: 3, label: "Payment" }].map(({ n, label }) => (
                    <div key={n} className="flex-1 text-center">
                        <div className={`h-1 rounded-full mb-2 transition-all duration-500 ${step >= n ? "bg-primary" : "bg-zinc-800"}`} />
                        <div className={`text-[9px] uppercase tracking-widest font-extrabold ${step >= n ? "text-primary" : "text-zinc-600"}`}>{label}</div>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 gold-border premium-shadow">
                                <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl shrink-0">
                                    {getSpiceEmoji(item.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-white mb-0.5 truncate">{item.name}</div>
                                    <div className="text-[9px] text-zinc-500 uppercase font-extrabold tracking-wider">{item.qty} × ₹{item.price}</div>
                                </div>
                                <div className="flex items-center gap-1 bg-zinc-900 rounded-md p-0.5 gold-border">
                                    <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-primary hover:text-white transition-colors">−</button>
                                    <span className="w-5 text-center text-[10px] font-extrabold">{item.qty_in_cart}</span>
                                    <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-primary hover:text-white transition-colors">+</button>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="text-zinc-700 hover:text-red-500 p-1 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Pay</span>
                        <span className="text-2xl font-bold text-primary font-serif">₹{cartTotal}</span>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        disabled={cart.length === 0}
                        className="w-full bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl text-sm font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                    >
                        Review Shipping →
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                        {([["name", "Full Name", "text"], ["phone", "Phone Number", "tel"], ["address", "Delivery Address", "textarea"]] as const).map(([field, label, type]) => (
                            <div key={field}>
                                <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-extrabold block mb-1.5">{label}</label>
                                {type === "textarea" ? (
                                    <textarea
                                        rows={2}
                                        value={customerInfo[field]}
                                        onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))}
                                        placeholder="Flat No, Building, Area, Pincode"
                                        className="w-full p-3 rounded-lg bg-surface/50 gold-border text-white text-sm focus:ring-1 ring-primary/20 transition-all resize-none outline-none"
                                    />
                                ) : (
                                    <input
                                        type={type}
                                        value={customerInfo[field]}
                                        onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))}
                                        className="w-full p-3 rounded-lg bg-surface/50 gold-border text-white text-sm focus:ring-1 ring-primary/20 transition-all outline-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button onClick={() => setStep(1)} className="flex-1 text-zinc-500 hover:text-white py-3 font-bold text-xs uppercase tracking-widest transition-colors">← Back</button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                            className="flex-[2] bg-primary hover:bg-primary-hover text-black py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Select Payment →
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3 mb-6">
                        {[(["cash", "On Delivery"] as const), (["upi", "Online (UPI)"] as const)].map(([method, label]) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method as PaymentMethod)}
                                className={`flex-1 p-3.5 rounded-xl border transition-all duration-300 text-[10px] font-extrabold uppercase tracking-wider
                                    ${paymentMethod === method ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5" : "border-white/5 bg-surface/30 text-zinc-600 hover:text-zinc-500"}`}
                            >
                                <div className="text-xl mb-1.5">{method === "upi" ? "📱" : "💵"}</div>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="gold-border rounded-xl p-6 mb-6 bg-surface/50 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                        {paymentMethod === "upi" ? (
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-extrabold block mb-3">Scan to Pay securely</span>
                                <div className="bg-white p-2 rounded-xl mb-4 shadow-xl">
                                    <img
                                        src="/qr.jpg"
                                        alt="UPI QR Code"
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>
                                <div className="text-sm font-bold text-white tracking-widest font-serif mb-3 px-4 py-2 bg-zinc-900 rounded-lg gold-border">
                                    {APP_CONFIG.UPI_ID}
                                </div>
                                <div className="bg-primary/10 inline-block px-3 py-1 rounded-full text-primary text-[10px] font-extrabold border border-primary/20">
                                    Instant Verification on WhatsApp
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-extrabold block mb-1">Service Type</span>
                                <div className="text-lg font-bold text-white font-serif mb-4 italic">Home Delivery</div>
                                <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Pay upon arrival</div>
                            </>
                        )}
                    </div>

                    <div className="bg-surface/30 rounded-xl p-3.5 mb-8 text-[11px] text-zinc-600 border border-white/5">
                        <div className="flex justify-between mb-1.5">
                            <span className="font-extrabold opacity-50 uppercase tracking-[0.1em] text-[9px]">Ship To</span>
                            <span className="text-zinc-400 font-bold">{customerInfo.name}</span>
                        </div>
                        <div className="text-right leading-relaxed mb-3 italic">{customerInfo.address}</div>
                        <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                            <span className="font-extrabold opacity-50 uppercase tracking-[0.1em] text-[9px]">Net Payable</span>
                            <span className="text-primary text-sm font-extrabold">₹{cartTotal}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="flex-1 text-zinc-500 hover:text-white py-3 font-bold text-xs uppercase tracking-widest transition-colors">← Details</button>
                        <button
                            onClick={placeOrder}
                            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" /></svg>
                            Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
