import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as odyogramOkulu } from './odyogram-okulu/manifest';
import { manifest as maskelemeUstasi } from './maskeleme-ustasi/manifest';
import { manifest as timpanogramAtlasi } from './timpanogram-atlasi/manifest';
import { manifest as odyoKartlar } from './odyo-kartlar/manifest';
import { manifest as kazancHedefi } from './kazanc-hedefi/manifest';
import { manifest as anketMerkezi } from './anket-merkezi/manifest';

export const GROUP_A: MiniAppManifest[] = [odyogramOkulu, maskelemeUstasi, timpanogramAtlasi, odyoKartlar, kazancHedefi, anketMerkezi];
