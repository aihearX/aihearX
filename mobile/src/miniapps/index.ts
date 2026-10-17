import type { MiniAppManifest } from '@/core/registry/types';
import { manifest as kokleaKosusu } from './koklea-kosusu/manifest';
import { manifest as kulakYolculugu } from './kulak-yolculugu/manifest';
import { manifest as zarZiplamasi } from './zar-ziplamasi/manifest';
import { manifest as sesDedektifi } from './ses-dedektifi/manifest';
import { manifest as tonHafizasi } from './ton-hafizasi/manifest';
import { manifest as perdeDuellosu } from './perde-duellosu/manifest';
import { manifest as gurultuAvcisi } from './gurultu-avcisi/manifest';
import { manifest as kulaginKacYasinda } from './kulagin-kac-yasinda/manifest';
import { manifest as odyogramle } from './odyogramle/manifest';
import { manifest as maskelemeUstasi } from './maskeleme-ustasi/manifest';
import { manifest as anketMerkezi } from './anket-merkezi/manifest';
import { manifest as cinlamaEslestir } from './cinlama-eslestir/manifest';
import { manifest as dengeGunlugu } from './denge-gunlugu/manifest';

/**
 * Az ama derin: 13 mini uygulama, 3 kategori. Arcade oyunlar Phaser ile WebView'da çalışır.
 * Sıra, kategori ekranındaki sırayı belirler.
 */
export const MINIAPPS: MiniAppManifest[] = [
  // Oyunlar (herkes için): önce arcade, sonra kulak oyunları
  kokleaKosusu, kulakYolculugu, zarZiplamasi,
  sesDedektifi, tonHafizasi, perdeDuellosu, gurultuAvcisi, kulaginKacYasinda,
  // Klinik (odyolog ve öğrenci)
  odyogramle, maskelemeUstasi, anketMerkezi,
  // Hasta & Aile
  cinlamaEslestir, dengeGunlugu,
];

const ids = new Set<string>();
for (const a of MINIAPPS) {
  if (ids.has(a.id)) throw new Error(`Çift mini uygulama id: ${a.id}`);
  ids.add(a.id);
}
