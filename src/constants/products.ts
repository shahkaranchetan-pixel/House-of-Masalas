import { Product } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
    { id: 1, name: "Jeera (Cumin Seeds) A-1 Quality", qty: "1 Kg", price: 400, category: "Masalas" },
    { id: 2, name: "Jeera (Cumin Seeds) A-2 Quality", qty: "1 Kg", price: 350, category: "Masalas" },
    { id: 3, name: "Methi Kuria A-1 Quality", qty: "1 Kg", price: null, category: "Masalas" },
    { id: 4, name: "Dhania Kuria A-1 Quality", qty: "1 Kg", price: null, category: "Masalas" },
    { id: 5, name: "Rai Kuria A-1 Quality", qty: "1 Kg", price: null, category: "Masalas" },
    { id: 6, name: "Variyali (Aniseed) A-1 Quality (Green)", qty: "1 Kg", price: 550, category: "Masalas" },
    { id: 7, name: "Variyali (Aniseed) A-2 Quality", qty: "1 Kg", price: 250, category: "Masalas" },
    { id: 8, name: "Kokam (Lonavala)", qty: "1 Kg", price: 560, category: "Masalas" },
    { id: 9, name: "Rai Barik (Black mustard seed)", qty: "1 Kg", price: 160, category: "Masalas" },
    { id: 10, name: "Rai Jadi (Large) (Black mustard seed)", qty: "1 Kg", price: 130, category: "Masalas" },
    { id: 11, name: "Ajma (Parsley)", qty: "1 Kg", price: 450, category: "Masalas" },
    { id: 12, name: "Kali Mirch (Black peppercorn)", qty: "100 gm", price: 130, category: "Masalas" },
    { id: 13, name: "Desi Gundh", qty: "1 Kg", price: 250, category: "Masalas" },
    { id: 14, name: "Taj/Dalchini (Cinnamon)", qty: "100 gm", price: 40, category: "Masalas" },
    { id: 15, name: "Taj/Dalchini (Cinnamon) -Cigarette", qty: "100 gm", price: 70, category: "Masalas" },
    { id: 16, name: "Lavang (Cloves) (A-1 Quality)", qty: "100 gm", price: 140, category: "Masalas" },
    { id: 17, name: "Oregano", qty: "250 gm", price: 90, category: "Masalas" },
    { id: 18, name: "Chilly Flakes", qty: "250 gm", price: 100, category: "Masalas" },
    { id: 19, name: "Methi", qty: "1 Kg", price: 150, category: "Masalas" },
    { id: 20, name: "White Sesame(Til) (A-1 Quality)", qty: "1 Kg", price: 280, category: "Masalas" },
    { id: 21, name: "White Sesame(Til) (A-2 Quality)", qty: "1 Kg", price: 230, category: "Masalas" },
    { id: 22, name: "Elaichi (Green Cardamom) 8mm", qty: "100 gm", price: 410, category: "Masalas" },
    { id: 23, name: "Elaichi (Green Cardamom)", qty: "100 gm", price: 340, category: "Masalas" },
    { id: 24, name: "Tej Patta", qty: "100 gm", price: 30, category: "Masalas" },
    { id: 101, name: "Kashmiri Mirch (A-1 Quality)", qty: "1 Kg", price: 640, category: "Masala Powders" },
    { id: 102, name: "Reshampatti (A-1 Quality)", qty: "1 Kg", price: 380, category: "Masala Powders" },
    { id: 103, name: "Bedgi Chilli Powder", qty: "1 Kg", price: 470, category: "Masala Powders" },
    { id: 104, name: "Turmeric -Haldi (A-1 Quality) (Salem)", qty: "1 Kg", price: 290, category: "Masala Powders" },
    { id: 105, name: "Dhana Jeera (A-1 Quality)", qty: "1 Kg", price: 310, category: "Masala Powders" },
    { id: 106, name: "Dhana Jeera (A-2 Quality)", qty: "1 Kg", price: 250, category: "Masala Powders" },
    { id: 107, name: "Bedki (Khandala)", qty: "1 Kg", price: 350, category: "Masala Powders" },
    { id: 108, name: "Bedki Mirch Powder", qty: "1 Kg", price: 290, category: "Masala Powders" },
    { id: 109, name: "Malavni Mirch", qty: "1 Kg", price: 340, category: "Masala Powders" },
    { id: 110, name: "Vandevi Hing", qty: "100 GM", price: 110, category: "Masala Powders" },
    { id: 111, name: "Vandevi Hing (Yellow Hing)", qty: "100 GM", price: 50, category: "Masala Powders" },
    { id: 112, name: "Garam Masala (A-1 Quality)", qty: "1 Kg", price: 350, category: "Masala Powders" },
    { id: 113, name: "Garam Masala (A-2 Quality)", qty: "1 Kg", price: 250, category: "Masala Powders" },
    { id: 114, name: "Suth Powder", qty: "1 Kg", price: 550, category: "Masala Powders" },
    { id: 115, name: "Ganthoda Powder (A-1 Quality)", qty: "1 Kg", price: 700, category: "Masala Powders" },
    { id: 116, name: "Amchur Powder (Special)", qty: "1 Kg", price: 340, category: "Masala Powders" },
];

export const APP_CONFIG = {
    UPI_ID: "belachetanshah1@okhdfcbank",
    PHONE: "9323982590",
    OWNER: "House of Masalas",
    ADMIN_PASSWORD: "cs123"
};

export const SPICE_EMOJIS: Record<string, string> = {
    "Jeera": "🌿", "Methi": "🍃", "Dhania": "🌱", "Rai": "⚫",
    "Variyali": "🌾", "Kokam": "🫐", "Ajma": "🌿", "Kali Mirch": "⚫",
    "Desi Gundh": "🟤", "Taj": "🟤", "Lavang": "🤎", "Oregano": "🌿",
    "Chilly": "🌶️", "Sesame": "⚪", "Elaichi": "💚", "Tej Patta": "🍂",
    "Kashmiri": "🌶️", "Reshampatti": "🌶️", "Bedgi": "🌶️", "Turmeric": "🟡",
    "Haldi": "🟡", "Dhana Jeera": "🟢", "Malavni": "🌶️", "Hing": "🟤",
    "Garam Masala": "🎭", "Suth": "🟤", "Ganthoda": "🔶", "Amchur": "🟡",
    "Bedki": "🌶️"
};
