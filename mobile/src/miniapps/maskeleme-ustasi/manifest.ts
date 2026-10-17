import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'maskeleme-ustasi',
  name: 'Maskeleme Ustası',
  tagline: 'Maske gerekli mi, kaç dB ile başlamalı?',
  description: 'Hava ve kemik yolu eşiklerini gir; maskeleme gereksinimini, Hood plato yöntemine göre başlangıç seviyesini, maksimum maskeyi ve aşırı maskeleme/maskeleme ikilemi riskini anında hesaplar. Pratik modunda rastgele senaryolarla kendini sına.',
  category: 'klinik',
  icon: 'calculator',
  gradient: gradients.mint,
  maker: maker('Maskeleme, öğrencilerin en çok korktuğu konuydu; bense her gün kabinde kafadan hesaplıyordum. Bu aracı o hesabı şeffaf ve öğretici hale getirmek için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist'],
  minutes: 5,
  tags: ['maskeleme', 'interaural atenüasyon', 'Hood plato', 'oklüzyon etkisi'],
  dailyHook: 'Her gün 5 yeni maskeleme senaryosu',
  shareable: false,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
