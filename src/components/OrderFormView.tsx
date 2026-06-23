/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Trash2, Plus, ArrowRight, MessageSquare, MapPin, Truck, 
  Layers, ChevronRight, CheckCircle2, ClipboardList, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, RosterItem } from '../types';
import { showToast } from '../utils/toast';
import { isSupabaseConfigured, saveSupabaseOrder } from '../lib/supabase';

interface OrderFormViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNavigate: (tab: 'home' | 'guide' | 'order' | 'admin') => void;
}

export default function OrderFormView({ orders, setOrders, onNavigate }: OrderFormViewProps) {
  // Client general details
  const [customerName, setCustomerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [orderType, setOrderType] = useState<'Jersey Futsal' | 'Jersey Basket' | 'Jersey Voli' | 'Jersey Esport' | 'Jaket/Hoodie'>('Jersey Futsal');
  const [materials, setMaterials] = useState('Dryfit Milano');
  const [shippingAddress, setShippingAddress] = useState('');

  // Bulk Roster list: starts with a few empty lines for visual prompt
  const [roster, setRoster] = useState<RosterItem[]>([
    { id: '1', name: '', number: '', size: 'L' },
    { id: '2', name: '', number: '', size: 'M' },
    { id: '3', name: '', number: '', size: 'XL' },
  ]);

  // Ongkir calculations
  const [targetRegion, setTargetRegion] = useState<'Jatim' | 'Jabar_DKI' | 'Jateng' | 'Bali_NTB' | 'Sumatera_Kalimantan' | 'Papua_Maluku'>('Jatim');
  const [courier, setCourier] = useState<'JNE' | 'J&T' | 'Sicepat'>('JNE');
  const [shippingCost, setShippingCost] = useState(0);
  const [isBiteshipCalculating, setIsBiteshipCalculating] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Kids S', 'Kids M', 'Kids L'];

  const handleAddRosterRow = () => {
    const nextId = (roster.length + 1).toString();
    setRoster([...roster, { id: nextId, name: '', number: '', size: 'L' }]);
  };

  const handleRemoveRosterRow = (index: number) => {
    if (roster.length <= 1) return; // Must have at least 1 row
    const updated = roster.filter((_, idx) => idx !== index);
    setRoster(updated);
  };

  const handleRosterChange = (index: number, field: keyof RosterItem, value: string) => {
    const updated = [...roster];
    updated[index] = { ...updated[index], [field]: value };
    setRoster(updated);
  };

  // Base production pricing estimate
  const getBasePricePerItem = (): number => {
    switch (orderType) {
      case 'Jersey Futsal': return 125000;
      case 'Jersey Basket': return 135000;
      case 'Jersey Voli': return 120000;
      case 'Jersey Esport': return 110000;
      case 'Jaket/Hoodie': return 185000;
      default: return 125000;
    }
  };

  const jerseyWeightKg = 0.18; // approx 180 grams per jersey
  const totalWeight = roster.length * jerseyWeightKg;
  const roundedWeightKg = Math.max(1, Math.ceil(totalWeight));

  // Auto Ongkir Calculator simulation based on weight & destination region
  useEffect(() => {
    setIsBiteshipCalculating(true);
    const timer = setTimeout(() => {
      let ratePerKg = 10000; // Jatim base rate
      switch (targetRegion) {
        case 'Jatim': ratePerKg = 10000; break;
        case 'Jateng': ratePerKg = 15000; break;
        case 'Jabar_DKI': ratePerKg = 18000; break;
        case 'Bali_NTB': ratePerKg = 24000; break;
        case 'Sumatera_Kalimantan': ratePerKg = 35000; break;
        case 'Papua_Maluku': ratePerKg = 55000; break;
      }
      
      // Add small courier markup
      let courierMarkup = 0;
      if (courier === 'J&T') courierMarkup = 2000;
      if (courier === 'Sicepat' as any) courierMarkup = -1000;

      setShippingCost(roundedWeightKg * (ratePerKg + courierMarkup));
      setIsBiteshipCalculating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [targetRegion, courier, roster.length, roundedWeightKg]);

  const basePriceValue = getBasePricePerItem() * roster.length;
  const finalTotalPrice = basePriceValue + shippingCost;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!customerName.trim() || !teamName.trim() || !contactNumber.trim() || !shippingAddress.trim()) {
      showToast('Mohon isi seluruh data kontak pemesan dan alamat pengiriman.', 'error');
      return;
    }

    // Validate roster inputs (filter out empty rows or show warning)
    const filteredRoster = roster.filter(r => r.name.trim() !== '');
    if (filteredRoster.length === 0) {
      showToast('Mohon isi minimal 1 nama pemain pada tabel roster.', 'error');
      return;
    }

    setSubmitting(true);

    // Create unique Order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ANV-${randomSuffix}`;

    // Create New Order Object matching types.ts
    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      teamName: teamName.trim(),
      contactNumber: contactNumber.replace(/[^0-9]/g, ''),
      orderType: orderType,
      quantity: filteredRoster.length,
      totalPrice: finalTotalPrice,
      status: 'Antrian Desain',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'Belum DP',
      shippingAddress: shippingAddress.trim() + ` (${targetRegion.toUpperCase()}, Kurir ${courier})`,
      roster: filteredRoster.map((item, idx) => ({
        id: (idx + 1).toString(),
        name: item.name.trim().toUpperCase(),
        number: item.number || '00',
        size: item.size
      }))
    };

    // Save in LocalStorage array state
    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    localStorage.setItem('anv_orders', JSON.stringify(nextOrders));

    // Save in Supabase if active
    if (isSupabaseConfigured) {
      saveSupabaseOrder(newOrder).then((success) => {
        if (success) {
          showToast('Pesanan berhasil disinkronisasi ke database Supabase!', 'success');
        } else {
          showToast('Gagal menyimpan pesanan ke database, disimpan secara offline.', 'info');
        }
      });
    }

    // Compile nice looking whatsapp text forwarder
    const rosterListText = filteredRoster.map((player, idx) => {
      return `${idx + 1}. [${player.size}] #${player.number} - ${player.name.trim().toUpperCase()}`;
    }).join('\n');

    const whatsappMessage = [
      `*FORMULIR PENDAFTARAN PORTAL TIM ANV APPAREL*`,
      `==================================`,
      `*TRANSAKSI CODE:* ${orderId}`,
      `*PEMESAN:* ${customerName.trim()}`,
      `*NAMA TIM:* ${teamName.trim()}`,
      `*JENIS APPAREL:* ${orderType}`,
      `*FIBRE BAHAN:* ${materials}`,
      `*KONTAK WA:* ${contactNumber}`,
      `----------------------------------`,
      `*ALAMAT KIRIM:*`,
      `${shippingAddress.trim()}`,
      `Wilayah: ${targetRegion.toUpperCase()}`,
      `Ekspedisi: ${courier} (${roundedWeightKg} kg)`,
      `----------------------------------`,
      `*DAFTAR PENERIMA NYATA (ROSTER TIM):*`,
      `${rosterListText}`,
      `----------------------------------`,
      `*RINCIAN TAGIHAN ESTIMASI:*`,
      `Harga Produksi: Rp ${basePriceValue.toLocaleString('id-ID')}`,
      `Biaya Ongkir Kurir: Rp ${shippingCost.toLocaleString('id-ID')}`,
      `*TOTAL TAGIHAN:* Rp ${finalTotalPrice.toLocaleString('id-ID')}`,
      `----------------------------------`,
      `Halo Admin ANV, saya baru saja men-submit data roster tim kami di Portal ANV. Mohon diterbitkan invoice dan kelanjutan proses antrian layout vektor.`
    ].join('\n');

    const cleanWaText = encodeURIComponent(whatsappMessage);

    setTimeout(() => {
      setSubmitting(false);
      setSuccessCode(orderId);
      // Open WhatsApp trigger
      window.open(`https://wa.me/6281234567890?text=${cleanWaText}`, '_blank');
    }, 1200);
  };

  const handleResetForm = () => {
    setCustomerName('');
    setTeamName('');
    setContactNumber('');
    setShippingAddress('');
    setSuccessCode(null);
    setRoster([
      { id: '1', name: '', number: '', size: 'L' },
      { id: '2', name: '', number: '', size: 'M' },
      { id: '3', name: '', number: '', size: 'XL' },
    ]);
  };

  return (
    <div id="order-form-view-root" className="bg-neutral-950 text-white min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* HEADER BLOCK */}
        <div className="mb-12 pb-4 border-b border-neutral-800 text-center md:text-left">
          <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">B2B Team Order form</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Portal Pemesanan Tim</h1>
          <p className="text-neutral-400 text-xs md:text-sm mt-1">Kelola data roster tim secara massal, lakukan pengecekan ongkos kirim otomatis, serta teruskan ke WhatsApp sekali klik.</p>
        </div>

        {/* SUCCESS MODAL / SCREEN OVERLAY */}
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
              <h2 className="text-2xl font-black text-white">Roster Tim Berhasil Diserahkan!</h2>
              <p className="text-neutral-450 text-xs mt-1.5 font-mono">KODE TRANSAKSI AKTIF: <span className="text-white font-bold">{successCode}</span></p>
              
              <div className="my-6 p-4 bg-neutral-950 rounded-xl border border-neutral-850/60 max-w-md mx-auto text-xs text-neutral-400 leading-relaxed space-y-3">
                <p>
                  ✅ <strong>Langkah Lanjutan:</strong> Rincian roster saat ini telah terkirim ke formulir kirim WhatsApp Admin. 
                </p>
                <p>
                  📱 Sistem database ANV telah mengarsip data Anda. Anda dapat menyalin kode transaksi <strong>{successCode}</strong> di atas dan menelusuri statusnya secara langsung di widget <strong>Live Tracking Beranda</strong> sewaktu-waktu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => {
                    handleResetForm();
                    onNavigate('home');
                  }}
                  className="bg-orange-600 hover:bg-orange-550 text-white font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider"
                >
                  Kembali Ke Beranda
                </button>
                <button
                  onClick={handleResetForm}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider"
                >
                  Input Tim Baru
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN ENTRY FORM GRID (HIDDEN IF TRANSACTION COMPLETE) */}
        {!successCode && (
          <form id="bulk-order-form" onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CONTACT DETAILS & CEK ONGKIR (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box 1: Customer Info */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800/40">
                  <ClipboardList className="w-5 h-5 text-orange-550" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Identitas Kontak Pemesan</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Nama Koordinator / Pemesan:</label>
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
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Nama Tim Olahraga:</label>
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
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Nomor WhatsApp Acuan:</label>
                      <input 
                        id="inputb2b-contact"
                        type="tel"
                        required
                        placeholder="e.g. 6281234567"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Jenis Jersey / Produk:</label>
                      <select 
                        id="selectb2b-order-type"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Jersey Futsal">Jersey Futsal & Bola</option>
                        <option value="Jersey Basket">Jersey Basket</option>
                        <option value="Jersey Voli">Jersey Voli</option>
                        <option value="Jersey Esport">Jersey Esport & Polo</option>
                        <option value="Jaket/Hoodie">Jaket & Hoodie Sublim</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Pilihan Serat Kain:</label>
                      <select 
                        id="selectb2b-material"
                        value={materials}
                        onChange={(e) => setMaterials(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Dryfit Milano">Dryfit Milano (Zigzag)</option>
                        <option value="Dryfit Benzema">Dryfit Benzema (Heksa)</option>
                        <option value="Dryfit Super">Dryfit Super (Pori Halus)</option>
                        <option value="Dryfit Waffle">Dryfit Waffle (Tebal Kotak)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Auto Ongkir calculator based on Destination region/Province & Weight */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800/40">
                  <Truck className="w-5 h-5 text-orange-550" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Alamat Kirim & Kalkulator Ongkir</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Alamat Pengiriman Lengkap:</label>
                    <textarea 
                      id="inputb2b-address"
                      required
                      rows={3}
                      placeholder="Tuliskan jalan, nomor, RT/RW, kecamatan, kabupaten, dan kode pos tujuan."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2 px-3.5 focus:outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Wilayah / Provinsi Tujuan:</label>
                      <select 
                        id="selectb2b-region"
                        value={targetRegion}
                        onChange={(e) => setTargetRegion(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="Jatim">Jawa Timur (Local)</option>
                        <option value="Jateng">Jawa Tengah</option>
                        <option value="Jabar_DKI">DKI Jakarta & Jawa Barat</option>
                        <option value="Bali_NTB">Bali & Ntb</option>
                        <option value="Sumatera_Kalimantan">Sumatera & Kalimantan</option>
                        <option value="Papua_Maluku">Papua & Maluku Extreme</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Layanan Ekspedisi:</label>
                      <select 
                        id="selectb2b-courier"
                        value={courier}
                        onChange={(e) => setCourier(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="JNE">JNE Express</option>
                        <option value="J&T">J&T Reguler</option>
                        <option value="Sicepat" as any>Sicepat Cargo</option>
                      </select>
                    </div>
                  </div>

                  {/* Weight info tag */}
                  <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-xs text-neutral-450 font-mono">
                    <span>Estimasi Berat Jersey:</span>
                    <span className="text-orange-550 font-bold">{roundedWeightKg} KG ({roster.length} Jersey)</span>
                  </div>

                  {/* Biteship Connection block */}
                  <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-[10.5px] text-neutral-450 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>Biteship Cost Checking:</span>
                    </div>
                    {isBiteshipCalculating ? (
                      <p className="text-orange-500 font-bold animate-pulse">Menghitung Tarif...</p>
                    ) : (
                      <p className="text-green-500 font-bold uppercase">AKURAT (LIVE)</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: BULK ROSTER MANAGE TABLE (7 COLS) */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800/40 mb-6 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-550" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Daftar Roster Tim (Bulk Input)</h3>
                    <p className="text-[10px] text-neutral-550">Tambahkan baris tak terbatas untuk nama, nomor punggung, dan ukuran.</p>
                  </div>
                </div>

                <button
                  id="btn-add-roster-row"
                  type="button"
                  onClick={handleAddRosterRow}
                  className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-all border border-neutral-800 hover:border-neutral-700"
                >
                  <Plus className="w-4 h-4 text-orange-500" />
                  Tambah Baris Roster
                </button>
              </div>

              {/* ROSTER ROW TABLE BOX */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                {roster.map((row, index) => (
                  <div 
                    key={row.id} 
                    id={`roster-row-${index}`}
                    className="flex items-center gap-2 bg-neutral-950/80 p-3 rounded-xl border border-neutral-850/60 relative group"
                  >
                    {/* Index Bullet indicator */}
                    <span className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-neutral-550 italic font-mono">
                      {index + 1}
                    </span>

                    {/* Name Input */}
                    <div className="flex-grow">
                      <input 
                        id={`roster-row-name-${index}`}
                        type="text"
                        required
                        placeholder="NAMA PEMAIN (e.g. ALFI)"
                        value={row.name}
                        onChange={(e) => handleRosterChange(index, 'name', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-lg py-2 px-3 focus:outline-none focus:border-orange-500 uppercase font-mono tracking-wider"
                      />
                    </div>

                    {/* Number Input */}
                    <div className="w-20">
                      <input 
                        id={`roster-row-number-${index}`}
                        type="text"
                        maxLength={3}
                        placeholder="N0 (7)"
                        value={row.number}
                        onChange={(e) => handleRosterChange(index, 'number', e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-lg py-2 px-2 text-center focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>

                    {/* Sizing dropdown selection */}
                    <div className="w-28">
                      <select
                        id={`roster-row-size-${index}`}
                        value={row.size}
                        onChange={(e) => handleRosterChange(index, 'size', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-orange-500 uppercase"
                      >
                        {sizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Remove player item button */}
                    <button
                      id={`btn-remove-roster-row-${index}`}
                      type="button"
                      disabled={roster.length <= 1}
                      onClick={() => handleRemoveRosterRow(index)}
                      className="text-neutral-500 hover:text-red-500 disabled:opacity-30 disabled:hover:text-neutral-500 p-2 transition-colors"
                      title="Hapus Pemain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* INVOICE SUMMARY PANEL & TOTAL BILLS */}
              <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-800 mt-8 space-y-4">
                <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-505 font-bold pb-2 border-b border-neutral-900">
                  ⚡ ESTIMASI NOTA INVOICE PRODUKSI TIM
                </h4>

                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>
                      Harga Jersey Jasa Cetak Sublim ({roster.length} pcs x Rp {getBasePricePerItem().toLocaleString('id-ID')}):
                    </span>
                    <span className="text-white font-bold">Rp {basePriceValue.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center min-h-[1.5rem]">
                    <span>
                      Ongkos Kirim Kurir ({roundedWeightKg} KG, {courier} - Jasa Kirim {targetRegion.toUpperCase()}):
                    </span>
                    {isBiteshipCalculating ? (
                      <span className="text-orange-500 font-bold flex items-center gap-1.5 animate-pulse font-mono text-[10.5px]">
                        <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block" />
                        Biteship Checking...
                      </span>
                    ) : (
                      <span className="text-white font-bold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-neutral-900 text-sm">
                  <span className="font-extrabold text-white uppercase tracking-wider">TOTAL TAGIHAN (DRAFT INVOICE):</span>
                  <span className="text-xl font-black text-orange-500">Rp {finalTotalPrice.toLocaleString('id-ID')}</span>
                </div>

                {/* Submitting dispatcher status info */}
                <button
                  id="btn-b2b-submit"
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-650 hover:bg-orange-640 text-black bg-orange-500 font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-all disabled:opacity-50 tracking-wider text-sm uppercase shadow-xl shadow-orange-600/10"
                >
                  <MessageSquare className="w-4.5 h-4.5 fill-current shrink-0" />
                  {submitting ? 'Arsip Core Database & Loading WA...' : 'Serahkan Roster & Teruskan Ke WhatsApp Admin'}
                </button>

                <p className="text-[10px] text-neutral-500 text-center leading-relaxed font-medium">
                  *Dengan menekan tombol di atas, seluruh draf roster akan terekap otomatis dan dikirim melalui pesan aman ke WhatsApp admin. Sistem kami juga mendaftarkan ID transaksi Anda untuk pelacakan langsung.
                </p>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
