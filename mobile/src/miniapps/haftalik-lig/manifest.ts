import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'haftalik-lig',
  name: 'Haftalık Lig',
  tagline: 'Üniversiteler ve oyuncular arası haftalık sıralama',
  description: 'Bu haftaki puanın, üniversite ligi tablosu ve ilk 20 oyuncu. Her pazartesi sıfırlanır. Oynamadığın oyunlara tek dokunuşla git. Sunucu bağlanana kadar lig yerel ve örnek veridir.',
  category: 'yarisma',
  icon: 'podium',
  gradient: gradients.gold,
  maker: maker('Odyoloji bölümleri arasında tatlı bir rekabet hep vardı ama ölçecek yer yoktu. Lig, "bugün de bir vaka çözeyim" demenin en iyi bahanesi.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 1,
  tags: ['lig', 'sıralama', 'üniversite', 'haftalık'],
  dailyHook: 'Her pazartesi sıfırlanır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
