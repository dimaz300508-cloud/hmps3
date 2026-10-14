import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DEPARTMENTS_DATA, HMPS_MEMBERS, MemberRecord } from './membersData';
import { firestore } from '../lib/firebase';
import { ProgramItem } from '../types';
import { DEFAULT_PROGRAMS } from './programsData';

export interface PollOption {
  id: string;
  label: string;
}

export interface DepartmentSetting {
  id: string;
  name: string;
  color: string;
}

export interface SiteSettings {
  vision: string;
  missions: { title: string; description: string }[];
  objectives: string[];
  programs: ProgramItem[];
  period: string;
  pollOptions: PollOption[];
  departments: DepartmentSetting[];
  members: MemberRecord[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  vision: 'MENJADI PROGRAM STUDI VOKASI YANG UNGGUL SECARA NASIONAL DI BIDANG PERTAMBANGAN BATUBARA DAN BERDAYA SAING GLOBAL PADA TAHUN 2030',
  missions: [
    {
      title: 'Menghasilkan Lulusan Tersertifikasi',
      description: 'Menghasilkan lulusan yang tersertifikasi dan mampu bersaing di bidang pertambangan batubara.',
    },
    {
      title: 'Publikasi Karya Ilmiah Internasional',
      description: 'Menghasilkan karya ilmiah yang terbit pada publikasi bereputasi internasional.',
    },
    {
      title: 'Pengabdian kepada Masyarakat',
      description: 'Menyelenggarakan kegiatan pengabdian kepada masyarakat di bidang keilmuan pertambangan.',
    },
    {
      title: 'Kerja Sama dengan Stakeholder Pertambangan',
      description: 'Menyelenggarakan kerja sama yang produktif dan kontributif dengan stakeholder di bidang pertambangan.',
    },
  ],
  objectives: [
    'Menghasilkan lulusan tersertifikasi yang terdidik dan terlatih serta memiliki bekal kemandirian untuk menerapkan iptek di bidang pekerjaan yang sesuai dengan kompetensi utama dan penunjang lulusan.',
    'Meningkatkan daya kreatifitas dan inovasi dosen dan mahasiswa dalam menggali serta mengembangkan penelitian di bidang pertambangan untuk menghasilkan karya ilmiah yang terbit pada publikasi bereputasi internasional.',
    'Meningkatkan kemampuan berbuat dan bersikap positif dosen dan mahasiswa dalam menyampaikan informasi dan teknologi untuk menerapkan iptek secara arif dan bijaksana bagi industri pertambangan maupun masyarakat yang terkait.',
    'Melaksanakan kerjasama dengan stakeholder di bidang pertambangan dalam Tri Dharma Perguruan Tinggi.',
  ],
  programs: DEFAULT_PROGRAMS,
  period: '2026-2027',
  pollOptions: [
    { id: '1', label: 'Penguatan Riset, Publikasi Ilmiah & Akses Beasiswa' },
    { id: '2', label: 'Aksi Nyata Bakti Sosial & Pelestarian Desa Adat Nusantara' },
    { id: '3', label: 'Pelatihan Kepemimpinan, Diplomasi & Soft Skills Industri' },
    { id: '4', label: 'Inkubasi Bisnis Mahasiswa & Inkubator Startup Mandiri' },
  ],
  departments: DEPARTMENTS_DATA.map(({ id, name, color }) => ({ id, name, color })),
  members: HMPS_MEMBERS,
};

function parseSiteSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== 'object') return DEFAULT_SITE_SETTINGS;
  const data = value as Partial<SiteSettings>;
  const missions = Array.isArray(data.missions)
    ? data.missions.filter((mission) => mission && typeof mission.title === 'string' && typeof mission.description === 'string')
    : DEFAULT_SITE_SETTINGS.missions;
  const objectives = Array.isArray(data.objectives)
    ? data.objectives.filter((objective): objective is string => typeof objective === 'string')
    : DEFAULT_SITE_SETTINGS.objectives;
  const programs = Array.isArray(data.programs)
    ? data.programs.filter((program): program is ProgramItem =>
      !!program && typeof program.id === 'string' && typeof program.title === 'string' &&
      typeof program.category === 'string' && typeof program.date === 'string' &&
      typeof program.location === 'string' &&
      ['Akan Datang', 'Sedang Berjalan', 'Selesai'].includes(program.status) &&
      typeof program.summary === 'string' && typeof program.image === 'string' &&
      typeof program.targetParticipants === 'number' && typeof program.registeredCount === 'number' &&
      (program.instagramUrl === undefined || typeof program.instagramUrl === 'string'),
    )
    : DEFAULT_SITE_SETTINGS.programs;
  const pollOptions = Array.isArray(data.pollOptions)
    ? data.pollOptions.filter((option) => option && typeof option.id === 'string' && typeof option.label === 'string')
    : DEFAULT_SITE_SETTINGS.pollOptions;
  const departments = Array.isArray(data.departments)
    ? data.departments.filter((department) =>
      department && typeof department.id === 'string' && typeof department.name === 'string' && /^#[0-9a-f]{6}$/i.test(department.color),
    )
    : DEFAULT_SITE_SETTINGS.departments;
  const members = Array.isArray(data.members)
    ? data.members.filter((member): member is MemberRecord =>
      !!member && typeof member.no === 'number' && typeof member.name === 'string' &&
      typeof member.npm === 'string' && typeof member.kelas === 'string' &&
      typeof member.departemen === 'string' &&
      ['Ketua', 'Wakil', 'Sekretaris', 'Bendahara', 'PJ', 'Anggota'].includes(member.role),
    )
    : DEFAULT_SITE_SETTINGS.members;

  return {
    vision: typeof data.vision === 'string' ? data.vision : DEFAULT_SITE_SETTINGS.vision,
    missions,
    objectives,
    programs,
    period: typeof data.period === 'string' ? data.period : DEFAULT_SITE_SETTINGS.period,
    pollOptions,
    departments,
    members,
  };
}

export function subscribeSiteSettings(
  onSettings: (settings: SiteSettings) => void,
  onError: (error: Error) => void,
  fallbackSettings: SiteSettings = DEFAULT_SITE_SETTINGS,
): () => void {
  if (!firestore) {
    onSettings(fallbackSettings);
    onError(new Error('Konfigurasi Firebase belum tersedia. Situs menggunakan konten bawaan.'));
    return () => {};
  }

  const settingsRef = doc(firestore, 'siteContent', 'public');
  return onSnapshot(
    settingsRef,
    (snapshot) => onSettings(snapshot.exists() ? parseSiteSettings(snapshot.data()) : fallbackSettings),
    (error) => onError(error),
  );
}

export function saveSiteSettings(settings: SiteSettings): Promise<void> {
  if (!firestore) {
    return Promise.reject(new Error('Konfigurasi Firebase belum tersedia. Pengaturan situs tidak dapat disimpan.'));
  }
  const settingsRef = doc(firestore, 'siteContent', 'public');
  return setDoc(settingsRef, settings);
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => subscribeSiteSettings(
    setSettings,
    (error) => console.error('Gagal memuat pengaturan situs dari Firebase:', error),
  ), []);

  return settings;
}
