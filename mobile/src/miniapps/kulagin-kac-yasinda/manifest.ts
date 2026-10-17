import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'kulagin-kac-yasinda',
  name: 'Kulağın Kaç Yaşında?',
  tagline: '17 kHz\'den aşağı: kulağın kaç yaşında?',
  description: 'Kulaklığını tak, sesi yarıya al ve 17 kHz\'den 8 kHz\'e inen tiz tonları dinle. Duyabildiğin en tiz sesten kulağının "yaşını" tahmin eder, rozetini ve mini frekans merdivenini paylaşırsın. Sessiz tuzak denemeler dürüstlüğü ölçer; geçmiş sonuçların ve trendin cihazda saklanır. Oyundur, ölçüm değildir.',
  category: 'oyun',
  icon: 'ear',
  gradient: gradients.sunset,
  maker: maker('Herkes kulağını merak eder ama kimse rastgele bir odyoloğa gitmez. Bu küçük oyunla önce merak uyandırmak, sonra "gerçek test için bir odyoloğa git" demek istedim.'),
  audience: ['hasta', 'aile', 'ogrenci', 'odyolog', 'odyometrist', 'kbb', 'denge', 'diger'],
  minutes: 2,
  tags: ['yüksek frekans', 'kulak yaşı', 'viral', 'oyun', 'meydan okuma'],
  dailyHook: 'Arkadaşına meydan oku, trendini izle',
  shareable: true,
  version: '2.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
