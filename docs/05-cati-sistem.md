# Çatı Sistem: Odyologların Uygulamaları Paylaştığı Platform

Tarih: 2026-10-17
Bağlam: Karar, tek büyük ürün yerine "çok mini uygulama, tek hesap, tek marka"
modeli (Instagram: aiHear Ünlü, slogan: Kulaktan Kulağa). Bu doküman, o
mini uygulamaların odyologlar eliyle hastaya ve meslektaşa yayılmasını
sağlayan ortak çatıyı tanımlar.

---

## 1. Tek cümle

Her odyoloğun bir **aiHear kimliği** ve bir **odyolog kodu** vardır; her mini
uygulama bu kodla açıldığında hastayı o odyoloğa bağlar, odyoloğun adını
taşır ve odyoloğun paneline düşer. Odyolog uygulamayı paylaşır çünkü
paylaştıkça hastası, itibarı ve paneli büyür.

---

## 2. Odyolog neden paylaşsın: beş kat teşvik

Teşvik sırası bilinçli: ilk ikisi lansman günü çalışır, sonrakiler ağ
büyüdükçe devreye girer.

| Kat | Teşvik | Nasıl görünür |
|---|---|---|
| 1. Fayda | Hastasına 10 saniyede verebileceği işe yarar araç | "Hastama gönder" butonu, hazır WhatsApp mesajı |
| 2. İmza | Uygulama odyoloğun adıyla açılır | "Bu aracı size Ody. Ayşe Yılmaz gönderdi" + fotoğraf |
| 3. Hasta kazanımı | Odyoloğu olmayan kullanıcı dizinden odyolog bulur; odyoloğun hastaları diziyi besler | Odyolog Vitrini: profil, uzmanlık, il, "bu ay 212 kişiye ulaştı" |
| 4. Statü | Rozetler, sıralama, kurucu üyelik | "İlk 100 Odyolog" rozeti, il ve üniversite sıralaması, aylık "en çok ulaşan" |
| 5. Gelir | Ücretli özelliklerden pay, klinik planı | Yönlendirdiği hastanın ödediği premium özellikten pay (2. yıl) |

Yan teşvik: **içerik tembelliği.** Odyolog paylaşmak ister ama paylaşım
hazırlamak istemez. Her uygulama için odyoloğun adı ve fotoğrafı
yerleştirilmiş, tek dokunuşla paylaşılan Story, Reels kapağı ve WhatsApp
metni sistemden çıkar. Odyoloğun tek işi "paylaş"a basmaktır.

---

## 3. Sistemin parçaları

```
┌──────────────────────────────────────────────────────────────────┐
│                         aiHear Kimliği                           │
│   tek giriş: odyolog / öğrenci / hasta / akademisyen rolleri     │
└──────────────┬───────────────────────────────────┬───────────────┘
               │                                   │
   ┌───────────▼───────────┐          ┌────────────▼────────────┐
   │   Odyolog Vitrini     │          │   Uygulama Kaydı        │
   │ profil, kod, QR,      │          │ her mini uygulamanın     │
   │ erişim istatistiği,   │          │ adı, linki, paylaşım    │
   │ rozetler, dizin       │          │ kiti, hangi role uygun   │
   └───────────┬───────────┘          └────────────┬────────────┘
               │                                   │
               └──────────────┬────────────────────┘
                              ▼
               ┌──────────────────────────────┐
               │   Bağlantı (Atıf) Motoru     │
               │ link/QR → odyolog kodu →     │
               │ hasta-odyolog bağı → panel   │
               └──────────────┬───────────────┘
                              ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐
   │ Odyogramle   │  │ Kulağın Kaç  │  │ İşitme İkizi │  │ İşitme    │
   │              │  │ Yaşında?     │  │              │  │ Nabzı ... │
   └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘
            her uygulamada aynı: giriş, "hastama gönder", imza, paylaşım kiti
```

### 3.1 aiHear Kimliği
- Tek kayıt, tüm uygulamalar. Google/Apple ile tek dokunuş.
- Roller: odyolog (diploma doğrulaması isteğe bağlı, doğrulanınca mavi tik),
  öğrenci (üniversite seçimi), hasta/herkes, akademisyen.
