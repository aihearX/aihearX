# aihearX

**Odyolojinin tamamı tek uygulamada.** Odyologlar, odyoloji öğrencileri, odyometristler, KBB hekimleri, işitme kaybı ve denge sorunu yaşayanlar ve aileleri için süper uygulama. İçinde birbirinden bağımsız 18 mini uygulama var; hepsi tek üyelikle açılır, her birinin yapımcısı ekranda yazar.

Yapımcı: **Sebahattin Ünlü** · aiHear. Instagram: **aiHear Ünlü** · Kulaktan Kulağa.

## Depo yapısı

| Klasör | İçerik |
|---|---|
| `mobile/` | Expo (React Native, TypeScript) uygulaması. iOS öncelikli; EAS ile App Store'a gönderilir. |
| `supabase/schema.sql` | Veritabanı: profiller, ilerleme, sonuçlar, ağ, lig görünümleri, yapımcı başvuruları, RLS. |
| `docs/` | Mimari, tasarım dili, App Store listesi, yol haritası. |
| `marketing/` | Viral yayılma stratejisi ve 22 hazır Reels senaryosu. |

## Kategoriler ve mini uygulamalar

| Kategori | Uygulamalar |
|---|---|
| **Öğren** | Odyogram Okulu · Timpanogram Atlası · OdyoKartlar |
| **Klinik Araçlar** | Maskeleme Ustası · Kazanç Hedefi · Anket Merkezi (HHIE-S, THI, DHI) |
| **Yarışmalar & Bulmacalar** | Odyogramle · OdyoKelime · Haftalık Lig |
| **Oyunlar** | Frekans Avı · Desibel Dedektifi · Kulak Refleksi · Hangi Odyolog Tipisin? |
| **Hasta & Aile** | Kulağın Kaç Yaşında? · Konuşma Muzu · Çınlama Eşleştirici · Denge Günlüğü · Gürültü Ölçer |
| **Ağ** | Akış (Arkadaşlar / Herkes) · Profiller · Odyolog Dizini · İş İlanları · Etkinlikler |
| **Yapımcı Ol** | "Aklınızdaki yazılım fikri çürüyüp gitmesin": başvur, uygunsa ücretsiz kodlayıp adınla yayınlayalım |

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
