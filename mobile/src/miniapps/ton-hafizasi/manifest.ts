import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'ton-hafizasi',
  name: 'Ton Hafızası',
  tagline: 'Sesleri sırayla dinle, aynı sırayla dokun',
  description: 'Renkli pad\'ler pentatonik tonlarla sırayla çalar; sen aynı sırayı tekrar edersin. Her tur bir nota eklenir ve tempo artar. Seviye yükseldikçe "Sessiz" turlar (ışık yok, sadece kulak) ve "Karışık" turlar (pad\'ler yer değiştirir) gelir. Günün Dizisi herkese aynı 20 notayı çalar.',
  category: 'oyun',
  icon: 'musical-notes',
  gradient: gradients.violet,
  maker: maker('Simon oyununu herkes bilir; ama ışığı kapatınca sadece kulağın kalır. İşitsel hafızayı eğlenceli bir alışkanlığa çevirmek için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'hasta', 'aile', 'diger'],
  minutes: 3,
  tags: ['işitsel hafıza', 'ton', 'dizi', 'refleks'],
  dailyHook: 'Her gün herkese aynı 20 notalık dizi',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
