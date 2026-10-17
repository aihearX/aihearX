import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'perde-duellosu',
  name: 'Perde Düellosu',
  tagline: 'Hangi ses daha tiz? Fark küçülür, puan büyür',
  description: 'İki ton art arda çalar; daha tiz olana dokunursun. Doğru bildikçe aralık bir oktavdan yarım tonun altına kadar daralır, yanlışta büyür. 60 saniye, 3 can, kombo. Düello modunda iki kişi aynı telefonda karşılıklı oturur; ilk doğru dokunan puanı alır, ilk 10 puan kazanır.',
  category: 'oyun',
  icon: 'git-compare',
  gradient: gradients.ocean,
  maker: maker('Perde ayrımı müzisyenlerin de odyologların da gizli silahı. Bir arkadaşla telefonu aranıza koyup yarışınca herkesin kulağının ne kadar keskin olduğu ortaya çıkıyor; bu oyunu o an için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'hasta', 'aile', 'diger'],
  minutes: 2,
  tags: ['perde', 'frekans ayrımı', 'düello', 'refleks'],
  dailyHook: 'Her gün en küçük farkı biraz daha küçült',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
