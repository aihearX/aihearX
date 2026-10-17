import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as kulaginKacYasinda } from './kulagin-kac-yasinda/manifest';
import { manifest as konusmaMuzu } from './konusma-muzu/manifest';
import { manifest as cinlamaEslestir } from './cinlama-eslestir/manifest';
import { manifest as dengeGunlugu } from './denge-gunlugu/manifest';
import { manifest as gurultuOlcer } from './gurultu-olcer/manifest';
import { manifest as hangiOdyolog } from './hangi-odyolog/manifest';

/** Grup C: hasta, aile ve genel kitle için araçlar + viral oyunlar. */
export const GROUP_C: MiniAppManifest[] = [kulaginKacYasinda, konusmaMuzu, cinlamaEslestir, dengeGunlugu, gurultuOlcer, hangiOdyolog];
