import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'odyogramle',
  name: 'Odyogramle',
  tagline: 'Günün vakasını 6 tahminde çöz',
  description: 'Her gün herkese aynı odyoloji vakası: öykü, odyogram ve timpanogram ile başla; her yanlış tahmin yeni bir ipucu açar (refleksler, konuşma testleri, OAE, ABR, görüntüleme). 24 tanılık listeden 6 tahmin hakkın var. Arşivde geçmiş vakalar seni bekler.',
  category: 'yarisma',
  icon: 'flask',
  gradient: gradients.gold,
  maker: maker('Odyogramle aslında aiHear fikrinin başladığı yer. Odyogram okumayı sabah kahvesiyle çözülen bir bulmacaya çevirmek istedim; vakaları paylaşıp tartışırken öğrenmek, sınava çalışmaktan daha kalıcı.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb'],
  minutes: 5,
  tags: ['vaka', 'odyogram', 'günlük', 'ayırıcı tanı'],
  dailyHook: 'Her gün yeni vaka',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
