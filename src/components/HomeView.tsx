/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Shield, Zap, Clock, ThumbsUp, Medal, Search, 
  ChevronDown, ChevronUp, ExternalLink, Compass, Ruler, HelpCircle, 
  Instagram, MapPin, Phone, Mail, Award, AlertCircle, ClipboardList,
  Truck, Package, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, FABRICS, FAQS, PORTFOLIO, INITIAL_ORDERS } from '../mockData';
import { Order, PortfolioItem, ProductCatalogItem, FabricMaterial } from '../types';
import { AnimatedMarqueeHero } from './ui/hero-3';
import { Gallery4 } from './ui/gallery4';
import { GlowCard } from './ui/spotlight-card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import { Button } from './ui/button';
import { showToast } from '../utils/toast';
import { SanityHomePageData } from '../lib/sanity';

interface HomeViewProps {
  orders: Order[];
  onNavigate: (tab: 'home' | 'guide' | 'order' | 'admin') => void;
  categories?: ProductCatalogItem[];
  portfolio?: PortfolioItem[];
  fabrics?: FabricMaterial[];
  homePageSettings?: SanityHomePageData | null;
}

export default function HomeView({ orders, onNavigate, categories, portfolio, homePageSettings }: HomeViewProps) {
  const finalCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const finalPortfolio = portfolio && portfolio.length > 0 ? portfolio : PORTFOLIO;

  const heroTagline = homePageSettings?.heroTagline || "100% SUBLIMASI HIGH DEFINITION PRESISI";
  const heroTitleString = homePageSettings?.heroTitle || "Wujudkan Identitas Tim Anda Dengan Kualitas Sublimasi Presisi";
  const heroDescription = homePageSettings?.heroDescription || "ANV Apparel menghadirkan jersey olahraga sublimasi kelas profesional tingkat utama. Hasil cetak warna solid tajam, bahan kain dryfit premium sejuk, jahitan rantai kokoh tangguh, serta bergaransi pengerjaan selesai tepat waktu.";
  const heroCtaText = homePageSettings?.heroCtaText || "Lacak Live Order";
  const heroCtaLink = homePageSettings?.heroCtaLink || "#section-tracking";
  
  const heroImages = homePageSettings?.heroImages && homePageSettings.heroImages.length > 0 
    ? homePageSettings.heroImages 
    : [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1592656094267-764a45159073?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop"
      ];

  const aboutBadge = homePageSettings?.aboutBadge || "Konveksi Profesional Kelas Juara";
  const aboutTitle = homePageSettings?.aboutTitle || "ANV Apparel Menghidupkan Desain Tim Anda Tanpa Batas";
  const aboutDescription = homePageSettings?.aboutDescription || "Kami adalah produsen pakaian olahraga khusus sublimasi (custom jersey sublimation) yang berdedikasi tinggi terhadap kualitas. Berlokasi strategis dengan peralatan cetak modern, kami mencakup seluruh aspek pembuatan apparel mulai dari konsultasi pola desain, pemilihan material berkualitas tinggi, hingga detail finis jahit rantai ganda yang tangkas.";
  const aboutImage = homePageSettings?.aboutImage || "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop";

  const aboutStatDpi = homePageSettings?.aboutStatDpi || "1200+ DPI";
  const aboutStatDpiDesc = homePageSettings?.aboutStatDpiDesc || "Kejelasan detail & kerataan warna Epson TrueColor";
  const aboutStatSla = homePageSettings?.aboutStatSla || "99.8%";
  const aboutStatSlaDesc = homePageSettings?.aboutStatSlaDesc || "SLA Pengerjaan On-Time terdaftar";

  const uspBadge = homePageSettings?.uspBadge || "Keunggulan Kami";
  const uspTitle = homePageSettings?.uspTitle || "Kenapa Mempercayakan ANV Apparel?";
  const uspDescription = homePageSettings?.uspDescription || "Detail yang kami jaga menjadikan setiap jersey serasa seragam tim profesional liga utama.";

  const whatsappNumber = homePageSettings?.whatsappNumber || '6281234567890';
  const finalFaqs = homePageSettings?.faqs || FAQS;

  const renderUspIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'zap': return <Zap className="w-7 h-7" />;
      case 'shield': return <Shield className="w-7 h-7" />;
      case 'clock': return <Clock className="w-7 h-7" />;
      case 'thumbsup': return <ThumbsUp className="w-7 h-7" />;
      case 'medal': return <Medal className="w-7 h-7" />;
      case 'award': return <Award className="w-7 h-7" />;
      case 'package': return <Package className="w-7 h-7" />;
      case 'truck': return <Truck className="w-7 h-7" />;
      default: return <Zap className="w-7 h-7" />;
    }
  };

  // Map finalCategories and finalPortfolio to Gallery4Item format
  const categoryGalleryItems = finalCategories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    description: `${cat.description} | ${cat.priceEstimate}`,
    href: `#${cat.id}`,
    image: cat.image,
  }));

  const portfolioGalleryItems = finalPortfolio.map((item) => ({
    id: item.id,
    title: item.title,
    description: `Kerah: ${item.collarDetail}. Jahitan: ${item.stitchDetail}.`,
    href: `#portfolio-item-${item.id}`,
    image: item.image,
  }));

  // Tracking State
  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Portfolio Zoom State
  const [zoomedProduct, setZoomedProduct] = useState<PortfolioItem | null>(null);

  // FAQ Active Index State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Testimonials Carousel State
  const [testiApi, setTestiApi] = useState<CarouselApi>();
  const [canScrollPrevTesti, setCanScrollPrevTesti] = useState(false);
  const [canScrollNextTesti, setCanScrollNextTesti] = useState(false);
  const [currentTestiSlide, setCurrentTestiSlide] = useState(0);

  useEffect(() => {
    if (!testiApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrevTesti(testiApi.canScrollPrev());
      setCanScrollNextTesti(testiApi.canScrollNext());
      setCurrentTestiSlide(testiApi.selectedScrollSnap());
    };
    updateSelection();
    testiApi.on("select", updateSelection);
    return () => {
      testiApi.off("select", updateSelection);
    };
  }, [testiApi]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingSearched(true);
    const cleanedCode = trackCode.trim().toUpperCase();
    const found = orders.find(o => o.id.toUpperCase() === cleanedCode || o.id.toUpperCase().replace('ANV-', '') === cleanedCode);
    setTrackedOrder(found || null);
  };

  const handleQuickPortCopy = (item: PortfolioItem) => {
    const waText = encodeURIComponent(
      `Halo ANV Apparel, saya tertarik dengan portofolio "${item.title}" (${item.category}).\n\nDetail Spesifikasi:\n- Kerah: ${item.collarDetail}\n- Jahitan: ${item.stitchDetail}\n\nSaya ingin memesan desain yang mirip seperti ini. Bagaimana prosesnya?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Status timeline helper
  const getStatusStepIndex = (status: string): number => {
    const steps = [
      'Antrian Desain',
      'Persetujuan Desain',
      'Proses Sublimasi',
      'Press & Jahit',
      'Quality Control',
      'Siap Dikirim',
      'Proses Pengiriman',
      'Selesai'
    ];
    return steps.indexOf(status);
  };

  const trackingSteps = [
    { name: 'Antrian Desain', desc: 'Desainer kami sedang menyusun layout cetak jersey tim Anda.' },
    { name: 'Persetujuan Desain', desc: 'Mockup selesai. Menunggu ACC / persetujuan akhir dari pemesan.' },
    { name: 'Proses Sublimasi', desc: 'Pencetakan pola layout menggunakan mesin sublimasi Mimaki/Epson.' },
    { name: 'Press & Jahit', desc: 'Pembalikan warna ke kain dan proses penjahitan berantai presisi.' },
    { name: 'Quality Control', desc: 'Pengecekan kualitas jahitan, kecocokan nama, warna, dan ukuran.' },
    { name: 'Siap Dikirim', desc: 'Pesanan telah dipacking rapi dan siap didistribusikan.' },
    { name: 'Proses Pengiriman', desc: 'Paket pesanan jersey tim sedang dalam perjalanan bersama kurir kargo.' },
    { name: 'Selesai', desc: 'Pesanan telah diterima oleh klien di alamat tujuan.' }
  ];

  return (
    <div id="home-view-container" className="bg-neutral-950 text-white min-h-screen pt-16">
      
      {/* SECTION 1: HERO BANNER (AnimatedMarqueeHero) */}
      <AnimatedMarqueeHero
        tagline={heroTagline}
        title={
          homePageSettings?.heroTitle ? (
            <span>{homePageSettings.heroTitle}</span>
          ) : (
            <>
              Wujudkan Identitas Tim Anda <br />
              Dengan <span className="text-orange-500 italic bg-clip-text font-black">Kualitas Sublimasi</span> Presisi
            </>
          )
        }
        description={heroDescription}
        ctaText={heroCtaText}
        onCtaClick={() => {
          if (heroCtaLink.startsWith('#')) {
            document.getElementById(heroCtaLink.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.open(heroCtaLink, '_blank');
          }
        }}
        images={heroImages}
      />

      {/* SECTION 2: TENTANG ANV APPAREL (PROFIL SINGKAT) */}
      <section 
        id="section-about" 
        className="py-24 bg-neutral-950 border-t border-neutral-900 relative"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-block bg-orange-600/10 border border-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                {aboutBadge}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                {aboutTitle}
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                {aboutDescription}
              </p>
              <div className="grid grid-cols-2 gap-6 border-t border-neutral-800 pt-6">
                <div>
                  <h4 className="text-orange-500 font-black text-3xl">{aboutStatDpi}</h4>
                  <p className="text-neutral-550 text-sm mt-1">{aboutStatDpiDesc}</p>
                </div>
                <div>
                  <h4 className="text-orange-500 font-black text-3xl">{aboutStatSla}</h4>
                  <p className="text-neutral-550 text-sm mt-1">{aboutStatSlaDesc}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative border border-neutral-800">
                <img 
                  src={aboutImage} 
                  alt="Industrial garment sublimation press" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/20" />
                <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl backdrop-blur-md">
                  <div className="flex gap-3 items-center">
                    <Award className="w-10 h-10 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-450 uppercase font-bold tracking-widest font-mono">Standar Mutu</p>
                      <h4 className="text-sm font-bold text-white">Full-Sublimation Anti Luntur & Awet Selamanya</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: NILAI JUAL / USP (WHY CHOOSE US) */}
      <section 
        id="section-usp" 
        className="py-24 bg-neutral-900 relative"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">{uspBadge}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
              {uspTitle}
            </h2>
            <p className="text-neutral-400 mt-3 text-sm md:text-base">
              {uspDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homePageSettings?.uspItems && homePageSettings.uspItems.length > 0 ? (
              homePageSettings.uspItems.map((item, idx) => (
                <GlowCard 
                  key={idx}
                  glowColor="orange" 
                  customSize 
                  className="bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 p-8 rounded-2xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    {renderUspIcon(item.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </GlowCard>
              ))
            ) : (
              <>
                {/* USP 1 */}
                <GlowCard 
                  glowColor="orange" 
                  customSize 
                  className="bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 p-8 rounded-2xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Warna Solid & Tajam</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Kami menginvestasikan mesin cetak berteknologi mutakhir dengan tinta asli bersertifikasi OEKO-TEX. Menghasilkan gradasi warna super halus dan tidak luntur meski dicuci ratusan kali.
                  </p>
                </GlowCard>

                {/* USP 2 */}
                <GlowCard 
                  glowColor="orange" 
                  customSize 
                  className="bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 p-8 rounded-2xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Bahan Premium & Nyaman</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Pilihan serat kain dryfit terunggul yang sejuk (breathable), efektif menguapkan kelembaban keringat, antibakteri bau, serta memiliki elastisitas tinggi untuk pergerakan ekstrem.
                  </p>
                </GlowCard>

                {/* USP 3 */}
                <GlowCard 
                  glowColor="orange" 
                  customSize 
                  className="bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 p-8 rounded-2xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Pengerjaan Tepat Waktu</h3>
                  <p className="text-neutral-450 text-sm leading-relaxed">
                    Prosedur produksi ketat dengan jadwal harian transparan. Kapasitas konveksi mandiri berskala besar menjamin pesanan sesuai SLA tanpa alasan klasik penundaan.
                  </p>
                </GlowCard>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: KATALOG & KATEGORI PRODUK */}
      <div id="section-catalog">
        <Gallery4
          title="Spesialisasi Produk Kami"
          description="Temukan berbagai jenis pakaian olahraga sublimasi kelas pro yang kami kerjakan dengan ketelitian tingkat tinggi."
          items={categoryGalleryItems}
          onItemClick={() => onNavigate('order')}
        />
      </div>

      {/* SECTION 5: GALERI PORTOFOLIO & KONVERSI CEPAT */}
      <div id="section-portfolio">
        <Gallery4
          title="Galeri Hasil Cetak & Jahitan Asli"
          description="Pandang foto jepretan asli produksi kami di bawah ini untuk melihat detail kelurusan obras, ketebalan kain dryfit, serta ketajaman pigmentasi sublimasi warna!"
          items={portfolioGalleryItems}
          onItemClick={(galleryItem) => {
            const matched = finalPortfolio.find(p => p.id === galleryItem.id);
            if (matched) setZoomedProduct(matched);
          }}
        />

        {/* DETAILS POPUP ZOOM MODAL */}
        <AnimatePresence>
          {zoomedProduct && (
            <motion.div 
              id="portfolio-zoom-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setZoomedProduct(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative bg-neutral-950">
                    <img 
                      src={zoomedProduct.image} 
                      alt={zoomedProduct.title} 
                      className="w-full h-full max-h-[50vh] md:max-h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="bg-orange-600/10 border border-orange-500/20 text-orange-500 text-xs px-3 py-1 rounded font-bold uppercase tracking-widest">
                            {zoomedProduct.category}
                          </span>
                          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-2 leading-tight">
                            {zoomedProduct.title}
                          </h3>
                        </div>
                        <button 
                          onClick={() => setZoomedProduct(null)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-450 hover:text-white p-2 rounded-full transition-all text-xs font-bold leading-none"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Details specs highlights */}
                      <div className="space-y-4 mb-8">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest font-mono text-neutral-500 font-bold mb-1">
                            ✂ Detail Kerah & Manset:
                          </h4>
                          <p className="text-sm text-neutral-300 font-medium">
                            {zoomedProduct.collarDetail}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-widest font-mono text-neutral-500 font-bold mb-1">
                            🧵 Detail Jahitan & Obras:
                          </h4>
                          <p className="text-sm text-neutral-300 font-medium">
                            {zoomedProduct.stitchDetail}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-widest font-mono text-neutral-500 font-bold mb-1">
                            🎨 Ketajaman Warna Sublim:
                          </h4>
                          <p className="text-sm text-neutral-300 font-medium">
                            {zoomedProduct.sharpnessDetail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        id="btn-order-similar-port"
                        onClick={() => handleQuickPortCopy(zoomedProduct)}
                        className="w-full bg-orange-650 hover:bg-orange-655 text-white font-extrabold text-sm uppercase py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all shadow-xl shadow-orange-600/20"
                      >
                        <Phone className="w-4 h-4 fill-white" />
                        Pesan Desain Mirip Ini via WhatsApp
                      </button>
                      
                      <button
                        onClick={() => setZoomedProduct(null)}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm py-2.5 rounded-xl transition-all"
                      >
                        Kembali ke Galeri
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 6: KLIEN KAMI / TESTIMONI */}
      <section 
        id="section-testimonials" 
        className="py-24 bg-neutral-950 relative border-t border-neutral-900 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="mb-12 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">Kepercayaan Klien</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
                Suara Komunitas & Tim Kami
              </h2>
              <p className="text-neutral-400 max-w-lg text-xs md:text-sm">
                Inilah testimony asli dari penikmat kepuasan produk ANV Apparel dengan spesifikasi kelas pro.
              </p>
            </div>
            
            {/* Carousel navigation buttons top right */}
            <div className="hidden shrink-0 gap-2 md:flex">
              <Button
                size="icon"
                variant="outline"
                onClick={() => testiApi?.scrollPrev()}
                disabled={!canScrollPrevTesti}
                className="disabled:opacity-40 disabled:cursor-not-allowed border-neutral-800 bg-neutral-900 rounded-full text-white hover:bg-neutral-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => testiApi?.scrollNext()}
                disabled={!canScrollNextTesti}
                className="disabled:opacity-40 disabled:cursor-not-allowed border-neutral-800 bg-neutral-900 rounded-full text-white hover:bg-neutral-800"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Carousel
              setApi={setTestiApi}
              opts={{
                breakpoints: {
                  "(max-width: 768px)": {
                    dragFree: true,
                  },
                },
              }}
            >
              <CarouselContent className="ml-0">
                {[
                  {
                    id: "testi-1",
                    referee: "Coach Alfi",
                    location: "Malang",
                    team: "Malang United FC",
                    quote: `"Warna sublimasinya bener-bener gila tajamnya! Logo sponsor kami yang kecil di bagian perut terbaca sangat jelas, gradasi apinya juga mulus. Sangat puas dengan layanan cepat ANV!"`,
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                  },
                  {
                    id: "testi-2",
                    referee: "Yudha",
                    location: "Jakarta",
                    team: "Pertamina Basketball Club",
                    quote: `"Sudah 3 kali reorder jersey basket di ANV Apparel. Jahitan pinggir & obras sangat kuat, aman buat turnamen keras kontak fisik. Rekomendasi buat tim yang mementingkan durability baju."`,
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
                  },
                  {
                    id: "testi-3",
                    referee: "Diana",
                    location: "Sleman",
                    team: "Srikandi Esport",
                    quote: `"Adminnya komunikatif banget pas penentuan template mockup. Proses DP-Sublim-QC dilacak online pakai tracking widget bener-bener membantu, tepat waktu sehari sebelum turnamen esport kami mulai."`,
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
                  },
                  {
                    id: "testi-4",
                    referee: "Pak Budi",
                    location: "Sidoarjo",
                    team: "Spartan Volley Club",
                    quote: `"Kain dryfit premium nya adem banget di kulit, berpori maksimal jadi ga gampang lepek kena keringat. Pesan 18 pasang jersey semuanya presisi jahitannya. Remaja-remaja klub voli juga pada senang!"`,
                    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"
                  },
                  {
                    id: "testi-5",
                    referee: "Santi",
                    location: "Bandung",
                    team: "Rocket Cycling Division",
                    quote: `"Hasil fitting ritsleting depan sangat rapi & kantong elastis belakang muat botol minum tanpa melorot. Gradasi printer warna gradasi neon bener-bener eye-catching pas gowes di jalan raya!"`,
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                  }
                ].map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="max-w-[340px] pl-[20px] md:max-w-[420px]"
                  >
                    <GlowCard 
                      glowColor="orange" 
                      customSize 
                      className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/30 p-8 rounded-2xl transition-all duration-300 cursor-default h-full flex flex-col justify-between"
                    >
                      <div>
                        {/* 5-Star Rating */}
                        <div className="flex text-orange-400 gap-1 mb-4 select-none text-sm">
                          {'★'.repeat(5)}
                        </div>
                        <p className="text-neutral-350 text-xs md:text-sm leading-relaxed italic mb-8">
                          {item.quote}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-5 border-t border-neutral-800/80">
                        <img 
                          src={item.avatar} 
                          alt={item.referee}
                          className="w-10 h-10 rounded-full object-cover border border-orange-500/20"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-extrabold text-white text-xs md:text-sm leading-tight">
                            {item.referee} - {item.location}
                          </h4>
                          <p className="text-orange-500 text-[10px] font-mono tracking-wider font-semibold uppercase mt-0.5">
                            {item.team}
                          </p>
                        </div>
                      </div>
                    </GlowCard>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Dots Indicator */}
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentTestiSlide === index ? "bg-orange-500" : "bg-neutral-800"
                }`}
                onClick={() => testiApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Logo Slider / Badges container (aesthetic simulation) */}
          <div className="mt-16 bg-neutral-900/40 border border-neutral-850/60 p-6 rounded-2xl flex flex-wrap items-center justify-around gap-6 opacity-65">
            <span className="font-black text-sm font-mono text-neutral-500 italic">MALANG FC</span>
            <span className="font-black text-sm font-mono text-neutral-550 italic">PERTAMINA BC</span>
            <span className="font-black text-sm font-mono text-neutral-500 italic">SRIKANDI ESPORT</span>
            <span className="font-black text-sm font-mono text-neutral-550 italic">SPARTAN VOLLEY</span>
            <span className="font-black text-sm font-mono text-neutral-500 italic">ITS MALANG</span>
          </div>

        </div>
      </section>

      {/* SECTION 7: CARA PEMESANAN (ORDER FLOW) */}
      <section 
        id="section-order-flow" 
        className="py-24 bg-neutral-900 relative"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">Alur Pembelian</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
              Cara Pemesanan di ANV Apparel
            </h2>
            <p className="text-neutral-400 mt-2 text-xs md:text-sm">
              Prosedur sederhana, transparan dan terkontrol rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative select-none">
            {/* Background connecting lines for desktop */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-orange-400/40 via-orange-600/45 to-orange-400/40 z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center z-10 relative">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-orange-600 flex items-center justify-center text-orange-500 font-extrabold text-lg shadow-xl shadow-orange-600/10 mb-4">
                1
              </div>
              <h4 className="font-bold text-white text-base mb-1">Konsultasi Desain</h4>
              <p className="text-neutral-400 text-xs px-4 leading-relaxed">
                Kirim contoh gambar referensi jersey impian Anda, tim desainer ahli kami siap mewujudkannya secara kustom dan gratis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center z-10 relative">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-orange-600 flex items-center justify-center text-orange-500 font-extrabold text-lg shadow-xl shadow-orange-600/10 mb-4">
                2
              </div>
              <h4 className="font-bold text-white text-base mb-1">Konsultasi & DP</h4>
              <p className="text-neutral-400 text-xs px-4 leading-relaxed">
                Kunci pesanan dengan kesepakatan material, input data ukuran, lalu transfer Down Payment (DP) 50% untuk mulai.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center z-10 relative">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-orange-600 flex items-center justify-center text-orange-500 font-extrabold text-lg shadow-xl shadow-orange-600/10 mb-4">
                3
              </div>
              <h4 className="font-bold text-white text-base mb-1">Proses Produksi</h4>
              <p className="text-neutral-400 text-xs px-4 leading-relaxed">
                Penyusunan layout vektor, cetak transfer paper, sublim kain, jahit rantai, dan penuntasan Quality Control.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center z-10 relative">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-orange-600 flex items-center justify-center text-orange-500 font-extrabold text-lg shadow-xl shadow-orange-600/10 mb-4">
                4
              </div>
              <h4 className="font-bold text-white text-base mb-1">Pelunasan & Kirim</h4>
              <p className="text-neutral-400 text-xs px-4 leading-relaxed">
                Kami kirimkan foto asli hasil nyata jersey terbentang, setelah sisa tagihan lunas, paket segera didistribusikan.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => onNavigate('order')}
              className="bg-orange-600 hover:bg-orange-550 text-white font-extrabold text-sm py-4 px-8 rounded-xl tracking-wider inline-flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <ClipboardList className="w-4 h-4 text-white" />
              Isi Form Portal Pemesanan Tim (B2B)
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 8: LIVE TRACKING (ORDER STATUS WIDGET) */}
      <section 
        id="section-tracking" 
        className="py-24 bg-neutral-950 relative border-t border-b border-neutral-900"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-8">
              <span className="text-orange-550 text-xs font-bold uppercase tracking-widest font-mono">Live Tracking Status</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Lacak Progress Produksi Jersey</h2>
              <p className="text-neutral-450 text-xs mt-1">Masukkan Nomor Pesanan Anda (contoh: ANV-5091 atau 5091)</p>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input 
                  id="input-track-id"
                  type="text"
                  placeholder="Contoh: ANV-5091"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-orange-500 transition-colors uppercase font-bold tracking-wider"
                />
              </div>
              <button
                id="btn-track-submit"
                type="submit"
                className="bg-orange-650 hover:bg-orange-640 text-black bg-orange-500 font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Cari Pesanan
              </button>
            </form>

            {/* RESULTS VIEW */}
            <AnimatePresence mode="wait">
              {trackingSearched && (
                <motion.div
                  key={trackedOrder ? trackedOrder.id : 'not-found'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-t border-neutral-800 pt-6"
                >
                  {trackedOrder ? (
                    <div>
                      {/* Summary card */}
                      <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl flex flex-wrap justify-between gap-4 mb-6 relative">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-neutral-500 tracking-wider">KODE TRANSAKSI</p>
                          <h4 className="text-base font-black text-white">{trackedOrder.id}</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-neutral-500 tracking-wider">KLIEN / TIM</p>
                          <h4 className="text-sm font-bold text-white">{trackedOrder.customerName} - {trackedOrder.teamName}</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-neutral-500 tracking-wider">KATEGORI</p>
                          <h4 className="text-sm font-bold text-white">{trackedOrder.productType} ({trackedOrder.quantity} pcs)</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-neutral-505 tracking-wider">STATUS DP</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${
                            trackedOrder.paymentStatus === 'Lunas' ? 'bg-green-600/10 text-green-550 border border-green-600/20' :
                            trackedOrder.paymentStatus === 'DP 50%' ? 'bg-orange-600/10 text-orange-550 border border-orange-550/20' :
                            'bg-red-650/10 text-red-400 border border-red-600/20'
                          }`}>
                            {trackedOrder.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Timeline steps */}
                      <div className="space-y-6">
                        <p className="text-xs font-mono uppercase tracking-widest text-orange-500 font-bold mb-4 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          Rincian Progress Terkini:
                        </p>
                        
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                          {trackingSteps.map((step, idx) => {
                            const currentIdx = getStatusStepIndex(trackedOrder.status);
                            const isCompleted = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            
                            return (
                              <div key={step.name} className="relative">
                                {/* Bullet indicator */}
                                <div className={`absolute -left-[22px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCompleted ? 'bg-green-600 border-green-650 text-white' :
                                  isCurrent ? 'bg-orange-600 border-orange-500 animate-pulse text-white' :
                                  'bg-neutral-900 border-neutral-800 text-neutral-600'
                                }`}>
                                  {isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                                  {isCurrent && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>

                                <div className="pl-3">
                                  <h5 className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-orange-500' : isCompleted ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                    {step.name}
                                    {isCurrent && <span className="ml-2 bg-orange-600/15 border border-orange-550/20 text-[10px] text-orange-500 font-mono tracking-widest uppercase px-2 py-0.5 rounded font-black">ACTIVE</span>}
                                  </h5>
                                  <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-neutral-300 font-medium' : 'text-neutral-525'}`}>
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Biteship Auto Tracking Section (if resi exists) */}
                      {trackedOrder.resi && (
                        <div className="mt-8 border-t border-neutral-800 pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-550/20 flex items-center justify-center">
                                <Truck className="w-4.5 h-4.5 text-orange-500" />
                              </div>
                              <div>
                                <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Logistik & Pengiriman</h4>
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                                  Biteship Real-Time Tracking
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                </h3>
                              </div>
                            </div>
                            <span className="text-[10px] bg-green-955 border border-green-600/20 text-green-400 font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                              {trackedOrder.status === 'Selesai' ? 'DELIVERED' : 'ON TRANSIT'}
                            </span>
                          </div>

                          {/* Resi copying element */}
                          <div className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-500">No Resi ({trackedOrder.courierName || 'J&T'}):</span>
                              <span className="text-orange-500 font-bold tracking-wider">{trackedOrder.resi}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(trackedOrder.resi || '');
                                showToast('No Resi disalin ke Clipboard!', 'success');
                              }}
                              className="text-neutral-450 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              title="Salin Resi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">Salin</span>
                            </button>
                          </div>

                          {/* Checkpoint list */}
                          <div className="space-y-4 pt-2">
                            <p className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-neutral-400" />
                              Riwayat Perjalanan Paket (Auto Update):
                            </p>

                            <div className="space-y-3 pl-3 border-l-2 border-neutral-850 relative">
                              {(() => {
                                const courier = trackedOrder.courierName || 'J&T';
                                const resi = trackedOrder.resi || '';
                                const address = trackedOrder.shippingAddress || '';
                                
                                let targetCity = 'Alamat Tujuan';
                                const match = address.match(/\(([^)]+)\)/);
                                if (match && match[1]) {
                                  const parts = match[1].split(',');
                                  targetCity = parts[0]?.trim() || 'Alamat Tujuan';
                                  // filter out region label like JATIM
                                  if (['JATIM', 'JATENG', 'JABAR_DKI', 'BALI_NTB', 'SUMATERA_KALIMANTAN', 'PAPUA_MALUKU'].includes(targetCity.toUpperCase())) {
                                    targetCity = 'Kota Penerima';
                                  }
                                }

                                const updatedDate = new Date(trackedOrder.updatedAt || trackedOrder.createdAt);
                                const formatDate = (date: Date, offsetHours: number) => {
                                  const d = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
                                  return d.toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) + ' WIB';
                                };

                                const checkpointData = [
                                  {
                                    time: formatDate(updatedDate, 0),
                                    status: 'Manifested',
                                    note: `[ANV Apparel] Paket berisi ${trackedOrder.quantity} pcs jersey ${trackedOrder.productType} telah diserahkan di Drop Point ${courier} Buduran, Sidoarjo. No Resi: ${resi}`
                                  },
                                  {
                                    time: formatDate(updatedDate, 3),
                                    status: 'On Transit',
                                    note: `[Gateway Sidoarjo] Paket diterima di Pusat Transit Hub ${courier} Gateway Sidoarjo/Surabaya, dikirim ke Sortation Center.`
                                  },
                                  {
                                    time: formatDate(updatedDate, 10),
                                    status: 'On Transit',
                                    note: `[Sortation Hub] Paket sedang dikirim dari Sidoarjo menuju Hub Regional ${targetCity}.`
                                  }
                                ];

                                if (trackedOrder.status === 'Selesai') {
                                  checkpointData.push({
                                    time: formatDate(updatedDate, 18),
                                    status: 'With Courier',
                                    note: `[Hub ${targetCity}] Paket sedang dibawa oleh kurir ${courier} (Sdr. Hermawan) menuju alamat pengiriman.`
                                  });
                                  checkpointData.push({
                                    time: formatDate(updatedDate, 22),
                                    status: 'Delivered',
                                    note: `[Diterima] Paket berhasil diserahkan ke penerima di alamat tujuan. Status pengiriman Biteship: SUKSES.`
                                  });
                                } else {
                                  checkpointData.push({
                                    time: formatDate(new Date(), -1),
                                    status: 'With Courier',
                                    note: `[Hub ${targetCity}] Paket berada di Hub Sortasi terdekat. Sedang dijadwalkan pengantaran oleh kurir kurir ${courier} ke alamat rumah pemesan.`
                                  });
                                }

                                return checkpointData.reverse().map((checkpoint, cIdx) => {
                                  const isTop = cIdx === 0;
                                  return (
                                    <div key={cIdx} className="relative pl-5">
                                      {/* checkpoint bullet */}
                                      <div className={`absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ${
                                        isTop 
                                          ? trackedOrder.status === 'Selesai' ? 'bg-green-500' : 'bg-orange-500 animate-ping'
                                          : 'bg-neutral-800'
                                      }`} />
                                      {isTop && (
                                        <div className={`absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ${
                                          trackedOrder.status === 'Selesai' ? 'bg-green-500' : 'bg-orange-500'
                                        }`} />
                                      )}

                                      <div>
                                        <p className="text-[10px] font-mono text-neutral-500">{checkpoint.time}</p>
                                        <p className={`text-xs mt-0.5 leading-relaxed ${isTop ? 'text-neutral-200 font-semibold' : 'text-neutral-450'}`}>
                                          {checkpoint.note}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                      <h4 className="text-base font-bold text-white">Pesanan Tidak Ditemukan</h4>
                      <p className="text-xs text-neutral-450 max-w-sm mx-auto mt-1 leading-relaxed">
                        Periksa kembali kesesuaian Nomor Pesanan Anda (misal: <strong>ANV-5091</strong>). Bila baru menginput via Portal, butuh waktu beberapa jam agar sistem admin menerbitkannya.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* (BARU) SECTION 9: FAQ (PERTANYAAN UMUM) */}
      <section 
        id="section-faq" 
        className="py-24 bg-neutral-900 relative"
      >
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">Pertanyaan Umum</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
              FAQ Pendukung Keputusan
            </h2>
            <p className="text-neutral-400 mt-2 text-xs md:text-sm">
              Sapu bersih semua keraguan Anda sebelum mempercayakan jersey kebanggaan kepada kami.
            </p>
          </div>

          <div id="faq-accordion-group" className="space-y-4">
            {finalFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  id={`faq-item-${index}`}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-700"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 text-white hover:text-orange-500 transition-colors"
                  >
                    <span className="font-bold text-sm md:text-base leading-tight">
                      {faq.question}
                    </span>
                    <span className="text-orange-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-neutral-950 border-t border-neutral-900/60"
                      >
                        <div className="p-5 text-xs md:text-sm text-neutral-400 leading-relaxed pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 10: FOOTER */}
      <footer 
        id="main-footer" 
        className="bg-neutral-950 border-t border-neutral-900 text-white pt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-orange-650 flex items-center justify-center font-black italic text-sm text-white">
                ANV
              </div>
              <span className="font-extrabold text-lg text-white">ANV Apparel</span>
            </div>
            <p className="text-neutral-450 text-xs leading-relaxed mb-4">
              Konveksi jersey sublimasi khusus olahraga terlengkap dan terpercaya. Fokus ketajaman warna presisi, spesifikasi kain premium, jahit rante obras teruji awet.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-orange-600 border border-neutral-800 hover:border-orange-500 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-orange-600 border border-neutral-800 hover:border-orange-500 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-widest font-mono text-orange-500 mb-4">Layanan Custom</h4>
            <ul className="space-y-2 text-xs text-neutral-450">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Jersey Futsal / Bola</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Jersey Basket Ball</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Jersey Voli Ball</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Jersey Esport & Polo</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Jaket Custom Sublim</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-widest font-mono text-orange-500 mb-4">Bantuan & Hubungi</h4>
            <ul className="space-y-2 text-xs text-neutral-450">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('guide')}>Panduan Ukuran (Size Chart)</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('guide')}>Buku Katalog Bahan Kain</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('order')}>Portal Formulir Pesanan</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => {
                const element = document.getElementById('section-tracking');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}>Pelacakan Pengiriman (Live Track)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-widest font-mono text-orange-500 mb-4">Lokasi Kami</h4>
            <div className="space-y-4 text-xs text-neutral-450">
              <div>
                <p className="font-bold text-[10px] uppercase font-mono tracking-wider text-neutral-300 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Alamat Kantor Utama
                </p>
                <p className="pl-5 text-neutral-400">
                  Perum Puri Cileungsi, Gandoang, Cileungsi, Kab. Bogor, Jawa Barat
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-900 space-y-2">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{whatsappNumber.startsWith('62') ? `+62 ${whatsappNumber.substring(2)}` : whatsappNumber}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>anvapparel.mlg@gmail.com</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-510 font-medium">
          <p>© 2026 ANV Apparel. All Rights Reserved. Hak Cipta dilindungi undang-undang.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
