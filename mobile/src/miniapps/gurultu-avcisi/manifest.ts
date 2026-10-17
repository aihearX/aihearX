import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'gurultu-avcisi',
  name: 'Gürültü Avcısı',
  tagline: 'Gürültünün içinden üç rakamı yakala',
  description: 'Arka planda gürültü çalarken bir ses üç rakam okur; sen tuş takımına yazarsın. Her doğruda gürültü yükselir, her yanlışta düşer. Gürültüde konuşmayı anlama becerini oyunlaştıran, günlük meydan okumalı bir av. Oyundur, tarama testi değildir.',
  category: 'oyun',
  icon: 'radio',
  gradient: gradients.ocean,
  maker: maker('Klinikte en çok duyduğum cümle "Sessizde iyiyim ama kalabalıkta anlamıyorum." Gürültüde rakam testi bunu en iyi yakalayan araçlardan biri; onu herkesin cebine, oyun olarak koymak istedim.'),
  audience: ['hasta', 'aile', 'ogrenci', 'odyolog', 'odyometrist', 'kbb', 'denge', 'diger'],
  minutes: 3,
  tags: ['gürültüde konuşma', 'rakam testi', 'SNR', 'oyun'],
  dailyHook: 'Günün Avı: herkese aynı 20 üçlü, günde bir kez',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
