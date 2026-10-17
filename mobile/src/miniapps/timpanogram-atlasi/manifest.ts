import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'timpanogram-atlasi',
  name: 'Timpanogram Atlası',
  tagline: 'Eğriyi kendin çiz, Jerger tipini gör',
  description: 'Tepe basıncı, statik komplians ve kulak kanalı hacmini kaydırıcılarla değiştir; timpanogram canlı çizilsin ve Jerger sınıflaması (A, As, Ad, B, C) olası klinik bulgularıyla açıklansın. "Tahmin Et" modunda rastgele eğrilerle kendini sına.',
  category: 'ogren',
  icon: 'analytics',
  gradient: gradients.violet,
  maker: maker('Timpanogramı ezberlemek yerine eğrinin neden öyle göründüğünü hissetmek gerekir. Kaydırıcıyı oynatıp orta kulağın nasıl değiştiğini görmek, bana öğrencilik yıllarımda çok şey kazandırırdı.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb'],
  minutes: 4,
  tags: ['timpanometri', 'Jerger', 'orta kulak', 'komplians'],
  dailyHook: 'Her gün 10 yeni eğri tahmini',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
