import React, { useState } from 'react';
import { Check, LoaderCircle, MessageSquare, Send, Star, Vote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createCommunitySubmission } from '../lib/communityData';
import { soundManager } from '../utils/audio';
import { useSiteSettings } from '../data/siteSettings';

function getSubmissionErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    if (error.code === 'permission-denied') {
      return 'Saran belum dapat dikirim karena aturan Firestore belum diperbarui. Hubungi admin situs.';
    }
    if (error.code === 'unavailable') {
      return 'Firebase sedang tidak tersedia. Periksa koneksi lalu coba lagi.';
    }
  }
  return 'Gagal menyimpan polling dan saran. Periksa koneksi lalu coba lagi.';
}

export const AspirationPoll: React.FC = () => {
  const settings = useSiteSettings();
  const [nameMode, setNameMode] = useState<'anonymous' | 'named'>('anonymous');
  const [name, setName] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [rating, setRating] = useState(0);
  const [criticism, setCriticism] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setStatus(null);

    if (!selectedOptionId || !rating || !criticism.trim() || (nameMode === 'named' && !name.trim())) {
      setStatus({ type: 'error', message: 'Lengkapi nama, pilihan program, nilai kepuasan, dan kritik atau saran.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedOption = settings.pollOptions.find((option) => option.id === selectedOptionId);
      if (!selectedOption) {
        setStatus({ type: 'error', message: 'Pilihan polling sudah berubah. Silakan pilih ulang.' });
        return;
      }
      await createCommunitySubmission({
        nameMode,
        name: nameMode === 'named' ? name.trim() : 'Anonim',
        pollOptionId: selectedOptionId,
        pollOption: selectedOption.label,
        rating,
        criticism: criticism.trim(),
      });

      soundManager.playSuccess();
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 }, colors: ['#F5C542', '#38BDF8'] });
      setStatus({ type: 'success', message: 'Terima kasih! Polling dan saran berhasil tersimpan dan dapat dibaca pengurus di panel admin.' });
      setName('');
      setSelectedOptionId('');
      setRating(0);
      setCriticism('');
    } catch (error) {
      console.error('Gagal mengirim suara dan kritik:', error);
      setStatus({ type: 'error', message: getSubmissionErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="aspirasi" className="relative border-b border-amber-900/20 bg-slate-950/80 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Demokrasi Mahasiswa & Suara Kolektif</span>
            <span aria-hidden="true">·</span>
            <span>Pojok Aspirasi</span>
          </div>
          <h2 className="font-cinzel text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Jajak Pendapat & Kritik Mataratu
          </h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Sampaikan pilihan program, nilai kepuasan kampus, dan kritik atau saran dalam satu formulir.
            Tidak perlu masuk akun Gmail; hasil suara tidak ditampilkan dan kiriman dapat dibaca pengurus melalui panel admin.
          </p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <fieldset>
            <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Vote className="h-4 w-4" /> Pilih prioritas program Mataratu
            </legend>
            <div className="space-y-3">
              {settings.pollOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    selectedOptionId === option.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span className="text-sm text-slate-200">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-amber-300">Seberapa puas Anda dengan kampus?</legend>
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Nilai kepuasan kampus dari 1 sampai 5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} dari 5`}
                  onClick={() => setRating(value)}
                  className={`flex h-12 w-12 items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition-colors ${
                    rating === value
                      ? 'border-amber-400 bg-amber-400 text-slate-950'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-400/70'
                  }`}
                >
                  {value}<Star className={`h-3.5 w-3.5 ${rating === value ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="ml-1 text-xs text-slate-400">1 = sangat tidak puas · 5 = sangat puas</span>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-amber-300">Nama yang ditampilkan</legend>
            <div className="flex flex-wrap gap-4 text-sm text-slate-200">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="name-mode" checked={nameMode === 'anonymous'} onChange={() => setNameMode('anonymous')} className="accent-amber-400" />
                Anonim
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="name-mode" checked={nameMode === 'named'} onChange={() => setNameMode('named')} className="accent-amber-400" />
                Nama lengkap
              </label>
            </div>
            {nameMode === 'named' && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
                placeholder="Masukkan nama lengkap"
                aria-label="Nama lengkap"
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
              />
            )}
          </fieldset>

          <div>
            <label htmlFor="community-criticism" className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
              <MessageSquare className="h-4 w-4" /> Kritik atau saran
            </label>
            <textarea
              id="community-criticism"
              value={criticism}
              onChange={(event) => setCriticism(event.target.value)}
              maxLength={2000}
              required
              rows={5}
              placeholder="Tuliskan kritik atau saran yang membangun..."
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
            />
            <div className="mt-1 text-right text-xs text-slate-500">{criticism.length}/2000</div>
          </div>

          {status && (
            <p role={status.type === 'error' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm ${status.type === 'error' ? 'bg-red-950/50 text-red-200' : 'bg-emerald-950/50 text-emerald-200'}`}>
              {status.type === 'success' && <Check className="mr-2 inline h-4 w-4" />}
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? 'Mengirim...' : 'Kirim suara & kritik'}
          </button>
        </form>
      </div>
    </section>
  );
};
