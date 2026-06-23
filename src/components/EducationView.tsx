/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Ruler, HelpCircle, Pocket, Info, CheckCircle2, ChevronRight, Calculator,
  TrendingUp, Sparkles, BookOpen, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { FABRICS } from '../mockData';
import { FabricMaterial } from '../types';

interface EducationViewProps {
  fabrics?: FabricMaterial[];
}

export default function EducationView({ fabrics }: EducationViewProps) {
  const finalFabrics = fabrics && fabrics.length > 0 ? fabrics : FABRICS;

  // Calculator States
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('65');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [recommenderDetail, setRecommenderDetail] = useState<string>('');

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setRecommendedSize(null);
      setRecommenderDetail('Masukkan input tinggi dan berat badan yang valid.');
      return;
    }

    // Logic based on standard Indonesian sports apparel sizing
    let size = 'L';
    let detail = '';

    if (h < 150 && w < 40) {
      size = 'KIDS / XS';
      detail = 'Ukuran anak-anak atau dewasa ekstra super slim fit. Disarankan memesan ukuran khusus.';
    } else if (w < 50) {
      size = 'S';
      detail = 'Sesuai dengan proporsi tubuh ramping. Lebar kaos sekitar 46-48 cm, nyaman melekat di dada.';
    } else if (w >= 50 && w < 63) {
      if (h > 175) {
        size = 'M (Slim Fit)';
        detail = 'Secara berat badan Anda masuk kategori S/M, namun karena tinggi di atas 175cm kami sarankan ukuran M agar kaos tidak mengatung ke atas.';
      } else {
        size = 'S / M';
        detail = 'Anda berada di ambang ukuran S dan M. Untuk kenyamanan bermain aktif pilih M, untuk ngepres ketat silakan pilih S.';
      }
    } else if (w >= 63 && w < 73) {
      size = 'M';
      detail = 'Proporsi tubuh ideal atletis. Lebar kaos 49-51 cm. Pergerakan lengan akan terasa lepas bebas.';
    } else if (w >= 73 && w < 83) {
      size = 'L';
      detail = 'Sesuai untuk postur agak berisi atau tinggi sedang. Lebar kaos 52-54 cm. Memberikan sirkulasi udara yang nyaman.';
    } else if (w >= 83 && w < 93) {
      size = 'XL';
      detail = 'Ukuran ideal untuk postur berotot, berisi, atau tinggi di atas 180cm. Lebar kaos 55-57 cm.';
    } else if (w >= 93 && w < 105) {
      size = 'XXL';
      detail = 'Postur besar / Big Size. Lebar kaos sekitar 58-60 cm dengan kelonggaran nyaman agar baju tidak ketat di perut.';
    } else {
      size = 'XXXL / SPECIAL ORDER';
      detail = 'Anda termasuk kategori Big-Size khusus. Kami menyarankan pemesanan custom pola dengan lebar kaos di atas 61 cm (silakan sampaikan data ini ke admin).';
    }

    setRecommendedSize(size);
    setRecommenderDetail(detail);
  };

  const genericSizes = [
    { name: 'KIDS (6-8 Th)', p: '52', l: '38', rangeHeight: '115-125 cm', rangeWeight: '20-28 kg' },
    { name: 'KIDS (9-11 Th)', p: '58', l: '42', rangeHeight: '125-140 cm', rangeWeight: '28-38 kg' },
    { name: 'XS (Dewasa)', p: '64', l: '45', rangeHeight: '145-155 cm', rangeWeight: '38-46 kg' },
    { name: 'S (Dewasa)', p: '68', l: '47', rangeHeight: '150-165 cm', rangeWeight: '45-55 kg' },
    { name: 'M (Dewasa)', p: '70', l: '50', rangeHeight: '160-172 cm', rangeWeight: '53-65 kg' },
    { name: 'L (Dewasa)', p: '72', l: '53', rangeHeight: '165-178 cm', rangeWeight: '63-75 kg' },
    { name: 'XL (Dewasa)', p: '74', l: '56', rangeHeight: '170-185 cm', rangeWeight: '73-85 kg' },
    { name: 'XXL (Dewasa)', p: '76', l: '59', rangeHeight: '175-195 cm', rangeWeight: '83-98 kg' },
    { name: '3XL (Dewasa)', p: '80', l: '62', rangeHeight: '180-200 cm', rangeWeight: '95-110 kg' },
  ];

  return (
    <div id="education-view-root" className="bg-neutral-950 text-white min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* VIEW TITLE */}
        <div className="mb-12 pb-4 border-b border-neutral-800 text-center md:text-left">
          <span className="text-orange-500 text-xs font-black uppercase tracking-wider font-mono">Book of Sports Textile</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">Panduan Bahan & Ukuran</h1>
          <p className="text-neutral-400 text-xs md:text-sm mt-2">Dapatkan pemahaman menyeluruh mengenai jenis anyaman kain dryfit serta hitung ukuran jersey tim Anda secara akurat.</p>
        </div>

        {/* SECTION 1: MATERIAL SHOWCASE */}
        <div id="material-catalog-section" className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">Katalog Tekstur Kain Premium ANV</h2>
              <p className="text-xs text-neutral-450 uppercase tracking-widest font-mono">Setiap jenis aktivitas olahraga menuntut anyaman serat dryfit spesifik</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {finalFabrics.map((fabric) => (
              <div 
                key={fabric.id}
                id={`fabric-card-${fabric.id}`}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-5 h-full">
                  
                  {/* Fabric visual thumbnail close-up */}
                  <div className="sm:col-span-2 relative h-48 sm:h-full min-h-[160px]">
                    <img 
                      src={fabric.image} 
                      alt={fabric.name} 
                      className="w-full h-full object-cover filter brightness-90 saturate-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-neutral-900/60 to-transparent" />
                    
                    <span className="absolute bottom-3 left-3 bg-neutral-950/80 border border-neutral-800 text-orange-500 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded">
                      FABRIC INSIGHT
                    </span>
                  </div>

                  {/* Fabric description specifications */}
                  <div className="sm:col-span-3 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-orange-500 transition-colors">
                        {fabric.name}
                      </h3>
                      <p className="text-xs text-orange-550 font-bold mb-3 italic">{fabric.suitability}</p>
                      <p className="text-neutral-450 text-xs leading-relaxed mb-4">
                        {fabric.fullDescription}
                      </p>
                    </div>

                    <div className="border-t border-neutral-800 pt-3">
                      <h4 className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase mb-2">⭐ Karakteristik Serat:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {fabric.characteristics.map((c, i) => (
                          <span 
                            key={i} 
                            className="bg-neutral-950 border border-neutral-850 text-neutral-350 text-[10px] font-medium px-2 py-0.5 rounded"
                          >
                            ✓ {c}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SMART SIZE RECOMMENDER vs MANUAL SIZE TABLE */}
        <div id="sizing-section-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIZING CALCULATOR PANEL (LEFT) */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className="font-extrabold text-md uppercase tracking-wider text-white">Smart Size Recommender</h3>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Kalkulator cerdas interaktif kami akan menganalisis kecocokan postur tinggi dan bobot Anda sesuai pola presisi standar jersey ANV Apparel.
            </p>

            <form onSubmit={handleCalculateSize} className="space-y-4">
              <div>
                <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Tinggi Badan Anda (cm):</label>
                <div className="flex items-center gap-3">
                  <input 
                    id="input-user-height"
                    type="number"
                    min="100"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 font-bold"
                  />
                  <span className="text-xs font-mono font-bold text-neutral-500">CM</span>
                </div>
                <input 
                  type="range" 
                  min="110" 
                  max="210" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 font-bold uppercase mb-1.5 block">Berat Badan Anda (kg):</label>
                <div className="flex items-center gap-3">
                  <input 
                    id="input-user-weight"
                    type="number"
                    min="15"
                    max="150"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 font-bold"
                  />
                  <span className="text-xs font-mono font-bold text-neutral-500">KG</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="125" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                />
              </div>

              <button
                id="btn-calculate-sizing"
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-550 text-white font-extrabold text-sm uppercase py-3 rounded-xl transition-all tracking-wider mt-4"
              >
                Analisis Rekomendasi Ukuran
              </button>
            </form>

            {/* Dynamic result popup box */}
            {recommendedSize && (
              <motion.div
                id="calculate-size-result-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-neutral-950 border border-orange-500/20 p-5 rounded-xl text-center space-y-2 relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-600/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">REKOMENDASI UKURAN ANDA</span>
                <h4 className="text-4xl font-black text-orange-500 italic">{recommendedSize}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed px-2">
                  {recommenderDetail}
                </p>
                <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-900 font-medium">
                  *Gunakan referensi ini saat menginput data roster tim Anda.
                </div>
              </motion.div>
            )}

          </div>

          {/* MANUAL TABLE CHART (RIGHT - DOMINATES CONTENT FOR B2B CLIENTS) */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-orange-500" />
              <h3 className="font-extrabold text-md uppercase tracking-wider text-white">Tabel Standar Ukuran Manual (Panjang x Lebar)</h3>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Gunakan penggaris konvensional untuk mengukur kaos olahraga ternyaman yang Anda miliki saat ini di rumah. Ukuran dihitung dari ketiak ke ketiak (Lebar) dan pundak ke ujung bawah (Panjang).
            </p>

            <div className="overflow-x-auto">
              <table id="manual-size-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4 font-bold">UKURAN (SIZE)</th>
                    <th className="py-3 px-4 font-bold">PANJANG (P) CM</th>
                    <th className="py-3 px-4 font-bold">LEBAR (L) CM</th>
                    <th className="py-3 px-4 font-bold text-center">PROPORSIONAL TUBUH</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-neutral-900">
                  {genericSizes.map((row) => (
                    <tr 
                      key={row.name} 
                      className="hover:bg-neutral-950/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-black text-white group-hover:text-orange-500 transition-colors">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-300">{row.p} cm</td>
                      <td className="py-3 px-4 font-semibold text-neutral-300">{row.l} cm</td>
                      <td className="py-3 px-4 text-center text-neutral-400 font-medium font-mono text-[10.5px]">
                        {row.rangeHeight} | {row.rangeWeight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-neutral-955 border border-neutral-850 rounded-xl text-[11px] text-neutral-400 leading-relaxed">
              ⚠️ <span className="font-bold text-white">Toleransi Jahitan:</span> Ukuran final hasil jahit garment dapat memiliki toleransi perbedaan sebesar ±1.5 cm karena sifat susut panas saat pemanggangan roller press mesin sublimasi. Jika ragu, disarankan selalu menaikkan satu step ukuran (up-size).
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
