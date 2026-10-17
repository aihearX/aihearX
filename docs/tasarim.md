# aihearX — Tasarım Dili: "Kâğıt & Koklea"

## İlkeler
1. **Açık, sade, boşluklu.** Beyaz zemin, çok hafif gri yüzeyler (#F7F8FB), ince kenarlıklar. Renk yalnızca anlam taşıdığı yerde: kategori ikonları, "Başla" butonu, paylaşım kartları.
2. **Her ekran tek iş yapar.** Keşfet = kategoriler. Kategori = uygulama listesi. Uygulama girişi = ne yapar, nasıl çalışır, yapımcı, Başla. Başka hiçbir şey yok.
3. **Tek liste tipi.** Her uygulama her yerde aynı satırla görünür: ikon, ad, bir cümle, süre. Kahraman kart, kutucuk, rozet kalabalığı yok.
4. **Önce anlam, sonra süs.** Her uygulamanın "Ne yapar?" ve üç adımlı "Nasıl çalışır?" metni var; kullanıcı başlamadan ne olacağını bilir.
5. **Odyoloji dili görselde.** Sağ kulak kırmızı, sol kulak mavi; odyogram her yerde aynı; koklea spirali marka işareti.
6. **Hareket ölçülü.** Giriş animasyonları kısa; ödül anı bir balon; sakin modda hepsi kısılır.
7. **Büyük dokunma alanları.** Hasta ve aile için 48 pt altı hedef yok.

## Navigasyon (3 sekme)
- **Keşfet:** arama, "Günün vakası" tek satırı, 5 kategori kartı, Yapımcı Ol.
- **Ağ:** akış (Arkadaşlar | Herkes), dizin, ilanlar, etkinlikler.
- **Ben:** kimlik, üç sayı (seviye, XP, seri), rozetler, oynadıkların, profil kartı, ayarlar.

## Kategoriler
Oyunlar (pembe-mor) · Klinik (mavi-yeşil) · Hasta & Aile (mercan-turuncu). Her kategori kartında tek satır "ne işe yarar" ve uygulama sayısı.

## Tokenler
`mobile/src/core/theme/tokens.ts`. Vurgu: mor #6C4CF1 (buton, aktif sekme), deniz yeşili #0E9C98 (ikincil). Metin #13162A, soluk #5D6378, en soluk #8C92A8. Gradyanlar yalnızca ikon rozetleri, kategori kartları ve paylaşım kartları için.

## Tipografi
Sistem fontu. H1 26/800, H2 20/700, H3 17/700, Body 15, Small 13, Tiny 11 büyük harf.

## Bileşenler
Screen, Card (beyaz, ince kenarlık), Button (primary gradyan, secondary gri, ghost), Chip, Stat, ProgressBar, Avatar, IconBadge, Toast, Audiogram, ShareCard, MiniAppCard (tek satır), CochleaMark.

## Uygulama ikonu
Beyaz zemin, mor-deniz yeşili koklea spirali, köşede küçük X. `mobile/assets/icon.png` (1024×1024).
