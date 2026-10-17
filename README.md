# aihearX

**Odyolojinin tamamı tek uygulamada.** Odyologlar, odyoloji öğrencileri, odyometristler, KBB hekimleri, işitme kaybı ve denge sorunu yaşayanlar, aileleri ve kulağını merak eden herkes için süper uygulama. Az ama derin: 13 mini uygulama (3'ü gerçek arcade oyun), tek üyelik, her birinin yapımcısı ekranda.

Yapımcı: **Sebahattin Ünlü** · aiHear. Instagram: **aiHear Ünlü** · Kulaktan Kulağa.

## Depo yapısı

| Klasör | İçerik |
|---|---|
| `mobile/` | Expo (React Native, TypeScript) uygulaması. iOS öncelikli; EAS ile App Store'a gönderilir. |
| `supabase/schema.sql` | Veritabanı: profiller, ilerleme, sonuçlar, ağ, lig görünümleri, yapımcı başvuruları, RLS. |
| `docs/` | Mimari, tasarım dili, App Store listesi, yol haritası. |
| `marketing/` | Viral yayılma stratejisi ve hazır Reels senaryoları. |

## Kategoriler ve mini uygulamalar

| Kategori | Uygulamalar |
|---|---|
| **Oyunlar** (herkes için) | **Arcade:** Koklea Koşusu · Kulak Yolculuğu · Zar Zıplaması · **Kulak oyunları:** Ses Dedektifi · Ton Hafızası · Perde Düellosu · Gürültü Avcısı · Kulağın Kaç Yaşında? |
| **Klinik** (odyolog ve öğrenci) | Odyogramle (günün vakası + antrenman) · Maskeleme Ustası · Anket Merkezi (HHIE-S, THI, DHI) |
| **Hasta & Aile** | Çınlama Eşleştirici · Denge Günlüğü |
| **Ağ** | Akış (Arkadaşlar / Herkes) · Profiller · Odyolog Dizini · İş İlanları · Etkinlikler |
| **Yapımcı Ol** | "Aklınızdaki yazılım fikri çürüyüp gitmesin": başvur, uygunsa ücretsiz kodlayıp adınla yayınlayalım |

Arcade oyunlar Phaser 3 ile yazıldı ve Expo DOM bileşeni içinde çalışır (Expo Go uyumlu); `mobile/tools/arcade-harness` ile Chromium'da gerçekten oynatılıp ekran görüntüsüyle doğrulanır (`ARCADE_GUIDE.md`). Kulak oyunları ortak bir oyun çekirdeği kullanır (`mobile/src/core/game`): skor, can, kombo, süre, 3-2-1 geri sayımı, doğru/yanlış flaşı, uçan puan, rütbeler (Çırak Kulak → Koklea Efsanesi), sentezlenmiş ses efektleri, rekor ve paylaşım kartı. Kalite çıtası: `mobile/GAME_GUIDE.md`.

## Çalıştırma

```bash
cd mobile
npm install --legacy-peer-deps
cp .env.example .env            # Supabase boşsa uygulama yerel modda çalışır
npx expo start                  # Expo Go veya geliştirme derlemesi
npm run typecheck               # tsc --noEmit
```

Native modüller (ses, Apple ile giriş, blur) Expo Go'da sınırlı çalışır; gerçek test için geliştirme derlemesi:

```bash
npx eas-cli@latest build --profile development --platform ios
```

App Store gönderimi: `npm run build:ios` sonra `npm run submit:ios` (`eas.json` içindeki Apple bilgilerini doldur).

## Ürün ilkeleri

1. **Tek üyelik.** Alt uygulamalarda ayrı hesap yok.
2. **Yapımcı görünür.** Her uygulama bir insanın adıyla çıkar.
3. **Her sonuç bir kart.** Paylaşılabilir, aihearX imzalı.
4. **Dopamin dengesi.** Küçük günlük hedef, sonlu akış, sakin mod, sessiz saatler.
5. **Tanı yerine geçmez.** Her sağlık sonucunda uyarı.

Ayrıntılar: [`docs/mimari.md`](docs/mimari.md) · [`docs/tasarim.md`](docs/tasarim.md) · [`docs/app-store.md`](docs/app-store.md) · [`marketing/viral-strateji.md`](marketing/viral-strateji.md)
