import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'konusma-muzu',
  name: 'Konuşma Muzu',
  tagline: 'Konuşma sesleri odyogramda nerede yaşar?',
  description: 'Odyogramın üstündeki "konuşma muzu"nda harflere dokun, sesini dinle ve o ses kaybolunca konuşmanın nasıl bozulduğunu gör. Bir işitme kaybı profili seç; hangi harflerin kaybolduğunu ve bir cümlenin nasıl duyulduğunu anında izle.',
  category: 'hasta',
  icon: 'chatbubble-ellipses',
  gradient: gradients.gold,
  maker: maker('Aileler "annem duyuyor ama anlamıyor" der. Konuşma muzunu bir kez görünce neden "s" ve "f" seslerinin kaybolduğunu herkes anlıyor. Bunu her aileye tek dokunuşla anlatmak istedim.'),
  audience: ['aile', 'hasta', 'ogrenci', 'odyolog', 'odyometrist', 'kbb', 'denge', 'diger'],
  minutes: 3,
  tags: ['konuşma muzu', 'odyogram', 'aile eğitimi', 'fonem'],
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
