import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'frekans-avi',
  name: 'Frekans Avı',
  tagline: 'Duyduğun tonun frekansını yakala',
  description: 'Rastgele saf ses tonları çalar; 250 Hz ile 8 kHz arasında hangi frekans olduğunu 4 seçenekten tahmin edersin. 10 tur, 3 can, kombo çarpanı ve 15 saniyelik tur sayacı. Seviye yükseldikçe komşu frekanslar tuzağa dönüşür.',
  category: 'oyun',
  icon: 'pulse',
  gradient: gradients.rose,
  maker: maker('Odyometri dersinde frekansları kulaktan tanıyabilen arkadaşlar hep bir adım öndeydi. Bu oyunu o kulağı herkese, eğlenerek kazandırmak için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'diger', 'hasta'],
  minutes: 3,
  tags: ['saf ses', 'frekans', 'kulak eğitimi', 'refleks'],
  dailyHook: 'Her gün yeni seri, rekorunu kır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
