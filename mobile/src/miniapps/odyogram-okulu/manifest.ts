import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'odyogram-okulu',
  name: 'Odyogram Okulu',
  tagline: 'Tip, derece ve konfigürasyonu bakışta tanı',
  description: 'Rastgele üretilen odyogramlarda kaybın tipini (iletim, sensörinöral, mikst), derecesini (PTA ile) ve konfigürasyonunu (eğimli, yükselen, düz, çentikli, köşe) tanı. Her tur 10 soru, anında açıklamalı geri bildirim.',
  category: 'ogren',
  icon: 'school',
  gradient: gradients.ocean,
  maker: maker('Klinikte ilk yılımda odyogramı okumak bana bir dil öğrenmek gibi gelmişti. Bu okulu, o dili herkesin oyun oynar gibi hızlıca söküp atması için kurdum.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb'],
  minutes: 5,
  tags: ['odyogram', 'iletim tipi', 'sensörinöral', 'PTA', 'konfigürasyon'],
  dailyHook: 'Her turda yeni vakalar; 10/10 serisini yakala',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
