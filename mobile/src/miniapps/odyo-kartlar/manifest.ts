import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'odyo-kartlar',
  name: 'OdyoKartlar',
  tagline: 'Günde 15 kart, aralıklı tekrarla kalıcı bilgi',
  description: 'Anatomi, testler, işitme cihazları, vestibüler ve pediatrik odyoloji destelerinden 60+ kart. Leitner kutularıyla (1-5) aralıklı tekrar: bildiğin kartlar seyrekleşir, bilemediklerin ertesi gün geri gelir.',
  category: 'ogren',
  icon: 'layers',
  gradient: gradients.rose,
  maker: maker('Sınav haftası öğrencilere "ne çalışayım" diye sorulduğunda cevap hep aynıydı: her gün az ama düzenli. Bu kartları o düzeni telefona sığdırmak için hazırladım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist'],
  minutes: 4,
  tags: ['flashcard', 'aralıklı tekrar', 'Leitner', 'sınav'],
  dailyHook: 'Her gün 15 kart; kutu 5\'e çıkanlar ustalaştı sayılır',
  shareable: false,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
