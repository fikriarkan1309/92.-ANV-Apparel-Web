/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, Search, ArrowRight, CheckCircle, RefreshCw, Filter, 
  Trash2, Plus, MessageSquare, Clipboard, MapPin, DollarSign, 
  Layers, User, Users, Calendar, AlertCircle, Edit, Save, X, Info
} from 'lucide-react';
import { Order, OrderStatus, SizingRosterItem, RosterItem } from '../types';
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

  // Manual Order Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newProductType, setNewProductType] = useState<Order['productType']>('Jersey atasan saja');
  const [newProductCustom, setNewProductCustom] = useState('');
  const [newFabricType, setNewFabricType] = useState<Order['fabricType']>('Dryfit Milano');
  const [newFabricCustom, setNewFabricCustom] = useState('');
  const [newCollar, setNewCollar] = useState('1');
  const [newQty, setNewQty] = useState('12');
  const [newPrice, setNewPrice] = useState('0'); // Admin edits price
  const [newFinishing, setNewFinishing] = useState('');

  // Editing Order State variables
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editShippingAddress, setEditShippingAddress] = useState('');
  const [editProductType, setEditProductType] = useState<Order['productType']>('Jersey atasan saja');
  const [editProductTypeCustom, setEditProductTypeCustom] = useState('');
  const [editFabricType, setEditFabricType] = useState<Order['fabricType']>('Dryfit Milano');
  const [editFabricTypeCustom, setEditFabricTypeCustom] = useState('');
  const [editCollarType, setEditCollarType] = useState('1');
  const [editQuantity, setEditQuantity] = useState<number>(12);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<OrderStatus>('Antrian Desain');
  const [editPayment, setEditPayment] = useState<Order['paymentStatus']>('Belum DP');
  const [editResi, setEditResi] = useState('');
  const [editCourier, setEditCourier] = useState('J&T');
  const [editFinishingOther, setEditFinishingOther] = useState('');
  const [editHasName, setEditHasName] = useState(true);
  const [editHasNumber, setEditHasNumber] = useState(true);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showInstruction, setShowInstruction] = useState(false);

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
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'Lunas') return sum + o.totalPrice;
    if (o.paymentStatus === 'DP 50%') return sum + (o.totalPrice * 0.5);
    return sum;
  }, 0);
  
  const activeJobs = orders.filter(o => o.status !== 'Selesai').length;
  const pendingApprovals = orders.filter(o => o.status === 'Persetujuan Desain').length;
  const completedJobs = orders.filter(o => o.status === 'Selesai').length;

  const handleUpdateOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          customerName: editCustomerName.trim(),
          teamName: editTeamName.trim(),
          contactNumber: editContactNumber.replace(/[^0-9]/g, ''),
          shippingAddress: editShippingAddress.trim(),
          productType: editProductType,
          productTypeCustom: editProductType === 'Lainnya' ? editProductTypeCustom.trim() : undefined,
          fabricType: editFabricType,
          fabricTypeCustom: editFabricType === 'Lainnya' ? editFabricTypeCustom.trim() : undefined,
          collarType: editCollarType,
          quantity: editQuantity,
          totalPrice: editPrice,
          status: editStatus,
          paymentStatus: editPayment,
          resi: editResi ? editResi.trim() : undefined,
          courierName: editCourier ? editCourier.trim() : undefined,
          finishingOther: editFinishingOther.trim(),
          hasNameCheckbox: editHasName,
          hasNumberCheckbox: editHasNumber,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('anv_orders', JSON.stringify(updated));
    setEditingOrderId(null);

    // Sync to Supabase
    const changedOrder = updated.find(o => o.id === orderId);
    if (changedOrder && isSupabaseConnected) {
      saveSupabaseOrder(changedOrder).then((success) => {
        if (success) {
          showToast(`Sikronisasi transaksi ${orderId} ke Supabase berhasil!`, 'success');
        } else {
          showToast(`Gagal menyimpan perubahan ke database cloud Supabase, dicadangkan lokal.`, 'info');
        }
      });
    } else {
      showToast('Perubahan disimpan secara lokal.', 'success');
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newTeamName || !newContact || !newAddress) {
      showToast('Mohon isi seluruh data kontak pemesan dan alamat.', 'error');
      return;
    }

    const randomID = `ANV-${Math.floor(1000 + Math.random() * 9000)}`;
    const freshOrder: Order = {
      id: randomID,
      customerName: newCustName.trim(),
      teamName: newTeamName.trim(),
      contactNumber: newContact.replace(/[^0-9]/g, ''),
      shippingAddress: newAddress.trim(),
      
      productType: newProductType,
      productTypeCustom: newProductType === 'Lainnya' ? newProductCustom.trim() : undefined,
      fabricType: newFabricType,
      fabricTypeCustom: newFabricType === 'Lainnya' ? newFabricCustom.trim() : undefined,
      collarType: newCollar,
      quantity: parseInt(newQty) || 12,
      totalPrice: parseInt(newPrice) || 0,
      
      hasNameCheckbox: true,
      hasNumberCheckbox: true,
      
      roster: [
        { id: '1', name: 'CONTOH PLAYER 1', number: '10', size: 'L' },
        { id: '2', name: 'CONTOH PLAYER 2', number: '07', size: 'M' },
      ],
      sizingRoster: [],
      finishingOther: newFinishing.trim(),
      
      status: 'Antrian Desain',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'Belum DP'
    };

    const updated = [freshOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('anv_orders', JSON.stringify(updated));

    // Sync to Supabase
    if (isSupabaseConnected) {
      saveSupabaseOrder(freshOrder).then((success) => {
        if (success) {
          showToast(`Transaksi ${freshOrder.id} berhasil tersimpan ke database Supabase!`, 'success');
        } else {
          showToast(`Gagal menyimpan transaksi baru ke cloud, disimpan di lokal browser.`, 'info');
        }
      });
    } else {
      showToast('Transaksi baru berhasil ditambahkan secara lokal.', 'success');
    }

    // Reset Form
    setNewCustName('');
    setNewTeamName('');
    setNewContact('');
    setNewAddress('');
    setNewQty('12');
    setNewPrice('0');
    setNewFinishing('');
    setShowAddForm(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Hapus transaksi ${orderId} secara permanen?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem('anv_orders', JSON.stringify(updated));

      if (isSupabaseConnected) {
        deleteSupabaseOrder(orderId).then((success) => {
          if (success) {
            showToast(`Transaksi ${orderId} berhasil dihapus dari cloud Supabase.`, 'success');
          } else {
            showToast(`Gagal menghapus transaksi dari server cloud.`, 'info');
          }
        });
      } else {
        showToast('Transaksi berhasil dihapus dari penyimpanan lokal.', 'success');
      }
    }
  };

  // WhatsApp Alert status notifier
  const handleTriggerStatusWhatsApp = (order: Order) => {
    const timeText = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const text = [
      `*UPDATE PROGRESS PRODUKSI - ANV APPAREL*`,
      `===============================`,
      `Halo Kak *${order.customerName}* dari *${order.teamName}*,`,
      `Berikut adalah pembaruan pengerjaan pesanan tim Anda per tanggal *${timeText}*:`,
      ``,
      `📌 *ID TRANSAKSI:* ${order.id}`,
      `📦 *PRODUK:* ${order.productType} (${order.quantity} pcs)`,
      `🟢 *STATUS TERKINI:* *[ ${order.status.toUpperCase()} ]*`,
      `💳 *PEMBAYARAN:* ${order.paymentStatus}`,
      `💰 *NILAI TAGIHAN:* Rp ${order.totalPrice.toLocaleString('id-ID')}`,
      ``,
      `*Keterangan Progress:*`,
      order.status === 'Antrian Desain' ? 'Saat ini draf roster Anda berada dalam tahap penyusunan berkas vektor desainer layout kami.' :
      order.status === 'Persetujuan Desain' ? 'Mockup visual 3D siap untuk divalidasi! Hubungi admin untuk melihat draf ACC desain Anda.' :
      order.status === 'Proses Sublimasi' ? 'Spesifikasi pola warna jersey saat ini sedang dipanggang menggunakan mesin transfer sublim Mimaki HD.' :
      order.status === 'Press & Jahit' ? 'Hasil print dipotong seimbang lalu memasuki proses penjahitan rante overdeck dobel benang.' :
      order.status === 'Quality Control' ? 'Jersey Anda sudah selesai dirakit! Sedang dibersihkan sisa benang dan dicheck kriteria ukuran oleh QC kami.' :
      order.status === 'Siap Dikirim' ? 'Jersey kebanggaan tim sudah dikemas rapi dengan aman, dan siap diserahkan ke jasa kurir!' :
      order.status === 'Proses Pengiriman' ? `Jersey sedang dikirimkan melalui layanan kurir ekspedisi ${order.courierName || 'J&T'}${order.resi ? ` dengan no resi: *${order.resi}*` : ''}.` :
      'Pesanan Anda selesai! Seluruh jersey tim telah diterima / dikirim tuntas dengan kondisi prima.',
      ``,
      `Terima kasih atas kepercayaannya mempercayakan jersey kebanggaan tim pada ANV Apparel. Pantau progress Anda di situs kami!`,
      `https://anvapparel.com`
    ].join('\n');

    const cleanMsg = encodeURIComponent(text);
    const targetPhone = order.contactNumber.startsWith('0') 
      ? `62${order.contactNumber.substring(1)}` 
      : order.contactNumber;

    window.open(`https://wa.me/${targetPhone}?text=${cleanMsg}`, '_blank');
  };

  // Export Roster list of a single order (Compatible with sizing counts or player list)
  const handleExportRosterToCSV = (order: Order) => {
    const BOM = '\ufeff';
    let csvContent = '';

    const hasPlayers = order.hasNameCheckbox || order.hasNumberCheckbox;

    if (hasPlayers) {
      csvContent = 'No,Nama Pemain,Nomor Punggung,Ukuran Jersey\n';
      const rosterList = order.roster || [];
      if (rosterList.length > 0) {
        rosterList.forEach((player, index) => {
          const name = (player.name || '').replace(/"/g, '""');
          const number = (player.number || '').replace(/"/g, '""');
          const size = (player.size || '').replace(/"/g, '""');
          csvContent += `${index + 1},"${name}","${number}","${size}"\n`;
        });
      } else {
        csvContent += '1,"Belum melengkapi nama roster",-,- \n';
      }
    } else {
      csvContent = 'No,Ukuran Jersey,Jumlah Pesanan (Pcs)\n';
      const sizeList = order.sizingRoster || [];
      if (sizeList.length > 0) {
        sizeList.forEach((item, index) => {
          const size = (item.size || '').replace(/"/g, '""');
          csvContent += `${index + 1},"${size}",${item.qty}\n`;
        });
      } else {
        csvContent += '1,"Belum melengkapi data ukuran",0\n';
      }
    }

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const sanitizedTeam = order.teamName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Roster_${order.id}_${sanitizedTeam}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Roster tim ${order.teamName} berhasil diunduh!`, 'success');
  };

  // Export all rosters to a single complex CSV file
  const handleExportAllRostersToCSV = () => {
    if (orders.length === 0) {
      showToast('Tidak ada data transaksi untuk diekspor.', 'error');
      return;
    }

    const BOM = '\ufeff';
    let csvContent = 'Kode Pesanan,Nama Tim,Produk,Bahan,Model Kerah,Tipe Roster,Detail Roster (Nama/Ukuran),No Punggung/Jumlah Qty\n';

    orders.forEach((order) => {
      const orderId = order.id;
      const teamName = order.teamName.replace(/"/g, '""');
      const product = order.productType.replace(/"/g, '""');
      const fabric = order.fabricType.replace(/"/g, '""');
      const collar = order.collarType;

      const hasPlayers = order.hasNameCheckbox || order.hasNumberCheckbox;

      if (hasPlayers) {
        if (order.roster && order.roster.length > 0) {
          order.roster.forEach((player) => {
            const name = (player.name || '').replace(/"/g, '""');
            const num = (player.number || '').replace(/"/g, '""');
            const size = (player.size || '').replace(/"/g, '""');
            csvContent += `"${orderId}","${teamName}","${product}","${fabric}","${collar}","Player Roster","${name} [Size: ${size}]","${num}"\n`;
          });
        } else {
          csvContent += `"${orderId}","${teamName}","${product}","${fabric}","${collar}","Player Roster","(Roster Belum Diisi)",-\n`;
        }
      } else {
        if (order.sizingRoster && order.sizingRoster.length > 0) {
          order.sizingRoster.forEach((item) => {
            const size = item.size.replace(/"/g, '""');
            csvContent += `"${orderId}","${teamName}","${product}","${fabric}","${collar}","Sizing Counter","Ukuran ${size}",${item.qty}\n`;
          });
        } else {
          csvContent += `"${orderId}","${teamName}","${product}","${fabric}","${collar}","Sizing Counter","(Sizing Belum Diisi)",-\n`;
        }
      }
    });

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Seluruh_Roster_ANV_Apparel.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Seluruh daftar roster berhasil diunduh.', 'success');
  };

  // Export metadata of all orders to CSV
  const handleExportOrdersToCSV = () => {
    if (orders.length === 0) {
      showToast('Tidak ada data transaksi.', 'error');
      return;
    }

    const BOM = '\ufeff';
    let csvContent = 'Kode Pesanan,Nama Koordinator,Nama Tim,Produk,Spesifikasi Bahan,Model Kerah,Jumlah (Pcs),Harga Total,Status Produksi,Status Pembayaran,Mempunyai Nama,Mempunyai No Pung,Alamat Pengiriman,No Resi,Ekspedisi Kurir,Catatan Finishing,Tanggal Masuk\n';

    orders.forEach((order) => {
      const id = order.id;
      const customer = order.customerName.replace(/"/g, '""');
      const team = order.teamName.replace(/"/g, '""');
      const product = order.productType;
      const fabric = order.fabricType;
      const collar = order.collarType;
      const qty = order.quantity;
      const price = order.totalPrice;
      const status = order.status;
      const payment = order.paymentStatus;
      const hasName = order.hasNameCheckbox ? 'YA' : 'TIDAK';
      const hasNo = order.hasNumberCheckbox ? 'YA' : 'TIDAK';
      const address = order.shippingAddress.replace(/"/g, '""');
      const resi = order.resi || '-';
      const courier = order.courierName || '-';
      const finishing = (order.finishingOther || '-').replace(/"/g, '""');
      const date = new Date(order.createdAt).toLocaleDateString('id-ID');

      csvContent += `"${id}","${customer}","${team}","${product}","${fabric}","${collar}",${qty},${price},"${status}","${payment}","${hasName}","${hasNo}","${address}","${resi}","${courier}","${finishing}","${date}"\n`;
    });

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Invoice_Pemesanan_ANV.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Rekap pesanan berhasil diekspor.', 'success');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || o.productType === filterType;
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
            <p className="text-neutral-400 text-xs md:text-sm mt-1">
              Panel sentral bagi admin untuk memodifikasi total harga, merubah status produksi, mendownload CSV, serta mengabarkan status melalui WA.
            </p>
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
                window.location.href = window.location.origin + window.location.pathname;
              }}
              className="bg-neutral-900 hover:bg-neutral-800 text-red-500 hover:text-red-400 font-extrabold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all border border-neutral-800"
            >
              <X className="w-4 h-4" />
              <span>Kunci Akses</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS COUNTERS */}
        <div id="admin-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-black">OMSET BERDASARKAN DP / LUNAS</p>
            <h4 className="text-xl md:text-2xl font-black text-white mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h4>
            <span className="text-[10px] text-green-505 font-bold mt-1 block">✓ Dana Masuk Riil</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-black">AKTIF PROSES PRODUKSI</p>
            <h4 className="text-xl md:text-2xl font-black text-orange-500 mt-1">
              {activeJobs} Pesanan
            </h4>
            <span className="text-[10px] text-neutral-400 mt-1 block">Jersey sedang dirakit</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-black">ACC LAYOUT VEKTOR</p>
            <h4 className="text-xl md:text-2xl font-black text-yellow-500 mt-1">
              {pendingApprovals} Tim
            </h4>
            <span className="text-[10px] text-neutral-450 mt-1 block">Menunggu validasi desain</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-xl">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-black">TUNTAS SELESAI</p>
            <h4 className="text-xl md:text-2xl font-black text-gray-400 mt-1">
              {completedJobs} Tim
            </h4>
            <span className="text-[10px] text-neutral-505 mt-1 block">Telah serah terima</span>
          </div>
        </div>

        {/* MANUAL ADD FORM COLLAPSIBLE */}
        {showAddForm && (
          <div id="admin-add-form-container" className="bg-neutral-900 border border-orange-500/20 p-6 rounded-2xl mb-10 shadow-2xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white mb-4">Pendaftaran Pesanan Manual (Pemesan Walk-In / Telepon)</h3>
            <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-neutral-200">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Nama Pemesan / Koordinator:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ahmad Ghozali" 
                  value={newCustName} 
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-heavy"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Nama Tim Olahraga:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Aremania Esports" 
                  value={newTeamName} 
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-heavy"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">No WhatsApp:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 62812345678" 
                  value={newContact} 
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-mono font-heavy"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Produk Jersey:</label>
                <select
                  value={newProductType}
                  onChange={(e) => setNewProductType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-bold"
                >
                  <option value="Jersey atasan saja">Jersey Atasan Saja</option>
                  <option value="Jersey Setelan">Jersey Setelan</option>
                  <option value="Jaket">Jaket Sublim</option>
                  <option value="Jaket+Training">Jaket + Training</option>
                  <option value="Lainnya">Lainnya, tulis custom...</option>
                </select>
              </div>

              {newProductType === 'Lainnya' && (
                <div>
                  <label className="text-xs text-orange-500 mb-1 block font-bold">Sebutkan Produk Lainnya:</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rompi Tim" 
                    value={newProductCustom} 
                    onChange={(e) => setNewProductCustom(e.target.value)}
                    className="w-full bg-neutral-950 border border-orange-500/20 text-xs py-2.5 px-4 rounded-xl text-white font-bold"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Spesifikasi Serat Kain:</label>
                <select
                  value={newFabricType}
                  onChange={(e) => setNewFabricType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-bold"
                >
                  <option value="Dryfit Milano">Dryfit Milano</option>
                  <option value="Dryfit Bintik">Dryfit Bintik</option>
                  <option value="Dryfit Benzema">Dryfit Benzema</option>
                  <option value="Dryfit Waffle">Dryfit Waffle</option>
                  <option value="Emboss Topograf">Emboss Topograf</option>
                  <option value="Emboss Jackuard">Emboss Jackuard</option>
                  <option value="Emboss Straw">Emboss Straw</option>
                  <option value="Lainnya">Lainnya, sebutkan...</option>
                </select>
              </div>

              {newFabricType === 'Lainnya' && (
                <div>
                  <label className="text-xs text-orange-500 mb-1 block font-bold">Sebutkan Bahan Lainnya:</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Spandex Premium" 
                    value={newFabricCustom} 
                    onChange={(e) => setNewFabricCustom(e.target.value)}
                    className="w-full bg-neutral-950 border border-orange-500/20 text-xs py-2.5 px-4 rounded-xl text-white font-bold"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Pilihan Kerah (1-12):</label>
                <input 
                  type="text" 
                  placeholder="Kerah Model No 1-12" 
                  value={newCollar} 
                  required
                  onChange={(e) => setNewCollar(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Jumlah Pesanan (Pcs):</label>
                <input 
                  type="number" 
                  required
                  value={newQty} 
                  onChange={(e) => setNewQty(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Total Harga Invoice Ditentukan (Rp):</label>
                <input 
                  type="number" 
                  required
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Alamat Pengiriman Lengkap:</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Perum Gatsu Barat No. 88, Denpasar, Bali" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white leading-relaxed font-semibold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-neutral-400 mb-1 block font-bold">Catatan Finishing Tambahan:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sablon logo tim sublim, sponsor kerah rib zigzag putih" 
                  value={newFinishing} 
                  onChange={(e) => setNewFinishing(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs py-2.5 px-4 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-550 text-white text-xs font-black py-2.5 px-6 rounded-lg uppercase transition-all tracking-wider font-mono shadow-md"
                >
                  Daftarkan Pesanan ke Database
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & SYSTEM FILTER ROILS */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center shadow-lg">
          
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-450 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Kode, Nama Pemesan atau Nama Tim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-xs rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0 select-none">
            {/* Category selection */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg font-bold"
            >
              <option value="ALL">Semua Produk</option>
              <option value="Jersey atasan saja">Jersey Atasan Saja</option>
              <option value="Jersey Setelan">Jersey Setelan</option>
              <option value="Jaket">Jaket Sublim</option>
              <option value="Jaket+Training">Jaket + Training</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            {/* Status selection */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg font-bold"
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
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-lg font-bold"
            >
              <option value="ALL">Status Bayar</option>
              <option value="Belum DP">Belum DP</option>
              <option value="DP 50%">DP 50%</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

        </div>

        {/* CORE DATABASE ORDERS LIST CONTAINER */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl relative">
          
          <div className="p-5 border-b border-neutral-800 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-neutral-900">
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
                Daftar Transaksi Tim ({filteredOrders.length} Ditemukan)
              </h3>
              <p className="text-[10px] font-mono text-neutral-500 mt-0.5">Admin berwenang meralat harga manual dan mendownload rekap.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                id="btn-export-orders"
                onClick={handleExportOrdersToCSV}
                className="bg-neutral-950 hover:bg-neutral-850 text-neutral-305 hover:text-white text-[11px] font-bold py-2 px-3 border border-neutral-800 rounded-xl transition-all flex items-center gap-1.5 font-mono"
              >
                <Clipboard className="w-3.5 h-3.5 text-orange-500" />
                <span>Unduh Rekap Transaksi (.csv)</span>
              </button>
              <button
                id="btn-export-rosters"
                onClick={handleExportAllRostersToCSV}
                className="bg-orange-650/10 hover:bg-orange-600/20 text-orange-500 hover:text-orange-400 text-[11px] font-black py-2 px-3 border border-orange-500/20 rounded-xl transition-all flex items-center gap-1.5 font-mono"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Unduh Seluruh Roster (.csv)</span>
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-14 text-center text-neutral-500">
              <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-300 mb-1">Tidak Ada Pesanan Memenuhi Kriteria</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Silakan ganti kata kunci pencarian Anda, atau rubah filter untuk menampilkan seluruh database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800/80 bg-neutral-950/20 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4 font-black">KODE</th>
                    <th className="py-3.5 px-4 font-black">KOR / PEMESAN & TIM OLAHRAGA</th>
                    <th className="py-3.5 px-4 font-black text-center">TGL MASUK</th>
                    <th className="py-3.5 px-4 font-black">HARGA (OLEH ADMIN)</th>
                    <th className="py-3.5 px-4 font-black">PROGRESS PRODUKSI</th>
                    <th className="py-3.5 px-4 text-center font-black">NAVIGASI</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-neutral-850">
                  {filteredOrders.map((order) => {
                    const isEditing = editingOrderId === order.id;
                    const isExpanded = expandedOrderId === order.id;
                    const dateText = new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <React.Fragment key={order.id}>
                        <tr 
                          id={`admin-order-record-${order.id}`}
                          className="hover:bg-neutral-950/20 transition-all"
                        >
                          {/* 1. Code */}
                          <td className="py-4 px-4 font-black text-white font-mono tracking-wider">
                            {order.id}
                          </td>

                          {/* 2. Pemesan Contact Details */}
                          <td className="py-4 px-4 space-y-1">
                            {isEditing ? (
                              <div className="space-y-1.5 max-w-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                                <div>
                                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">Koordinator:</span>
                                  <input 
                                    type="text"
                                    value={editCustomerName}
                                    onChange={(e) => setEditCustomerName(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 text-[11px] font-black rounded p-1 text-white w-full"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">Tim Olahraga:</span>
                                  <input 
                                    type="text"
                                    value={editTeamName}
                                    onChange={(e) => setEditTeamName(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 text-[11px] font-black rounded p-1 text-white w-full"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">WhatsApp:</span>
                                  <input 
                                    type="text"
                                    value={editContactNumber}
                                    onChange={(e) => setEditContactNumber(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 text-[11px] font-mono rounded p-1 text-white w-full"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h5 className="font-extrabold text-neutral-100">{order.customerName}</h5>
                                <p className="text-neutral-400 flex items-center gap-1 text-[11.5px] mt-0.5">
                                  <Users className="w-3.5 h-3.5 text-neutral-550 shrink-0" />
                                  <span>{order.teamName}</span>
                                </p>
                                <p className="text-neutral-500 text-[10.5px] font-mono">WA: +{order.contactNumber}</p>
                              </div>
                            )}

                            <div className="pt-1.5">
                              <button
                                id={`btn-toggle-roster-${order.id}`}
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                className="text-[10.5px] font-black text-orange-500 hover:text-orange-400 flex items-center gap-0.5 transition-all"
                              >
                                <span>{expandedOrderId === order.id ? 'Tutup Detail & Roster' : `Lihat Roster & Detail (${order.quantity} pcs)`}</span>
                                <ArrowRight className={`w-3 h-3 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                              </button>
                            </div>
                          </td>

                          {/* 3. Date */}
                          <td className="py-4 px-4 text-neutral-400 font-mono text-center whitespace-nowrap">
                            {dateText}
                          </td>

                          {/* 4. Manual Price Control & Payment Status */}
                          <td className="py-4 px-4 space-y-1.5 whitespace-nowrap">
                            {isEditing ? (
                              <div className="space-y-1 px-2.5 py-1.5 bg-neutral-950 rounded-lg border border-neutral-800">
                                <span className="text-[9px] text-neutral-500 uppercase block font-bold">Harga Rata:</span>
                                <div className="flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-800 rounded">
                                  <span className="text-[10px] text-neutral-400 font-mono">Rp</span>
                                  <input 
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(Number(e.target.value))}
                                    className="bg-transparent text-xs font-mono text-white focus:outline-none w-20"
                                  />
                                </div>
                                <span className="text-[9px] text-neutral-500 uppercase block font-bold mt-1.5">Model Bayar:</span>
                                <select 
                                  value={editPayment}
                                  onChange={(e) => setEditPayment(e.target.value as any)}
                                  className="bg-neutral-900 border border-neutral-850 text-[10.5px] text-white p-1 rounded w-full focus:outline-none"
                                >
                                  <option value="Belum DP">Belum DP</option>
                                  <option value="DP 50%">DP 50%</option>
                                  <option value="Lunas">Lunas</option>
                                </select>
                              </div>
                            ) : (
                              <div>
                                <strong className="text-sm font-black text-white font-mono block">
                                  {order.totalPrice > 0 ? `Rp ${order.totalPrice.toLocaleString('id-ID')}` : 'Belum Ditentukan'}
                                </strong>
                                <span className={`inline-block text-[9px] px-2 py-0.5 mt-1 rounded font-black tracking-widest uppercase border ${
                                  order.paymentStatus === 'Lunas' ? 'bg-green-650/10 text-green-500 border-green-600/20' :
                                  order.paymentStatus === 'DP 50%' ? 'bg-orange-655/10 text-orange-500 border-orange-550/25' :
                                  'bg-red-650/10 text-red-500 border-red-600/30'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 5. Progress Status */}
                          <td className="py-4 px-4">
                            {isEditing ? (
                              <div className="space-y-1.5 p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                                <span className="text-[9px] text-neutral-500 uppercase block font-bold">Produksi:</span>
                                <select
                                  id={`edit-status-${order.id}`}
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                                  className="bg-neutral-900 text-[11px] border border-neutral-800 text-white rounded p-1 w-full"
                                >
                                  {statusList.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>

                                {(editStatus === 'Proses Pengiriman' || editStatus === 'Selesai') && (
                                  <div className="p-1 bg-neutral-900 rounded space-y-1 border border-neutral-850 mt-1">
                                    <input 
                                      type="text"
                                      placeholder="No Resi (e.g. BS3191)"
                                      value={editResi}
                                      onChange={(e) => setEditResi(e.target.value)}
                                      className="w-full bg-neutral-955 text-[10px] font-mono border border-neutral-800 p-1 text-white placeholder:text-neutral-600"
                                    />
                                    <input 
                                      type="text"
                                      placeholder="Kurir (e.g. J&T)"
                                      value={editCourier}
                                      onChange={(e) => setEditCourier(e.target.value)}
                                      className="w-full bg-neutral-955 text-[10px] font-mono border border-neutral-800 p-1 text-white"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className={`inline-block font-sans font-black text-[10px] px-2.5 py-1 rounded-full ${
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
                                {order.resi && (
                                  <div className="text-[10px] text-neutral-400 bg-neutral-950 border border-neutral-850 p-1 rounded font-mono mt-1">
                                    <p className="font-bold text-orange-500 truncate" title={order.resi}>{order.resi}</p>
                                    <p className="text-[8.5px] uppercase font-bold text-neutral-500">{order.courierName || 'J&T'}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 6. Action buttons */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* WhatsApp notifier */}
                              <button
                                id={`btn-alert-wa-${order.id}`}
                                onClick={() => handleTriggerStatusWhatsApp(order)}
                                className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-orange-500 hover:text-orange-400 p-2 rounded-xl transition-colors font-bold text-[11px] shrink-0"
                                title="Kirim notifikasi progress pesanan ke WA Klien"
                              >
                                <MessageSquare className="w-3.5 h-3.5 fill-current inline mr-1" />
                                <span>Notif WA</span>
                              </button>

                              {/* Edit triggers toggling */}
                              {isEditing ? (
                                <button
                                  id={`btn-save-order-${order.id}`}
                                  onClick={() => handleUpdateOrder(order.id)}
                                  className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors shadow"
                                  title="Simpan seluruh revisi admin"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  id={`btn-edit-order-${order.id}`}
                                  onClick={() => {
                                    setEditingOrderId(order.id);
                                    setEditCustomerName(order.customerName);
                                    setEditTeamName(order.teamName);
                                    setEditContactNumber(order.contactNumber);
                                    setEditShippingAddress(order.shippingAddress);
                                    setEditProductType(order.productType || 'Jersey atasan saja');
                                    setEditProductTypeCustom(order.productTypeCustom || '');
                                    setEditFabricType(order.fabricType || 'Dryfit Milano');
                                    setEditFabricTypeCustom(order.fabricTypeCustom || '');
                                    setEditCollarType(order.collarType || '1');
                                    setEditQuantity(order.quantity || 12);
                                    setEditPrice(order.totalPrice || 0);
                                    setEditStatus(order.status);
                                    setEditPayment(order.paymentStatus);
                                    setEditResi(order.resi || '');
                                    setEditCourier(order.courierName || 'J&T');
                                    setEditFinishingOther(order.finishingOther || '');
                                    setEditHasName(order.hasNameCheckbox);
                                    setEditHasNumber(order.hasNumberCheckbox);
                                  }}
                                  className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white p-2 rounded-xl transition-all"
                                  title="Ralat rincian parameter pesanan"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete orders */}
                              <button
                                id={`btn-delete-order-${order.id}`}
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-neutral-500 hover:text-red-500 p-2 transition-colors duration-200"
                                title="Hapus pesanan ini dari database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>

                        {/* EXPANDED DETAIL VIEW & SPECIFICATIONS PANEL */}
                        {isExpanded && (
                          <tr id={`roster-detail-row-${order.id}`} className="bg-neutral-950/40">
                            <td colSpan={6} className="p-4 border-l-4 border-orange-500">
                              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl md:grid md:grid-cols-12 gap-6">
                                
                                {/* A. left Specifications Panel (5 cols) */}
                                <div className="md:col-span-5 space-y-4">
                                  <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-805">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                    <h6 className="font-heavy text-xs text-white uppercase tracking-wider">Detail Pesanan & Bahan</h6>
                                  </div>

                                  {isEditing ? (
                                    // ADMIN EDIT FORM FOR PRODUCTS
                                    <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-neutral-200">
                                      <div>
                                        <span className="text-[10px] text-neutral-450 uppercase font-bold">Produk:</span>
                                        <select
                                          value={editProductType}
                                          onChange={(e) => setEditProductType(e.target.value as any)}
                                          className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 font-bold"
                                        >
                                          <option value="Jersey atasan saja">Jersey Atasan Saja</option>
                                          <option value="Jersey Setelan">Jersey Setelan</option>
                                          <option value="Jaket">Jaket Sublim</option>
                                          <option value="Jaket+Training">Jaket+Training</option>
                                          <option value="Lainnya">Lainnya...</option>
                                        </select>
                                        {editProductType === 'Lainnya' && (
                                          <input 
                                            type="text"
                                            placeholder="Tulis nama barang..."
                                            value={editProductTypeCustom}
                                            onChange={(e) => setEditProductTypeCustom(e.target.value)}
                                            className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1.5 font-bold"
                                          />
                                        )}
                                      </div>

                                      <div>
                                        <span className="text-[10px] text-neutral-450 uppercase font-bold">Kain:</span>
                                        <select
                                          value={editFabricType}
                                          onChange={(e) => setEditFabricType(e.target.value as any)}
                                          className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 font-bold"
                                        >
                                          <option value="Dryfit Milano">Dryfit Milano</option>
                                          <option value="Dryfit Bintik">Dryfit Bintik</option>
                                          <option value="Dryfit Benzema">Dryfit Benzema</option>
                                          <option value="Dryfit Waffle">Dryfit Waffle</option>
                                          <option value="Emboss Topograf">Emboss Topograf</option>
                                          <option value="Emboss Jackuard">Emboss Jackuard</option>
                                          <option value="Emboss Straw">Emboss Straw</option>
                                          <option value="Lainnya">Lainnya...</option>
                                        </select>
                                        {editFabricType === 'Lainnya' && (
                                          <input 
                                            type="text"
                                            placeholder="Tulis nama bahan..."
                                            value={editFabricTypeCustom}
                                            onChange={(e) => setEditFabricTypeCustom(e.target.value)}
                                            className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1.5 font-bold"
                                          />
                                        )}
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[10px] text-neutral-450 uppercase font-bold">Model Kerah:</span>
                                          <input 
                                            type="text"
                                            value={editCollarType}
                                            onChange={(e) => setEditCollarType(e.target.value)}
                                            className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 font-bold font-mono"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-neutral-450 uppercase font-bold">Total Pcs (QTY):</span>
                                          <input 
                                            type="number"
                                            value={editQuantity}
                                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                                            className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 font-bold font-mono"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <span className="text-[10px] text-neutral-450 uppercase font-bold">Alamat Pengiriman:</span>
                                        <textarea
                                          value={editShippingAddress}
                                          rows={2}
                                          onChange={(e) => setEditShippingAddress(e.target.value)}
                                          className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 leading-normal font-semibold"
                                        />
                                      </div>

                                      <div>
                                        <span className="text-[10px] text-neutral-450 uppercase font-bold">Tambahan Finishing:</span>
                                        <textarea
                                          value={editFinishingOther}
                                          rows={2}
                                          onChange={(e) => setEditFinishingOther(e.target.value)}
                                          className="bg-neutral-900 text-xs border border-neutral-800 rounded p-1.5 w-full text-white mt-1 leading-normal"
                                        />
                                      </div>

                                      <div className="flex gap-2">
                                        <label className="flex items-center gap-1.5 text-[11px]">
                                          <input type="checkbox" checked={editHasName} onChange={(e) => setEditHasName(e.target.checked)} className="accent-orange-500" />
                                          <span>Custom Nama</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-[11px]">
                                          <input type="checkbox" checked={editHasNumber} onChange={(e) => setEditHasNumber(e.target.checked)} className="accent-orange-500" />
                                          <span>Custom Nomor</span>
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    // STANDARD READ-ONLY METADATA REPORT
                                    <div className="space-y-2 text-xs">
                                      <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                                        <div>
                                          <p className="text-[10px] text-neutral-500 uppercase">PRODUK:</p>
                                          <strong className="text-white text-xs">
                                            {order.productType === 'Lainnya' ? order.productTypeCustom : order.productType}
                                          </strong>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-neutral-500 uppercase">PILIHAN BAHAN:</p>
                                          <strong className="text-white text-xs">
                                            {order.fabricType === 'Lainnya' ? order.fabricTypeCustom : order.fabricType}
                                          </strong>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                                        <div>
                                          <p className="text-[10px] text-neutral-500 uppercase">KERAH:</p>
                                          <strong className="text-white text-xs">No. {order.collarType}</strong>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-neutral-500 uppercase">QTY:</p>
                                          <strong className="text-white text-xs font-mono">{order.quantity} Pcs</strong>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-neutral-500 uppercase">ROSTER:</p>
                                          <strong className="text-orange-500 text-xs uppercase font-mono">
                                            {order.hasNameCheckbox || order.hasNumberCheckbox ? 'Custom List' : 'Sizing Only'}
                                          </strong>
                                        </div>
                                      </div>

                                      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1.5 text-neutral-350">
                                        <div>
                                          <span className="text-[10px] text-neutral-500 uppercase block font-bold">ALAMAT PENGIRIMAN:</span>
                                          <p className="text-white leading-relaxed font-semibold">{order.shippingAddress || '-'}</p>
                                        </div>
                                        <div className="pt-2 border-t border-neutral-900">
                                          <span className="text-[10px] text-neutral-500 uppercase block font-bold">FINISHING LAINNYA:</span>
                                          <p className="text-white leading-normal italic">{order.finishingOther || 'Tidak ada spesifikasi tambahan.'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* B. Right active Roster display panel (7 cols) */}
                                <div className="md:col-span-7 mt-5 md:mt-0 space-y-4">
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-neutral-805">
                                    <div className="flex items-center gap-1.5">
                                      <Users className="w-4 h-4 text-orange-500" />
                                      <h6 className="font-heavy text-xs text-white uppercase tracking-wider">
                                        {order.hasNameCheckbox || order.hasNumberCheckbox ? 'Roster Pemain Custom' : 'Rekap Sizing List'}
                                      </h6>
                                    </div>
                                    <button
                                      id={`btn-download-roster-csv-${order.id}`}
                                      onClick={() => handleExportRosterToCSV(order)}
                                      className="bg-orange-500/10 hover:bg-orange-600/20 text-orange-500 hover:text-orange-400 font-bold text-[11px] py-1 px-3 rounded-lg border border-orange-500/15 flex items-center gap-1.5 transition-all font-mono"
                                    >
                                      <span>Unduh Roster (.csv)</span>
                                    </button>
                                  </div>

                                  {/* Render standard players cards if Name/No is checked */}
                                  {(order.hasNameCheckbox || order.hasNumberCheckbox) ? (
                                    <div>
                                      {order.roster && order.roster.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                                          {order.roster.map((player, idx) => (
                                            <div key={idx} className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg flex items-center justify-between gap-1.5">
                                              <div className="min-w-0 flex-grow font-mono">
                                                <p className="font-black text-white text-[11px] truncate uppercase" title={player.name}>
                                                  {order.hasNameCheckbox ? (player.name || '-') : '(Tanpa Nama)'}
                                                </p>
                                                <span className="text-[9.5px] text-neutral-500">
                                                  {order.hasNumberCheckbox ? `No. ${player.number || '00'}` : '(Tanpa No)'}
                                                </span>
                                              </div>
                                              <span className="bg-orange-500/10 text-orange-500 border border-orange-500/10 text-[10px] font-black px-2 py-0.5 rounded shrink-0">
                                                {player.size || '-'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-neutral-505 italic py-6 text-center">Tabel roster belum diinput oleh pembeli.</p>
                                      )}
                                    </div>
                                  ) : (
                                    // Render Sizing blocks if neither checked
                                    <div>
                                      {order.sizingRoster && order.sizingRoster.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                          {order.sizingRoster.map((item, idx) => (
                                            <div key={idx} className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl text-center space-y-1">
                                              <span className="text-[10px] text-neutral-450 uppercase font-bold block">Ukuran</span>
                                              <strong className="text-orange-500 font-mono font-black text-sm block">{item.size}</strong>
                                              <p className="text-white text-xs font-mono font-bold bg-neutral-900 border border-neutral-805 py-0.5 rounded leading-none">
                                                {item.qty} Pcs
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-neutral-505 italic py-6 text-center">Sizing matrix kosong atau belum diinput.</p>
                                      )}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
