export interface Product {
    id: number;
    name: string;
    qty: string;
    price: number | null;
    category: "Masalas" | "Masala Powders";
}

export interface CartItem extends Product {
    qty_in_cart: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
}

export type ViewState = "shop" | "checkout" | "admin";
export type DisplayMode = "list" | "icon";
export type PaymentMethod = "upi" | "cash";

export interface Order {
    id: string;
    date: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
    originalTotal: number;
    discountAmount: number;
    appliedPromoCode: string | null;
    paymentMethod: PaymentMethod;
}

export type PromotionType = "percentage" | "fixed";
export type PromotionScope = "all" | "category";

export interface Promotion {
    id: number;
    text: string;
    code: string;
    isActive: boolean;
    type: PromotionType;
    value: number;
    scope: PromotionScope;
    targetCategory?: string;
    minOrderValue?: number;
    expiresAt?: string;
}

export interface PromotionWithCalc extends Promotion {
    calculatedDiscount: number;
    amountNeeded: number;
}

