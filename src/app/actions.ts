'use server';

import { Pool } from 'pg';
import { Product, Promotion, Order, CustomerInfo, PaymentMethod } from '../types';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Fetch initial global data
export async function getMasalaData() {
  const client = await pool.connect();
  try {
    const { rows: products } = await client.query<Product>('SELECT * FROM products ORDER BY id ASC');
    const { rows: promos } = await client.query<any>(`
      SELECT 
        id, text, code, 
        is_active as "isActive", 
        type, 
        CAST(value AS float) as value, 
        scope, 
        target_category as "targetCategory", 
        CAST(min_order_value AS float) as "minOrderValue", 
        expires_at as "expiresAt"
      FROM promotions 
      ORDER BY id DESC
    `);
    const { rows: orders } = await client.query<any>(`
      SELECT 
        id, 
        date, 
        customer_name as "customerName", 
        customer_phone as "customerPhone", 
        customer_address as "customerAddress",
        items, 
        CAST(total AS float) as total, 
        CAST(original_total AS float) as "originalTotal", 
        CAST(discount_amount AS float) as "discountAmount", 
        applied_promo_code as "appliedPromoCode", 
        payment_method as "paymentMethod"
      FROM orders 
      ORDER BY date DESC
    `);

    // Map rows to interfaces correctly
    const formattedOrders: Order[] = orders.map(o => ({
      id: o.id,
      date: o.date.toISOString(),
      customer: {
        name: o.customerName,
        phone: o.customerPhone,
        address: o.customerAddress
      },
      items: Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]'),
      total: o.total,
      originalTotal: o.originalTotal,
      discountAmount: o.discountAmount,
      appliedPromoCode: o.appliedPromoCode,
      paymentMethod: o.paymentMethod
    }));

    return { products, promos, orders: formattedOrders };
  } catch (error) {
    console.error('Database fetch error:', error);
    return { products: [], promos: [], orders: [] };
  } finally {
    client.release();
  }
}

// ── PRODUCT ACTIONS ──
export async function addProduct(p: Product) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO products (name, qty, price, category) VALUES ($1, $2, $3, $4)',
      [p.name, p.qty, p.price, p.category]
    );
    revalidatePath('/');
  } finally {
    client.release();
  }
}

export async function updateProduct(p: Product) {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE products SET name = $1, qty = $2, price = $3, category = $4 WHERE id = $5',
      [p.name, p.qty, p.price, p.category, p.id]
    );
    revalidatePath('/');
  } finally {
    client.release();
  }
}

export async function deleteProduct(id: number) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    revalidatePath('/');
  } finally {
    client.release();
  }
}

// ── PROMOTION ACTIONS ──
export async function addPromotion(p: Promotion) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO promotions (text, code, is_active, type, value, scope, target_category, min_order_value, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [p.text, p.code, p.isActive, p.type, p.value, p.scope, p.targetCategory, p.minOrderValue, p.expiresAt]
    );
    revalidatePath('/');
  } finally {
    client.release();
  }
}

export async function updatePromotion(p: Promotion) {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE promotions SET text = $1, code = $2, is_active = $3, type = $4, value = $5, scope = $6, target_category = $7, min_order_value = $8, expires_at = $9 WHERE id = $10',
      [p.text, p.code, p.isActive, p.type, p.value, p.scope, p.targetCategory, p.minOrderValue, p.expiresAt, p.id]
    );
    revalidatePath('/');
  } finally {
    client.release();
  }
}

export async function deletePromotion(id: number) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM promotions WHERE id = $1', [id]);
    revalidatePath('/');
  } finally {
    client.release();
  }
}

// ── ORDER ACTION ──
export async function storeOrder(order: Order) {
  const client = await pool.connect();
  try {
    const itemsJson = JSON.stringify(order.items);
    await client.query(
      `INSERT INTO orders (id, date, customer_name, customer_phone, customer_address, items, total, original_total, discount_amount, applied_promo_code, payment_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        order.id, 
        order.date, 
        order.customer.name, 
        order.customer.phone, 
        order.customer.address, 
        itemsJson, 
        order.total, 
        order.originalTotal, 
        order.discountAmount, 
        order.applied_promo_code, 
        order.paymentMethod
      ]
    );
    revalidatePath('/');
  } finally {
    client.release();
  }
}
