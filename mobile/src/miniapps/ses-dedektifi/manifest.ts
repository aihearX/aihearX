import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'ses-dedektifi',
  name: 'Ses Dedektifi',
  tagline: 'Gizemli sesi dinle, süre bitmeden bul',
  description: 'Bir ses çalar: siren mi, kedi mi, mors kodu mu? 4 seçenekten doğrusunu süre dolmadan bul. Seviye yükseldikçe klipler kısalır, seçenekler benzeşir, gürültü biner. Günün Serisi herkese aynı 10 ses; Serbest modda canların bitene kadar devam.',
  category: 'oyun',
  icon: 'search',
  gradient: gradients.violet,
  maker: maker('Odyoloji sesleri ayırt etme sanatıdır; ama bunu öğrenmek için klinikte olmak gerekmez. Herkesin "bir tur daha" diyeceği bir ses tanıma oyunu yapmak istedim.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 3,
  tags: ['ses tanıma', 'dinleme', 'refleks', 'günlük'],
  dailyHook: 'Her gün herkese aynı 10 gizemli ses',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
