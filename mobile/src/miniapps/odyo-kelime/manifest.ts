import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'odyo-kelime',
  name: 'OdyoKelime',
  tagline: 'Günün 5 harfli odyoloji kelimesi',
  description: 'Wordle tarzı kelime bulmacası, ama sözlük odyoloji: kulak anatomisi, ses fiziği, KBB ve klinik terimler. Her gün herkese aynı kelime, 6 deneme, Türkçe klavye. Pratik modunda sınırsız oyna.',
  category: 'yarisma',
  icon: 'grid',
  gradient: gradients.mint,
  maker: maker('Sabah kahvesiyle Wordle çözerken "keşke kelimeler bizim dünyadan olsa" dedim. Terimleri oyunla tekrar etmek, ders notlarını tekrar okumaktan daha kalıcı.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 3,
  tags: ['kelime', 'günlük', 'terim', 'bulmaca'],
  dailyHook: 'Her gün yeni kelime, seri kırma',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
