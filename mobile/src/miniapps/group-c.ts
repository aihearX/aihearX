import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as kulaginKacYasinda } from './kulagin-kac-yasinda/manifest';
import { manifest as cinlamaEslestir } from './cinlama-eslestir/manifest';
import { manifest as dengeGunlugu } from './denge-gunlugu/manifest';
/** Hasta, aile ve herkes. */
export const GROUP_C: MiniAppManifest[] = [kulaginKacYasinda, cinlamaEslestir, dengeGunlugu];
