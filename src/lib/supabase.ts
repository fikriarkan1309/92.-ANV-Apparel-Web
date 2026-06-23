import { createClient } from '@supabase/supabase-js';
import { Order } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

// Initialize the Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

console.log('[Supabase Diagnostic Initialization]', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  isConfigured: !!isSupabaseConfigured,
  urlSample: supabaseUrl ? supabaseUrl.substring(0, 25) + '...' : ''
});

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
    // 1. Try selecting with 'updated_at' ordering
    let result = await supabase
      .from('orders')
      .select('*')
      .order('updated_at', { ascending: false });
      
    let data = result.data;
    let error = result.error;
    
    // 2. If that fails, try with 'updatedAt' ordering
    if (error) {
      const res = await supabase
        .from('orders')
        .select('*')
        .order('updatedAt', { ascending: false });
      data = res.data;
      error = res.error;
    }
    
    // 3. If that still fails, try plain select with no ordering (client can sort)
    if (error) {
      const res = await supabase
        .from('orders')
        .select('*');
      data = res.data;
      error = res.error;
    }
    
    if (error) throw error;
    if (!data) return [];

    // Sort manually by updated time if we had to fall back to plain select
    const mapped = (data as any[])?.map(row => {
      const id = row.id;
      const customerName = row.customer_name || row.customerName || '';
      const teamName = row.team_name || row.teamName || '';
      const contactNumber = row.phone || row.contact_number || row.contactNumber || '';
      const orderType = row.order_type || row.orderType || 'Jersey Futsal';
      const quantity = row.quantity !== undefined ? row.quantity : 1;
      const totalPrice = Number(row.total_price || row.totalPrice || 0);
      const status = row.status || 'Antrian Desain';
      const paymentStatus = row.payment_status || row.paymentStatus || 'Belum DP';
      const shippingAddress = row.shipping_address || row.shippingAddress || '';
      const resi = row.resi || undefined;
      const courierName = row.courier_name || row.courierName || undefined;
      const createdAt = row.created_at || row.createdAt || new Date().toISOString();
      const updatedAt = row.updated_at || row.updatedAt || new Date().toISOString();
      const roster = row.roster || [];

      return {
        id,
        customerName,
        teamName,
        contactNumber,
        orderType,
        quantity,
        totalPrice,
        status,
        paymentStatus,
        shippingAddress,
        resi,
        courierName,
        createdAt,
        updatedAt,
        roster
      };
    }) || [];

    // Sort descending by updatedAt
    return mapped.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.warn('Graceful Supabase fallback: error fetching orders, using cache/mock.', err);
    return null;
  }
}

// Self-healing recursive upsert helper to handle missing/different columns in the database
async function upsertWithFallback(payload: any, attempt: number = 0): Promise<boolean> {
  if (!supabase) return false;
  if (attempt > 15) return false; // Prevent infinite loops
  if (Object.keys(payload).length <= 1 && !payload.id) return false; // If only id or empty, stop
  
  try {
    const { error } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' });
      
    if (!error) return true;
    
    console.error(`[Supabase Error] Upsert attempt ${attempt} failed:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payloadKeys: Object.keys(payload)
    });

    if (error.message && error.message.toLowerCase().includes('row-level security')) {
      console.error('👉 Supabase RLS (Row Level Security) is ACTIVE but fails to find an ALLOW POLICY. Please enable public INSERT operations on your "orders" table.');
    }
    
    // Check for undefined column error
    // Code 42703 is PostgreSQL for undefined_column status
    const isUndefinedColumn = error.code === '42703' || 
      (error.message && (
        error.message.toLowerCase().includes('column') || 
        error.message.toLowerCase().includes('property') || 
        error.message.toLowerCase().includes('attribute') || 
        error.message.toLowerCase().includes('schema cache')
      ));

    if (isUndefinedColumn) {
      const msg = error.message.toLowerCase();
      const keys = Object.keys(payload);
      
      // Look for a key in our payload that is mentioned in the error message
      let offendingKey = keys.find(key => msg.includes(key.toLowerCase()));
      
      // If we didn't find one directly, see if we can map Wa/phone/contact related things
      if (!offendingKey) {
        if (msg.includes('phone')) {
          offendingKey = keys.find(k => k === 'phone' || k === 'contact_number' || k === 'contactNumber');
        } else if (msg.includes('contact_number') || msg.includes('contact_num')) {
          offendingKey = keys.find(k => k === 'contact_number' || k === 'phone' || k === 'contactNumber');
        } else if (msg.includes('contactnumber')) {
          offendingKey = keys.find(k => k === 'contactNumber' || k === 'contact_number' || k === 'phone');
        } else if (msg.includes('customer_name') || msg.includes('customername')) {
          offendingKey = keys.find(k => k === 'customer_name' || k === 'customerName');
        } else if (msg.includes('team_name') || msg.includes('teamname')) {
          offendingKey = keys.find(k => k === 'team_name' || k === 'teamName');
        }
      }
      
      if (offendingKey) {
        console.log(`Self-healing Supabase: removing column '${offendingKey}' from insert payload`);
        const newPayload = { ...payload };
        delete newPayload[offendingKey];
        return upsertWithFallback(newPayload, attempt + 1);
      } else {
        // If we can't identify the offending column from the message, try removing keys one by one as fallback
        // Let's remove the first non-id key to make progress
        const firstNonIdKey = keys.find(key => key !== 'id');
        if (firstNonIdKey) {
          console.log(`Self-healing fallback: removing key '${firstNonIdKey}' to attempt recovery`);
          const newPayload = { ...payload };
          delete newPayload[firstNonIdKey];
          return upsertWithFallback(newPayload, attempt + 1);
        }
      }
    }
    
    return false;
  } catch (err) {
    console.warn('Exception during upsertWithFallback:', err);
    return false;
  }
}

export async function saveSupabaseOrder(order: Order): Promise<boolean> {
  if (!supabase) return false;

  // Try snake_case payload first (standard in Supabase custom creations as seen in screenshot)
  const snakePayload: any = {
    id: order.id,
    customer_name: order.customerName,
    team_name: order.teamName,
    phone: order.contactNumber, // map to WA/phone as literally seen in user screenshot!
    contact_number: order.contactNumber, // also map to contact_number in case
    order_type: order.orderType,
    quantity: order.quantity,
    total_price: order.totalPrice,
    status: order.status,
    payment_status: order.paymentStatus,
    shipping_address: order.shippingAddress,
    resi: order.resi || null,
    courier_name: order.courierName || null,
    roster: order.roster,
    created_at: order.createdAt,
    updated_at: order.updatedAt || new Date().toISOString(),
  };

  const successSnake = await upsertWithFallback(snakePayload);
  if (successSnake) {
    return true;
  }

  // Fallback: try camelCase payload (the schema in our comments)
  const camelPayload: any = {
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

  return await upsertWithFallback(camelPayload);
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
