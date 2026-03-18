"use client";

import React, { useState } from 'react';
import { CartItem, CustomerInfo, PaymentMethod, PromotionWithCalc } from '../types';
import { getSpiceEmoji } from '../utils/emoji';
import { APP_CONFIG } from '../constants/products';

interface CheckoutFormProps {
    cart: CartItem[];
    cartTotal: number;
    subtotal: number;
    discountAmount: number;
    appliedPromoCode: string | null;
    allValidPromos: PromotionWithCalc[];
    allLockedPromos: PromotionWithCalc[];
    bestPromoId: number | null;
    selectedPromoId: number | null;
    onSelectPromo: (id: number | null) => void;
    onApplyCode: (code: string) => { success: boolean; error?: string };
    onUpdateQty: (id: number, delta: number) => void;
    onRemoveItem: (id: number) => void;
    onBack: () => void;
    onOrderPlaced: (ref: string, customer: CustomerInfo, total: number, paymentMethod: PaymentMethod) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
    cart,
    cartTotal,
    subtotal,
    discountAmount,
    appliedPromoCode,
    allValidPromos,
    allLockedPromos,
    bestPromoId,
    selectedPromoId,
    onSelectPromo,
    onApplyCode,
    onUpdateQty,
    onRemoveItem,
    onBack,
    onOrderPlaced,
}) => {
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "", address: "" });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [manualCode, setManualCode] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoSuccess, setPromoSuccess] = useState("");
    const orderRef = useState(() => "ORD" + Date.now().toString().slice(-6))[0];

    const placeOrder = () => {
        const itemLines = cart.map(item =>
            `  • ${item.name} (${item.qty}) x${item.qty_in_cart} = ₹${(item.price || 0) * item.qty_in_cart}`
        ).join("\n");

        const message =
            `🌶️ *NEW ORDER — House of Masalas*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 *Order Ref:* ${orderRef}\n\n` +
            `👤 *Customer Details*\n` +
            `  Name: ${customerInfo.name}\n` +
            `  Phone: ${customerInfo.phone}\n` +
            `  Address: ${customerInfo.address}\n\n` +
            `🛒 *Items Ordered*\n${itemLines}\n\n` +
            `💰 *Subtotal: ₹${subtotal}*\n` +
            `🎁 *Promo Applied:* ${appliedPromoCode || "None"}\n` +
            `✨ *Savings: ₹${discountAmount}*\n` +
            `✅ *Final Total: ₹${cartTotal}*\n` +
            `💳 Payment: ${paymentMethod === "upi" ? "UPI (online)" : "Cash on Delivery"}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Please confirm & arrange delivery 🚚`;

        const whatsappURL = `https://wa.me/91${APP_CONFIG.PHONE}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank");
        onOrderPlaced(orderRef, customerInfo, cartTotal, paymentMethod);
    };

    // FIX Bug 8: Detect when the selected promo is no longer valid (cart dropped below minimum)
    const selectedPromoIsLocked = selectedPromoId
        ? allLockedPromos.some(p => p.id === selectedPromoId)
        : false;

    const selectedLockedPromo = selectedPromoIsLocked
        ? allLockedPromos.find(p => p.id === selectedPromoId)
        : null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <button onClick={onBack} className="group text-zinc-500 hover:text-primary flex items-center gap-3 text-xs font-black mb-12 transition-all uppercase tracking-[0.3em]">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </div>
                Back to Shop
            </button>

            <div className="flex flex-col mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="h-[1px] w-8 bg-primary/40" />
                    <span className="text-xs text-primary font-black uppercase tracking-[0.4em]">Checkout</span>
                </div>
                <h2 className="text-4xl text-white font-serif italic">
                    Place Your <span className="text-primary/30 not-italic font-sans">Order</span>
                </h2>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-4 mb-20">
                {[{ n: 1, label: "Review" }, { n: 2, label: "Shipping" }, { n: 3, label: "Payment" }].map(({ n, label }) => (
                    <div key={n} className="relative group cursor-pointer" onClick={() => step > n && setStep(n)}>
                        <div className={`h-1.5 rounded-full mb-3 transition-all duration-1000 ${step >= n ? "bg-primary shadow-[0_0_15px_var(--primary-glow)]" : "bg-zinc-800"}`} />
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black font-mono ${step >= n ? "text-primary" : "text-zinc-700"}`}>0{n}</span>
                            <span className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black ${step >= n ? "text-white" : "text-zinc-700"}`}>{label === "Review" ? "Review Items" : label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                    {/* Cart Items */}
                    <div className="space-y-6">
                        <label className="text-[11px] sm:text-xs text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Selected Items</label>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="group flex items-center gap-5 p-4 sm:p-5 rounded-3xl glass-card reveal-scale">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:rotate-12 transition-transform">
                                        {getSpiceEmoji(item.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight">{item.name}</div>
                                        <div className="text-xs text-primary font-black uppercase tracking-widest">{item.qty} Packet</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center bg-zinc-950 p-1.5 rounded-xl border border-white/5">
                                            <button onClick={() => onUpdateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-primary hover:text-white hover:bg-white/5 rounded-lg transition-all text-xl font-bold">−</button>
                                            <span className="w-10 text-center text-base font-black text-white">{item.qty_in_cart}</span>
                                            <button onClick={() => onUpdateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center text-primary hover:text-white hover:bg-white/5 rounded-lg transition-all text-xl font-bold">+</button>
                                        </div>
                                        <span className="text-base font-bold text-zinc-500">₹{(item.price || 0) * item.qty_in_cart}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Coupon Section */}
                        <div className="space-y-5">
                            <label className="text-[11px] sm:text-xs text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Promo Code</label>

                            {/* Manual Entry */}
                            <div className="relative group">
                                <input
                                    value={manualCode}
                                    onChange={e => {
                                        setManualCode(e.target.value.toUpperCase());
                                        setPromoError("");
                                        setPromoSuccess("");
                                    }}
                                    placeholder="Enter Code"
                                    className="input-premium font-mono tracking-widest text-base py-5"
                                />
                                <button
                                    onClick={() => {
                                        if (!manualCode.trim()) return;
                                        const result = onApplyCode(manualCode);
                                        if (result.success) {
                                            setPromoSuccess("Code activated! ✨");
                                            setManualCode("");
                                            setPromoError("");
                                        } else {
                                            setPromoError(result.error || "Invalid code.");
                                            setPromoSuccess("");
                                        }
                                    }}
                                    className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-hover text-black font-black text-xs px-6 rounded-xl uppercase tracking-[0.2em] transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                            {promoError && <p className="text-amber-400 text-[11px] font-black uppercase tracking-wider ml-2 animate-pulse">{promoError}</p>}
                            {promoSuccess && <p className="text-emerald-500 text-[11px] font-black uppercase tracking-wider ml-2 animate-bounce">{promoSuccess}</p>}

                            {/* FIX Bug 8: Warning when selected promo is now below minimum */}
                            {selectedLockedPromo && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 animate-in fade-in duration-500">
                                    <span className="text-amber-400 text-lg shrink-0">⚠️</span>
                                    <div>
                                        <p className="text-amber-400 text-xs font-black uppercase tracking-wider">Code Not Yet Active</p>
                                        <p className="text-zinc-400 text-[11px] mt-1">
                                            Add <span className="text-white font-bold">₹{selectedLockedPromo.amountNeeded}</span> more to unlock <span className="text-primary font-mono">{selectedLockedPromo.code}</span>
                                        </p>
                                        {/* FIX R5: Progress bar */}
                                        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.min(100, Math.max(5, 100 - (selectedLockedPromo.amountNeeded / (selectedLockedPromo.minOrderValue || 1)) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Available (Valid) Promos */}
                            {allValidPromos.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <label className="text-[11px] text-zinc-700 uppercase tracking-[0.3em] font-black px-1">Available Offers</label>
                                    <div className="space-y-3">
                                        {allValidPromos.map(promo => {
                                            const isSelected = selectedPromoId === promo.id;
                                            return (
                                                <button
                                                    key={promo.id}
                                                    onClick={() => onSelectPromo(promo.id)}
                                                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-500 relative overflow-hidden group
                                                        ${isSelected
                                                            ? "border-primary/50 bg-primary/5 shadow-inner shadow-primary/10"
                                                            : "border-white/5 bg-zinc-950/50 hover:border-white/20"}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono text-sm font-black text-white tracking-[0.2em]">{promo.code}</span>
                                                                {promo.id === bestPromoId && (
                                                                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase">Best Deal</span>
                                                                )}
                                                                {isSelected && (
                                                                    <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">Applied</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">{promo.text}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="text-primary font-black text-base tracking-tighter">−₹{promo.calculatedDiscount}</div>
                                                            {/* Deselect option */}
                                                            {isSelected && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onSelectPromo(null); }}
                                                                    className="text-[8px] text-zinc-600 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Locked Promos (add more to unlock) */}
                            {allLockedPromos.filter(p => p.id !== selectedPromoId).length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] text-zinc-800 uppercase tracking-[0.3em] font-black px-1">Locked Offers</label>
                                    {allLockedPromos.filter(p => p.id !== selectedPromoId).map(promo => (
                                        <div key={promo.id} className="p-4 rounded-2xl border border-white/5 bg-zinc-950/30 opacity-60">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-black text-zinc-500 tracking-widest">{promo.code}</span>
                                                        <span className="bg-zinc-800 text-zinc-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-zinc-700 uppercase">Locked</span>
                                                    </div>
                                                    <div className="text-[9px] text-zinc-700 font-bold mt-1 uppercase">
                                                        {/* FIX R5: Show exactly how much is needed */}
                                                        Add ₹{promo.amountNeeded} more to unlock
                                                    </div>
                                                </div>
                                                <span className="text-zinc-700 text-xs font-black">
                                                    {promo.type === "percentage" ? `${promo.value}%` : `₹${promo.value}`} off
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Invoice Summary */}
                        <div className="space-y-5">
                            <label className="text-[11px] sm:text-xs text-zinc-600 uppercase tracking-[0.4em] font-black px-1">Order Summary</label>
                            <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                <div className="flex justify-between items-center text-zinc-500 font-bold">
                                    <span className="text-xs uppercase tracking-widest">Subtotal</span>
                                    <span className="text-lg">₹{subtotal}</span>
                                </div>

                                {/* FIX Bug 1: Only show discount when explicitly selected */}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center py-5 border-y border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Discount</span>
                                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest font-mono mt-1">CODE: {appliedPromoCode}</span>
                                        </div>
                                        <span className="text-xl font-bold text-emerald-500 shrink-0">−₹{discountAmount}</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pt-4">
                                    <span className="text-[11px] font-black text-primary/50 uppercase tracking-[0.4em]">Final Total</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-5xl font-bold text-luxury-gold tracking-tighter font-serif leading-none">₹{cartTotal}</span>
                                        <span className="text-xs text-zinc-700 font-black uppercase tracking-widest mb-1">Payable</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full btn-primary-luxury py-5 mt-6 text-sm"
                                >
                                    Proceed to Shipping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto">
                    <div className="glass-card rounded-[2.5rem] p-10 space-y-8">
                        <div className="space-y-6">
                            {([["name", "Your Name", "text", "e.g. Ramesh Patel"], ["phone", "Phone Number", "tel", "+91 00000 00000"], ["address", "Delivery Address", "textarea", "Flat, Building, Street, Pincode"]] as const).map(([field, label, type, placeholder]) => (
                                <div key={field} className="space-y-3">
                                    <label className="text-xs text-primary/60 uppercase tracking-[0.3em] font-black px-1">{label}</label>
                                    {type === "textarea" ? (
                                        <textarea
                                            rows={2}
                                            value={customerInfo[field]}
                                            onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="input-premium resize-none h-32"
                                        />
                                    ) : (
                                        <input
                                            type={type}
                                            value={customerInfo[field]}
                                            onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="input-premium"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(1)} className="btn-secondary-luxury flex-1">Back</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                                className="btn-primary-luxury flex-[2] disabled:opacity-30 disabled:grayscale transition-all"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto">
                    <div className="glass-card rounded-[2.5rem] p-10 space-y-10">
                        <div className="flex gap-4">
                            {([["cash", "Cash on Delivery", "💵"], ["upi", "UPI Payment", "📱"]] as const).map(([method, label, icon]) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method as PaymentMethod)}
                                    className={`flex-1 p-6 rounded-3xl border transition-all duration-700 flex flex-col items-center gap-3
                                        ${paymentMethod === method
                                            ? "border-primary bg-primary/10 premium-glow text-primary"
                                            : "border-white/5 bg-zinc-950/50 text-zinc-600 hover:text-zinc-400"}`}
                                >
                                    <span className="text-3xl">{icon}</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-zinc-950/80 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 shimmer-bg opacity-30" />

                            {paymentMethod === "upi" ? (
                                <div className="flex flex-col items-center relative z-10">
                                    <span className="text-xs text-primary font-black uppercase tracking-[0.4em] mb-6">Secure UPI Payment</span>
                                    
                                    <div className="w-full bg-zinc-900 border border-primary/30 rounded-2xl px-4 py-4 mb-6 flex flex-col items-center">
                                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2 text-center">UPI ID</span>
                                        <span className="text-sm font-bold text-white tracking-widest font-mono text-center break-all select-all">{APP_CONFIG.UPI_ID}</span>
                                    </div>
                                    <div className="w-full space-y-3">
                                        <a 
                                            href={`upi://pay?pa=${APP_CONFIG.UPI_ID}&pn=${encodeURIComponent(APP_CONFIG.OWNER)}&am=${cartTotal}&cu=INR`}
                                            className="block w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg active:scale-95 transition-all"
                                        >
                                            Pay via Google Pay / UPI App
                                        </a>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest text-center leading-tight">
                                            Recommended for Mobile Purchases
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <span className="text-3xl">🚚</span>
                                    </div>
                                    <h4 className="text-2xl font-serif italic text-white mb-2">Home Delivery</h4>
                                    <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em]">Pay cash at the time of delivery</p>
                                </div>
                            )}
                        </div>

                        {/* Order summary before placing */}
                        <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-6 space-y-2">
                            <div className="flex justify-between text-zinc-500 text-xs">
                                <span>Subtotal</span><span>₹{subtotal}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-500 text-xs font-bold">
                                    <span>Discount ({appliedPromoCode})</span><span>−₹{discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-white font-bold text-base border-t border-white/5 pt-2 mt-2">
                                <span>Total</span><span className="text-luxury-gold">₹{cartTotal}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="btn-secondary-luxury flex-1">Back</button>
                            <button
                                onClick={placeOrder}
                                className="btn-primary-luxury flex-[2] flex items-center justify-center gap-3 bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
