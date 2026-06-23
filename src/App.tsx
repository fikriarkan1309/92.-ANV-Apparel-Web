/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import EducationView from './components/EducationView';
import OrderFormView from './components/OrderFormView';
import AdminDashboard from './components/AdminDashboard';
import { Order, FabricMaterial, ProductCatalogItem, PortfolioItem } from './types';
import { INITIAL_ORDERS, FABRICS, CATEGORIES, PORTFOLIO } from './mockData';
import { motion, AnimatePresence } from 'motion/react';
import ToastContainer from './components/ui/ToastContainer';
import { isSupabaseConfigured, fetchSupabaseOrders } from './lib/supabase';
import { 
  isSanityConfigured, 
  fetchSanityFabrics, 
  fetchSanityCatalog, 
  fetchSanityPortfolio,
  fetchSanityHomePage,
  fetchSanityGuidePage,
  SanityHomePageData,
  SanityGuidePageData
} from './lib/sanity';
import { showToast } from './utils/toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'guide' | 'order' | 'admin'>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [fabrics, setFabrics] = useState<FabricMaterial[]>([]);
  const [categories, setCategories] = useState<ProductCatalogItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [homePageSettings, setHomePageSettings] = useState<SanityHomePageData | null>(null);
  const [guidePageSettings, setGuidePageSettings] = useState<SanityGuidePageData | null>(null);
  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize admin check and load orders/CMS data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminApproved(true);
      localStorage.setItem('anv_admin_approved', 'true');
    } else {
      const saved = localStorage.getItem('anv_admin_approved');
      if (saved === 'true') {
        setIsAdminApproved(true);
      }
    }

    async function loadAllData() {
      setLoading(true);
      
      // 1. Load orders (Supabase vs LocalStorage fallback)
      if (isSupabaseConfigured) {
        const dbOrders = await fetchSupabaseOrders();
        if (dbOrders) {
          setOrders(dbOrders);
          localStorage.setItem('anv_orders', JSON.stringify(dbOrders));
        } else {
          // Fallback to cache if database fetch fails
          const cached = localStorage.getItem('anv_orders');
          setOrders(cached ? JSON.parse(cached) : INITIAL_ORDERS);
        }
      } else {
        const cached = localStorage.getItem('anv_orders');
        if (cached) {
          try {
            setOrders(JSON.parse(cached));
          } catch (e) {
            setOrders(INITIAL_ORDERS);
            localStorage.setItem('anv_orders', JSON.stringify(INITIAL_ORDERS));
          }
        } else {
          setOrders(INITIAL_ORDERS);
          localStorage.setItem('anv_orders', JSON.stringify(INITIAL_ORDERS));
        }
      }

      // 2. Load CMS content from Sanity if configured
      if (isSanityConfigured) {
        const [sanityFabrics, sanityCatalog, sanityPortfolio, sanityHome, sanityGuide] = await Promise.all([
          fetchSanityFabrics(),
          fetchSanityCatalog(),
          fetchSanityPortfolio(),
          fetchSanityHomePage(),
          fetchSanityGuidePage()
        ]);

        let hasSyncedAny = false;

        if (sanityFabrics && sanityFabrics.length > 0) {
          setFabrics(sanityFabrics);
          hasSyncedAny = true;
        } else {
          setFabrics(FABRICS);
        }

        if (sanityCatalog && sanityCatalog.length > 0) {
          setCategories(sanityCatalog);
          hasSyncedAny = true;
        } else {
          setCategories(CATEGORIES);
        }

        if (sanityPortfolio && sanityPortfolio.length > 0) {
          setPortfolio(sanityPortfolio);
          hasSyncedAny = true;
        } else {
          setPortfolio(PORTFOLIO);
        }

        if (sanityHome) {
          setHomePageSettings(sanityHome);
          hasSyncedAny = true;
        }

        if (sanityGuide) {
          setGuidePageSettings(sanityGuide);
          hasSyncedAny = true;
        }

        if (hasSyncedAny) {
          showToast('Konten CMS berhasil disinkronisasi dari Sanity!', 'success');
        } else {
          showToast('Menggunakan data statis (Sanity belum dikonfigurasi/aktif)', 'info');
        }
      } else {
        setFabrics(FABRICS);
        setCategories(CATEGORIES);
        setPortfolio(PORTFOLIO);
      }

      setLoading(false);
    }

    loadAllData();
  }, []);

  return (
    <div id="app-viewport" className="min-h-screen bg-neutral-950 font-sans selection:bg-orange-600 selection:text-white">
      
      {/* Dynamic Modal-Free Toast Notifications */}
      <ToastContainer />

      {/* Floating Translucent Sticky Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAdminApproved={isAdminApproved} />

      {/* Loading indicator if fetching */}
      {loading && (
        <div className="fixed bottom-4 left-4 z-50 bg-neutral-900/90 border border-neutral-800 text-neutral-400 text-[10px] font-mono py-2 px-3 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Sinkronisasi database & CMS...</span>
        </div>
      )}

      {/* Main Multi-Section Viewer with Smooth Transitions */}
      <main id="app-main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && (
              <HomeView 
                orders={orders} 
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }} 
                categories={categories}
                portfolio={portfolio}
                fabrics={fabrics}
                homePageSettings={homePageSettings}
              />
            )}

            {activeTab === 'guide' && (
              <EducationView 
                fabrics={fabrics} 
                guidePageSettings={guidePageSettings}
              />
            )}

            {activeTab === 'order' && (
              <OrderFormView 
                orders={orders} 
                setOrders={setOrders} 
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard 
                orders={orders} 
                setOrders={setOrders} 
                isSupabaseConnected={isSupabaseConfigured}
                isSanityConnected={isSanityConfigured}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
