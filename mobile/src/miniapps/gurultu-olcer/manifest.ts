import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'gurultu-olcer',
  name: 'Gürültü Ölçer',
  tagline: 'Bulunduğun ortam kulağın için güvenli mi?',
  description: 'Telefonun mikrofonuyla ortam gürültüsünü yaklaşık dB olarak canlı ölçer; renkli göstergede güvenli bölgeyi, tepe ve ortalama değeri ve bu seviyede kulağın ne kadar süre dayanabileceğini gösterir. Ses kaydedilmez, yalnızca seviye ölçülür.',
  category: 'hasta',
  icon: 'speedometer',
  gradient: gradients.ember,
  maker: maker('Gürültüye bağlı işitme kaybı tamamen önlenebilir; sorun, kimsenin 95 dB\'in ne demek olduğunu bilmemesi. Konserde, düğünde, atölyede telefona bakıp "bu kadar sürede çık" diyebilmen için yaptım.'),
  audience: ['hasta', 'aile', 'ogrenci', 'odyolog', 'odyometrist', 'kbb', 'denge', 'diger'],
  minutes: 1,
  tags: ['gürültü', 'desibel', 'işitme koruma', 'ölçüm'],
  dailyHook: 'Bugün en gürültülü yerin neresiydi?',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
