import { useState } from 'react';
import { Header } from './components/Header';
import { Hero3D } from './components/Hero3D';
import { Philosophy } from './components/Philosophy';
import { Organization3D } from './components/Organization3D';
import { ProgramsTimeline } from './components/ProgramsTimeline';
import { AspirationPoll } from './components/AspirationPoll';
import { JoinModal } from './components/JoinModal';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { MiningBackdrop } from './components/MiningBackdrop';
import { ScrollReveal } from './components/ScrollReveal';
import { MataratuLogo } from './components/MataratuLogo';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <div className="relative isolate min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <MiningBackdrop />
      {!hasEntered ? (
        <main className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 top-[18%] h-96 w-96 rounded-full bg-red-700/20 blur-[100px]" />
            <div className="absolute -right-40 bottom-[12%] h-96 w-96 rounded-full bg-red-600/20 blur-[110px]" />
            {[
              { left: '12%', top: '22%' },
              { left: '22%', top: '67%' },
              { left: '31%', top: '15%' },
              { left: '39%', top: '82%' },
              { left: '63%', top: '13%' },
              { left: '71%', top: '76%' },
              { left: '82%', top: '29%' },
              { left: '91%', top: '61%' },
              { left: '8%', top: '51%' },
              { left: '87%', top: '88%' },
            ].map((position, index) => (
              <span
                key={index}
                className="absolute h-1.5 w-1.5 rounded-full bg-red-400/90 shadow-[0_0_14px_rgba(248,113,113,0.9)] animate-pulse"
                style={position}
              />
            ))}
          </div>
          <div className="flex max-w-3xl flex-col items-center">
            <MataratuLogo className="mb-8 h-36 w-36 drop-shadow-[0_0_30px_rgba(245,158,11,0.25)] sm:h-44 sm:w-44" />
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-amber-400 sm:text-sm">
              Himpunan Mahasiswa Teknik Pertambangan
            </p>
            <h1 className="font-cinzel text-4xl font-bold leading-tight text-amber-100 sm:text-6xl">
              Selamat Datang
              <span className="mt-2 block gold-gradient-text">di Website MATARATU!!!</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Kenali MATARATU, semangat kebersamaan, dan berbagai kegiatan kami.
            </p>
            <button
              type="button"
              onClick={() => setHasEntered(true)}
              className="mt-10 rounded-full border border-amber-400/70 bg-amber-500 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.24)] transition duration-300 hover:scale-105 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
            >
              Masuk ke Website
            </button>
          </div>
        </main>
      ) : (
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Top Bar Header */}
      <Header
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Interactive 3D Emblem Hero */}
        <ScrollReveal><Hero3D onOpenJoinModal={() => setIsJoinModalOpen(true)} /></ScrollReveal>

        {/* Filosofi & Makna Lambang */}
        <ScrollReveal delay={40}><Philosophy /></ScrollReveal>

        {/* Struktur Organisasi Bagan Interaktif */}
        <ScrollReveal delay={70}><Organization3D /></ScrollReveal>

        {/* Program Kerja & Ekskursi Tambang */}
        <ScrollReveal delay={100}><ProgramsTimeline /></ScrollReveal>

        {/* Pojok Suara & Kotak Aspirasi */}
        <ScrollReveal delay={130}><AspirationPoll /></ScrollReveal>
      </main>

      {/* Institutional Footer */}
      <Footer onOpenAdminPanel={() => setIsAdminPanelOpen(true)} />

      {/* Recruitment Registration Modal */}
      <JoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      </div>
      )}
    </div>
  );
}
