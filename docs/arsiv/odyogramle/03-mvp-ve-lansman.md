# Odyogramle — MVP, Teknik Plan ve Lansman

## 1. MVP kapsamı (30 gün)

Yalnızca viral döngüyü kanıtlayan parçalar. Geri kalan her şey 2. aya.

**Var:**
- Günlük vaka ekranı (anamnez, odyogram, timpanogram)
- 6 tahmin, kademeli ipucu, tanı listesinden seçim
- Sonuç ekranı: doğru tanı, kısa açıklama, kaynak
- Emoji odyogram paylaşım metni + Instagram Story görseli
- Seri sayacı (hesapsız: tarayıcı deposu; hesaplı: sunucu)
- Üniversite ligi (okul seçimi tek soru)
- Türkçe + İngilizce
- Tek tık kayıt (Google / Apple) → aiHearX hesabı

**Yok (2. ay ve sonrası):**
- Odyogramı Çiz modu
- Vaka gönderim formu ve hakem paneli (ilk ay vakalar ekip tarafından elle girilir)
- Ses simülasyonu
- Hoca modu
- Yapay zekâ yorumlayıcı
- Mobil uygulama (web zaten telefonda çalışır; mağaza uygulaması ağ 10 bini geçince)

## 2. Teknik yığın

Hedef: aylık maliyet 0–20 dolar, tek geliştirici, ilk 100 bin oyuncuya kadar
ölçek sorunu yok.

| Katman | Seçim | Neden |
|---|---|---|
| Ön yüz | Next.js (statik dışa aktarım) + Tailwind | Hızlı, telefonda akıcı, SEO için her vaka sayfası statik |
| Odyogram çizimi | SVG (kütüphanesiz) | Hafif, emoji karta ve Story görseline aynı veriden dönüştürülür |
| Vaka verisi | `cases/*.json` (repo içinde) | Hakem onayı = pull request. Sürüm geçmişi bedava. |
| Hesap, lig, seri | Supabase (Postgres + Auth) | Ücretsiz katman yeterli; satır düzeyi güvenlik |
| Paylaşım görseli | Edge fonksiyonunda sunucu tarafı SVG → PNG | Her sonuç için benzersiz Story kartı |
| Dağıtım | Vercel / Cloudflare Pages | Ücretsiz, küresel |
| Analitik | PostHog (ücretsiz katman) | Paylaşım oranı ve geri dönüş ölçümü |

Vaka JSON şeması: [`04-vaka-bankasi-ornekleri.md`](04-vaka-bankasi-ornekleri.md)

Vaka günü hesaplama: kullanıcının yerel gününe göre `cases/` dizininden
deterministik seçim (epoch gün sayısı → vaka numarası). Cevap istemciye gitmez;
tahmin sunucuda doğrulanır (hile ve kaynak kodundan okuma engeli).

## 3. 30 günlük yapım takvimi

| Hafta | İş |
|---|---|
| 1 | Oyun ekranı, odyogram SVG bileşeni, tahmin mantığı, 20 vaka yazımı |
| 2 | Sonuç ekranı, emoji kart, Story görseli, seri, Türkçe/İngilizce |
| 3 | Supabase: hesap, okul listesi (YÖK odyoloji programları + dünya için serbest giriş), lig tablosu |
| 4 | 40 vaka daha (toplam 60), 10 kişilik kapalı test, hata düzeltme, lansman içerikleri |

## 4. Lansman planı

**Zamanlama:** Dönem içinde, vize haftasından 2 hafta önce. (Öğrenci
odyogram çalışıyor, ders dolu.) Alternatif: 3 Mart Dünya İşitme Günü
haftası; bu tarih zaten camianın en çok paylaşım yaptığı gün.

**0. gün — tohum:**
- 5 üniversiteden birer "elçi" öğrenci (kulüp başkanları) lansmandan 3 gün
  önce erişim alır; kendi okulunun ligde ilk sırada olduğunu paylaşır.
- 3 akademisyene vaka yazarlığı teklif edilir; ilk haftanın vakaları onların
  adıyla çıkar.
- Instagram hesabı: her gün 08:00'de "Bugünün vakası" Reels'i (odyogram 3
  saniye görünür, "tahminini yorumla ya da oyna"). Akşam 20:00'de cevap.

**1–7. gün — okul rekabeti:**
- Her gün ligin ilk 3'ü Story'de paylaşılır, okullar etiketlenir.
- Odyoloji öğrenci kulüplerinin WhatsApp gruplarına elçiler üzerinden
  "bugün geride kaldık" mesajı.

**8–30. gün — camia dışı:**
- Kulak Burun Boğaz asistanlarına "odyologları geçebilir misiniz?" vakası.
- LinkedIn'de İngilizce "Audiogramle" paylaşımı; ABD/İngiltere odyoloji
  gruplarına (AAA, BAA toplulukları) gönderim.
- İlk "Cuma Ligi".

**Tek cümlelik mesaj:** "Her gün bir vaka. Tüm odyologlar aynı anda. Okulun
kaçıncı sırada?"

## 5. Ölçülecek metrikler

| Metrik | Hedef (30. gün) | Neden önemli |
|---|---|---|
| Günlük oyuncu | 2.000 | Büyüklük |
| Paylaşım oranı (sonuç ekranı → paylaş) | %25+ | Viral katsayı; Wordle'da bu oran %20 civarıydı |
| Ertesi gün geri dönüş | %50+ | Ritüel oluştu mu |
| 7 günlük seri tutan | %30+ | Alışkanlık |
| Hesap açma oranı | %40+ | aiHearX'e bağlanma |
| Ligde temsil edilen üniversite | 20+ | Okul rekabeti çalışıyor mu |
| Kullanıcı gönderimli vaka | 100 | İçerik motoru kendi kendine dönüyor mu |

Paylaşım oranı %10'un altında kalırsa, ilk düzeltilecek şey kart tasarımıdır;
oyun değil.

## 6. Gelir (ağ kurulduktan sonra, 6. aydan itibaren)

- İşitme cihazı ve implant firmaları için "haftanın sponsorlu vakası"
  (etik: sponsor, vakanın tanısını etkileyemez; yalnızca sonuç ekranında
  "bu vakada uygulanabilecek çözümler" bölümü).
- İş ve staj ilanları (işitme merkezleri, hastaneler).
- Üniversiteler için hoca modu / sınıf lisansı.
- aiHearX yapay zekâ odyogram yorumlayıcı için klinik abonelik.

Oyun her zaman ücretsiz kalır; viral motor para kapısının arkasına konmaz.
