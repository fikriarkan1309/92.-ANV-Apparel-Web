import { createClient } from '@supabase/supabase-js';
import { Order } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

// Initialize the Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * SQL Schema for Supabase:
 * 
 * create table orders (
 *   id text primary key,
 *   "customerName" text not null,
 *   "teamName" text not null,
 *   "contactNumber" text not null,
 *   "orderType" text not null,
 *   quantity integer not null,
 *   "totalPrice" numeric not null,
 *   status text not null,
 *   "paymentStatus" text not null,
 *   "shippingAddress" text not null,
 *   resi text,
 *   "courierName" text,
 *   roster jsonb not null default '[]'::jsonb,
 *   "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
 *   "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Read/Write for anyone (or secure with RLS as needed)
 * alter table orders enable row level security;
 * create policy "Allow public read-write for demo" on orders for all using (true) with check (true);
 */

export async function fetchSupabaseOrders(): Promise<Order[] | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('updatedAt', { ascending: false });
      
    if (error) throw error;
    return (data as any[])?.map(row => ({
      id: row.id,
      customerName: row.customerName,
      teamName: row.teamName,
      contactNumber: row.contactNumber,
      orderType: row.orderType,
      quantity: row.quantity,
      totalPrice: Number(row.totalPrice),
      status: row.status,
      paymentStatus: row.paymentStatus,
      roster: row.roster || [],
      shippingAddress: row.shippingAddress,
      resi: row.resi || undefined,
      courierName: row.courierName || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) || [];
  } catch (err) {
    console.warn('Graceful Supabase fallback: error fetching orders, using cache/mock.', err);
    return null;
  }
}

export async function saveSupabaseOrder(order: Order): Promise<boolean> {
  if (!supabase) return false;

  try {
    const dbPayload = {
      id: order.id,
      customerName: order.customerName,
      teamName: order.teamName,
      contactNumber: order.contactNumber,
      orderType: order.orderType,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      roster: order.roster,
      shippingAddress: order.shippingAddress,
      resi: order.resi || null,
      courierName: order.courierName || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('orders')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Graceful Supabase warning: error saving order.', err);
    return false;
  }
}

export async function deleteSupabaseOrder(id: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Graceful Supabase warning: error deleting order.', err);
    return false;
  }
}
