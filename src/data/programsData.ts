import { ProgramItem } from '../types';
import summitImg from '../assets/images/mataratu_activity_summit_1791553719793.jpeg';
import socialImg from '../assets/images/mataratu_social_cultural_1791553732138.jpeg';
import sambutanMabaImg from '../assets/images/sambutan_maba_mataratu_1791559256979.jpeg';

export const PROGRAM_CATEGORIES = [
  'Akademik',
  'Sosial',
  'Kebudayaan',
  'Kaderisasi',
  'Sambutan Mahasiswa Baru',
] as const;

export const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: 'summit-2026',
    title: 'Finalis Bujang Gadis Mataratu 2025',
    category: 'Akademik',
    date: '14 November 2025',
    location: 'Politeknik Akamigas Palembang',
    status: 'Akan Datang',
    summary: 'Kegiatan FINALIS BUJANG GADIS MATARATU 2025. Yang di adakan setiap 1 tahun sekali oleh HMPS MATARATU Politeknik Akamigas Palembang. Kegiatan ini bertujuan untuk mencari mahasiswa/i terbaik yang memiliki bakat, prestasi, dan kepribadian yang baik untuk menjadi duta Teknik Pertambangan Batubara.',
    image: summitImg,
    instagramUrl: 'https://www.instagram.com/hmpsmataratu/p/DRJvS1KEthT/',
    targetParticipants: 0,
    registeredCount: 0,
  },
  {
    id: 'bakti-desa-2026',
    title: 'Serah Terima Jabatan',
    category: 'Akademik',
    date: '14 Mei 2026',
    location: 'Politeknik Akamigas Palembang',
    status: 'Akan Datang',
    summary: 'Selamat atas pelantikan Pengurus Baru HMPS Mataratu Politeknik Akamigas Palembang. ​Kami ucapkan terima kasih yang sebesar-besarnya kepada pengurus demisioner atas dedikasi dan kontribusinya. Kepada pengurus baru, selamat bertugas! Sambut tantangan baru dengan semangat juang yang tinggi. Kepalan tangan di foto ini adalah janji kami untuk terus maju bersama. ​Mari kita buat sejarah baru!',
    image: socialImg,
    instagramUrl: 'https://www.instagram.com/hmpsmataratu/p/DYUe7_mIKYj/',
    targetParticipants: 0,
    registeredCount: 0,
  },
  {
    id: 'sambutan-mahasiswa-baru',
    title: 'Sambutan Mahasiswa Baru',
    category: 'Sambutan Mahasiswa Baru',
    date: '3 Oktober 2025',
    location: 'Lapangan Politeknik Akamigas Palembang',
    status: 'Selesai',
    summary: 'Tradisi penyambutan dan kebersamaan mahasiswa baru Teknik Pertambangan Batubara di Lapangan Politeknik Akamigas Palembang, mempererat persaudaraan, solidaritas angkatan, dan penanaman jiwa korsa MATARATU.',
    image: sambutanMabaImg,
    instagramUrl: 'https://www.instagram.com/hmpsmataratu/p/DPXem4rj9lP/',
    targetParticipants: 0,
    registeredCount: 0,
  },
];
