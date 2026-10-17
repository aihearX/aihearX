import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as frekansAvi } from './frekans-avi/manifest';
import { manifest as desibelDedektifi } from './desibel-dedektifi/manifest';
import { manifest as odyoKelime } from './odyo-kelime/manifest';
import { manifest as odyogramle } from './odyogramle/manifest';
import { manifest as kulakRefleksi } from './kulak-refleksi/manifest';
import { manifest as haftalikLig } from './haftalik-lig/manifest';

/** Grup B: oyunlar ve yarışmalar. */
export const GROUP_B: MiniAppManifest[] = [frekansAvi, desibelDedektifi, odyoKelime, odyogramle, kulakRefleksi, haftalikLig];
