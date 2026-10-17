import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'cinlama-eslestir',
  name: 'Çınlama Eşleştirici',
  tagline: 'Çınlamanın sesini bul, kaydet, rahatla',
  description: 'Kulağındaki çınlamaya en çok benzeyen tonu adım adım bul (incelik ve yükseklik), türünü seç ve profilini kaydet. Ardından beyaz, pembe ve kahverengi gürültüyle 30 saniyelik ses terapisi dene ve çınlamayla yaşamak için pratik ipuçları oku.',
  category: 'hasta',
  icon: 'pulse',
  gradient: gradients.violet,
  maker: maker('Çınlaması olan herkes "hangi ses?" sorusunu anlatmakta zorlanır. Kendi çınlamanın kaydını klinisyenine götürebilmen ve gece bir fan sesiyle rahatlayabilmen için yaptım.'),
  audience: ['hasta', 'odyolog', 'odyometrist', 'kbb', 'diger'],
  minutes: 4,
  tags: ['tinnitus', 'çınlama', 'ses terapisi', 'gürültü'],
  dailyHook: 'Çınlama günlüğünü güncelle',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
