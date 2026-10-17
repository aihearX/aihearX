import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'anket-merkezi',
  name: 'Anket Merkezi',
  tagline: 'HHIE-S, THI ve DHI: puanla, yorumla, klinisyene gönder',
  description: 'İşitme (HHIE-S), çınlama (THI) ve baş dönmesi (DHI) için doğrulanmış öz-bildirim anketleri. Tek tek sorular, otomatik puanlama, derece yorumu ve klinisyeninize gönderebileceğiniz özet kartı. Son sonuçlar cihazda saklanır.',
  category: 'klinik',
  icon: 'clipboard',
  gradient: gradients.mint,
  maker: maker('Bu anketleri yıllarca kâğıtta doldurttum ve elde topladım. Hastanın evde beş dakikada doldurup bana kart olarak göndermesi, randevuyu konuşmaya ayırmamızı sağlıyor.'),
  audience: ['hasta', 'denge', 'aile', 'odyolog', 'odyometrist', 'kbb'],
  minutes: 5,
  tags: ['HHIE-S', 'THI', 'DHI', 'anket', 'tinnitus', 'vertigo'],
  dailyHook: 'Ayda bir tekrarla, değişimi izle',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
