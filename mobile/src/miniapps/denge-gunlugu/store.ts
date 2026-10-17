import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import type { EpisodeType, DurationPreset } from './data';

export type Episode = {
  id: string;
  at: string;
  type: EpisodeType;
  duration: DurationPreset;
  severity: number;
  triggers: string[];
  accompanying: string[];
  note: string;
};

type State = {
  episodes: Episode[];
  add: (e: Omit<Episode, 'id'>) => void;
  remove: (id: string) => void;
};

export const useDiary = create<State>()(
  persist(
    (set, get) => ({
      episodes: [],
      add: (e) => set({ episodes: [{ ...e, id: `${Date.now()}-${Math.floor(Math.random() * 1000)}` }, ...get().episodes].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 500) }),
      remove: (id) => set({ episodes: get().episodes.filter((x) => x.id !== id) }),
    }),
    { name: 'aihearx.miniapp.denge-gunlugu', storage: jsonStorage() },
  ),
);

export type Summary = {
  count: number;
  meanSeverity: number;
  topTrigger: string | null;
  topAccompanying: string | null;
  typeCounts: Record<string, number>;
  hints: string[];
  text: string;
};

const countBy = (arr: string[]): Record<string, number> => arr.reduce<Record<string, number>>((m, k) => { m[k] = (m[k] ?? 0) + 1; return m; }, {});
const top = (m: Record<string, number>): string | null => Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

/** Son 30 günün özeti ve ölçülü örüntü ipuçları. */
export function summarize(all: Episode[], days = 30): Summary {
  const since = Date.now() - days * 86400000;
  const eps = all.filter((e) => new Date(e.at).getTime() >= since);
  const count = eps.length;
  const meanSeverity = count ? Math.round((eps.reduce((a, e) => a + e.severity, 0) / count) * 10) / 10 : 0;
  const trig = countBy(eps.flatMap((e) => e.triggers));
  const acc = countBy(eps.flatMap((e) => e.accompanying));
  const typeCounts = countBy(eps.map((e) => e.type));
  const hints: string[] = [];

  const bppv = eps.filter((e) => e.type === 'dönme' && e.duration === 'saniyeler' && e.triggers.some((t) => t === 'yatakta dönme' || t === 'baş hareketi')).length;
  if (bppv >= 3) hints.push(`Yatakta dönme / baş hareketiyle gelen saniyelik dönme atağı ${bppv} kez → BPPV (kristal kayması) ile uyumlu olabilir; hekimine söyle, basit manevralarla düzelebilir.`);
  const meniere = eps.filter((e) => e.type === 'dönme' && (e.duration === 'dakikalar' || e.duration === 'saatler') && e.accompanying.some((a) => a === 'işitme azalması' || a === 'kulakta dolgunluk' || a === 'çınlama')).length;
  if (meniere >= 2) hints.push(`Saatler süren dönme + işitme/çınlama/dolgunluk ${meniere} kez → iç kulak kaynaklı bir tablo (ör. Meniere) hekimince değerlendirilmeli.`);
  const migren = eps.filter((e) => e.accompanying.some((a) => a === 'baş ağrısı' || a === 'görme bozukluğu') || e.triggers.some((t) => t === 'uykusuzluk' || t === 'stres' || t === 'ekran')).length;
  if (migren >= 3 && count >= 3) hints.push(`Baş ağrısı, görme bozukluğu, uykusuzluk ya da stresle ilişkili ${migren} kayıt → vestibüler migren olasılığı için nörolog/KBB görüşü faydalı olabilir.`);
  const orto = eps.filter((e) => e.type === 'sersemlik' && e.triggers.includes('ayağa kalkma')).length;
  if (orto >= 3) hints.push(`Ayağa kalkınca gelen sersemlik ${orto} kez → tansiyon düşmesi (ortostatik) ile ilişkili olabilir; yavaş kalk ve hekimine bildir.`);
  const salt = (trig['tuzlu yemek'] ?? 0) + (trig['kafein'] ?? 0);
  if (salt >= 3) hints.push(`Tuz/kafein sonrası ${salt} atak → birkaç hafta azaltıp günlüğe bakmak işe yarayabilir.`);
  if (count >= 8) hints.push(`30 günde ${count} atak oldukça sık; günlüğü hekimine göstermek için iyi bir zaman.`);

  const lines = [
    `Denge Günlüğü · son ${days} gün`,
    `Atak sayısı: ${count}${count ? ` · ort. şiddet ${meanSeverity}/10` : ''}`,
    count ? `Türler: ${Object.entries(typeCounts).map(([k, v]) => `${k} ${v}`).join(', ')}` : '',
    top(trig) ? `En sık tetikleyici: ${top(trig)} (${trig[top(trig)!] ?? 0})` : '',
    top(acc) ? `En sık eşlik eden: ${top(acc)} (${acc[top(acc)!] ?? 0})` : '',
    ...eps.slice(0, 6).map((e) => `• ${e.at.slice(0, 16).replace('T', ' ')} ${e.type}, ${e.duration}, ${e.severity}/10${e.triggers.length ? `, tetik: ${e.triggers.join('/')}` : ''}`),
    'aihearX Denge Günlüğü · tanı yerine geçmez',
  ].filter(Boolean);

  return { count, meanSeverity, topTrigger: top(trig), topAccompanying: top(acc), typeCounts, hints, text: lines.join('\n') };
}
