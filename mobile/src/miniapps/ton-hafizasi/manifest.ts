import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'ton-hafizasi',
  name: 'Ton Hafızası',
  tagline: 'Diziyi tekrar et; farkında olmadan bir şarkı çal',
  description: 'Renkli pad\'ler sırayla çalar; sen aynı sırayı tekrar edersin. Her tur gizli bir ezginin sıradaki notası eklenir: cümle bitince şarkı ritmiyle çalar ve "Bu ezgiyi tanıdın mı?" diye sorar. Türkü, çocuk şarkısı ve klasik ezgiler; pad\'ler şarkının seslerine göre kurulur (Do Re Mi…). Seviye yükseldikçe "Sessiz" (ışık yok) ve "Karışık" (pad\'ler yer değiştirir) turlar gelir. Günün Ezgisi herkese aynı şarkıyı verir; Rastgele mod klasik Simon.',
  category: 'oyun',
  icon: 'musical-notes',
  gradient: gradients.violet,
  maker: maker('Simon oyununu herkes bilir; ama ışığı kapatınca sadece kulağın kalır. İşitsel hafızayı eğlenceli bir alışkanlığa çevirmek için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'hasta', 'aile', 'diger'],
  minutes: 3,
  tags: ['işitsel hafıza', 'ton', 'ezgi', 'şarkı', 'refleks'],
  dailyHook: 'Her gün herkese aynı gizli ezgi',
  shareable: true,
  version: '2.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
