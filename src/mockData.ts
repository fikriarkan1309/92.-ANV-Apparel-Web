/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, FabricMaterial, ProductCatalogItem, PortfolioItem } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ANV-5091',
    customerName: 'Ahmad Fikri',
    teamName: 'Malang United FC',
    contactNumber: '6281234567890',
    orderType: 'Jersey Futsal',
    quantity: 14,
    totalPrice: 2100000,
    status: 'Proses Sublimasi',
    updatedAt: '2026-06-22T14:30:00Z',
    createdAt: '2026-06-12T09:00:00Z',
    paymentStatus: 'DP 50%',
    shippingAddress: 'Jl. Ijen No. 45, Kota Malang, Jawa Timur',
    roster: [
      { id: '1', name: 'Alfi', number: '10', size: 'M' },
      { id: '2', name: 'Rendra', number: '7', size: 'L' },
      { id: '3', name: 'Zidane', number: '21', size: 'XL' },
      { id: '4', name: 'Bagas', number: '9', size: 'L' },
      { id: '5', name: 'Doni', number: '1', size: 'M' },
      { id: '6', name: 'Eko', number: '4', size: 'XL' },
      { id: '7', name: 'Farez', number: '5', size: 'S' },
      { id: '8', name: 'Gani', number: '8', size: 'L' },
      { id: '9', name: 'Haikal', number: '11', size: 'M' },
      { id: '10', name: 'Irfan', number: '14', size: 'XL' },
      { id: '11', name: 'Jody', number: '6', size: 'M' },
      { id: '12', name: 'Kelvin', number: '3', size: 'L' },
      { id: '13', name: 'Luthfi', number: '17', size: 'M' },
      { id: '14', name: 'Mirza', number: '99', size: 'XXL' },
    ],
  },
  {
    id: 'ANV-3482',
    customerName: 'Diana Putri',
    teamName: 'Srikandi Esport',
    contactNumber: '628765432109',
    orderType: 'Jersey Esport',
    quantity: 6,
    totalPrice: 1020000,
    status: 'Antrian Desain',
    updatedAt: '2026-06-21T10:15:00Z',
    createdAt: '2026-06-21T08:00:00Z',
    paymentStatus: 'Belum DP',
    shippingAddress: 'Perum Gading Astri Blok C-12, Sleman, DI Yogyakarta',
    roster: [
      { id: '1', name: 'Diana', number: '07', size: 'S' },
      { id: '2', name: 'Novi', number: '13', size: 'M' },
      { id: '3', name: 'Amalia', number: '24', size: 'S' },
      { id: '4', name: 'Fitri', number: '11', size: 'M' },
      { id: '5', name: 'Salsa', number: '01', size: 'S' },
      { id: '6', name: 'Vania', number: '88', size: 'L' },
    ],
  },
  {
    id: 'ANV-8821',
    customerName: 'Raditya Wijaya',
    teamName: 'Pertamina Basketball Club',
    contactNumber: '6281122334455',
    orderType: 'Jersey Basket',
    quantity: 12,
    totalPrice: 2280000,
    status: 'Proses Pengiriman',
    updatedAt: '2026-06-22T17:00:00Z',
    createdAt: '2026-06-10T11:45:00Z',
    paymentStatus: 'Lunas',
    shippingAddress: 'Graha Pertamina Lt. 12, Gambir, Jakarta Pusat',
    roster: [
      { id: '1', name: 'Radit', number: '23', size: 'XL' },
      { id: '2', name: 'Arya', number: '0', size: 'XXL' },
      { id: '3', name: 'Bimo', number: '15', size: 'XL' },
      { id: '4', name: 'Dito', number: '4', size: 'L' },
      { id: '5', name: 'Eza', number: '33', size: 'XL' },
      { id: '6', name: 'Farhan', number: '8', size: 'XXL' },
      { id: '7', name: 'Hadi', number: '11', size: 'L' },
      { id: '8', name: 'Kaka', number: '10', size: 'M' },
      { id: '9', name: 'Nico', number: '2', size: 'XL' },
      { id: '10', name: 'Rama', number: '1', size: 'L' },
      { id: '11', name: 'Sandi', number: '7', size: 'XXL' },
      { id: '12', name: 'Yudha', number: '13', size: 'XL' },
    ],
  },
  {
    id: 'ANV-4011',
    customerName: 'Yusuf Gibran',
    teamName: 'Spartan Volley Community',
    contactNumber: '6285511223344',
    orderType: 'Jersey Voli',
    quantity: 10,
    totalPrice: 1500000,
    status: 'Press & Jahit',
    updatedAt: '2026-06-22T09:12:00Z',
    createdAt: '2026-06-14T15:20:00Z',
    paymentStatus: 'DP 50%',
    shippingAddress: 'Kompleks Olahraga Cilandak, Jakarta Selatan',
    roster: [
      { id: '1', name: 'Gibran', number: '1', size: 'L' },
      { id: '2', name: 'Agung', number: '5', size: 'XL' },
      { id: '3', name: 'Tedy', number: '2', size: 'M' },
      { id: '4', name: 'Danang', number: '10', size: 'L' },
      { id: '5', name: 'Rahmat', number: '4', size: 'XL' },
      { id: '6', name: 'Faisal', number: '6', size: 'L' },
      { id: '7', name: 'Dimas', number: '9', size: 'M' },
      { id: '8', name: 'Erlan', number: '8', size: 'M' },
      { id: '9', name: 'Budi', number: '12', size: 'L' },
      { id: '10', name: 'Sony', number: '11', size: 'XL' },
    ],
  }
];

