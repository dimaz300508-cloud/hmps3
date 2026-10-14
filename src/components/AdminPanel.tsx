import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Shield, UserCog, Plus, Trash2, RotateCcw, LogOut, BookOpen, Vote, Building2, MessageSquare, CalendarDays, Download } from 'lucide-react';
import { getEffectiveMembers, MemberRecord, DEPARTMENTS_DATA } from '../data/membersData';
import { CommunitySubmission, resetCommunityData, subscribeCommunitySubmissions } from '../lib/communityData';
import { deleteRegistration, RegistrationRecord, subscribeRegistrations } from '../lib/registrationData';
import { ProgramItem } from '../types';
import { PROGRAM_CATEGORIES } from '../data/programsData';
import { firebaseAuth, firebaseConfigured } from '../lib/firebase';
import { getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import * as XLSX from 'xlsx';
import {
  DEFAULT_SITE_SETTINGS,
  saveSiteSettings,
  SiteSettings,
  subscribeSiteSettings,
} from '../data/siteSettings';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = {
  name: '',
  npm: '',
  kelas: 'TPB 3A',
  departemen: 'Humas',
  role: 'Anggota' as MemberRecord['role'],
};

const emptyProgramDraft = {
  title: '',
  category: 'Akademik',
  date: '',
  location: '',
  status: 'Akan Datang' as ProgramItem['status'],
  summary: '',
  image: '',
  instagramUrl: '',
};

type AdminTab = 'members' | 'content' | 'poll' | 'departments' | 'submissions' | 'programs' | 'registrations';

const fieldClassName = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none';

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [members, setMembers] = useState<MemberRecord[]>(() => getEffectiveMembers());
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isClearingSubmissions, setIsClearingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<string | null>(null);
  const [registrationsError, setRegistrationsError] = useState('');
  const [programDraft, setProgramDraft] = useState(emptyProgramDraft);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsLoggedIn(false);
      setLoginError('Konfigurasi Firebase belum tersedia. Panel admin memerlukan variabel VITE_FIREBASE_* di Vercel.');
      return;
    }

    const auth = firebaseAuth;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const token = await getIdTokenResult(user, true);
        if (token.claims.admin === true) {
          setIsLoggedIn(true);
        } else {
          await signOut(auth);
          setIsLoggedIn(false);
          setLoginError('Akun ini belum diberi akses admin Firebase.');
        }
      } catch (error) {
        console.error('Gagal memverifikasi akses admin Firebase:', error);
        setIsLoggedIn(false);
        setLoginError('Gagal memverifikasi akses admin. Periksa koneksi lalu coba lagi.');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;
    return subscribeSiteSettings(
      (nextSettings) => {
        setSettings(nextSettings);
        setMembers(nextSettings.members);
      },
      (error) => {
        console.error('Gagal memuat pengaturan situs:', error);
        setNoticeError(true);
        setNotice('Pengaturan situs gagal dimuat dari Firebase.');
      },
      { ...DEFAULT_SITE_SETTINGS, members: getEffectiveMembers() },
    );
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    if (!isOpen || !isLoggedIn || activeTab !== 'submissions') return;

    setIsLoadingSubmissions(true);
    setSubmissionsError('');
    return subscribeCommunitySubmissions(
      (nextSubmissions) => {
        setSubmissions(nextSubmissions);
        setIsLoadingSubmissions(false);
      },
      (error) => {
        console.error('Gagal memuat saran dan hasil polling:', error);
        setSubmissionsError('Data saran gagal dimuat. Pastikan akun admin memiliki akses ke Firestore.');
        setIsLoadingSubmissions(false);
      },
    );
  }, [isOpen, isLoggedIn, activeTab]);

  useEffect(() => {
    if (!isOpen || !isLoggedIn || activeTab !== 'registrations') return;

    setIsLoadingRegistrations(true);
    setRegistrationsError('');
    return subscribeRegistrations(
      (nextRegistrations) => {
        setRegistrations(nextRegistrations);
        setIsLoadingRegistrations(false);
      },
      (error) => {
        console.error('Gagal memuat pendaftaran anggota:', error);
        setRegistrationsError('Data pendaftar gagal dimuat. Pastikan Firestore Rules sudah diperbarui dan akun memiliki akses admin.');
        setIsLoadingRegistrations(false);
      },
    );
  }, [isOpen, isLoggedIn, activeTab]);

  useEffect(() => {
    if (!settings.departments.some((department) => department.name === form.departemen)) {
      setForm((current) => ({ ...current, departemen: settings.departments[0]?.name ?? '' }));
    }
  }, [settings.departments, form.departemen]);

  const totalMembers = useMemo(() => members.length, [members]);
  const pollResults = useMemo(() => {
    const results = new Map<string, { id: string; label: string; votes: number }>();
    settings.pollOptions.forEach((option) => results.set(option.id, { id: option.id, label: option.label, votes: 0 }));
    submissions.forEach((submission) => {
      const result = results.get(submission.pollOptionId);
      if (result) {
        result.votes += 1;
      } else {
        results.set(submission.pollOptionId, {
          id: submission.pollOptionId,
          label: submission.pollOption,
          votes: 1,
        });
      }
    });
    return [...results.values()];
  }, [settings.pollOptions, submissions]);
  const averageRating = submissions.length
    ? (submissions.reduce((total, submission) => total + submission.rating, 0) / submissions.length).toFixed(1)
    : '0.0';

  const syncMembers = async (nextMembers: MemberRecord[], successMessage: string): Promise<boolean> => {
    const normalizedMembers = nextMembers.map((member, index) => ({
      ...member,
      no: index + 1,
    }));

    const saved = await persistSettings({ ...settings, members: normalizedMembers }, successMessage);
    if (saved) setMembers(normalizedMembers);
    return saved;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!firebaseAuth) {
      setLoginError('Konfigurasi Firebase belum tersedia. Tambahkan variabel VITE_FIREBASE_* di Vercel lalu deploy ulang.');
      return;
    }
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const token = await getIdTokenResult(credential.user, true);
      if (token.claims.admin !== true) {
        await signOut(firebaseAuth);
        setLoginError('Akun ini belum diberi akses admin Firebase.');
        return;
      }
      setIsLoggedIn(true);
      setPassword('');
    } catch (error) {
      console.error('Login admin Firebase gagal:', error);
      setLoginError('Login gagal. Pastikan email, password, dan akun admin Firebase sudah benar.');
    }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) {
      setNoticeError(true);
      setNotice('Konfigurasi Firebase belum tersedia.');
      return;
    }
    try {
      await signOut(firebaseAuth);
      setIsLoggedIn(false);
      setPassword('');
    } catch (error) {
      console.error('Gagal keluar dari panel admin:', error);
      setNoticeError(true);
      setNotice('Gagal keluar dari akun admin. Silakan coba lagi.');
    }
  };

  const persistSettings = async (nextSettings: SiteSettings, successMessage: string): Promise<boolean> => {
    setIsSavingSettings(true);
    setNotice('');
    setNoticeError(false);
    try {
      await saveSiteSettings(nextSettings);
      setSettings(nextSettings);
      setNotice(successMessage);
      return true;
    } catch (error) {
      console.error('Gagal menyimpan pengaturan situs:', error);
      setNoticeError(true);
      setNotice('Pengaturan gagal disimpan. Periksa koneksi dan izin admin Firebase.');
      return false;
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveContent = (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings.vision.trim() || settings.vision.length > 1200 || !settings.period.trim() || settings.period.length > 30 ||
      settings.missions.length === 0 || settings.missions.length > 12 ||
      settings.missions.some((mission) => !mission.title.trim() || mission.title.length > 120 ||
        !mission.description.trim() || mission.description.length > 500) ||
      settings.objectives.length === 0 || settings.objectives.length > 12 ||
      settings.objectives.some((objective) => !objective.trim() || objective.length > 1000)) {
      setNoticeError(true);
      setNotice('Visi/periode harus diisi; isi 1–12 misi dan tujuan. Judul misi maksimal 120, uraian maksimal 500, dan tiap tujuan maksimal 1000 karakter.');
      return;
    }
    void persistSettings(settings, 'Visi, misi, tujuan, dan periode berhasil diperbarui.');
  };

  const handleSavePoll = (event: React.FormEvent) => {
    event.preventDefault();
    const labels = settings.pollOptions.map((option) => option.label.trim());
    if (labels.length < 2 || labels.length > 20 || labels.some((label) => !label || label.length > 160) ||
      new Set(labels.map((label) => label.toLowerCase())).size !== labels.length ||
      new Set(settings.pollOptions.map((option) => option.id)).size !== settings.pollOptions.length) {
      setNoticeError(true);
      setNotice('Polling harus memiliki 2–20 pilihan unik dengan isi maksimal 160 karakter.');
      return;
    }
    void persistSettings({
      ...settings,
      pollOptions: settings.pollOptions.map((option) => ({ ...option, label: option.label.trim() })),
    }, 'Pilihan polling berhasil diperbarui.');
  };

  const handleSaveDepartments = (event: React.FormEvent) => {
    event.preventDefault();
    const names = settings.departments.map((department) => department.name.trim());
    if (settings.departments.length < 1 || settings.departments.length > 20 ||
      !settings.departments.some((department) => department.id === 'himpunan') ||
      names.some((name) => !name || name.length > 60) ||
      new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
      setNoticeError(true);
      setNotice('Harus ada 1–20 departemen dengan nama unik maksimal 60 karakter; Himpunan tidak boleh dihapus.');
      return;
    }
    void persistSettings({
      ...settings,
      departments: settings.departments.map((department) => ({ ...department, name: department.name.trim() })),
    }, 'Daftar departemen berhasil diperbarui.');
  };

  const handleAddProgram = (event: React.FormEvent) => {
    event.preventDefault();
    const title = programDraft.title.trim();
    const date = programDraft.date.trim();
    const location = programDraft.location.trim();
    const summary = programDraft.summary.trim();
    const isHttpUrl = (value: string) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    };

    if (
      !title || title.length > 120 ||
      !date || date.length > 60 ||
      !location || location.length > 160 ||
      !summary || summary.length > 2000 ||
      !isHttpUrl(programDraft.image.trim()) ||
      !isHttpUrl(programDraft.instagramUrl.trim()) ||
      settings.programs.length >= 50
    ) {
      setNoticeError(true);
      setNotice('Lengkapi data agenda: judul, kategori, tanggal, lokasi, deskripsi, URL foto, dan tautan postingan yang valid. Maksimal 50 agenda.');
      return;
    }

    const newProgram: ProgramItem = {
      id: `program-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category: programDraft.category,
      date,
      location,
      status: programDraft.status,
      summary,
      image: programDraft.image.trim(),
      instagramUrl: programDraft.instagramUrl.trim(),
      targetParticipants: 0,
      registeredCount: 0,
    };

    void persistSettings(
      { ...settings, programs: [newProgram, ...settings.programs] },
      'Dokumentasi atau agenda berhasil ditambahkan.',
    ).then((saved) => {
      if (saved) setProgramDraft(emptyProgramDraft);
    });
  };

  const handleRemoveProgram = (programId: string) => {
    if (!window.confirm('Hapus dokumentasi atau agenda ini dari situs?')) return;
    void persistSettings(
      { ...settings, programs: settings.programs.filter((program) => program.id !== programId) },
      'Dokumentasi atau agenda berhasil dihapus.',
    );
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const npm = form.npm.trim();
    if (!name || !npm) {
      setNotice('Nama dan NIM wajib diisi.');
      return;
    }

    const nextMember: MemberRecord = {
      no: members.length + 1,
      name: name.toUpperCase(),
      npm,
      kelas: form.kelas,
      departemen: form.departemen,
      role: form.role,
    };

    const nextMembers = [...members, nextMember];
    if (await syncMembers(nextMembers, 'Anggota baru berhasil ditambahkan.')) setForm(emptyForm);
  };

  const handleRemoveMember = async (npm: string) => {
    const nextMembers = members.filter((member) => member.npm !== npm);
    await syncMembers(nextMembers, 'Anggota berhasil dihapus.');
  };

  const handleResetData = async () => {
    if (!window.confirm('Hapus semua data polling dan saran? Data yang dihapus tidak dapat dipulihkan.')) return;

    setIsClearingSubmissions(true);
    setNotice('');
    try {
      await resetCommunityData();
      setNoticeError(false);
      setNotice('Semua data suara dan aspirasi di Firebase berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus data polling dan aspirasi:', error);
      setNoticeError(true);
      setNotice('Gagal menghapus data Firebase. Pastikan akun admin memiliki izin custom claim admin.');
    } finally {
      setIsClearingSubmissions(false);
    }
  };

  const handleDownloadRegistrations = () => {
    if (registrations.length === 0) {
      setNoticeError(true);
      setNotice('Belum ada data pendaftaran untuk diunduh.');
      return;
    }

    const headers = [
      'No.',
      'Nama Lengkap',
      'NIM',
      'Kelas',
      'Email',
      'Nomor WhatsApp',
      'Perguruan Tinggi',
      'Program Studi',
      'Pilihan Divisi Utama',
      'Pilihan Divisi Kedua',
      'Motivasi & Komitmen',
      'Kode Registrasi',
      'Tanggal Pendaftaran',
    ];
    const rows = registrations.map((registration, index) => [
      index + 1,
      registration.fullName,
      registration.nim,
      registration.className,
      registration.email,
      registration.phone,
      registration.university,
      registration.major,
      registration.division,
      registration.secondaryDivision,
      registration.motivation,
      registration.regCode,
      registration.registeredAt
        ? new Date(registration.registeredAt).toLocaleString('id-ID')
        : 'Waktu tidak tersedia',
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [6, 28, 18, 12, 30, 18, 34, 32, 28, 28, 48, 22, 24]
      .map((wch) => ({ wch }));
    worksheet['!autofilter'] = { ref: worksheet['!ref'] ?? `A1:M${rows.length + 1}` };
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendaftar MATARATU');
    XLSX.writeFile(workbook, `Data-Pendaftar-MATARATU-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleDeleteRegistration = async (registration: RegistrationRecord) => {
    if (!window.confirm(`Hapus data pendaftar ${registration.fullName}? Tindakan ini tidak dapat dibatalkan.`)) return;

    setDeletingRegistrationId(registration.id);
    setNotice('');
    setNoticeError(false);
    try {
      await deleteRegistration(registration.id);
      setNotice(`Data pendaftar ${registration.fullName} berhasil dihapus.`);
    } catch (error) {
      console.error('Gagal menghapus pendaftaran anggota:', error);
      setNoticeError(true);
      setNotice('Data pendaftar gagal dihapus. Pastikan Firestore Rules terbaru sudah dipublikasikan dan akun memiliki akses admin.');
    } finally {
      setDeletingRegistrationId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-amber-500/40 bg-slate-900 p-5 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Tutup panel admin"
        >
          ✕
        </button>

        {!isLoggedIn ? (
          <div className="max-w-md mx-auto py-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="rounded-full border border-amber-500/40 bg-amber-500/10 p-3 text-amber-300">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400">Admin Area</div>
                <h3 className="font-cinzel text-2xl font-bold text-white">Login Panel</h3>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Email Admin</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
              <p className="mb-4 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-[11px] leading-relaxed text-slate-400">
                Panel ini memakai Firebase Authentication. Akun harus dibuat di Firebase dan diberi akses admin khusus sebelum dapat masuk.
              </p>
              {!firebaseConfigured && (
                <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                  Konfigurasi Firebase belum terpasang. Halaman publik tetap dapat dibuka, tetapi fitur admin perlu variabel Firebase di Vercel.
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {loginError && <div className="text-red-400 text-[11px]">{loginError}</div>}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,197,66,0.25)] cursor-pointer"
              >
                Masuk ke Panel Admin
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-amber-500/40 bg-amber-500/10 p-2 text-amber-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400">Panel Admin</div>
                  <h3 className="font-cinzel text-xl font-bold text-white">Kelola Konten & Kepengurusan</h3>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-[11px] font-medium text-slate-300 hover:border-amber-500/40 hover:text-amber-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-4 sm:grid-cols-3 xl:grid-cols-4">
              {([
                { id: 'members', label: 'Anggota & Data', icon: UserCog },
                { id: 'content', label: 'Visi, Misi & Periode', icon: BookOpen },
                { id: 'programs', label: 'Program & Dokumentasi', icon: CalendarDays },
                { id: 'registrations', label: 'Pendaftar Gabung', icon: UserCog },
                { id: 'poll', label: 'Polling', icon: Vote },
                { id: 'departments', label: 'Departemen', icon: Building2 },
                { id: 'submissions', label: 'Saran & Hasil Suara', icon: MessageSquare },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTab(id);
                    setNotice('');
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                    activeTab === id
                      ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'members' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1.8fr] gap-6">
              <form onSubmit={handleAddMember} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <UserCog className="w-4 h-4" />
                  Tambah Anggota Baru
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Nama Lengkap</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="Nama sesuai KTM"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">NIM</label>
                  <input
                    value={form.npm}
                    onChange={(e) => setForm({ ...form, npm: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="Contoh: 2404057"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Kelas</label>
                    <input
                      value={form.kelas}
                      onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as MemberRecord['role'] })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Ketua">Ketua</option>
                      <option value="Wakil">Wakil</option>
                      <option value="Sekretaris">Sekretaris</option>
                      <option value="Bendahara">Bendahara</option>
                      <option value="PJ">PJ</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Departemen</label>
                  <select
                    value={form.departemen}
                    onChange={(e) => setForm({ ...form, departemen: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {settings.departments.map((department) => (
                      <option key={department.id} value={department.name}>{department.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(emptyForm)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-[11px] font-medium text-slate-300 cursor-pointer"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 text-[11px] font-semibold text-slate-950 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Simpan Anggota
                  </button>
                </div>
              </form>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-amber-300">Daftar Anggota Saat Ini</div>
                  <div className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-200">
                    {totalMembers} anggota
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                  {members.map((member) => (
                    <div key={`${member.npm}-${member.name}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-slate-400">{member.npm} · {member.kelas} · {member.departemen}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.npm)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-red-300 hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
            )}

            {activeTab === 'content' && (
              <form onSubmit={handleSaveContent} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300"><BookOpen className="h-4 w-4" />Visi, Misi & Periode Jabatan</h4>
                  <p className="mt-1 text-[11px] text-slate-400">Perubahan tersimpan di Firebase dan tampil untuk semua pengunjung.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-300">Visi</span>
                    <textarea
                      value={settings.vision}
                      maxLength={1200}
                      onChange={(event) => setSettings({ ...settings, vision: event.target.value })}
                      rows={3}
                      className={fieldClassName}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-300">Periode Jabatan</span>
                    <input
                      value={settings.period}
                      maxLength={30}
                      onChange={(event) => setSettings({ ...settings, period: event.target.value })}
                      placeholder="Contoh: 2026-2027"
                      className={fieldClassName}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Daftar Misi</h5>
                    <button
                      type="button"
                      disabled={settings.missions.length >= 12}
                      onClick={() => setSettings({ ...settings, missions: [...settings.missions, { title: '', description: '' }] })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-2.5 py-1.5 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />Tambah Misi
                    </button>
                  </div>
                  {settings.missions.map((mission, index) => (
                    <div key={index} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:grid-cols-[1fr_1.5fr_auto]">
                      <label>
                        <span className="mb-1 block text-[10px] font-medium text-slate-400">Judul Misi {index + 1}</span>
                        <input
                          value={mission.title}
                              maxLength={120}
                          onChange={(event) => setSettings({
                            ...settings,
                            missions: settings.missions.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                          })}
                          className={fieldClassName}
                        />
                      </label>
                      <label>
                        <span className="mb-1 block text-[10px] font-medium text-slate-400">Uraian Misi</span>
                        <textarea
                          value={mission.description}
                              maxLength={500}
                          onChange={(event) => setSettings({
                            ...settings,
                            missions: settings.missions.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item),
                          })}
                          rows={2}
                          className={fieldClassName}
                        />
                      </label>
                      <button
                        type="button"
                        aria-label={`Hapus misi ${index + 1}`}
                        onClick={() => setSettings({ ...settings, missions: settings.missions.filter((_, itemIndex) => itemIndex !== index) })}
                        className="self-end rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Daftar Tujuan</h5>
                    <button
                      type="button"
                      disabled={settings.objectives.length >= 12}
                      onClick={() => setSettings({ ...settings, objectives: [...settings.objectives, ''] })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-2.5 py-1.5 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />Tambah Tujuan
                    </button>
                  </div>
                  {settings.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <span className="mt-2 w-6 shrink-0 text-center text-[10px] text-slate-500">{index + 1}</span>
                      <textarea
                        aria-label={`Tujuan ${index + 1}`}
                        value={objective}
                        maxLength={1000}
                        onChange={(event) => setSettings({
                          ...settings,
                          objectives: settings.objectives.map((item, itemIndex) => itemIndex === index ? event.target.value : item),
                        })}
                        rows={3}
                        className={fieldClassName}
                      />
                      <button
                        type="button"
                        aria-label={`Hapus tujuan ${index + 1}`}
                        onClick={() => setSettings({
                          ...settings,
                          objectives: settings.objectives.filter((_, itemIndex) => itemIndex !== index),
                        })}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={isSavingSettings} className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-60">
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Visi, Misi, Tujuan & Periode'}
                </button>
              </form>
            )}

            {activeTab === 'poll' && (
              <form onSubmit={handleSavePoll} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300"><Vote className="h-4 w-4" />Pilihan Polling</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Ubah, tambah, atau hapus pilihan yang tampil di formulir aspirasi.</p>
                  </div>
                  <button
                    type="button"
                    disabled={settings.pollOptions.length >= 20}
                    onClick={() => setSettings({
                      ...settings,
                      pollOptions: [...settings.pollOptions, {
                        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                        label: '',
                      }],
                    })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-2 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />Tambah Pilihan
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.pollOptions.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <span className="w-6 shrink-0 text-center text-[10px] text-slate-500">{index + 1}</span>
                      <input
                        aria-label={`Pilihan polling ${index + 1}`}
                        value={option.label}
                        maxLength={160}
                        onChange={(event) => setSettings({
                          ...settings,
                          pollOptions: settings.pollOptions.map((item) => item.id === option.id ? { ...item, label: event.target.value } : item),
                        })}
                        className={fieldClassName}
                      />
                      <button
                        type="button"
                        aria-label={`Hapus pilihan ${index + 1}`}
                        onClick={() => setSettings({ ...settings, pollOptions: settings.pollOptions.filter((item) => item.id !== option.id) })}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isSavingSettings} className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-60">
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Pilihan Polling'}
                </button>
              </form>
            )}

            {activeTab === 'programs' && (
              <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                <form onSubmit={handleAddProgram} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                      <CalendarDays className="h-4 w-4" />Tambah Program Kerja & Dokumentasi
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Isi data yang tampil pada kartu publik. Foto menggunakan URL gambar langsung dan tautan Instagram membuka postingan terkait.
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">Judul</span>
                    <input
                      value={programDraft.title}
                      maxLength={120}
                      onChange={(event) => setProgramDraft({ ...programDraft, title: event.target.value })}
                      className={fieldClassName}
                      placeholder="Nama program atau kegiatan"
                      required
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-1 block text-xs font-medium text-slate-300">Kategori</span>
                      <select
                        value={programDraft.category}
                        onChange={(event) => setProgramDraft({ ...programDraft, category: event.target.value })}
                        className={fieldClassName}
                      >
                        {PROGRAM_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-slate-300">Status</span>
                      <select
                        value={programDraft.status}
                        onChange={(event) => setProgramDraft({ ...programDraft, status: event.target.value as ProgramItem['status'] })}
                        className={fieldClassName}
                      >
                        <option>Akan Datang</option>
                        <option>Sedang Berjalan</option>
                        <option>Selesai</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-1 block text-xs font-medium text-slate-300">Tanggal</span>
                      <input
                        value={programDraft.date}
                        maxLength={60}
                        onChange={(event) => setProgramDraft({ ...programDraft, date: event.target.value })}
                        className={fieldClassName}
                        placeholder="Contoh: 14 November 2025"
                        required
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-slate-300">Lokasi</span>
                      <input
                        value={programDraft.location}
                        maxLength={160}
                        onChange={(event) => setProgramDraft({ ...programDraft, location: event.target.value })}
                        className={fieldClassName}
                        placeholder="Lokasi kegiatan"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">Deskripsi</span>
                    <textarea
                      value={programDraft.summary}
                      maxLength={2000}
                      onChange={(event) => setProgramDraft({ ...programDraft, summary: event.target.value })}
                      className={fieldClassName}
                      rows={4}
                      placeholder="Keterangan singkat kegiatan"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">URL Foto</span>
                    <input
                      type="url"
                      value={programDraft.image}
                      onChange={(event) => setProgramDraft({ ...programDraft, image: event.target.value })}
                      className={fieldClassName}
                      placeholder="https://.../foto-kegiatan.jpg"
                      required
                    />
                  </label>

                  {programDraft.image.trim() && (
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                      <div className="relative aspect-4/3">
                        <img
                          src={programDraft.image}
                          alt="Pratinjau bingkai foto program"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-slate-950/85 px-3 py-1 text-xs font-semibold text-amber-300">
                          {programDraft.category}
                        </span>
                      </div>
                      <p className="px-3 py-2 text-[10px] text-slate-400">Pratinjau bingkai foto yang digunakan pada kartu program.</p>
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">Tautan Postingan Instagram</span>
                    <input
                      type="url"
                      value={programDraft.instagramUrl}
                      onChange={(event) => setProgramDraft({ ...programDraft, instagramUrl: event.target.value })}
                      className={fieldClassName}
                      placeholder="https://www.instagram.com/.../"
                      required
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setProgramDraft(emptyProgramDraft)}
                      className="rounded-xl border border-slate-700 px-3 py-2.5 text-xs font-medium text-slate-300 hover:border-slate-500"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSettings || settings.programs.length >= 50}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isSavingSettings ? 'Menyimpan...' : 'Tambah Postingan'}
                    </button>
                  </div>
                  {settings.programs.length >= 50 && (
                    <p className="text-[11px] text-amber-200">Maksimal 50 program atau dokumentasi.</p>
                  )}
                </form>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300">Postingan Saat Ini</h4>
                      <p className="mt-1 text-[11px] text-slate-400">Perubahan disimpan di Firebase dan ditampilkan kepada semua pengunjung.</p>
                    </div>
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-200">
                      {settings.programs.length} / 50
                    </span>
                  </div>

                  <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
                    {settings.programs.map((program) => (
                      <article key={program.id} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <img
                          src={program.image}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-20 w-24 shrink-0 rounded-lg border border-slate-800 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="break-words text-xs font-semibold text-white">{program.title}</h5>
                            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-200">
                              {program.category}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400">{program.date} · {program.location}</p>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-300">{program.summary}</p>
                          {program.instagramUrl && (
                            <a
                              href={program.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block break-all text-[10px] text-pink-300 hover:text-pink-200"
                            >
                              Buka tautan Instagram
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Hapus postingan ${program.title}`}
                          onClick={() => handleRemoveProgram(program.id)}
                          disabled={isSavingSettings}
                          className="h-fit shrink-0 rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </article>
                    ))}
                    {settings.programs.length === 0 && (
                      <p className="py-10 text-center text-xs text-slate-400">Belum ada program atau dokumentasi.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'registrations' && (
              <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-300">Data Pendaftar Gabung MATARATU</h4>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Data pendaftar diperbarui otomatis. Unduh berkas Excel untuk menyimpan atau mengolah data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadRegistrations}
                    disabled={isLoadingRegistrations || registrations.length === 0}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Unduh Excel (.xlsx)
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-xs text-slate-300">Total pendaftar</span>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
                    {registrations.length}
                  </span>
                </div>

                {registrationsError && (
                  <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {registrationsError}
                  </p>
                )}
                {isLoadingRegistrations ? (
                  <p className="py-10 text-center text-xs text-slate-400">Memuat data pendaftar...</p>
                ) : !registrationsError && registrations.length === 0 ? (
                  <p className="py-10 text-center text-xs text-slate-400">Belum ada pendaftaran anggota baru.</p>
                ) : !registrationsError && (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="min-w-[1500px] w-full border-collapse text-left text-[11px]">
                      <thead className="sticky top-0 bg-slate-900 text-amber-200">
                        <tr>
                          {[
                            'No.',
                            'Nama Lengkap',
                            'NIM',
                            'Kelas',
                            'Email',
                            'WhatsApp',
                            'Perguruan Tinggi',
                            'Program Studi',
                            'Divisi Utama',
                            'Divisi Kedua',
                            'Motivasi & Komitmen',
                            'Kode Registrasi',
                            'Tanggal Pendaftaran',
                          ].map((heading) => (
                            <th key={heading} className="border-b border-slate-700 px-3 py-3 font-semibold">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((registration, index) => (
                          <tr key={registration.id} className="border-b border-slate-800 align-top text-slate-300 last:border-0">
                            <td className="px-3 py-3">{index + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex min-w-40 items-start justify-between gap-3">
                                <span className="font-medium text-white">{registration.fullName}</span>
                                <button
                                  type="button"
                                  aria-label={`Hapus pendaftar ${registration.fullName}`}
                                  title="Hapus pendaftar"
                                  disabled={deletingRegistrationId === registration.id}
                                  onClick={() => void handleDeleteRegistration(registration)}
                                  className="shrink-0 rounded-md border border-red-500/30 p-1.5 text-red-300 hover:bg-red-500/10 disabled:cursor-wait disabled:opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3">{registration.nim}</td>
                            <td className="px-3 py-3">{registration.className}</td>
                            <td className="px-3 py-3">{registration.email}</td>
                            <td className="px-3 py-3">{registration.phone}</td>
                            <td className="px-3 py-3">{registration.university}</td>
                            <td className="px-3 py-3">{registration.major}</td>
                            <td className="px-3 py-3">{registration.division}</td>
                            <td className="px-3 py-3">{registration.secondaryDivision}</td>
                            <td className="max-w-xs whitespace-pre-wrap px-3 py-3">{registration.motivation}</td>
                            <td className="px-3 py-3 font-mono text-amber-200">{registration.regCode}</td>
                            <td className="px-3 py-3">
                              {registration.registeredAt
                                ? new Date(registration.registeredAt).toLocaleString('id-ID')
                                : 'Waktu tidak tersedia'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                  <div className="mb-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                      <MessageSquare className="h-4 w-4" />Inspirasi, Saran & Hasil Polling
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Data terbaru diperbarui otomatis. Nama yang memilih anonim tetap ditampilkan sebagai Anonim.
                    </p>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-[11px] text-slate-300">
                      Hapus semua kiriman polling dan saran untuk mengosongkan data.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleResetData()}
                      disabled={isClearingSubmissions}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {isClearingSubmissions ? 'Menghapus...' : 'Hapus Semua Data'}
                    </button>
                  </div>

                  {submissionsError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      {submissionsError}
                    </div>
                  )}

                  {isLoadingSubmissions ? (
                    <p className="py-8 text-center text-xs text-slate-400">Memuat aspirasi dan hasil polling...</p>
                  ) : !submissionsError && submissions.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">
                      Belum ada data polling atau saran tersimpan.
                    </p>
                  ) : !submissionsError && (
                    <>
                      <div className="mb-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">Total kiriman</div>
                          <div className="mt-1 text-xl font-bold text-white">{submissions.length}</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">Rata-rata kepuasan</div>
                          <div className="mt-1 text-xl font-bold text-white">{averageRating}<span className="text-sm text-slate-400"> / 5</span></div>
                        </div>
                      </div>

                      <div className="mb-5 space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Rekap suara polling</h5>
                        {pollResults.map((result) => (
                          <div key={result.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
                            <span className="text-slate-200">{result.label}</span>
                            <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-semibold text-amber-200">
                              {result.votes} suara
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Daftar kritik dan saran</h5>
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                          {submissions.map((submission) => (
                            <article key={submission.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs font-semibold text-white">{submission.name}</div>
                                <time className="text-[10px] text-slate-500">
                                  {submission.createdAt
                                    ? new Date(submission.createdAt).toLocaleString('id-ID')
                                    : 'Waktu tidak tersedia'}
                                </time>
                              </div>
                              <div className="mt-2 text-[11px] text-amber-200">
                                Pilihan: {submission.pollOption} · Kepuasan: {submission.rating}/5
                              </div>
                              <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
                                {submission.criticism}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                      {submissions.length === 100 && (
                        <p className="mt-3 text-[10px] text-slate-500">Menampilkan 100 kiriman terbaru.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <form onSubmit={handleSaveDepartments} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300"><Building2 className="h-4 w-4" />Kelola Departemen</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Nama dan warna akan diperbarui pada bagan serta pilihan departemen anggota.</p>
                  </div>
                  <button
                    type="button"
                    disabled={settings.departments.length >= 20}
                    onClick={() => setSettings({
                      ...settings,
                      departments: [...settings.departments, {
                        id: `department-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        name: '',
                        color: '#F59E0B',
                      }],
                    })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-2 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />Tambah Departemen
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {settings.departments.map((department) => (
                    <div key={department.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <input
                        aria-label="Warna departemen"
                        type="color"
                        value={department.color}
                        onChange={(event) => setSettings({
                          ...settings,
                          departments: settings.departments.map((item) => item.id === department.id ? { ...item, color: event.target.value } : item),
                        })}
                        className="h-9 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent"
                      />
                      <input
                        aria-label="Nama departemen"
                        value={department.name}
                        maxLength={60}
                        onChange={(event) => setSettings({
                          ...settings,
                          departments: settings.departments.map((item) => item.id === department.id ? { ...item, name: event.target.value } : item),
                        })}
                        className={fieldClassName}
                        placeholder="Nama departemen"
                      />
                      <button
                        type="button"
                        aria-label={`Hapus departemen ${department.name || 'baru'}`}
                        disabled={department.id === 'himpunan'}
                        onClick={() => {
                          const originalName = DEPARTMENTS_DATA.find((item) => item.id === department.id)?.name;
                          if (members.some((member) => member.departemen === department.name || member.departemen === originalName)) {
                            setNoticeError(true);
                            setNotice('Departemen masih memiliki anggota. Pindahkan anggota terlebih dahulu sebelum menghapusnya.');
                            return;
                          }
                          setSettings({ ...settings, departments: settings.departments.filter((item) => item.id !== department.id) });
                        }}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isSavingSettings} className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-60">
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Departemen'}
                </button>
              </form>
            )}

            {notice && (
              <div className={`rounded-xl border px-3 py-2 text-[11px] ${
                noticeError
                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}>
                {notice}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
