import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as maskelemeUstasi } from './maskeleme-ustasi/manifest';
import { manifest as anketMerkezi } from './anket-merkezi/manifest';
/** Klinik uygulamalar. */
export const GROUP_A: MiniAppManifest[] = [maskelemeUstasi, anketMerkezi];
