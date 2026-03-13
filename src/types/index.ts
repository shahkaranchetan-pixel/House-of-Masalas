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
    paymentMethod: PaymentMethod;
}

export interface Promotion {
    id: number;
    text: string;
    isActive: boolean;
}
