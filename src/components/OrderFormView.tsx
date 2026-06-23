/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Trash2, Plus, ArrowRight, MessageSquare, MapPin, 
  Layers, ChevronRight, CheckCircle2, ClipboardList, Info, Maximize2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, RosterItem, SizingRosterItem } from '../types';
import { showToast } from '../utils/toast';
import { isSupabaseConfigured, saveSupabaseOrder } from '../lib/supabase';

interface OrderFormViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNavigate: (tab: 'home' | 'guide' | 'order' | 'admin') => void;
}

export default function OrderFormView({ orders, setOrders, onNavigate }: OrderFormViewProps) {
  // 1. Identitas Kontak Pemesan
  const [customerName, setCustomerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // 2. Detail Pesanan
  const [productType, setProductType] = useState<Order['productType']>('Jersey atasan saja');
  const [productTypeCustom, setProductTypeCustom] = useState('');
  
  const [fabricType, setFabricType] = useState<Order['fabricType']>('Dryfit Milano');
  const [fabricTypeCustom, setFabricTypeCustom] = useState('');
  
  const [collarType, setCollarType] = useState('1'); // Pilihan nomor 1-12
  const [quantity, setQuantity] = useState<number>(12); // Default MOQ is 12
  
  // Choose Name / Number customizations
  const [hasNameCheckbox, setHasNameCheckbox] = useState(true);
  const [hasNumberCheckbox, setHasNumberCheckbox] = useState(true);
  
  // Bulk Roster fields (Active if hasNameCheckbox OR hasNumberCheckbox is TRUE)
  const [roster, setRoster] = useState<RosterItem[]>([
    { id: '1', name: '', number: '', size: 'L' },
    { id: '2', name: '', number: '', size: 'M' },
    { id: '3', name: '', number: '', size: 'XL' },
  ]);

  // Sizing Roster fields (Active if BOTH hasNameCheckbox & hasNumberCheckbox are FALSE)
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Kids S', 'Kids M', 'Kids L'];
  const [sizingRoster, setSizingRoster] = useState<Record<string, number>>({
    'XS': 0,
    'S': 0,
    'M': 6,
    'L': 6,
    'XL': 0,
    'XXL': 0,
    '3XL': 0,
    'Kids S': 0,
    'Kids M': 0,
    'Kids L': 0,
  });

  const [finishingOther, setFinishingOther] = useState('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [isCollarModalOpen, setIsCollarModalOpen] = useState(false);

  // Auto-sync quantity when player roster changes
  useEffect(() => {
    if (hasNameCheckbox || hasNumberCheckbox) {
      setQuantity(roster.length);
    }
  }, [roster, hasNameCheckbox, hasNumberCheckbox]);

  // Auto-sync quantity when sizing counts change
  useEffect(() => {
    if (!hasNameCheckbox && !hasNumberCheckbox) {
      const total = Object.keys(sizingRoster).reduce((sum, key) => sum + (sizingRoster[key] || 0), 0);
      setQuantity(total);
    }
  }, [sizingRoster, hasNameCheckbox, hasNumberCheckbox]);

  const handleAddRosterRow = () => {
    const nextId = (roster.length + 1).toString();
    setRoster([...roster, { id: nextId, name: '', number: '', size: 'L' }]);
  };

  const handleRemoveRosterRow = (index: number) => {
    if (roster.length <= 1) return;
    const updated = roster.filter((_, idx) => idx !== index);
    setRoster(updated);
  };

  const handleRosterChange = (index: number, field: keyof RosterItem, value: string) => {
    const updated = [...roster];
    updated[index] = { ...updated[index], [field]: value };
    setRoster(updated);
  };

  const handleSizingCountChange = (size: string, value: number) => {
    const val = Math.max(0, value);
    setSizingRoster({
      ...sizingRoster,
      [size]: val
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verification
    if (!customerName.trim() || !teamName.trim() || !contactNumber.trim() || !shippingAddress.trim()) {
      showToast('Mohon lengkapi identitas pemesan dan alamat pengiriman.', 'error');
      return;
    }

    if (quantity <= 0) {
      showToast('Jumlah pesanan minimal harus 1 pcs.', 'error');
      return;
    }

    const isCustomRosterActive = hasNameCheckbox || hasNumberCheckbox;
    const finalRosterList: RosterItem[] = isCustomRosterActive 
      ? roster.filter(r => (hasNameCheckbox ? r.name.trim() !== '' : true)) 
      : [];

    if (isCustomRosterActive && finalRosterList.length === 0) {
      showToast('Mohon tambahkan baris roster dan isi nama pemain.', 'error');
      return;
    }

    setSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ANV-${randomSuffix}`;

    // Convert sizing object to array
    const finalSizingRosterArray: SizingRosterItem[] = Object.entries(sizingRoster)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([size, qty]) => ({ size, qty: qty as number }));

    // Create New Order Object Matching types.ts
    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      teamName: teamName.trim(),
      contactNumber: contactNumber.replace(/[^0-9]/g, ''),
      shippingAddress: shippingAddress.trim(),
      
      productType,
      productTypeCustom: productType === 'Lainnya' ? productTypeCustom.trim() : undefined,
      fabricType,
      fabricTypeCustom: fabricType === 'Lainnya' ? fabricTypeCustom.trim() : undefined,
      collarType,
      quantity,
      
      hasNameCheckbox,
      hasNumberCheckbox,
      
      roster: finalRosterList,
      sizingRoster: !isCustomRosterActive ? finalSizingRosterArray : [],
      finishingOther: finishingOther.trim(),
      
      totalPrice: 0, // Admin will set price manually in Admin Panel
      status: 'Antrian Desain',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'Belum DP'
    };

    // Save locally
    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    localStorage.setItem('anv_orders', JSON.stringify(nextOrders));

    // Save to Supabase
    if (isSupabaseConfigured) {
      saveSupabaseOrder(newOrder).then((success) => {
        if (success) {
          showToast('Pesanan berhasil disimpan & disinkronisasikan ke Supabase!', 'success');
        } else {
          showToast('Koneksi Supabase error, data dicadangkan sebagai offline.', 'info');
        }
      });
    }

    // Compile nice looking whatsapp text
    const displayProduct = productType === 'Lainnya' ? `${productType} (${productTypeCustom})` : productType;
    const displayFabric = fabricType === 'Lainnya' ? `${fabricType} (${fabricTypeCustom})` : fabricType;
    
    // Format roster
    let rosterMessageText = '';
    if (isCustomRosterActive) {
      rosterMessageText = finalRosterList.map((player, idx) => {
        const namePart = hasNameCheckbox ? ` - ${player.name.trim().toUpperCase()}` : '';
        const numPart = hasNumberCheckbox ? ` #${player.number}` : '';
        return `${idx + 1}. [${player.size}]${numPart}${namePart}`;
      }).join('\n');
    } else {
      rosterMessageText = finalSizingRosterArray.map((item) => `• Ukuran [ ${item.size} ] : ${item.qty} Jersey`).join('\n');
    }

    const whatsappMessage = [
      `*FORM DATA PEMESANAN TIM - ANV APPAREL*`,
      `==================================`,
      `*ID TRANSAKSI:* ${orderId}`,
      `*PEMESAN:* ${customerName.trim()}`,
      `*NAMA TIM:* ${teamName.trim()}`,
      `*KONTAK WA MENGHUBUNGI:* ${contactNumber}`,
      `*ALAMAT PENGIRIMAN:*`,
      `${shippingAddress.trim()}`,
      `----------------------------------`,
      `*DETAIL SPESIFIKASI PESANAN:*`,
      `1. Produk: ${displayProduct}`,
      `2. Pilihan Bahan: ${displayFabric}`,
      `3. Pilihan Model Kerah: Nomor ${collarType}`,
      `4. Jumlah Berkas Pesanan: ${quantity} Pcs`,
      `5. Custom Nama Punggung: ${hasNameCheckbox ? 'YA' : 'TIDAK'}`,
      `6. Custom Nomor Punggung: ${hasNumberCheckbox ? 'YA' : 'TIDAK'}`,
      `----------------------------------`,
      `*RINCIAN REKAP ROSTER (UKURAN):*`,
      `${rosterMessageText}`,
      `----------------------------------`,
      `*FINISHING & TAMBAHAN:*`,
      `${finishingOther.trim() || 'Tidak ada catatan tambahan.'}`,
      `----------------------------------`,
      `*STATUS HARGA:* Menunggu Validasi & Penilaian Admin (Akan Terbit Invoice)`,
      `----------------------------------`,
      `Halo Admin ANV Apparel, saya baru saja mengirimkan draf portal pesanan tim kami. Mohon divalidasi detail kerah, kain, dan draf roster kami untuk diterbitkan Invoice serta antrian Vektor Desain.`
    ].join('\n');

    const cleanWaText = encodeURIComponent(whatsappMessage);

    setTimeout(() => {
      setSubmitting(false);
      setSuccessCode(orderId);
      // Open WhatsApp Link
      window.open(`https://wa.me/6281234567890?text=${cleanWaText}`, '_blank');
    }, 1200);
  };

  const handleResetForm = () => {
    setCustomerName('');
    setTeamName('');
    setContactNumber('');
    setShippingAddress('');
    setProductType('Jersey atasan saja');
    setProductTypeCustom('');
    setFabricType('Dryfit Milano');
    setFabricTypeCustom('');
    setCollarType('1');
    setHasNameCheckbox(true);
    setHasNumberCheckbox(true);
    setFinishingOther('');
    setSuccessCode(null);
    setRoster([
      { id: '1', name: '', number: '', size: 'L' },
      { id: '2', name: '', number: '', size: 'M' },
      { id: '3', name: '', number: '', size: 'XL' },
    ]);
    setSizingRoster({
      'XS': 0, 'S': 0, 'M': 6, 'L': 6, 'XL': 0, 'XXL': 0, '3XL': 0, 'Kids S': 0, 'Kids M': 0, 'Kids L': 0,
    });
  };

  return (
    <div id="order-form-view-root" className="bg-neutral-950 text-white min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* HEADER BLOCK */}
        <div className="mb-12 pb-4 border-b border-neutral-800 text-center md:text-left">
          <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">B2B Team Production Portal</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Portal Pemesanan Tim</h1>
          <p className="text-neutral-400 text-xs md:text-sm mt-1">
            Isi formulir spesifikasi produk, detail bahan, pilihan model kerah, dan rekap ukuran roster tim Anda secara online dan aman.
          </p>
        </div>

        {/* SUCCESS LIGHTBOX */}
        <AnimatePresence>
          {successCode && (
            <motion.div 
              id="order-success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-orange-500/30 p-8 rounded-2xl text-center max-w-2xl mx-auto mb-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-600" />
              <div className="w-16 h-16 bg-orange-600/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/25">
                <CheckCircle2 className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-white">Spesifikasi Roster Berhasil Terkirim!</h2>
              <p className="text-neutral-400 text-xs mt-1.5 font-mono">KODE TRANSAKSI AKTIF: <span className="text-white font-bold">{successCode}</span></p>
              
              <div className="my-6 p-4 bg-neutral-950 rounded-xl border border-neutral-800 max-w-md mx-auto text-xs text-neutral-400 leading-relaxed text-left space-y-3">
                <p>
                  ✅ <strong>Data Tersimpan:</strong> Roster tim Anda telah diarsip di server pusat ANV Apparel.
                </p>
                <p>
                  📱 <strong>Kirim Berkas WA:</strong> Saat ini tab browser WhatsApp telah terbuka meneruskan ringkasan rekap roster ke admin.
                </p>
                <p>
                  🔍 <strong>Pemantauan Produksi:</strong> Salin kode transaksi <strong>{successCode}</strong> untuk melacak proses pengerjaan (Desain, Cetak Sublim, Jahit, QC) secara real-time melalui form pencarian di Beranda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => {
                    handleResetForm();
                    onNavigate('home');
                  }}
                  className="bg-orange-600 hover:bg-orange-550 text-white font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition-all"
                >
                  Kembali Ke Beranda
                </button>
                <button
                  onClick={handleResetForm}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition-all"
                >
                  Input Tim Baru
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN ENTRY FORM */}
        {!successCode && (
          <form id="bulk-order-form" onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (5 COLS): IDENTITAS & DETAIL PESANAN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box 1: Identitas Kontak Pemesan */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative shadow-lg">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800/40">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">1. Identitas Kontak Pemesan</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Nama Koordinator / Pemesan:</label>
                    <input 
                      id="inputb2b-customer-name"
                      type="text"
                      required
                      placeholder="e.g. Ahmad Fikri"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Nama Tim Olahraga:</label>
                      <input 
                        id="inputb2b-team-name"
                        type="text"
                        required
                        placeholder="e.g. Malang United FC"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Nomor WhatsApp Acuan:</label>
                      <input 
                        id="inputb2b-contact"
                        type="tel"
                        required
                        placeholder="e.g. 62812345678"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Alamat Pengiriman lengkap:</label>
                    <textarea 
                      id="inputb2b-shipping-address"
                      required
                      rows={3}
                      placeholder="Sebutkan Jl, Rt/Rw, Kel, Kec, Kota/Kabupaten, Provinsi dan Kode Pos Penerima."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-orange-500 font-semibold leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Detail Pesanan */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative shadow-lg">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800/40">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">2. Detail Pesanan & Bahan</h3>
                </div>

                <div className="space-y-4">
                  {/* SELECT PRODUK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Produk:</label>
                      <select 
                        id="selectb2b-product-type"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Jersey atasan saja">Jersey Atasan Saja</option>
                        <option value="Jersey Setelan">Jersey Setelan</option>
                        <option value="Jaket">Jaket Sublim</option>
                        <option value="Jaket+Training">Jaket + Training</option>
                        <option value="Lainnya">Lainnya, sebutkan...</option>
                      </select>
                    </div>

                    {productType === 'Lainnya' && (
                      <div>
                        <label className="text-[10.5px] text-orange-550 font-bold uppercase mb-1 block">Tulis Produk Lainnya:</label>
                        <input
                          id="inputb2b-product-custom"
                          type="text"
                          required
                          placeholder="e.g. Rompi Latihan"
                          value={productTypeCustom}
                          onChange={(e) => setProductTypeCustom(e.target.value)}
                          className="w-full bg-neutral-950 border border-orange-500/20 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* SELECT BAHAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Pilihan Bahan:</label>
                      <select 
                        id="selectb2b-fabric-type"
                        value={fabricType}
                        onChange={(e) => setFabricType(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Dryfit Milano">Dryfit Milano</option>
                        <option value="Dryfit Bintik">Dryfit Bintik</option>
                        <option value="Dryfit Benzema">Dryfit Benzema</option>
                        <option value="Dryfit Waffle">Dryfit Waffle</option>
                        <option value="Emboss Topograf">Emboss Topograf</option>
                        <option value="Emboss Jackuard">Emboss Jackuard</option>
                        <option value="Emboss Straw">Emboss Straw</option>
                        <option value="Lainnya">Lainnya, tulis sendiri...</option>
                      </select>
                    </div>

                    {fabricType === 'Lainnya' && (
                      <div>
                        <label className="text-[10.5px] text-orange-550 font-bold uppercase mb-1 block">Tulis Bahan Lainnya:</label>
                        <input
                          id="inputb2b-fabric-custom"
                          type="text"
                          required
                          placeholder="e.g. Lotto Polyester"
                          value={fabricTypeCustom}
                          onChange={(e) => setFabricTypeCustom(e.target.value)}
                          className="w-full bg-neutral-950 border border-orange-500/20 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. COLLAR SELECTION GRID & MODAL TRIGGER */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase">3. Pilihan Kerah (Katalog 1-12):</label>
                      <button
                        type="button"
                        onClick={() => setIsCollarModalOpen(true)}
                        className="text-[11px] font-black text-orange-500 hover:text-orange-400 flex items-center gap-1 leading-none"
                      >
                        <span>Aturan & Desain Kerah (Pop-up)</span>
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Circular Grid Choice */}
                    <div className="grid grid-cols-6 gap-2 p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl">
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCollarType(num)}
                          className={`py-2 rounded-lg text-xs font-black transition-all ${
                            collarType === num 
                              ? 'bg-orange-500 text-black border-orange-500 shadow-md shadow-orange-500/10' 
                              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. TOTAL QUANTITY (READONLY IF ENTERED FROM ROSTER, ACTIVE OTHERWISE) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1 block">Jumlah Pesanan (QTY):</label>
                      <input 
                        id="inputb2b-quantity"
                        type="number"
                        min={1}
                        value={quantity}
                        disabled={hasNameCheckbox || hasNumberCheckbox}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className={`w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold font-mono ${
                          (hasNameCheckbox || hasNumberCheckbox) ? 'opacity-60 cursor-not-allowed bg-neutral-900' : ''
                        }`}
                      />
                      {(hasNameCheckbox || hasNumberCheckbox) && (
                        <span className="text-[9.5px] text-neutral-500 mt-1 block">Di-lock dari baris roster tim.</span>
                      )}
                    </div>

                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] text-neutral-450 uppercase font-mono block">MOQ Standard:</span>
                      <strong className="text-white text-xs mt-0.5">1 Lusin (12 Pcs)</strong>
                    </div>
                  </div>

                  {/* 5. SELECTION CHECKBOXES TO DISALLOW CUSTOM TO REMOVE COMPLICATED COLUMNS */}
                  <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2.5">
                    <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Customisasi Punggung Jersey</span>
                    
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-white select-none">
                      <input 
                        type="checkbox"
                        checked={hasNameCheckbox}
                        onChange={(e) => setHasNameCheckbox(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded cursor-pointer border-neutral-800"
                      />
                      <span>Gunakan Nama Punggung Player</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-white select-none">
                      <input 
                        type="checkbox"
                        checked={hasNumberCheckbox}
                        onChange={(e) => setHasNumberCheckbox(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded cursor-pointer border-neutral-800"
                      />
                      <span>Gunakan Nomor Punggung Player</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (7 COLS): CUSTOM ROSTER TABLE OR SIZING SUMMARY COUNTER */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative shadow-lg">
              
              {/* Conditional Display: Detailed table or Simple counters */}
              {(hasNameCheckbox || hasNumberCheckbox) ? (
                // PLAYER-BY-PLAYER DETAILED ROSTER TABLE
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800/40 mb-6 gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Daftar Roster Tim (Sublimasi Custom)</h3>
                        <p className="text-[10.5px] text-neutral-500">Isi nama & nomor punggung tiap jersey secara presisi.</p>
                      </div>
                    </div>

                    <button
                      id="btn-add-roster-row"
                      type="button"
                      onClick={handleAddRosterRow}
                      className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-all border border-neutral-800 hover:border-neutral-700 font-mono"
                    >
                      <Plus className="w-4 h-4 text-orange-500 font-bold" />
                      <span>Tambah Pemain</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
                    {roster.map((row, index) => (
                      <div 
                        key={row.id} 
                        id={`roster-row-${index}`}
                        className="flex items-center gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-850 relative group transition-all"
                      >
                        <span className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10.5px] font-black text-neutral-500 italic font-mono shrink-0">
                          {index + 1}
                        </span>

                        {/* Player name input (disables container if false) */}
                        {hasNameCheckbox ? (
                          <div className="flex-grow min-w-0">
                            <input 
                              id={`roster-row-name-${index}`}
                              type="text"
                              required
                              placeholder="NAMA PEMAIN (e.g. DIANA)"
                              value={row.name}
                              onChange={(e) => handleRosterChange(index, 'name', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-black rounded-lg py-2 px-3 focus:outline-none focus:border-orange-500 uppercase font-mono tracking-wider"
                            />
                          </div>
                        ) : (
                          <div className="flex-grow text-xs text-neutral-500 italic p-2 border border-dashed border-neutral-850 rounded bg-neutral-900/40">
                            No Custom Name
                          </div>
                        )}

                        {/* Player number input */}
                        {hasNumberCheckbox ? (
                          <div className="w-20 shrink-0">
                            <input 
                              id={`roster-row-number-${index}`}
                              type="text"
                              maxLength={3}
                              placeholder="NO (7)"
                              value={row.number}
                              onChange={(e) => handleRosterChange(index, 'number', e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-lg py-2 px-2 text-center focus:outline-none focus:border-orange-500 font-mono"
                            />
                          </div>
                        ) : (
                          <div className="w-20 shrink-0 text-xs text-neutral-500 italic text-center p-2 border border-dashed border-neutral-850 rounded bg-neutral-900/40">
                            No No.
                          </div>
                        )}

                        {/* Size dropdown selection */}
                        <div className="w-24 shrink-0">
                          <select
                            id={`roster-row-size-${index}`}
                            value={row.size}
                            onChange={(e) => handleRosterChange(index, 'size', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold rounded-lg py-2 px-2 focus:outline-none focus:border-orange-500 uppercase"
                          >
                            {sizeOptions.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>

                        {/* Remove item */}
                        <button
                          id={`btn-remove-roster-row-${index}`}
                          type="button"
                          disabled={roster.length <= 1}
                          onClick={() => handleRemoveRosterRow(index)}
                          className="text-neutral-500 hover:text-red-500 disabled:opacity-30 p-2 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // SIMPLE SIZING COUNTERS GRID (IF BOTH NAME & NUMBER INACTIVE)
                <div>
                  <div className="pb-4 border-b border-neutral-800/40 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-550" />
                      <div>
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Input Jumlah per Ukuran (Sizing Only)</h3>
                        <p className="text-[10.5px] text-neutral-500">Anda tidak mengaktifkan cetak nama & nomor punggung, cukup sebutkan total tiap ukuran.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sizeOptions.map((size) => {
                      const qty = sizingRoster[size] || 0;
                      return (
                        <div key={size} className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between gap-2.5">
                          <span className="font-black text-xs text-orange-500 font-mono w-12">{size}</span>
                          <div className="flex items-center border border-neutral-800 rounded bg-neutral-900 overflow-hidden">
                            <button
                              id={`btn-sizing-decrement-${size}`}
                              type="button"
                              onClick={() => handleSizingCountChange(size, qty - 1)}
                              className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                            >
                              -
                            </button>
                            <span className="px-2 cursor-default font-bold text-xs text-white min-w-[20px] text-center font-mono">{qty}</span>
                            <button
                              id={`btn-sizing-increment-${size}`}
                              type="button"
                              onClick={() => handleSizingCountChange(size, qty + 1)}
                              className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-5 p-3.5 bg-orange-650/10 rounded-xl border border-orange-500/10 flex items-start gap-2 text-xs text-neutral-400 leading-relaxed">
                    <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <p>Total Jersey akumulasi di atas adalah <strong className="text-white">{quantity} PCS</strong>. Qty total akan di-lock ke tabel ini secara otomatis demi kemudahan draf produksi.</p>
                  </div>
                </div>
              )}

              {/* 6. CATATAN FINISHING LAINNYA */}
              <div className="mt-6">
                <label className="text-[10.5px] text-neutral-400 font-bold uppercase mb-1.5 block">6. Finishing & Detail Tambahan (Sablon sponsor, logo liga, celana, dll):</label>
                <textarea
                  id="inputb2b-finishing-other"
                  rows={2}
                  placeholder="e.g. Sponsor dada cetak putih polyflex, logo klub pakai patch 3D, manset kerah warna merah kontras berkelok."
                  value={finishingOther}
                  onChange={(e) => setFinishingOther(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-orange-500 font-medium leading-relaxed"
                />
              </div>

              {/* ESTIMATION AD HOC INSTRUCTIONS FOR CLIENTS */}
              <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-850 mt-6 space-y-4">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h5 className="text-[11px] uppercase font-mono tracking-wider text-white font-heavy">INFORMASI HARGA & INVOICE DIGITAL</h5>
                    <p className="text-[11.5px] text-neutral-400 leading-relaxed">
                      Sistem pengetesan ongkos kirim dan perhitungan biaya otomatis ditiadakan karena model penyesuaian harga di ANV Apparel sangat variatif (bergantung pada jumlah, kompleksitas bordir, jenis rib, serta diskon quantity). 
                    </p>
                    <p className="text-[11.5px] text-orange-500">
                      <strong>Admin akan meninjau draf Anda dan menginput Harga secara manual di Panel Admin</strong>, yang langsung terekam dan bisa dipantau pada widget live tracking status di halaman depan.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-b2b-submit"
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-all disabled:opacity-50 tracking-wider text-xs uppercase shadow-xl shadow-orange-500/10"
                  >
                    <MessageSquare className="w-4.5 h-4.5 fill-current shrink-0" />
                    {submitting ? 'Mengarsip Data & Mengalihkan ke WhatsApp...' : 'Serahkan Roster & Teruskan Ke WhatsApp Admin'}
                  </button>
                </div>

                <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                  *Dengan menekan tombol di atas, draf roster sitematis akan terekap otomatis, tersimpan aman didatabase lokal & Cloud, lalu dialihkan sekali klik ke WhatsApp admin untuk diterbitkan invoice. No Antrean layout akan diperoleh.
                </p>
              </div>

            </div>

          </form>
        )}

      </div>

      {/* COLLAR GUIDE MODAL */}
      <AnimatePresence>
        {isCollarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsCollarModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <span className="text-orange-500 font-mono text-[10px] uppercase font-bold tracking-widest">Katalog Panduan Kerah Jersey</span>
                <h3 className="text-xl font-extrabold text-white">Layout Pola Kerah Terfavorit (Nomor 1-12)</h3>
                <p className="text-xs text-neutral-400 mt-1">Gunakan diagram nomor referensi di bawah ini untuk memilih pola kerah sublimasi yang cocok dengan jersey tim.</p>
              </div>

              {/* GRID OF COLLARS ARTWORK MOCKUP / ILLUSTRATION */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-6">
                {[
                  { num: '1', title: 'O-Neck Rib Tebal', desc: 'Sederhana, standar retro elastis nyaman.' },
                  { num: '2', title: 'Classic V-Neck', desc: 'Garis kerah menyerupai huruf V klasik sporty.' },
                  { num: '3', title: 'Standard Polo Kerah', desc: 'Formal look dengan bukaan kancing 2-jalur.' },
                  { num: '4', title: 'V-Neck Rib Ganda', desc: 'Dua lapis jahitan rajut kombinasi warna.' },
                  { num: '5', title: 'Kerah Shanghai (Koko)', desc: 'Kerah tegak ramping, memberi kesan etnik oriental.' },
                  { num: '6', title: 'Retro Rib Overlap', desc: 'Bentuk V overlap tumpang tindih berkerah rib.' },
                  { num: '7', title: 'Zip-Up Athletic Polo', desc: 'Model polo modern bertutup ritsleting YKK.' },
                  { num: '8', title: 'O-Neck Rib Kontras', desc: 'Warna manset leher berbeda dengan warna dasar kaos.' },
                  { num: '9', title: 'Hoodie Active Collar', desc: 'Melengkapi tudung bertali, hangat & fungsional.' },
                  { num: '10', title: 'Shoreline V-Neck', desc: 'Potongan V-neck lebar yang melengkung aerodinamis.' },
                  { num: '11', title: 'High-Neck Collar', desc: 'Potongan leher tinggi tertutup elastis ala kompresi.' },
                  { num: '12', title: 'Classic Buttoned-Up', desc: 'Pola V bertingkat dengan tambahan kancing hias.' },
                ].map((collar) => (
                  <div 
                    key={collar.num}
                    onClick={() => {
                      setCollarType(collar.num);
                      setIsCollarModalOpen(false);
                      showToast(`Kerah model #${collar.num} terpilih!`, 'success');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      collarType === collar.num 
                        ? 'bg-orange-500/10 border-orange-500 text-white' 
                        : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-850 hover:border-neutral-800'
                    }`}
                  >
                    {/* Visual collar dummy mock representation */}
                    <div className="h-20 bg-neutral-900 border border-neutral-800 rounded-lg mb-2 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-neutral-700">
                      {/* Stylized geometric curves representing collar type */}
                      <div className="absolute top-0 w-8 h-8 rounded-full border-2 border-orange-500/20 flex items-center justify-center mt-2">
                        <span className="font-mono text-[10px] text-orange-500 font-bold">{collar.num}</span>
                      </div>
                      <div className="absolute bottom-1 text-[9px] font-mono text-neutral-500 font-black">MODEL {collar.num}</div>
                    </div>
                    <div className="font-bold text-xs text-white uppercase tracking-tight">{collar.title}</div>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-normal">{collar.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-neutral-800 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsCollarModalOpen(false)}
                  className="bg-orange-500 hover:bg-orange-400 text-black font-black py-2 px-5 rounded-lg uppercase tracking-wide transition-all"
                >
                  Gunakan Pilihan Kerah Saat Ini
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
