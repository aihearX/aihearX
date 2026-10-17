# İşitme Nabzı — Ürün Tasarımı

> Nabız, tansiyon, adım sayısı, uyku... Hepsi her gün ölçülüyor.
> İşitme ise hâlâ yılda bir, kabinde, tek seferlik bir test.
> İşitme Nabzı bunu değiştirir.

İngilizce adı: **aiHear Pulse**.

---

## 1. Fikrin özü

Tek bir ürün, iki yüz ve bir ağ:

```
HASTA / HERKES                 ODYOLOG                      AĞ
─────────────────              ─────────────────            ─────────────────
Günde 60 saniye:               Her sabah "servis listesi":  Türkiye İşitme Nabzı
• gürültüde rakam testi        • 🔴 ani düşüş: bugün ara    canlı ekranı
• çınlama / efor / cihaz       • 🟠 cihaz 3 gündür takılmadı
  (3 dokunuş)                  • 🟡 efor artıyor, kontrol    Üniversite tarama
• telefon gürültü dozu           planla                     kampanyaları
  (arka planda, pasif)         • 🟢 iyi gidenler
                               + haftalık sonuç karnesi     Anonim araştırma
İşitme nabzı skoru + trend                                  veri seti
+ seri (streak)
```

Hasta bir şey öğrenmek zorunda değil: uygulama her gün aynı saatte 60 saniye
ister. Odyolog hiçbir şey girmek zorunda değil: veri hastadan akar, yapay zekâ
eler, odyolog yalnızca listeye bakar.

---

## 2. Neden üç ölçütü de karşılıyor

### 2.1 Herkesi etkilesin

- **Kavram yeni:** "İşitmenin nabzı" ifadesini duyan herkes anında anlıyor
  ve "neden yoktu?" diyor. Ürünün adı, konuşma konusunun kendisi.
- **Canlı ekran:** Türkiye haritasında o gün ölçülen nabız sayısı, il il
  ortalama gürültü dozu, saatlik "şu an kaç kişi test yapıyor". Basın bunu
  görsel olarak yayınlar. Dünya İşitme Günü'nde (3 Mart) tek haberdir.
- **İlk hikâye:** "Sabah nabzı düştü, uygulama odyoloğuna haber verdi, aynı
  gün tedaviye başlandı." Ani sensörinöral işitme kaybında tedavinin ilk
  günlerde başlaması sonucu belirgin değiştirir; bu hikâye bir kez yaşanınca
  ürünün reklamı camia tarafından yapılır.
- **Odyoloğa statü:** Hastası "odyoloğum beni her gün izliyor" der. Bu,
  mesleğin algısını "cihaz satan" konumundan "izleyen hekim" konumuna taşır.
  Odyologların paylaşma sebebi tam olarak budur.

### 2.2 Çok faydalı

| Sorun | İşitme Nabzı'nın yaptığı |
|---|---|
| Ani işitme kaybı geç fark ediliyor; hasta "geçer" diye bekliyor | Günlük nabızda ani düşüş → hastaya "bugün odyoloğunu ara" + odyoloğa 🔴 uyarı. Tedavi penceresi kaçmıyor. |
| İşitme cihazlarının ciddi bir kısmı çekmecede kalıyor; hasta sessizce vazgeçiyor | Cihaz kullanımı, efor ve memnuniyet her gün görünüyor; vazgeçme başlamadan odyolog arıyor. Kontrol randevusu "sorun olunca" değil "sinyal gelince". |
| Çınlama, Ménière, ototoksisite gibi dalgalanan durumlar tek seferlik testte görünmüyor | 90 günlük eğri. Odyolog ilk kez hastanın "arasındaki" günleri görüyor. |
| Odyolog, kliniğe gelmeyen hastasından haber alamıyor | Her sabah, her hasta tek ekranda. Gelmeyen hasta kaybolmuyor. |
| Öğrenci gerçek hasta verisiyle çalışamıyor | Anonim ağ verisi: eğilimler, vaka havuzu, bitirme projeleri. |
| Türkiye'de işitme sağlığına dair güncel, geniş veri yok | İlk sürekli, boylamsal işitme veri seti. Akademi bunun üstüne yayın yapar. |

### 2.3 Düzenli bakılması gereksin

Her rol için kaçırınca bir şey kaybedilen bir ritüel var:

| Rol | Ritüel | Kaçırınca |
|---|---|---|
| Hasta / herkes | Günde 60 sn nabız + seri | Seri kırılır; odyoloğu "3 gündür ölçüm yok" görür |
| Odyolog | Her sabah uyarı listesi (2 dk) | 🔴 uyarı bekler; hastası arar "neden aramadınız?" |
| Öğrenci | Kampüs tarama görevleri, haftalık veri paneli | Üniversite tarama sıralamasında geri düşer |
| Akademisyen | Haftalık anonim eğilim raporu | Araştırma verisinde boşluk |
| Herkes | Haftalık "İşitme Karnesi" (pazar akşamı) | Paylaşılacak kart gelmez |

