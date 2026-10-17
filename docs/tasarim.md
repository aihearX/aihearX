# aihearX — Tasarım Dili: "Obsidian & Koklea"

## İlkeler
1. **Karanlık, derin, parlak vurgu.** Arka plan neredeyse siyah (#070A12), yüzeyler camsı (%5-10 beyaz), tek marka gradyanı (mor #7C5CFF → turkuaz #2EE6D6). Göz yormaz, klinikte ve gece yatakta aynı rahatlıkla kullanılır.
2. **Odyoloji dili görselde.** Sağ kulak kırmızı, sol kulak mavi; odyogram her yerde aynı çizilir; koklea spirali marka işareti.
3. **Her sonuç bir kart.** Paylaşılabilir, 9:16'ya uygun, aihearX imzalı. Kart tasarımı uygulamanın kendisinden daha önemlidir: viral olan odur.
4. **Hareket anlam taşır.** Giriş animasyonları yumuşak (FadeInDown), ödül anları kısa ve haptikli, sakin modda hepsi kısılır.
5. **Büyük dokunma alanları.** Hasta ve aile için 50 pt altı buton yok.
6. **Yapımcı görünür.** Her mini uygulamanın giriş ekranında bir insan var; bu, uygulama mağazasındaki anonim araçlardan ayıran şey.

## Tokenler
Bkz. `mobile/src/core/theme/tokens.ts`. Gradyanlar: brand, violet, sunset, ocean, mint, ember, night, rose, gold. Kategori renkleri: Öğren=ocean, Klinik=mint, Yarış=gold, Oyun=rose, Hasta=sunset.

## Tipografi
Sistem fontu (SF Pro), ağır başlıklar (800), sıkı harf aralığı. Display 34 / H1 26 / H2 20 / H3 17 / Body 15 / Small 13 / Tiny 11 büyük harf.

## Bileşenler
Screen, Card (camsı veya gradyan), Button (primary gradyan, secondary cam, ghost, danger), Chip, SectionHeader, Stat, ProgressBar, Avatar (ad baş harfi + gradyan), IconBadge, Toast, Audiogram, ShareCard, MiniAppCard (row / tile / hero), CochleaMark.

## Ekran kalıpları
- **Bugün:** selam + seri, günlük hedef çubuğu, "bugün sana özel" hero kartı, seviye, yeni çıkanlar, Yapımcı Ol daveti.
- **Keşfet:** arama, kategori çipleri, kategori başına yatay kaydırmalı kutucuklar.
- **Mini uygulama girişi:** tam ekran gradyan kahraman alanı, yapımcı kartı, açıklama, "Başla".
- **Çalıştırma kabuğu:** ince üst çubuk (kapat, ad, yapımcı), ödül balonu.

## Uygulama ikonu (yapılacak)
Koklea spirali, mor-turkuaz gradyan, siyah zemin; köşede küçük "X". 1024×1024 PNG `mobile/assets/icon.png` olarak değiştirilecek (şu an Expo'nun varsayılan ikonu).
