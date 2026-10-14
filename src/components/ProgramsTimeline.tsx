import React, { useState } from 'react';
import { ProgramItem } from '../types';
import { soundManager } from '../utils/audio';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../data/siteSettings';
import { PROGRAM_CATEGORIES } from '../data/programsData';

export const ProgramsTimeline: React.FC = () => {
  const settings = useSiteSettings();
  const [filter, setFilter] = useState<string>('Semua');
  const categories = [...new Set([
    'Semua',
    ...PROGRAM_CATEGORIES,
    ...settings.programs.map((program) => program.category),
  ])];

  const filteredPrograms = filter === 'Semua' 
    ? settings.programs 
    : settings.programs.filter((p) => p.category === filter);

  return (
    <section id="program-kerja" className="py-20 bg-slate-950/80 border-b border-amber-900/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-3">
              <span>Dokumentasi Resmi & Agenda Kegiatan</span>
              <span aria-hidden="true">·</span>
              <span>HMPS MATARATU</span>
            </div>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Program Kerja & Dokumentasi Lapangan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Dokumentasi dan rencana agenda strategis keilmuan, kepemimpinan, dan kepedulian lingkungan hidup mahasiswa Teknik Pertambangan Batubara.
            </p>
          </div>

          {/* Social Instagram Channel & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <a
              href="https://www.instagram.com/hmpsmataratu?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-pink-500/50 text-xs font-medium text-pink-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@hmpsmataratu</span>
            </a>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundManager.playClick();
                    setFilter(cat);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    filter === cat
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Program Cards Grid (Clean: Foto, Keterangan & Link Instagram) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group shadow-lg"
            >
              <div>
                {/* Foto Kegiatan */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                  <img
                    src={program.image}
                    alt={program.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  
                  {/* Kategori Badge Unboxed */}
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs font-semibold text-amber-300">
                    {program.category}
                  </div>
                </div>

                {/* Keterangan & Detail */}
                <div className="p-6">
                  {/* Waktu & Lokasi */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{program.date}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{program.location}</span>
                    </span>
                  </div>

                  <h3 className="font-cinzel text-lg font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">
                    {program.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {program.summary}
                  </p>
                </div>
              </div>

              {/* Link ke Postingan Instagram Resmi */}
              {program.instagramUrl && (
                <div className="p-6 pt-0 border-t border-slate-800/80 mt-2">
                  <a
                    href={program.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:border-slate-700"
                  >
                    <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Buka Dokumentasi di Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
