# İşitme Nabzı — Teknik Mimari

## 1. Bileşenler

```
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ Hasta uygulaması│   │ Odyolog paneli  │   │ Canlı Türkiye    │
│ (iOS/Android,   │   │ (web + mobil)   │   │ ekranı (web)     │
│  React Native)  │   │                 │   │                  │
└────────┬────────┘   └────────┬────────┘   └────────┬─────────┘
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    ▼                     ▼
          ┌──────────────────┐   ┌──────────────────┐
          │ API (Node/TS)    │   │ Anonim veri       │
          │ Supabase/Postgres│   │ ambarı + k-anonim │
          └────────┬─────────┘   └──────────────────┘
                   ▼
          ┌──────────────────┐
          │ Triyaj motoru    │
          │ kural + dil      │
          │ modeli           │
          └──────────────────┘
```

## 2. Ölçüm: gürültüde rakam testi (DIN)

- **Uyaran:** Türkçe 0–9 rakamları, tek konuşmacı, stüdyo kaydı; üçlü
  diziler (örn. "4-7-2"). Konuşma spektrumlu sabit gürültü.
- **Prosedür:** Uyarlanabilir; her doğru üçlüden sonra sinyal/gürültü oranı
  2 dB düşer, her yanlışta 2 dB yükselir. 20–25 üçlü. Sonuç: son dönüş
  noktalarının ortalaması = konuşma anlama eşiği (dB SNR).
- **Neden uygun:** Göreli ölçüm olduğu için kulaklık ve telefon
  kalibrasyonu gerekmez; dil yükü düşük; 60–90 saniye; ani değişimlere
  duyarlı; literatürde yaygın doğrulama var.
- **Öğrenme etkisi:** İlk 3–5 testte eşik iyileşir, sonra plato. Taban
  çizgisi 5. testten sonra hesaplanır; triyaj kuralları tabana göre çalışır.
- **Kulaklık kontrolü:** Test başında sol/sağ kanal ve ses düzeyi kontrolü;
  kulaklıksız ölçüm "düşük güven" etiketiyle kaydedilir.
- **Kulak ayrımı:** Haftada bir kez sağ ve sol ayrı ölçülür (ani kayıp
  çoğunlukla tek taraflıdır). Diğer günler iki kulak birlikte.

## 3. Gürültü dozu

- Mikrofon örneklemesi: saatte birkaç kez kısa pencere, yalnızca A ağırlıklı
  dB değeri saklanır; ses kaydedilmez, cihazdan dışarı ses çıkmaz.
- Kulaklık düzeyi: iOS ve Android'in sağlık/ses düzeyi arayüzlerinden
  okunur (kullanıcı izniyle).
- Doz: 8 saat 85 dBA eşdeğeri = %100 (yaygın mesleki sınır referansı).
  Günlük doz hesaplanır, hastaya yüzde olarak gösterilir.
- Telefon mikrofonları mutlak kalibrasyon gerektirir; ilk sürümde cihaz
  modeline göre kaba düzeltme tablosu, sonradan kullanıcı başı kalibrasyon.

## 4. Triyaj motoru

**Kural katmanı** veritabanında tetikleyici olarak çalışır; her ölçüm
sonrası değerlendirilir ve `alerts` tablosuna yazar. Kurallar sürümlenir ve
odyolog panelinde "bu uyarı neden üretildi" olarak gösterilir.

**Dil modeli katmanı** yalnızca bir uyarı üretildiğinde çağrılır (maliyet
kontrolü). Girdi: hastanın son 90 gün ölçümleri, öz bildirimleri, cihaz
bilgisi, odyoloğun önceki notları (hasta adı yok, takma kimlik). Çıktı
yapılandırılmıştır: `ozet` (2 cümle), `onerilen_eylem`, `aciliyet`,
`hasta_mesaji_taslagi`.

- Model: `claude-opus-5-5` (yapılandırılmış çıktı ile; tanı üretmez, yalnızca
  özetler ve önerir). Yoğunluk arttığında triyaj özetleri için
  `claude-haiku-5-5` değerlendirilir.
- Günde 10.000 hasta, %3 uyarı oranı → günde ~300 çağrı. Çağrı başına birkaç
  bin giriş, birkaç yüz çıkış token. Aylık model maliyeti ilk yıl için
  göz ardı edilebilir düzeyde kalır; asıl maliyet uygulama mağazaları ve
  altyapıdır.
- Her çıktı odyolog tarafından "faydalı / faydasız" olarak işaretlenir;
  bu etiketler kural eşiklerini ve istemleri iyileştirmek için kullanılır.

## 5. Veri ve gizlilik (KVKK)

- İşitme verisi **özel nitelikli kişisel veri**. Açık rıza ekranı, sade dil,
  her veri türü için ayrı onay (ölçüm, gürültü dozu, odyolog paylaşımı,
  anonim araştırma).
- Veri Türkiye'de barındırılır. Hasta-odyolog bağı hasta tarafından her an
  kesilebilir.
- Odyolog paneli yalnızca bağlı hastaları görür; satır düzeyi güvenlik.
- Araştırma veri seti: takma kimlik, il düzeyi konum, 5 yıllık yaş bandı,
  k-anonimlik (k ≥ 10) altında yayınlanır.
- Dil modeline hasta adı, telefon, tam doğum tarihi gönderilmez.

## 6. Regülasyon konumlandırması

- Ürün: işitme sağlığı **tarama ve izleme** uygulaması; **karar destek**.
  Tanı koymaz, tedavi önermez; uyarıları değerlendiren odyologdur.
- Her ekranda: "Bu uygulama tıbbi tanı yerine geçmez."
- Danışma kurulu: 2 odyoloji akademisyeni, 1 KBB uzmanı, 1 sağlık hukuku
  danışmanı. Kural eşikleri kurul onayıyla.
- Büyüme sonrası tıbbi cihaz yazılımı sınıflandırması için başvuru
  değerlendirilir; mimari baştan izlenebilir ve denetlenebilir kurulur
  (kural sürümleri, uyarı kayıtları, model çıktı kayıtları).

## 7. Yığın ve maliyet

| Katman | Seçim |
|---|---|
| Mobil | React Native (Expo); ses için native modül |
| Odyolog paneli | Next.js |
| Arka uç | Supabase (Postgres, Auth, satır düzeyi güvenlik, Edge Functions), Türkiye/AB bölgesi |
| Canlı ekran | Next.js + anonim toplulaştırılmış görünümler |
| Triyaj | Postgres tetikleyici + Edge Function + Claude API |
| Bildirim | Push (Expo), isteğe bağlı WhatsApp/SMS |
| Analitik | PostHog |

İlk 6 ay altyapı maliyeti düşük (ücretsiz/küçük katmanlar). Asıl maliyet:
Türkçe DIN kayıt stüdyosu (bir kez), mağaza hesapları, hukuk danışmanlığı,
ve 2 geliştirici.
