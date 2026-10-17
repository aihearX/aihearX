import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'denge-gunlugu',
  name: 'Denge Günlüğü',
  tagline: 'Baş dönmesi ataklarını kaydet, örüntüyü gör',
  description: 'Her baş dönmesi ya da dengesizlik atağını 30 saniyede kaydet: tür, süre, şiddet, tetikleyiciler ve eşlik eden belirtiler. 30 günlük özet ve "klinisyen özeti" kartıyla hekimine net bir tablo götür.',
  category: 'hasta',
  icon: 'walk',
  gradient: gradients.ocean,
  maker: maker('Vestibüler hastalar muayeneye geldiğinde "geçen ay birkaç kez döndü" der, hekim de tahminle ilerler. Günlük tutan hastanın tanısı daha hızlı konur; bu yüzden en kolay günlüğü yapmak istedim.'),
  audience: ['denge', 'hasta', 'aile', 'kbb', 'odyolog'],
  minutes: 1,
  tags: ['vertigo', 'baş dönmesi', 'vestibüler', 'günlük', 'BPPV'],
  dailyHook: 'Bugün atak oldu mu? Hemen kaydet',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
