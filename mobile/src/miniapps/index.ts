import type { MiniAppManifest } from '@/core/registry/types';
import { GROUP_A } from './group-a';
import { GROUP_B } from './group-b';
import { GROUP_C } from './group-c';

// Keşfet'teki sıra: Öğren → Klinik → Yarışma → Oyun → Hasta & Aile grupları içinde kendi sıraları.
export const MINIAPPS: MiniAppManifest[] = [...GROUP_A, ...GROUP_B, ...GROUP_C];

const ids = new Set<string>();
for (const a of MINIAPPS) {
  if (ids.has(a.id)) throw new Error(`Çift mini uygulama id: ${a.id}`);
  ids.add(a.id);
}
