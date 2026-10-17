# aihearX — Mimari

## Karar: tek süper uygulama, içinde çok mini uygulama

- **Tek mağaza uygulaması:** aihearX (iOS öncelikli, Android aynı kod tabanı). Her mini uygulama kullanıcıya ayrı ürün gibi tanıtılır, telefonda tek simge olur.
- **Tek üyelik:** `useUser` (Apple ile giriş, e-posta bağlantısı, misafir). Alt uygulamalarda üyelik, onboarding ya da ayrı profil yoktur. Mini uygulama yalnızca `MiniAppProps` alır: `{ onResult, role }`.
- **Kayıt sistemi (registry):** her mini uygulama bir `MiniAppManifest` ile kaydolur: ad, kategori, yapımcı, hedef kitle, süre, etiketler, paylaşılabilirlik, bileşen. Keşfet, Bugün, Oyna ve Profil ekranları bu kayıttan beslenir.
- **Yapımcı katmanı:** her uygulamanın giriş ekranında önce yapımcı (ad, unvan, kişisel not) ve açıklama, sonra "Başla". Topluluk yapımcıları `maker.community = true` ile işaretlenir; "Yapımcı Ol" başvurusu `ideas` tablosuna düşer.
- **Çevrimdışı önce:** Supabase yapılandırılmamışsa her şey yerelde çalışır (zustand + AsyncStorage). Supabase gelince ağ, lig ve başvurular sunucuya geçer. Mini uygulamalar sunucuya bağımlı değildir.

## Teknik yığın

| Katman | Seçim | Neden |
|---|---|---|
| Uygulama | Expo SDK 58, React Native 0.88, React 19, TypeScript strict | Tek kod tabanı, EAS ile App Store'a Xcode'suz gönderim |
| Yönlendirme | expo-router (dosya tabanlı), `Stack.Protected` ile oturum kapıları | Deep link: `aihearx://uygulama/<id>` |
| Durum | zustand + persist (AsyncStorage) | Küçük, hızlı, mini uygulama başına izole store |
| Arcade oyunlar | Phaser 3 + Expo DOM bileşeni (`'use dom'`, WebView) | Gerçek oyun motoru; Metro ayrı www.bundle üretir; Chromium harness ile test edilir |
| Ses | Saf JS ile WAV sentezi → expo-file-system → expo-audio | Ek native modül yok; ton, uyarı tonu, beyaz/pembe/kahverengi gürültü, stereo kulak yönlendirme |
| Grafik | react-native-svg (odyogram, timpanogram, göstergeler) | Hafif, paylaşım görseline aynı veriden dönüşür |
| Animasyon | react-native-reanimated 4 + worklets | Giriş animasyonları, skor patlamaları |
| Paylaşım | react-native-view-shot + expo-sharing + expo-clipboard | Her sonuç bir Instagram kartı |
| Kimlik | expo-apple-authentication (+ Supabase `signInWithIdToken`) | App Store zorunluluğu: Apple ile giriş |
| Arka uç | Supabase (Postgres, Auth, RLS) — `supabase/schema.sql` | Satır düzeyi güvenlik, lig görünümleri |

## Dizin yapısı

```
mobile/
  src/app/                 expo-router ekranları
    (auth)/giris, rol      giriş ve rol seçimi
    (tabs)/index           Bugün: günlük ritüel, hedef, seviye
    (tabs)/kesfet          Kategoriler ve arama
    (tabs)/oyunlar         Oyunlar ve yarışmalar
    (tabs)/akis            Ağ (sosyal akış)
    (tabs)/profil          Ben
    uygulama/[id]/         mini uygulama giriş + çalıştırma kabuğu
    yapimci-ol             fikir başvurusu
    ag/                    dizin, ilanlar, etkinlikler
  src/core/
    theme/                 renk, tipografi, gradyan tokenleri
    ui/                    UI kiti (Screen, Card, Button, Audiogram, ShareCard...)
    registry/              manifest tipleri, kategoriler, roller, yapımcı
    audio/                 WAV sentezi ve oynatma
    store/                 user, progress, settings
    auth/                  Supabase istemcisi, Apple/e-posta eylemleri
  src/arcade/<id>/       Phaser oyunları (web kodu) + src/arcade/shared kit
  src/core/arcade/       ArcadeShell: giriş → tam ekran oyun → sonuç
  tools/arcade-harness/  esbuild + Playwright oyun duman testi
  src/core/game/         oyun çekirdeği: HUD, geri sayım, flaş, puan, sonuç, rütbe, sfx
  src/miniapps/<id>/       her mini uygulama: manifest.ts + App.tsx (+ store, components)
  src/network/             ağ modülü (akış, profil, dizin, ilanlar, etkinlikler)
supabase/schema.sql        veritabanı
marketing/                 reels senaryoları ve viral strateji
docs/                      bu dokümanlar
```

## Mini uygulama sözleşmesi

Bkz. `mobile/MINIAPP_GUIDE.md`. Özet: `manifest.ts` + `App.tsx`; `onResult` ile XP/seri/rozet; yalnızca ortak UI kiti; Türkçe; "tanı yerine geçmez" notu.

## Dopamin dengesi (ürün ilkesi)

Uygulama dikkat çeker ama tüketmez:
- Günlük hedef küçüktür (2 mini uygulama) ve bitince "bugünlük bu kadar" der.
- Ağ akışı sonludur (`feedLimit`), sonsuz kaydırma yoktur.
- Sakin mod: seri baskısı ve kutlama animasyonları azalır.
- Sessiz saatler: gece bildirim yok.
- Seri kırılması cezalandırmaz; "yeniden başla" dilini kullanır.

## Veri gizliliği

- Sağlık verisi (anket sonuçları, çınlama profili, denge günlüğü) cihazda kalır; sunucuya yalnızca kullanıcı paylaşırsa gider.
- Gürültü Ölçer ses kaydetmez; yalnızca seviye okur.
- Supabase'de satır düzeyi güvenlik: kullanıcı yalnızca kendi verisini yazar.
- KVKK açık rıza metni giriş ekranında; dizinde görünürlük opt-in.