export const FABRICS: FabricMaterial[] = [
  {
    id: 'dryfit-milano',
    name: 'Dryfit Milano',
    description: 'Bahan dengan sirkulasi udara optimal bertekstur zigzag elegan.',
    fullDescription: 'Dryfit Milano memiliki karakteristik rajutan berbentuk zigzag yang khas. Bahan ini sangat populer untuk jersey sepak bola/futsal karena kemampuannya dalam mengalirkan udara dengan sangat baik, tebal namun tetap ringan, serta memberikan kesan premium dan atletis.',
    characteristics: ['Tekstur rajutan zigzag elegan', 'Relatif tebal & menyerap keringat optimal', 'Sirkulasi udara maksimal', 'Warna hasil sublimasi sangat tajam'],
    image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=600&auto=format&fit=crop',
    suitability: 'Sangat cocok untuk Sepak Bola, Futsal, dan Voli.'
  },
  {
    id: 'dryfit-benzema',
    name: 'Dryfit Benzema',
    description: 'Bahan rintik-rintik heksagonal yang lentur dan sangat elastis.',
    fullDescription: 'Dryfit Benzema terkenal dengan tekstur rajutan berbentuk bintik-bintik heksagonal (seperti sarang lebah). Memiliki kelenturan yang sangat baik, jatuh di tubuh dengan sempurna, dan cepat kering ketika basah oleh keringat.',
    characteristics: ['Tekstur bintik heksagonal mini', 'Sangat lentur & fleksibel', 'Anti-statis & cepat kering', 'Halus di kulit sensitif'],
    image: 'https://images.unsplash.com/photo-1571945153237-4929e78394a9?q=80&w=600&auto=format&fit=crop',
    suitability: 'Rekomendasi utama untuk Jersey Lari, Sepeda, Badminton, dan Esport.'
  },
  {
    id: 'dryfit-super',
    name: 'Dryfit Super / Billabong',
    description: 'Permukaan berpori mikroskopis halus, kuat, dan awet jemur.',
    fullDescription: 'Bahan klasik andalan para atlet. Teksturnya padat dengan pori-pori halus menyebar rata. Sangat awet dan tahan lama meskipun sering melalui pencucian dan penjemuran ekstrem. Sangat handal menahan pemudaran warna.',
    characteristics: ['Pori mikroskopis merata', 'Serat kain kuat tahan abrasi', 'Kelenturan sedang berstruktur kokoh', 'Mampu menahan ketegangan print tinggi'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop',
    suitability: 'Paling sering digunakan untuk Jersey Basket, Rompi Tim, dan Seragam Komunitas.'
  },
  {
    id: 'dryfit-waffle',
    name: 'Dryfit Wave / Waffle',
    description: 'Desain menyerupai permukaan waffle premium, berbobot & kokoh.',
    fullDescription: 'Dryfit Wave/Waffle menyajikan anyaman geometris 3D mirip kotak-kotak waffle yang memberikan sirkulasi udara teratur. Sangat disukai untuk merchandise jaket, polo shirt olahraga, atau jersey berkonsep street-style modern.',
    characteristics: ['Anyaman 3D kotak waffle premium', 'Tebal & tidak gampang kusut', 'Tampilan modern anti-mainstream', 'Mudah dibentuk & dijahit presisi'],
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?q=80&w=600&auto=format&fit=crop',
    suitability: 'Cocok untuk Jaket Sublimasi, Hoodie, Polo Sport, dan Jersey Voli Klasik.'
  }
];

export const CATEGORIES: ProductCatalogItem[] = [
  {
    id: 'cat-futsal',
    name: 'Jersey Futsal & Bola',
    category: 'Futsal',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    description: 'Desain custom sublimasi penuh dari kerah ke celana dengan sirkulasi udara tinggi.',
    priceEstimate: 'Mulai dari Rp 125.000 / Setel'
  },
  {
    id: 'cat-basket',
    name: 'Jersey Basket',
    category: 'Basket',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop',
    description: 'Potongan singlet atletis tanpa lengan, bahan billabong premium, jahitan obras super tebal.',
    priceEstimate: 'Mulai dari Rp 135.000 / Setel'
  },
  {
    id: 'cat-voli',
    name: 'Jersey Voli',
    category: 'Voli',
    image: 'https://images.unsplash.com/photo-1592656094267-764a45159073?q=80&w=600&auto=format&fit=crop',
    description: 'Elongated sleeves / regular fit, lentur tinggi untuk lompatan dan rentang ayunan lengan bebas.',
    priceEstimate: 'Mulai dari Rp 120.000 / Pcs'
  },
  {
    id: 'cat-esport',
    name: 'Jersey Esport & Casual',
    category: 'Esport',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    description: 'Model kerah zip, polo, atapun v-neck serbaguna. Desain futuristis dengan sublimasi warna tajam.',
    priceEstimate: 'Mulai dari Rp 110.000 / Pcs'
  },
  {
    id: 'cat-jaket',
    name: 'Jaket & Hoodie Sublim',
    category: 'Jaket',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
    description: 'Jaket zipper olahraga atau pullover hoodie berlapis puring jala yang hangat sekaligus sporty.',
    priceEstimate: 'Mulai dari Rp 185.000 / Pcs'
  }
];

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Slayer Orange Jersey - Malang United',
    category: 'Jersey Futsal',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop',
    collarDetail: 'Kerah modern Shoreline V-neck ganda, jahitan tersembunyi rapi.',
    stitchDetail: 'Jahit rante bahu dobel benang, kuat dari tarikan fisik permainan lapangan.',
    sharpnessDetail: 'Teknologi Sublimasi Epson TrueColor 1200 DPI menghasilkan gradasi jingga api menyala tajam.'
  },
  {
    id: 'port-2',
    title: 'Retro Classic Edition - Pertamina BC',
    category: 'Jersey Basket',
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=800&auto=format&fit=crop',
    collarDetail: 'Rib elastis tebal bergaris merah-putih retro di bagian lubang leher & lengan.',
    stitchDetail: 'Ujung bawah dijahit dobel mesin overdeck 3-jarum rapi bebas lepas benang.',
    sharpnessDetail: 'Logo dada menggunakan sablon sublimasi pigmen tinggi menyatu langsung ke serat kain.'
  },
  {
    id: 'port-3',
    title: 'Futuristic Stealth - Srikandi Esport',
    category: 'Jersey Esport',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    collarDetail: 'Kerah bermodel zip-up polo dengan ritsleting YKK mini tersembunyi dan fungsional.',
    stitchDetail: 'Sambungan lengan raglan presisi tinggi meningkatkan fleksibilitas bahu pemain.',
    sharpnessDetail: 'Pola heksogonal abu abu gelap dengan aksen oranye neon menyala (high-luminescence).'
  },
  {
    id: 'port-4',
    title: 'Cyberpunk Volley - Spartan Squad',
    category: 'Jersey Voli',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop',
    collarDetail: 'O-Neck elastis fleksibel, tidak menjepit tenggorokan ketika melompat tinggi.',
    stitchDetail: 'Bahu samping dijahit dengan overhead flatlock 4 jarum yang sangat datar aman di kulit.',
    sharpnessDetail: 'Cetak sayap elang beresolusi super tajam, gradasi dari abu-abu metalik ke oranye menyala.'
  },
  {
    id: 'port-5',
    title: 'Windbreaker Sublim - Track Team Indonesia',
    category: 'Jaket/Hoodie',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
    collarDetail: 'High-neck collar dengan tudung kepala (hoodie) berlapisan furing tebal.',
    stitchDetail: 'Saku samping ritsleting jahit dalam (invisible seam pockets).',
    sharpnessDetail: 'Gradasi motif batik kontemporer oranye-hitam menyatu sempurna, warna tahan sabun selamanya.'
  }
];