---

## 3. Hasta yüzü: günlük 60 saniye

### 3.1 Ölçüm bileşenleri

1. **Gürültüde rakam testi (Digits-in-Noise, DIN):** Gürültü içinde üç
   rakam söylenir, hasta tuşlar. Uyarlanabilir zorluk; sonuç "konuşma
   anlama eşiği" (dB SNR). Dünya Sağlık Örgütü'nün hearWHO uygulamasının da
   kullandığı, dil bağımlılığı düşük, kulaklık kalitesinden az etkilenen,
   bilimsel geçerliliği yüksek yöntem. Türkçe rakamlarla kayıt yapılır.
   Süre: yaklaşık 60–90 saniye. Haftada en az 3, isteyen her gün.
2. **Üç dokunuş:** Çınlama (0–10), dinleme eforu (0–10), cihaz bugün
   takıldı mı (evet/hayır; cihaz kullanıcısı için). 5 saniye.
3. **Gürültü dozu (pasif):** Telefon mikrofonundan ortam ses düzeyi,
   kullanıcı izniyle arka planda örneklenir; ses kaydedilmez, yalnızca dB
   değeri alınır. Günlük "gürültü dozu" yüzdesi (örn. "bugün güvenli sınırın
   %140'ındaydın"). Kulaklık dinleme düzeyi işletim sisteminden okunur.

### 3.2 İşitme Nabzı skoru

Tek bir sayı (0–100) ve bir eğri. Hesap: DIN eşiği (ağırlık yüksek) +
öz bildirimler + gürültü dozu. Sayının anlamı hastaya her zaman tek cümleyle
söylenir: "Bugün nabzın 78, geçen haftaya göre sabit."

Skorun **kişisel taban çizgisi** vardır; önemli olan mutlak değer değil,
kişinin kendi tabanından sapmadır. Ani düşüş tanımı bu sapma üstünden yapılır.

### 3.3 Haftalık İşitme Karnesi (paylaşım nesnesi)

Pazar akşamı herkese gelen görsel kart: haftalık nabız eğrisi, gürültü dozu,
seri, "bu hafta en gürültülü günün: Cumartesi, konser". Instagram Story
boyutunda, odyoloğun adı ve aiHearX imzasıyla. Viral döngünün hasta tarafı
budur.

---

## 4. Odyolog yüzü: sabah servis listesi

Odyolog uygulamayı sabah açar. Tek ekran:

```
Günaydın Dr. Ayşe. 142 hastanız izleniyor. Bugün 3 uyarı.

🔴 Mehmet K. (58)  Sağ kulak nabzı 2 günde 31 puan düştü. Çınlama 8/10.
                  Ani işitme kaybı şüphesi. → Bugün ara  [Ara] [Not]
🟠 Fatma D. (71)  Cihaz 4 gündür takılmadı. Efor 7/10.
                  Terk riski. → Bu hafta kontrol  [Randevu ver]
🟡 Ali T. (34)    Gürültü dozu 5 gündür %200+. Nabız sabit.
                  Koruyucu danışmanlık. → Mesaj gönder  [Hazır mesaj]
🟢 139 hasta iyi gidiyor.

Haftalık: cihaz kullanımı %81 (Türkiye ort. %74). Yeni bağlanan: 6.
```

Her uyarı için tek dokunuşla hazır mesaj veya arama. Odyolog ne gördüyse
not düşer; bu notlar triyaj modelini eğitir (geri bildirim döngüsü).

**Hastayı bağlama:** Odyolog, hastaya kliniğinde QR kod gösterir. Hasta
uygulamayı indirir, QR'ı okutur, bağlanır. 30 saniye. Odyoloğun kendi QR'ı
her yerde: kartvizit, klinik duvarı, Instagram profili.

**Karne:** Odyolog kendi hasta grubunun cihaz kullanım oranını, ortalama nabız
eğrisini ve Türkiye ortalamasına göre konumunu görür. İyi odyolog ilk kez
ölçülebilir olur; bunu paylaşmak ister.

---

## 5. Yapay zekâ triyaj

Triyaj iki katmanlıdır:

1. **Kural katmanı (deterministik, açıklanabilir):**
   - 🔴 Ani düşüş: DIN eşiği kişisel tabandan ≥ belirlenen eşik kadar
     kötüleşti ve iki ölçümde tekrarladı, ya da öz bildirimde "ani"
     işaretlendi.
   - 🟠 Terk riski: cihaz kullanımı ardışık N gün "hayır" + efor artışı.
   - 🟡 Gürültü: günlük doz üst üste K gün sınırın üstünde.
   - Her kuralın eşiği klinik danışma kuruluyla belirlenir ve ürün içinde
     açıkça yazılır.
2. **Dil modeli katmanı:** Kural tetiklenince model, hastanın 90 günlük
   verisini ve öz bildirim notlarını okuyup odyoloğa **iki cümlelik** özet ve
   önerilen eylem yazar; hastaya ise yumuşak, panik yaratmayan bir mesaj
   taslağı hazırlar. Model tanı koymaz, karar odyoloğundur. Model yalnızca
   odyoloğun zamanını kısaltır.

Bu ayrım hem güven (açıklanabilir kurallar) hem de regülasyon (karar destek,
tanı değil) için önemlidir.

---

## 6. Viral döngüler

```
Odyolog ──QR──▶ Hasta ──Karne──▶ Aile / arkadaş ──"ben de ölçeyim"──▶ Yeni kullanıcı
   ▲                                                                     │
   │                                        "Odyoloğum yok" ──▶ Odyolog dizini
   └──────────────── yeni hasta ◀───────────────────────────────────────┘

Öğrenci ──kampüs taraması──▶ 200 öğrenci ──▶ Üniversite sıralaması ──▶ Diğer üniversiteler
Akademisyen ──anonim veri──▶ Yayın ──▶ Kongre ──▶ Diğer akademisyenler
Basın ──canlı Türkiye ekranı──▶ Halk ──▶ "Odyolog bul"
```

Üç ayrı grup (hasta, odyolog, öğrenci) üç ayrı sebepten paylaşır; hepsinin
hedefi aynı yer: aiHearX hesabı.

Odyoloğun paylaşma sebebi en kritik olandır ve doğrudan çıkar içerir:
**hastası bağlandıkça odyoloğun paneli değerlenir ve yeni hasta kendisine
yönlenir.** Hiçbir sosyal kampanyaya ihtiyaç yok.

---

## 7. Dünyada neden yok, neden şimdi

| Var olan | Eksiği |
|---|---|
| hearWHO, Mimi, cihaz üreticilerinin test uygulamaları | Tek seferlik test. Odyoloğa bağlı değil. Eğri yok. |
| Üretici uygulamaları (uzaktan ayar) | Yalnızca kendi markası. Odyolog her marka için ayrı panel. Günlük işitme ölçümü yok. |
| Akıllı saat gürültü uyarıları | Yalnızca gürültü. İşitmeyi ölçmüyor. Klinisyen yok. |
| Hastane bilgi sistemleri | Hasta klinikten çıkınca veri biter. |

İşitme Nabzı, bunların birleşmediği noktada duruyor: **marka bağımsız, günlük,
odyoloğa bağlı, yapay zekâ eleme ile**. Teknik olarak 5 yıl önce de
yapılabilirdi; yapılmadı çünkü üreticiler kendi ekosistemini korur, odyologlar
yazılım yapmaz. aiHearX tam bu boşluğun adıdır.

---

## 8. Riskler ve karşı önlemler

| Risk | Önlem |
|---|---|
| Hasta günlük ölçümü bırakır | Ölçüm 60 sn; seri; odyoloğun "3 gündür yok" görmesi; haftalık karne. DIN testi en az haftada 3 yeter, günlük zorunlu değil. |
| Yanlış alarm odyoloğu yorar | Ani düşüş iki ölçümde teyit; eşikler ayarlanabilir; odyolog geri bildirimi modeli düzeltir. |
| Tıbbi cihaz regülasyonu | Konumlandırma: tarama ve izleme, karar destek; tanı koymaz; klinisyen döngüde. Danışma kurulu; kurallar şeffaf. Gerektiğinde sınıflandırma başvurusu. |
| KVKK (sağlık verisi özel nitelikli) | Açık rıza; veri Türkiye'de; hasta-odyolog bağı hastanın onayıyla; anonim araştırma verisi k-anonimlik ile. |
| Kulaklık ve telefon farkı | DIN testi göreli (sinyal/gürültü oranı) ölçer; mutlak kalibrasyon gerekmez. Kişisel taban çizgisi farkları eler. |
| Üreticiler rakip görür | Marka bağımsızlık avantaj; üreticilere "sizin cihazınızın gerçek kullanım verisi" olarak sonradan satılır. |

---

## 9. Elenen fikirlerin burada yaşadığı yer

- **İşitme İkizi** → hastanın karnesinde "ailen seni böyle duyuyor" butonu.
- **Kulağın Kaç Yaşında?** → uygulamanın ilk açılış testi ve halk için giriş kapısı.
- **Türkiye İşitme Haritası** → canlı Türkiye ekranı, basın malzemesi.
- **Odyogramle** → öğrenci modülünde haftalık vaka; ağın anonim verisinden üretilir.
- **WhatsApp asistanı** → odyoloğun uyarıları isterse WhatsApp'tan alması.