- Odyolog hesabı açılır açılmaz bir **odyolog kodu** üretilir
  (örn. `AYSE-34`) ve bir kısa link: `aihear.app/ayse34`.

### 3.2 Odyolog Vitrini (herkese açık profil)
- Ad, unvan, il, klinik, uzmanlık alanları, iletişim (isteğe bağlı).
- "Hastalarıma önerdiğim araçlar": odyoloğun seçtiği mini uygulamalar,
  her biri kendi koduyla gömülü.
- Canlı sayaç: "bu ay 212 kişiye ulaştı", "47 hasta bağlı".
- Rozetler ve sıralama.
- QR kod: kartvizit, klinik duvarı, Instagram biyografisi için indirilebilir.
- Vitrin aynı zamanda **Türkiye Odyolog Dizini**'nin bir sayfasıdır.
  Odyoloğu olmayan her kullanıcı "yakınımdaki odyolog" ile buraya gelir.

### 3.3 Uygulama Kaydı
Her mini uygulama çatıya şu bilgilerle kaydolur:
- ad, kısa açıklama, ikon, kime uygun (hasta / odyolog / öğrenci)
- paylaşım kiti şablonları (Story, Reels kapağı, WhatsApp metni, LinkedIn)
- "hastama gönder" mesajının metni
- hangi sonuçların odyolog paneline düşeceği (örn. test skoru, tamamlama)

Yeni bir uygulama kaydedildiğinde tüm odyologlara tek bildirim gider:
"Yeni araç: X. Hastana göndermek için dokun." Odyolog iki dokunuşla kendi
vitrinine ekler.

### 3.4 Bağlantı (Atıf) Motoru
- Her uygulama linki odyolog kodu taşır: `aihear.app/ikiz?o=AYSE34`.
- Kullanıcı uygulamayı o linkten açınca, uygulama "Ody. Ayşe Yılmaz sizinle
  paylaştı" diye açılır; kullanıcı kaydolursa odyolog-hasta bağı kurulur
  (hasta onayı ile; tek dokunuş).
- Bağ bir kere kurulur, sonraki tüm uygulamalarda otomatik geçerlidir.
- Sonuçlar odyolog paneline düşer: "Mehmet K. Kulağın Kaç Yaşında? testinde
  52 çıktı" (hasta izin verirse).
- Hasta bağı her an kesebilir.

### 3.5 Odyolog Paneli
- Bağlı hastalar, hangi uygulamayı ne zaman kullandı, dikkat gerektirenler.
- Erişim istatistiği: hangi paylaşım kaç kişiye ulaştı, kaçı hasta oldu.
- "Hastama gönder" geçmişi.
- İleride İşitme Nabzı'nın sabah uyarı listesi de buraya gelir; çatı
  şimdiden ona göre kurulur.

### 3.6 Paylaşım Kiti üretici
- Odyoloğun adı, fotoğrafı, kodu ve QR'ı ile her uygulama için otomatik
  görsel üretir (Story 9:16, kare, LinkedIn yatay).
- Hazır WhatsApp metni: "Merhaba, işitmenizi evde 1 dakikada ölçmek için şu
  linki kullanabilirsiniz: aihear.app/yas?o=AYSE34. Sonuç bana da ulaşır."
- Odyolog bir kez fotoğraf yükler, bir daha tasarım yapmaz.

### 3.7 Öğrenci ve üniversite katmanı
- Öğrenci de kod alır; kampüs ve aile taramalarında kullanır.
- Üniversite sıralaması: öğrencilerin ulaştığı kişi sayısı.
- Hocalar sınıf kodu ile öğrencilerin katılımını görür.
- Öğrenci mezun olunca kodu odyolog koduna dönüşür; ağ kaybolmaz.

---

## 4. Her mini uygulamanın uyması gereken sözleşme

Çatıya giren her proje, kod şablonundan geldiği için şunları otomatik taşır:

1. aiHear Kimliği ile giriş (hesapsız da çalışır, ama hesapla daha iyi).
2. Odyolog kodu okuma ve "sizinle paylaştı" imzası.
3. "Hastama gönder" ve "Meslektaşıma gönder" butonları (rol bazlı).
4. Paylaşılabilir bir sonuç nesnesi (kart, skor, görsel).
5. Sonuç olayının çatıya bildirilmesi (panel ve istatistik için).
6. Ortak tasarım sistemi ve aynı alt imza: "aiHear · Kulaktan Kulağa".
7. Türkçe ve İngilizce metin dosyaları.

