import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'kulagin-kac-yasinda',
  name: 'Kulağın Kaç Yaşında?',
  tagline: 'Yüksek frekans oyunu: kulağın kaç yaşında?',
  description: 'Kulaklığını tak, sesi yarıya al ve giderek kalınlaşan tiz tonları dinle. Duyabildiğin en tiz sesten kulağının "yaşını" tahmin ederiz. Bu bir oyundur, ölçüm değildir; ama paylaşması çok eğlencelidir.',
  category: 'hasta',
  icon: 'ear',
  gradient: gradients.sunset,
  maker: maker('Herkes kulağını merak eder ama kimse rastgele bir odyoloğa gitmez. Bu küçük oyunla önce merak uyandırmak, sonra "gerçek test için bir odyoloğa git" demek istedim.'),
  audience: ['hasta', 'aile', 'ogrenci', 'odyolog', 'odyometrist', 'kbb', 'denge', 'diger'],
  minutes: 2,
  tags: ['yüksek frekans', 'kulak yaşı', 'viral', 'oyun'],
  dailyHook: 'Arkadaşlarınla karşılaştır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
