import type React from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { Gradient } from '@/core/theme';

export type Role = 'odyolog' | 'odyometrist' | 'kbb' | 'ogrenci' | 'hasta' | 'denge' | 'aile' | 'diger';

export type CategoryId = 'ogren' | 'klinik' | 'oyun' | 'yarisma' | 'hasta';

export type Maker = {
  name: string;
  title: string;
  /** Yapımcının bu uygulamayı neden yaptığına dair 1-3 cümle. Giriş ekranında gösterilir. */
  note: string;
  /** Topluluk yapımcısı mı (Yapımcı Ol programından mı geldi) */
  community?: boolean;
};

export type MiniAppResult = {
  appId: string;
  /** 0-100 arası genel skor (varsa) */
  score?: number;
  label?: string;
  shareText?: string;
  xp?: number;
  /** Lig/sıralama için ham puan (büyük = iyi) */
  points?: number;
  meta?: Record<string, unknown>;
};

export type MiniAppProps = {
  /** Mini uygulama anlamlı bir sonuç ürettiğinde çağırır; kabuk XP, seri ve istatistiği işler. */
  onResult: (r: Omit<MiniAppResult, 'appId'>) => void;
  /** Kullanıcı rolü; içerik buna göre sadeleşebilir. */
  role: Role;
};

export type MiniAppManifest = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: CategoryId;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: Gradient;
  maker: Maker;
  audience: Role[];
  minutes: number;
  tags: string[];
  /** Günlük geri dönüş sebebi: "Her gün yeni vaka" gibi. */
  dailyHook?: string;
  /** Paylaşım kartı üretiyor mu */
  shareable: boolean;
  version: string;
  /** Yeni rozeti için yayın tarihi (YYYY-MM-DD) */
  releasedAt: string;
  component: React.ComponentType<MiniAppProps>;
};
