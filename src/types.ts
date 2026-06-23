/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus = 'Antrian Desain' | 'Persetujuan Desain' | 'Proses Sublimasi' | 'Press & Jahit' | 'Quality Control' | 'Siap Dikirim' | 'Proses Pengiriman' | 'Selesai';

export interface Order {
  id: string; // Order Number / Transaction Code (e.g. ANV-2026-001)
  customerName: string; // Nama Koordinator / Pemesan
  teamName: string; // Nama Tim Olahraga
  contactNumber: string; // Nomor WhatsApp Acuan
  shippingAddress: string; // Alamat Pengiriman
  
  // Detail Pesanan
  productType: 'Jersey atasan saja' | 'Jersey Setelan' | 'Jaket' | 'Jaket+Training' | 'Lainnya';
  productTypeCustom?: string;
  fabricType: 'Dryfit Milano' | 'Dryfit Bintik' | 'Dryfit Benzema' | 'Dryfit Waffle' | 'Emboss Topograf' | 'Emboss Jackuard' | 'Emboss Straw' | 'Lainnya';
  fabricTypeCustom?: string;
  collarType: string; // Pilihan nomor 1-12
  quantity: number; // Jumlah Pesanan (total)
  
  hasNameCheckbox: boolean; // Pilihan Nama Punggung
  hasNumberCheckbox: boolean; // Pilihan Nomor Punggung
  
  roster: RosterItem[]; // Used when custom name or number is checked
  sizingRoster?: SizingRosterItem[]; // Used when neither is checked (just size and quantity)
  
  finishingOther: string; // Finishing lainnya
  
  totalPrice: number; // Edited manually by Admin
  status: OrderStatus;
  updatedAt: string;
  createdAt: string;
  paymentStatus: 'Belum DP' | 'DP 50%' | 'Lunas';
  resi?: string;
  courierName?: string;
}

export interface RosterItem {
  id: string;
  name: string;
  number: string;
  size: string;
}

export interface SizingRosterItem {
  size: string;
  qty: number;
}

export interface FabricMaterial {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  characteristics: string[];
  image: string; // generated preview/icon placeholder
  suitability: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  priceEstimate: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  collarDetail: string;
  stitchDetail: string;
  sharpnessDetail: string;
}