Bu sözleşmeyi sağlamayan proje çatıya alınmaz; sayfa da onu duyurmaz.

---

## 5. Yayılma mekanikleri (kanal kanal)

| Kanal | Mekanik |
|---|---|
| Klinik içi | Masada QR; hasta çıkmadan uygulamayı yükler, bağlanır |
| WhatsApp | Hazır metin + link; hasta ailesine iletir, link kodu taşımaya devam eder |
| Instagram | Odyoloğun adıyla Story; "kaydır, dene" |
| Meslektaş | "Meslektaşıma gönder": kod taşımaz, davet taşır; davet eden "elçi" rozeti alır |
| Kongre ve dernek | Kongre özel kodu; stantta QR; dernekler için toplu üyelik |
| Üniversite | Sınıf kodu, kampüs taraması, sıralama |
| aiHear Ünlü sayfası | Her yeni uygulama bir Reels; "sıradakini siz seçin" anketi |

---

## 6. Teknik iskelet

| Parça | Seçim |
|---|---|
| Kod deposu | Tek monorepo: `packages/kimlik`, `packages/tasarim`, `packages/paylasim-kiti`, `apps/*` |
| Kimlik ve veri | Supabase (Auth, Postgres, satır düzeyi güvenlik), Türkiye/AB bölgesi |
| Web uygulamaları | Next.js; her mini uygulama `aihear.app/<ad>` altında |
| Mobil | Expo (React Native); tek mağaza uygulaması "aiHear" içinde modüller, yalnızca gerekirse ayrı uygulama |
| Kısa link ve atıf | `aihear.app/<kod>` yönlendirici + `attributions` tablosu |
| Paylaşım görselleri | Sunucu tarafı SVG → PNG (Edge Function) |
| Bildirim | Push + e-posta; WhatsApp isteğe bağlı |
| Analitik | PostHog; her olay `app`, `odyolog_kodu`, `rol` ile etiketli |

Veri modeli çekirdeği:

```
users(id, rol, ad, il, universite, dogrulandi)
odyolog_kodlari(kod, user_id)
baglar(hasta_id, odyolog_id, kaynak_app, tarih, aktif)
apps(id, ad, rol_hedefi, paylasim_kiti, aktif)
olaylar(app_id, user_id, odyolog_kodu, tur, veri, tarih)
```

---

## 7. İlk 90 gün

| Dönem | İş |
|---|---|
| 1–30 | Kimlik, odyolog kodu, vitrin (sade), kısa link, paylaşım kiti v1. İlk mini uygulama (Kulağın Kaç Yaşında?) çatıya bağlı çıkar. |
| 31–60 | İkinci ve üçüncü uygulama (Odyogramle, İşitme İkizi). "Hastama gönder" ve panel v1. İlk 100 odyolog "kurucu üye". |
| 61–90 | Dizin herkese açılır. Üniversite kodları. İlk sıralama ve rozetler. Sayfada "sıradakini siz seçin". |

Ölçülecek: kayıtlı odyolog, kod ile açılan oturum oranı, odyolog başına
bağlı hasta, paylaşım kiti kullanım oranı, dizinden gelen yeni hasta.

---

## 8. Riskler

| Risk | Önlem |
|---|---|
| Odyolog kayıt olur, paylaşmaz | Paylaşım kiti sıfır emek; ilk paylaşımda rozet; "henüz kimseye ulaşmadın" nazik hatırlatma |
| Sahte odyolog hesapları | Doğrulama isteğe bağlı ama dizinde yalnızca doğrulanmışlar görünür |
| Hasta verisi odyoloğa izinsiz akar | Bağ hastanın onayıyla; her sonuç için paylaşım tercihi; KVKK açık rıza |
| Uygulamalar kalite olarak dağılır | Sözleşme (bölüm 4) ve tek tasarım sistemi; sözleşmeyi geçmeyen çatıya girmez |
| Mağaza uygulaması şişer | Modüller isteğe bağlı yüklenir; web öncelikli |
