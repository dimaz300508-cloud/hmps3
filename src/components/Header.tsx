import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MataratuLogo } from './MataratuLogo';

interface HeaderProps {
  onOpenJoinModal: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenJoinModal, onOpenAdminPanel }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    soundManager.playClick();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-900/30 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-8 sm:px-6 sm:py-3.5">
        {/* Zone 1: Brand title, one line */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <a 
            href="#beranda" 
            onClick={handleNavClick}
            aria-label="Beranda Himpunan MATARATU"
            className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap flex items-center gap-2.5"
          >
            <MataratuLogo className="h-7 w-7 shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] sm:h-8 sm:w-8" />
            <span className="hidden sm:inline">Himpunan MATARATU</span>
          </a>
        </div>

        {/* Zone 2: 4–5 nav links, 1–2 word labels, single-line (NO '3D' in names) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a 
            href="#filosofi" 
            onClick={handleNavClick}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Visi & Filosofi
          </a>
          <a 
            href="#lambang-resmi" 
            onClick={handleNavClick}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Lambang Resmi
          </a>
          <a 
            href="#struktur" 
            onClick={handleNavClick}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Struktur Organisasi
          </a>
          <a 
            href="#program-kerja" 
            onClick={handleNavClick}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Program Kerja
          </a>
          <a 
            href="#aspirasi" 
            onClick={handleNavClick}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Aspirasi
          </a>
        </nav>

        {/* Zone 3: 1 primary action + audio toggle + Instagram link */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
          <a
            href="https://www.instagram.com/hmpsmataratu?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Resmi @hmpsmataratu"
            aria-label="Instagram Resmi HMPS MATARATU"
            className="flex items-center justify-center rounded-lg border border-amber-900/40 bg-slate-900/60 p-1.5 text-xs text-pink-400 transition-all hover:border-pink-500/50 hover:text-pink-300 sm:p-2"
          >
            <svg className="h-4 w-4 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          <button
            onClick={() => {
              soundManager.playChime();
              onOpenJoinModal();
            }}
            className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 px-2 py-2 text-[10px] font-semibold text-slate-950 shadow-[0_0_15px_rgba(245,197,66,0.3)] transition-all hover:from-amber-300 hover:to-yellow-400 sm:px-4 sm:text-xs"
          >
            <span className="sm:hidden">Gabung</span>
            <span className="hidden sm:inline">Gabung Sekarang</span>
          </button>

          {onOpenAdminPanel && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-2 text-[9px] font-semibold text-amber-200 shadow-[0_0_10px_rgba(245,197,66,0.12)] transition-all hover:bg-amber-500/20 sm:px-3 sm:text-[10px]"
            >
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Login Admin</span>
            </button>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:text-amber-300 sm:p-2"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-900/30 bg-slate-950/95 px-6 py-4 flex flex-col gap-4">
          <a href="#filosofi" onClick={handleNavClick} className="text-slate-300 hover:text-amber-300 py-1">Visi & Filosofi</a>
          <a href="#lambang-resmi" onClick={handleNavClick} className="text-slate-300 hover:text-amber-300 py-1">Lambang Resmi</a>
          <a href="#struktur" onClick={handleNavClick} className="text-slate-300 hover:text-amber-300 py-1">Struktur Organisasi</a>
          <a href="#program-kerja" onClick={handleNavClick} className="text-slate-300 hover:text-amber-300 py-1">Program Kerja</a>
          <a href="#aspirasi" onClick={handleNavClick} className="text-slate-300 hover:text-amber-300 py-1">Aspirasi</a>
        </div>
      )}
    </header>
  );
};
