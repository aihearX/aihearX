import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'odyogramle',
  name: 'Odyogramle',
  tagline: 'Günün vakasını 6 tahminde çöz, odyogramı bakışta oku',
  description: 'Klinisyenin günlük ritüeli. Günün Vakası: herkese aynı kompozit vaka; öykü, odyogram ve timpanogramla başla, her yanlış tahmin yeni bir ipucu açar (refleksler, konuşma testleri, OAE, ABR/vestibüler, görüntüleme) ve her ipucunun neden önemli olduğunu öğrenirsin. 40 vakalık arşiv, seri ve tahmin dağılımı. Antrenman: süreli, 3 canlı odyogram okuma drili (tip, derece, konfigürasyon, hangi kulak, PTA tahmini).',
  category: 'klinik',
  icon: 'flask',
  gradient: gradients.gold,
  maker: maker('Odyogramle aslında aiHear fikrinin başladığı yer. Odyogram okumayı sabah kahvesiyle çözülen bir bulmacaya çevirmek istedim; vakaları paylaşıp tartışırken öğrenmek, sınava çalışmaktan daha kalıcı.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb'],
  minutes: 6,
  tags: ['vaka', 'odyogram', 'günlük', 'ayırıcı tanı', 'antrenman', 'PTA'],
  dailyHook: 'Her gün yeni vaka, seri ve antrenman rekoru',
  shareable: true,
  version: '2.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
