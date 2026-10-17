import React, { useCallback } from 'react';
import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest, MiniAppProps } from '@/core/registry/types';
import { ArcadeShell } from '@/core/arcade/ArcadeShell';
import Dom from './Dom';
import { useZarStore } from './store';

function rankOf(meters: number): string {
  if (meters >= 3500) return 'Sinir Yıldızı';
  if (meters >= 1500) return 'Koklea Efsanesi';
  if (meters >= 500) return 'Orta Kulak Ustası';
  return 'Kanal Kaşifi';
}

function App(props: MiniAppProps) {
  const best = useZarStore((s) => s.best);
  const games = useZarStore((s) => s.games);
  const record = useZarStore((s) => s.record);
  const onSave = useCallback((score: number, stats: Record<string, number | string>) => {
    record({ score, meters: Number(stats['Yükseklik'] ?? 0), zone: String(stats['Bölge'] ?? '') });
  }, [record]);
  const shareTextOf = useCallback((score: number, stats: Record<string, number | string>) => {
    const meters = Number(stats['Yükseklik'] ?? score);
    return `Zar Zıplaması 🥁 ${meters.toLocaleString('tr-TR')} m · ${rankOf(meters)} · aihearX`;
  }, []);
  return (
    <ArcadeShell
      {...props}
      Dom={Dom}
      title="Zar Zıplaması"
      tagline="Odi ile kulak kanalından beyne zıpla; yükseklik skorun!"
      howTo={['Ekranın sol veya sağ yarısına basılı tut; Odi platformlarda kendiliğinden zıplar.', 'Kulak zarı trambolini ve kıl hücresi yayı seni fırlatır; ince zar bir kez dayanır.', 'İki parmakla dokun veya butona bas: ses patlaması bakterileri temizler.']}
      gradient={gradients.ocean}
      makerName="Sebahattin Ünlü"
      best={best}
      games={games}
      onSave={onSave}
      ratioOf={(s) => Math.min(1, s / 5000)}
      shareTextOf={shareTextOf}
    />
  );
}

export const manifest: MiniAppManifest = {
  id: 'zar-ziplamasi',
  name: 'Zar Zıplaması',
  tagline: 'Kulak kanalından beyne sonsuz zıplama',
  description: 'Odi kıkırdak, kemikçik ve kulak zarı platformlarında yukarı zıplar; kulak kanalı, orta kulak, koklea ve işitme siniri boyunca yükselir. Bakterilere dikkat, ses patlamasıyla temizle, jetonları topla.',
  category: 'oyun',
  icon: 'arrow-up-circle',
  gradient: gradients.ocean,
  maker: maker('İşitme yolunu bir kuleye çevirdim: kulak kanalından koklea spiraline, oradan sinire. Herkes aynı günlük tohumla tırmanıyor; kim daha yükseğe çıkacak diye merak ediyorum.'),
  audience: ['odyolog', 'odyometrist', 'kbb', 'ogrenci', 'hasta', 'denge', 'aile', 'diger'],
  minutes: 3,
  tags: ['arcade', 'zıplama', 'koklea', 'tonotopi'],
  dailyHook: 'Günün tohumu: herkes aynı kuleye tırmanır',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
