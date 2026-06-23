/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus = 'Antrian Desain' | 'Persetujuan Desain' | 'Proses Sublimasi' | 'Press & Jahit' | 'Quality Control' | 'Siap Dikirim' | 'Proses Pengiriman' | 'Selesai';

export interface Order {
  id: string; // Order Number / Transaction Code (e.g. ANV-2026-001)
  customerName: string;
  teamName: string;
  contactNumber: string;
  orderType: 'Jersey Futsal' | 'Jersey Basket' | 'Jersey Voli' | 'Jersey Esport' | 'Jaket/Hoodie';
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  updatedAt: string;
  createdAt: string;
  paymentStatus: 'Belum DP' | 'DP 50%' | 'Lunas';
  roster: RosterItem[];
  shippingAddress: string;
  resi?: string;
  courierName?: string;
}

export interface RosterItem {
  id: string;
  name: string;
  number: string;
  size: string;
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