export const FAQS = [
  {
    question: 'Berapa Minimum Order Quantity (MOQ)?',
    answer: 'Minimum pembuatan jersey di ANV Apparel adalah 1 lusin / 12 pcs per model desain. Hal ini dikarenakan proses layouting, cetak kertas transfer sublimasi, dan setting mesin cetak presisi kami disesuaikan untuk skala produksi tim demi menjaga efisiensi harga terbaik untuk Anda.'
  },
  {
    question: 'Berapa lama estimasi waktu pengerjaan (SLA)?',
    answer: 'Estimasi pengerjaan standard kami berkisar antara 10-14 hari kerja terhitung setelah desain disepakati (Desain ACC) dan uang muka (DP) diterima. Jika Anda memiliki kebutuhan mendesak untuk turnamen, silakan diskusikan opsi antrian prioritas (Express Service) dengan admin kami.'
  },
  {
    question: 'Bagaimana kebijakan revisi desain?',
    answer: 'Kami menyediakan gratis revisi minor sebanyak 2 kali (seperti koreksi warna, ejaan nama, pemindahan tata letak logo) sebelum desain masuk ke tahap antrian cetak layout. Untuk mempermudah pengerjaan cepat, silakan gunakan 2D Visualizer kami untuk menyempurnakan konsep awal Anda!'
  },
  {
    question: 'Apakah bisa beda-beda ukuran dalam 1 tim?',
    answer: 'Sangat bisa! Dalam pesanan 1 lusin tersebut, Anda bebas menentukan ukuran masing-masing pemain, mulai dari size anak, S, M, L, XL, XXL, hingga BIG SIZE (3XL+). Anda bisa menginput data roster tim secara rapi di Halaman Portal Pemesanan Tim kami.'
  },
  {
    question: 'Apakah harga sudah termasuk ongkos kirim?',
    answer: 'Harga dasar penawaran produksi belum termasuk ongkos kirim. Ongkos kirim dihitung berdasarkan berat total paket baju, ekspedisi/kurir pilihan Anda, dan lokasi kota pengiriman. Anda dapat menggunakan kalkulator estimasi ongkos kirim di Portal Pemesanan Tim kami untuk mengecek ongkir secara otomatis.'
  }
];
