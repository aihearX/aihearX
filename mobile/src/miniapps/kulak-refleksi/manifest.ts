import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'kulak-refleksi',
  name: 'Kulak Refleksi',
  tagline: 'Ses hangi kulaktan geldi? Hızlı bas!',
  description: 'Kulaklıkla oynanan tepki oyunu: kısa bir ton rastgele sol ya da sağ kulağına gelir, doğru tarafa olabildiğince hızlı basarsın. 20 deneme, milisaniye cinsinden tepki süresi, doğruluk ve dağılım grafiği.',
  category: 'oyun',
  icon: 'flash',
  gradient: gradients.ocean,
  maker: maker('Lateralizasyon ve tepki süresi klinikte sıkıcı bir ölçüm gibi gelir; arkadaşlarla "kim daha hızlı" diye yarışınca en eğlenceli test oldu. Bunu herkesin cebine koymak istedim.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 2,
  tags: ['tepki süresi', 'lateralizasyon', 'kulaklık', 'refleks'],
  dailyHook: 'Her gün ortalama süreni düşür',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
