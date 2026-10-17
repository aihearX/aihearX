import React, { useCallback, useMemo } from 'react';
import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest, MiniAppProps } from '@/core/registry/types';
import { ArcadeShell } from '@/core/arcade/ArcadeShell';
import Dom from './Dom';
import { useKulakYolculuguStore } from './store';

const LEVELS = [
  { id: 'l1', name: 'Dış Kulak', hint: 'Kulak kepçesi: zıplamayı öğren' },
  { id: 'l2', name: 'Kulak Kanalı', hint: 'Tünel: serumen yapışkan, damlalara dikkat' },
  { id: 'l3', name: 'Orta Kulak', hint: 'Kulak zarı trambolin, kemikçiklere bin' },
  { id: 'l4', name: 'Koklea', hint: 'Su altı: kıl hücreleri seni fırlatır' },
];

const fmt = (n: number) => n.toLocaleString('tr-TR');

function App(props: MiniAppProps) {
  const best = useKulakYolculuguStore((s) => s.best);
  const games = useKulakYolculuguStore((s) => s.games);
  const unlocked = useKulakYolculuguStore((s) => s.unlocked);
  const modes = useMemo(() => LEVELS.slice(0, Math.max(1, Math.min(4, unlocked))), [unlocked]);
  const onSave = useCallback((score: number, stats: Record<string, number | string>) => useKulakYolculuguStore.getState().record(score, stats), []);
  const shareTextOf = useCallback((score: number, stats: Record<string, number | string>) => `Kulak Yolculuğu 👂 Bölüm ${stats['Bölüm'] ?? 1} · ${fmt(score)} puan · aihearX`, []);
  return (
    <ArcadeShell
      {...props}
      Dom={Dom}
      title="Kulak Yolculuğu"
      tagline="Odi'yi dış kulaktan beyne taşı; sesi teslim et."
      howTo={['Ekranın sol / sağ tarafına basılı tut: yürü', 'Üst yarıya dokun veya ZIPLA: zıpla (basılı tut: daha yüksek)', 'Düşmanların üstüne atla, ♪ jetonları topla, altın kokleayı bul']}
      gradient={gradients.violet}
      makerName="aiHear"
      best={best}
      games={games}
      modes={modes}
      onSave={onSave}
      ratioOf={(s) => Math.min(1, s / 4000)}
      shareTextOf={shareTextOf}
      xp={50}
    />
  );
}

export const manifest: MiniAppManifest = {
  id: 'kulak-yolculugu',
  name: 'Kulak Yolculuğu',
  tagline: 'Sesi dış kulaktan beyne taşı',
  description: 'Dört bölümlük platform macerası: kulak kepçesi, kulak kanalı, orta kulak ve koklea. Odi ile zıpla, jeton topla, kemikçiklere bin ve sesi işitme sinirine ulaştır.',
  category: 'oyun',
  icon: 'map',
  gradient: gradients.violet,
  maker: maker('Sesin kulağa girip beyne varana dek izlediği yolu herkesin eğlenerek öğrenmesini istedim. Dış kulak, kanal, orta kulak ve kokleayı bir platform oyununa çevirdim.'),
  audience: ['ogrenci', 'hasta', 'aile', 'diger', 'odyolog', 'odyometrist'],
  minutes: 5,
  tags: ['oyun', 'anatomi', 'platform', 'koklea'],
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
