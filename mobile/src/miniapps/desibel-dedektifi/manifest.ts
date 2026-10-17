import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'desibel-dedektifi',
  name: 'Desibel Dedektifi',
  tagline: 'Bu ses kaç desibel?',
  description: 'Fısıltıdan jet kalkışına kırktan fazla günlük ses; her birinin dB SPL değerini tahmin et. ±5 dB tam puan, kombo çarpanı ve her cevapta güvenli maruziyet süresi bilgisi.',
  category: 'oyun',
  icon: 'speedometer',
  gradient: gradients.ember,
  maker: maker('Kliniğe gelen herkes "gürültü ne kadar zararlı?" diye soruyordu. Rakamları ezberletmek yerine tahmin oyununa çevirdim; insanlar düğün hoparlörünün 110 dB olduğunu bir kez şaşırarak öğrenince unutmuyor.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'kbb', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 3,
  tags: ['desibel', 'gürültü', 'maruziyet', 'koruma'],
  dailyHook: 'Her gün farklı ses seti, rekorunu kır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
