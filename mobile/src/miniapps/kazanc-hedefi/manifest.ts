import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'kazanc-hedefi',
  name: 'Kazanç Hedefi',
  tagline: 'Eşikten hedef kazanca: yarım kazanç, POGO, NAL-R',
  description: 'Her kulak için 6 frekans eşiği gir (ya da hazır profil seç), yarım kazanç / POGO / üçte bir / NAL-R benzeri basitleştirilmiş reçete hedefini bar grafikte gör. Eğitim amaçlı yaklaşım; gerçek uygulama NAL-NL2/DSL ve gerçek kulak ölçümüyle yapılır.',
  category: 'klinik',
  icon: 'stats-chart',
  gradient: gradients.sunset,
  maker: maker('Reçete formülleri bir kara kutu gibi görünür; oysa hepsi eşikten başlayan basit bir fikre dayanır. Bu aracı, o fikri hastaya da öğrenciye de iki cümleyle anlatabilmek için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist'],
  minutes: 4,
  tags: ['işitme cihazı', 'kazanç', 'POGO', 'NAL-R', 'reçete'],
  shareable: false,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
