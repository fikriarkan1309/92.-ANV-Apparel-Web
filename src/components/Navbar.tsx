/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shirt, Info, ClipboardList, Settings, Menu, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: 'home' | 'guide' | 'order' | 'admin';
  setActiveTab: (tab: 'home' | 'guide' | 'order' | 'admin') => void;
  isAdminApproved?: boolean;
}

export default function Navbar({ activeTab, setActiveTab, isAdminApproved = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rawNavItems = [
    { id: 'home', label: 'Beranda', icon: Shirt },
    { id: 'guide', label: 'Panduan & Bahan', icon: Info },
    { id: 'order', label: 'Portal Pemesanan', icon: ClipboardList },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
  ] as const;

  const navItems = rawNavItems.filter(item => item.id !== 'admin' || isAdminApproved);

  const handleNavClick = (tabId: 'home' | 'guide' | 'order' | 'admin') => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 ${
        isScrolled
          ? 'bg-neutral-900/95 text-white shadow-lg backdrop-blur-md border-b border-neutral-800'
          : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div
          id="navbar-brand"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white italic tracking-wider text-xl transform group-hover:scale-105 transition-all">
            ANV
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">ANV</span>
            <span className="text-orange-500 font-bold ml-1 text-sm tracking-widest uppercase">Apparel</span>
          </div>
        </div>

        {/* DESKTOP NAV ITEMS */}
        <div id="desktop-nav-links" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all relative ${
                  isActive
                    ? 'text-orange-500 font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-orange-600/10 border-b-2 border-orange-600 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* WHATSAPP CTA BADGE */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            id="nav-whatsapp-cta"
            href="https://wa.me/6281234567890?text=Halo%20ANV%20Apparel,%20saya%20ingin%20konsultasi%20mengenai%20desain%20jersey!"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-md hover:shadow-orange-600/20"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            Hubungi Admin
          </a>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white p-2 rounded-md hover:bg-neutral-800 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE NAV PANEL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-neutral-950/95 border-t border-neutral-800 absolute top-full left-0 right-0 overflow-hidden backdrop-blur-lg shadow-xl"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-orange-600 font-bold text-white shadow-md'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <a
                id="mobile-whatsapp-cta"
                href="https://wa.me/6281234567890?text=Halo%20ANV%20Apparel...%20saya%20ingin%20tanya%20desain"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-505 text-white py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-colors mt-2"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                CHAT WHATSAPP
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
