import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'hangi-odyolog',
  name: 'Hangi Odyolog Tipisin?',
  tagline: '10 soruda odyolog kişiliğini keşfet',
  description: 'Vaka Dedektifi mi, Cihaz Sihirbazı mı, Pediatri Kahramanı mı? 10 eğlenceli soruyla altı odyolog tipinden hangisi olduğunu öğren; güçlü yanını, dikkat etmen gerekeni ve seninle en iyi anlaşan tipi gör. Odyolog olmayanlar da rahatça oynayabilir.',
  category: 'oyun',
  icon: 'sparkles',
  gradient: gradients.rose,
  maker: maker('Bir meslek grubunun içinde bile bambaşka karakterler var: vakaya dalan, cihazla konuşan, çocukla oyun kuran... Herkesin kendi tipini bulup ekibiyle gülerek paylaşması için yaptım.'),
  audience: ['odyolog', 'odyometrist', 'ogrenci', 'kbb', 'hasta', 'aile', 'denge', 'diger'],
  minutes: 3,
  tags: ['kişilik testi', 'viral', 'eğlence', 'odyolog'],
  dailyHook: 'Ekibindekilerle karşılaştır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
