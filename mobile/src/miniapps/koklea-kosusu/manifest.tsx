import React, { useCallback } from 'react';
import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest, MiniAppProps } from '@/core/registry/types';
import { ArcadeShell } from '@/core/arcade/ArcadeShell';
import Dom from './Dom';
import { rankOf, useKokleaStore } from './store';

const shareTextOf = (score: number, stats: Record<string, number | string>) =>
  `Koklea Koşusu 🐚 ${Number(stats.Mesafe ?? 0).toLocaleString('tr-TR')} m · ${rankOf(score)} · aihearX`;

function App(props: MiniAppProps) {
  const best = useKokleaStore((s) => s.best);
  const games = useKokleaStore((s) => s.games);
  const record = useKokleaStore((s) => s.record);
  const onSave = useCallback((score: number, stats: Record<string, number | string>) => record(score, stats), [record]);
  return (
    <ArcadeShell
      {...props}
      Dom={Dom}
      title="Koklea Koşusu"
      tagline="Odi ile tabandan apekse koş: ince sesten kalın sese!"
      howTo={['Dokun: zıpla · basılı tut: daha yüksek (2 zıplama)', 'Aşağı kaydır: gürültü bulutunun altından kay', 'Frekans jetonlarını topla, 5 üst üste = x2']}
      gradient={gradients.violet}
      makerName="Sebahattin Ünlü"
      best={best}
      games={games}
      onSave={onSave}
      ratioOf={(s) => Math.min(1, s / 3000)}
      shareTextOf={shareTextOf}
    />
  );
}

export const manifest: MiniAppManifest = {
  id: 'koklea-kosusu',
  name: 'Koklea Koşusu',
  tagline: 'Kokleanın içinde sonsuz koşu',
  description: 'Odi ile kokleanın tabanından apeksine koş. Gürültü dikenlerinin üstünden atla, gürültü bulutlarının altından kay, serumenden ve ototoksik damlalardan kaç; frekans jetonlarını topla. İlerledikçe renk ve ses tonotopiye göre değişir: mor ince seslerden turuncu kalın seslere.',
  category: 'oyun',
  icon: 'walk',
  gradient: gradients.violet,
  maker: maker('Kokleayı herkesin ezberlemesini değil, hissetmesini istedim. Tabandan apekse koşarken rengin ve sesin değiştiğini fark edince tonotopi akılda kalıyor; gerisi sadece bir tur daha oynamak.'),
  audience: ['odyolog', 'odyometrist', 'kbb', 'ogrenci', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 3,
  tags: ['koklea', 'tonotopi', 'koşu', 'arcade', 'oyun'],
  dailyHook: 'Her gün aynı koklea, kim daha uzağa gider?',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
