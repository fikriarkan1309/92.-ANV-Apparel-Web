/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Settings, Search, ArrowRight, CheckCircle, RefreshCw, Filter, 
  Trash2, Plus, MessageSquare, Clipboard, MapPin, DollarSign, 
  Layers, User, Users, Calendar, AlertCircle, Edit, Save, X
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { showToast } from '../utils/toast';
import { saveSupabaseOrder, deleteSupabaseOrder } from '../lib/supabase';

interface AdminDashboardProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  isSupabaseConnected?: boolean;
  isSanityConnected?: boolean;
}

export default function AdminDashboard({ orders, setOrders, isSupabaseConnected, isSanityConnected }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');

  // Manual Order Creation Fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'Jersey Futsal' | 'Jersey Basket' | 'Jersey Voli' | 'Jersey Esport' | 'Jaket/Hoodie'>('Jersey Futsal');
  const [newQty, setNewQty] = useState('12');
  const [newPrice, setNewPrice] = useState('1500000');
  const [newAddress, setNewAddress] = useState('');

  // Editing Order State
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus>('Antrian Desain');
  const [editPayment, setEditPayment] = useState<'Belum DP' | 'DP 50%' | 'Lunas'>('Belum DP');
  const [editResi, setEditResi] = useState('');
  const [editCourier, setEditCourier] = useState('J&T');

  const statusList: OrderStatus[] = [
    'Antrian Desain',
    'Persetujuan Desain',
    'Proses Sublimasi',
    'Press & Jahit',
    'Quality Control',
    'Siap Dikirim',
    'Proses Pengiriman',
    'Selesai'
  ];

  // Calculations for stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Lunas' ? o.totalPrice : o.paymentStatus === 'DP 50%' ? o.totalPrice * 0.5 : 0), 0);
  const activeJobs = orders.filter(o => o.status !== 'Selesai').length;
  const pendingApprovals = orders.filter(o => o.status === 'Persetujuan Desain').length;
  const completedJobs = orders.filter(o => o.status === 'Selesai').length;

  const handleUpdateStatusAndPayment = (
    orderId: string, 
    status: OrderStatus, 
    payment: 'Belum DP' | 'DP 50%' | 'Lunas',
    resi?: string,
    courierName?: string
  ) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          paymentStatus: payment,
          resi: resi !== undefined ? resi : o.resi,
          courierName: courierName !== undefined ? courierName : o.courierName,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('anv_orders', JSON.stringify(updated));
    setEditingOrderId(null);

    // Sync status change to Supabase if connected
    const changedOrder = updated.find(o => o.id === orderId);
    if (changedOrder && isSupabaseConnected) {
      saveSupabaseOrder(changedOrder).then((success) => {
        if (success) {
          showToast(`Sikronisasi status transaksi ${orderId} ke Supabase berhasil!`, 'success');
        } else {
          showToast(`Sinkronisasi database Supabase gagal, perubahan tersimpan lokal.`, 'info');
        }
      });
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newTeamName || !newContact || !newAddress) {
      showToast('Mohon isi seluruh bidang formulir admin.', 'error');
      return;
    }

    const randomID = `ANV-${Math.floor(1000 + Math.random() * 9000)}`;
    const freshOrder: Order = {
      id: randomID,
      customerName: newCustName,
      teamName: newTeamName,
      contactNumber: newContact.replace(/[^0-9]/g, ''),
      orderType: newType,
      quantity: parseInt(newQty) || 12,
      totalPrice: parseInt(newPrice) || 1500000,
      status: 'Antrian Desain',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'Belum DP',
      shippingAddress: newAddress,
      roster: [
        { id: '1', name: 'Contoh Pemain S', number: '10', size: 'S' },
        { id: '2', name: 'Contoh Pemain M', number: '17', size: 'M' },
      ]
    };

    const updated = [freshOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('anv_orders', JSON.stringify(updated));

    // Sync dynamic insert to Supabase if connected
    if (isSupabaseConnected) {
      saveSupabaseOrder(freshOrder).then((success) => {
        if (success) {
          showToast(`Transaksi ${freshOrder.id} berhasil tersimpan ke Supabase!`, 'success');
        } else {
          showToast(`Gagal sinkron transaksi baru ke database Supabase.`, 'info');
        }
      });
    }

    // Reset Form
    setNewCustName('');
    setNewTeamName('');
    setNewContact('');
    setNewQty('12');
    setNewPrice('1500000');
    setNewAddress('');
    setShowAddForm(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Hapus transaksi ${orderId} dari database ANV permanen?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem('anv_orders', JSON.stringify(updated));

      // Sync delete to Supabase if connected
      if (isSupabaseConnected) {
        deleteSupabaseOrder(orderId).then((success) => {
          if (success) {
            showToast(`Transaksi ${orderId} berhasil dihapus dari Supabase.`, 'success');
          } else {
            showToast(`Gagal menghapus transaksi dari database Supabase.`, 'info');
          }
        });
      }
    }
  };

  // Generate automated message links for Whatsapp status alert forwarding
  const handleTriggerStatusWhatsApp = (order: Order) => {
    const timeText = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Custom friendly template according to the requested status mapping
    const text = [
      `*UPDATE NOTIFIKASI PRODUKSI ANV APPAREL*`,
      `===============================`,
      `Halo Kak *${order.customerName}* dari *${order.teamName}*,`,
      `Ada update terbaru mengenai pengerjaan jersey tim Anda per tanggal *${timeText}*:`,
      ``,
      `📌 *KODE PESANAN:* ${order.id}`,
      `📦 *PROD:* ${order.orderType} (${order.quantity} pcs)`,
      `🟢 *STATUS TERKINI:* *[ ${order.status.toUpperCase()} ]*`,
      `💳 *PEMBAYARAN:* ${order.paymentStatus}`,
      ``,
      `*Keterangan Progress:*`,
      order.status === 'Antrian Desain' ? 'Saat ini desainer layout kami sedang menyusun pola printing sesuai mockup.' :
      order.status === 'Persetujuan Desain' ? 'Mockup layout siap didiskusikan! Mohon dicek file gambar berikut untuk ACC / revisi.' :
      order.status === 'Proses Sublimasi' ? 'Bahan kain saat ini sedang dalam proses pemanggangan transfer paper sublim Mimaki.' :
      order.status === 'Press & Jahit' ? 'Hasil print sublimasi siap dipotong & masuk penjahitan rante obras presisi.' :
      order.status === 'Quality Control' ? 'Jersey Anda sudah selesai dijahit dan berada dalam pengecekan benang serta size oleh QC ANV.' :
      order.status === 'Siap Dikirim' ? 'Jersey kebanggaan tim selesai packing rapi! Siap dikirim ke alamat tujuan setelah verifikasi admin.' :
      order.status === 'Proses Pengiriman' ? 'Jersey kebanggaan tim sedang dalam proses pengiriman oleh kurir ekspedisi ke alamat tujuan.' :
      'Seluruh proses selesai! Paket pesanan jersey telah dikirim aman / berhasil serah terima.',
      ``,
      `Terima kasih banyak telah menjadi bagian dari kualitas sirkulasi dan detail terbaik ANV Apparel. Pantau terus progress Anda di web kami!`,
      `https://anvapparel.com`
    ].join('\n');

    const cleanMsg = encodeURIComponent(text);
    // target phone number
    const targetPhone = order.contactNumber.startsWith('0') 
      ? `62${order.contactNumber.substring(1)}` 
      : order.contactNumber;

    window.open(`https://wa.me/${targetPhone}?text=${cleanMsg}`, '_blank');
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || o.orderType === filterType;
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesPayment = filterPayment === 'ALL' || o.paymentStatus === filterPayment;

    return matchesSearch && matchesType && matchesStatus && matchesPayment;
  });

  return (
    <div id="admin-view-root" className="bg-neutral-950 text-white min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* UPPER TITLE ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 mb-8 gap-4">
          <div>
            <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">Workspace Operations</span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Dashboard Kontrol Admin</h1>
            <p className="text-neutral-400 text-xs md:text-sm mt-1">Panel sentral memantau, merubah progress sublimasi, dan mengabarkan status pesanan klien secara real-time.</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-admin-add-order"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-orange-600 hover:bg-orange-550 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/10"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-white stroke-[3px]" />}
              {showAddForm ? 'Tutup Formulir' : 'Daftarkan Pesanan Baru'}
            </button>
            <button
              id="btn-admin-lock"
              onClick={() => {
                localStorage.removeItem('anv_admin_approved');
                window.location.href = window.location.origin + window.location.pathname; // navigate back and drop query
              }}
              className="bg-neutral-900 hover:bg-neutral-800 text-red-500 hover:text-red-400 font-extrabold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all border border-neutral-800"
            >
              <X className="w-4 h-4" />
              <span>Kunci Akses</span>
            </button>
          </div>
        </div>

        {/* DATABASE & CMS INTEGRATION PANEL */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl mb-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <Settings className="w-5 h-5 text-orange-500 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-widest">SINKRONISASI DATABASE & CONTENT MANAGEMENT</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Pantau status sinkronisasi Supabase (transaksi) dan Sanity (CMS konten statis).</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowInstruction(!showInstruction)}
              className="text-[10px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-700 px-3.5 py-2 rounded-xl text-neutral-300 font-mono transition-all shrink-0 cursor-pointer"
            >
              {showInstruction ? 'Sembunyikan Panduan' : 'Lihat Panduan Setup & SQL Schema'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isSupabaseConnected 
                ? 'bg-green-950/20 border-green-800/60 text-green-200' 
                : 'bg-yellow-950/20 border-yellow-800/60 text-yellow-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSupabaseConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-xs font-bold font-mono">SUPABASE (PERSISTENSI DATA)</p>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {isSupabaseConnected 
                      ? 'Terhubung dengan aman! Menghandle data pesanan, nomor resi, dan tabel roster secara real-time.' 
                      : 'Mock Mode (LocalStorage aktif). Setup kredensial VITE_SUPABASE_URL & ANON_KEY untuk mengaktifkan database awan.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isSanityConnected 
                ? 'bg-green-950/20 border-green-800/60 text-green-200' 
                : 'bg-yellow-950/20 border-yellow-800/60 text-yellow-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSanityConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-xs font-bold font-mono">SANITY (CMS CONTENT)</p>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {isSanityConnected 
                      ? 'Terhubung! Menghandle katalog bahan premium, material dryfit, dan portfolio cetakan secara dinamis.' 
                      : 'Mock Mode (File statis aktif). Setup VITE_SANITY_PROJECT_ID & DATASET untuk mengaktifkan edit visual Sanity.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showInstruction && (
            <div className="bg-neutral-950 border border-neutral-850 p-5 rounded-xl text-xs font-mono leading-relaxed text-neutral-300">
              <p className="text-white font-extrabold mb-2 text-sm">🛠️ LANGKAH CEPAT SETUP INTEGRASI AWAN</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-orange-500 font-bold mb-1 col-span-2">1. Setup Database Supabase:</p>
                  <p>Buka konsol Supabase Anda, jalankan skrip SQL berikut di SQL Editor untuk membuat tabel <code className="text-neutral-200 text-xs">orders</code>:</p>
                  <pre className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-[11px] mt-1.5 overflow-x-auto text-neutral-400 select-all font-mono">
{`create table orders (
  id text primary key,
  "customerName" text not null,
  "teamName" text not null,
  "contactNumber" text not null,
  "orderType" text not null,
  quantity integer not null,
  "totalPrice" numeric not null,
  status text not null,
  "paymentStatus" text not null,
  "shippingAddress" text not null,
  resi text,
  "courierName" text,
  roster jsonb not null default '[]'::jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Kebijakan RLS (Row Level Security) agar Client & Admin bisa membaca, mengedit, dan menambah
alter table orders enable row level security;
create policy "Allow public read-write for demo" on orders for all using (true) with check (true);`}
                  </pre>
                </div>

                <div>
                  <p className="text-orange-500 font-bold mb-1">2. Setup Sanity Studio (CMS Konten):</p>
                  <p>Inisialisasi Sanity Studio Anda, lalu tambahkan schema berikut agar struktur datanya sesuai:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-neutral-450 mt-1.5">
                    <li><strong className="text-neutral-300">fabricMaterial</strong>: Berisi <code className="text-orange-400">id</code> (string), <code className="text-orange-400">name</code> (string), <code className="text-orange-400">description</code> (string), <code className="text-orange-400">fullDescription</code> (text), <code className="text-orange-400">characteristics</code> (array), <code className="text-orange-400">image</code> (image), dan <code className="text-orange-400">suitability</code> (string).</li>
                    <li><strong className="text-neutral-300">productCatalog</strong>: Berisi <code className="text-orange-400">id</code>, <code className="text-orange-400">name</code>, <code className="text-orange-400">category</code>, <code className="text-orange-400">image</code>, <code className="text-orange-400">description</code>, dan <code className="text-orange-400">priceEstimate</code>.</li>
                    <li><strong className="text-neutral-300">portfolioItem</strong>: Berisi <code className="text-orange-400">id</code>, <code className="text-orange-400">title</code>, <code className="text-orange-400">category</code>, <code className="text-orange-400">image</code>, <code className="text-orange-400">collarDetail</code>, <code className="text-orange-400">stitchDetail</code>, dan <code className="text-orange-400">sharpnessDetail</code>.</li>
                  </ul>
                </div>

                <div>
                  <p className="text-orange-500 font-bold mb-1">3. Masukkan Kunci Rahasia / Secrets:</p>
                  <p>Setelah database dan CMS siap, konfigurasikan environment variables di berkas <code className="text-neutral-300">.env</code> Anda:</p>
                  <pre className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-[11px] mt-1.5 text-neutral-400 select-all font-mono">
{`VITE_SUPABASE_URL="https://xxx-your-project-xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
VITE_SANITY_PROJECT_ID="your_sanity_project_id"
VITE_SANITY_DATASET="production"`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* METRICS STATS COUNTERS */}
        <div id="admin-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">OMSET BERDASARKAN DP/LUNAS</p>
            <h4 className="text-xl md:text-2xl font-black text-white mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h4>
            <span className="text-[10px] text-green-500 font-bold mt-1 block">✓ Dana Masuk Tersimpan</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">AKIF PROSES PRODUKSI</p>
            <h4 className="text-xl md:text-2xl font-black text-orange-500 mt-1">
              {activeJobs} Pesanan
            </h4>
            <span className="text-[10px] text-neutral-400 mt-1 block">Jersey sedang dikerjakan</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">PENDING ACC LAYOUT</p>
            <h4 className="text-xl md:text-2xl font-black text-yellow-500 mt-1">
              {pendingApprovals} Tim
            </h4>
            <span className="text-[10px] text-neutral-450 mt-1 block">Menunggu konfirmasi visual</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">PESANAN TERKIRIM</p>
            <h4 className="text-xl md:text-2xl font-black text-gray-400 mt-1">
              {completedJobs} Tim
            </h4>
            <span className="text-[10px] text-neutral-505 mt-1 block">Selesai status archive</span>
          </div>
        </div>

        {/* MANUAL ADD FORM COLLAPSIBLE */}
        {showAddForm && (
          <div id="admin-add-form-container" className="bg-neutral-900 border border-orange-500/20 p-6 rounded-2xl mb-10">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white mb-4">Pendaftaran Pesanan Manual (Pemesan Walk-In / Telepon)</h3>
            <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Nama Klien:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ahmad Ghozali" 
                  value={newCustName} 
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Nama Tim:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Aremania Esports" 
                  value={newTeamName} 
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">No WhatsApp:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 6281234567" 
                  value={newContact} 
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Jenis Jersey:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                >
                  <option value="Jersey Futsal">Jersey Futsal</option>
                  <option value="Jersey Basket">Jersey Basket</option>
                  <option value="Jersey Voli">Jersey Voli</option>
                  <option value="Jersey Esport">Jersey Esport</option>
                  <option value="Jaket/Hoodie">Jaket/Hoodie</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Jumlah Pesanan (Pcs):</label>
                <input 
                  type="number" 
                  required
                  value={newQty} 
                  onChange={(e) => setNewQty(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Total Tagihan (Rp):</label>
                <input 
                  type="number" 
                  required
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-neutral-400 mb-1 block">Alamat Kirim & Catatan Kurir:</label>
                <input 
                  type="text" 
                  required
                  placeholder="Jl. Merdeka No 10, Pasuruan" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-550 text-white text-xs font-bold py-2.5 px-6 rounded-lg uppercase"
                >
                  Daftarkan Pesanan ke Database
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & SYSTEM FILTER ROILS */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-550 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Kode, Nama Pemesan atau Nama Tim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-xs rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
            {/* Category selection */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg"
            >
              <option value="ALL">Semua Produk</option>
              <option value="Jersey Futsal">Jersey Futsal</option>
              <option value="Jersey Basket">Jersey Basket</option>
              <option value="Jersey Voli">Jersey Voli</option>
              <option value="Jersey Esport">Jersey Esport</option>
              <option value="Jaket/Hoodie">Jaket/Hoodie</option>
            </select>

            {/* Status selection */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg"
            >
              <option value="ALL">Semua Status</option>
              {statusList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Payment Selection */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg"
            >
              <option value="ALL">Status Bayar</option>
              <option value="Belum DP">Belum DP</option>
              <option value="DP 50%">DP 50%</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

        </div>

        {/* CORE DATABASE ORDERS LIST CONTAINER */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          
          <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Data Transaksi Produksi ({filteredOrders.length} Ditemukan)
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Mendukung Live Storage Update</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-14 text-center text-neutral-500">
              <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-300 mb-1">Tidak Ada Pesanan Memenuhi Kriteria</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Silakan ganti kata kunci pencarian Anda, atau nonaktifkan filter untuk menampilkan seluruh database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800/80 bg-neutral-950/20 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4 font-bold">KODE PESANAN</th>
                    <th className="py-3.5 px-4 font-bold">DETAIL PEMESAN & TIM</th>
                    <th className="py-3.5 px-4 font-bold">TANGGAL DAFTAR</th>
                    <th className="py-3.5 px-4 font-bold">PEMBAYARAN / HARGA</th>
                    <th className="py-3.5 px-4 font-bold">PROGRESS TERAKHIR</th>
                    <th className="py-3.5 px-4 font-bold text-center">NOTIFIKASI / AKSI</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-neutral-955">
                  {filteredOrders.map((order) => {
                    const isEditing = editingOrderId === order.id;
                    const dateText = new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr 
                        key={order.id} 
                        id={`admin-order-record-${order.id}`}
                        className="hover:bg-neutral-950/20 transition-all group"
                      >
                        {/* 1. Transaction ID */}
                        <td className="py-4 px-4 font-black text-white font-mono tracking-wider">
                          {order.id}
                        </td>

                        {/* 2. Client Details */}
                        <td className="py-4 px-4 space-y-1">
                          <h5 className="font-bold text-neutral-100">{order.customerName}</h5>
                          <p className="text-neutral-450 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{order.teamName} (<strong>{order.orderType}</strong>)</span>
                          </p>
                          <p className="text-neutral-500 text-[10.5px]">WA: {order.contactNumber}</p>
                        </td>

                        {/* 3. Created Date */}
                        <td className="py-4 px-4 text-neutral-400 font-medium whitespace-nowrap">
                          {dateText}
                        </td>

                        {/* 4. Payment Stats & Pricing */}
                        <td className="py-4 px-4 space-y-1.5">
                          <p className="font-bold text-white">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                          
                          {isEditing ? (
                            <select
                              id={`edit-payment-${order.id}`}
                              value={editPayment}
                              onChange={(e) => setEditPayment(e.target.value as any)}
                              className="bg-neutral-950 text-xs border border-neutral-800 text-white rounded p-1"
                            >
                              <option value="Belum DP">Belum DP</option>
                              <option value="DP 50%">DP 50%</option>
                              <option value="Lunas">Lunas</option>
                            </select>
                          ) : (
                            <span className={`inline-block text-[9.5px] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${
                              order.paymentStatus === 'Lunas' ? 'bg-green-650/10 text-green-500 border-green-600/20' :
                              order.paymentStatus === 'DP 50%' ? 'bg-orange-655/10 text-orange-500 border-orange-550/25' :
                              'bg-red-650/10 text-red-500 border-red-600/30'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          )}
                        </td>

                        {/* 5. Production progress timeline status */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <select
                                id={`edit-status-${order.id}`}
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                                className="bg-neutral-950 text-xs border border-neutral-800 text-white rounded p-1 w-full max-w-[150px]"
                              >
                                {statusList.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                              {(editStatus === 'Proses Pengiriman' || editStatus === 'Selesai') && (
                                <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-1.5 rounded text-left">
                                  <p className="text-[9.5px] text-neutral-400 font-mono">Biteship Auto Tracking:</p>
                                  <input
                                    type="text"
                                    placeholder="No Resi (e.g. BS12345)"
                                    value={editResi}
                                    onChange={(e) => setEditResi(e.target.value)}
                                    className="bg-neutral-950 font-mono text-[10.5px] border border-neutral-850 p-1 rounded text-white w-full placeholder:text-neutral-600 focus:outline-none"
                                  />
                                  <select
                                    value={editCourier}
                                    onChange={(e) => setEditCourier(e.target.value)}
                                    className="bg-neutral-950 text-[10.5px] border border-neutral-850 p-1 rounded text-white w-full focus:outline-none"
                                  >
                                    <option value="J&T">J&T</option>
                                    <option value="Sicepat">Sicepat</option>
                                    <option value="JNE">JNE</option>
                                    <option value="POS">POS</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className={`inline-block font-sans font-bold text-[10.5px] px-2.5 py-0.5 rounded-full ${
                                order.status === 'Selesai' ? 'bg-green-600 text-white' :
                                order.status === 'Proses Pengiriman' ? 'bg-indigo-600 text-white' :
                                order.status === 'Siap Dikirim' ? 'bg-cyan-600 text-white' :
                                order.status === 'Quality Control' ? 'bg-blue-600 text-white' :
                                order.status === 'Press & Jahit' ? 'bg-yellow-600 text-neutral-950' :
                                order.status === 'Proses Sublimasi' ? 'bg-orange-600 text-white animate-pulse' :
                                order.status === 'Persetujuan Desain' ? 'bg-purple-600 text-white' :
                                'bg-neutral-800 text-neutral-300'
                              }`}>
                                {order.status}
                              </span>
                              {order.resi ? (
                                <div className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 p-1 rounded max-w-[155px]">
                                  <p className="font-mono text-orange-500 font-bold">{order.resi}</p>
                                  <p className="text-[8.5px] text-neutral-500 uppercase font-mono">{order.courierName || 'J&T'}</p>
                                </div>
                              ) : (
                                <p className="text-[10px] text-neutral-500 italic">Klik edit di samping untuk merubah</p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 6. Quick notification alert via WHATSAPP plus edit selectors */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2.5">
                            
                            {/* WhatsApp alert redirect trigger */}
                            <button
                              id={`btn-alert-wa-${order.id}`}
                              onClick={() => handleTriggerStatusWhatsApp(order)}
                              title="Forward Status update alert via safe WA message"
                              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-orange-500 hover:text-orange-400 p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-[11px]"
                            >
                              <MessageSquare className="w-3.5 h-3.5 fill-current" />
                              Notif WA
                            </button>

                            {/* Edit Action Toggle */}
                            {isEditing ? (
                              <button
                                id={`btn-save-order-${order.id}`}
                                onClick={() => handleUpdateStatusAndPayment(order.id, editStatus, editPayment, editResi, editCourier)}
                                className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded"
                                title="Save changes"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                id={`btn-edit-order-${order.id}`}
                                onClick={() => {
                                  setEditingOrderId(order.id);
                                  setEditStatus(order.status);
                                  setEditPayment(order.paymentStatus);
                                  setEditResi(order.resi || '');
                                  setEditCourier(order.courierName || 'J&T');
                                }}
                                className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white p-2 rounded-xl transition-all"
                                title="Edit status & billing"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              id={`btn-delete-order-${order.id}`}
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-neutral-600 hover:text-red-500 p-2 transition-colors"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
