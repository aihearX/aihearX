# Odyogramle — Günlük Odyogram Bulmacası

> "Her gün bir vaka. Tüm dünya aynı anda. 6 deneme. Tanıyı koy, odyogramını paylaş."

İngilizce adı: **Audiogramle** (audiogramle.com). Türkçe: **Odyogramle**.
Her iki alan adı tek üründe, dil otomatik seçilir.

---

## 1. Neden bu fikir viral olur

Wordle'ın 2022'de üç ayda 90 kişiden 2+ milyon günlük oyuncuya çıkmasının
nedeni oyunun kendisi değil, **paylaşım kartıydı**: hiçbir şey açıklamadan
"ben de oynuyorum, şu kadarda bildim" diyen emoji ızgarası. Odyogramle aynı
mekanizmayı, bir meslek camiasının **kimlik işareti** olan odyogram üstüne
kuruyor.

| Wordle'ın yaptığı | Odyogramle'nin karşılığı |
|---|---|
| Herkes aynı kelimeyi çözüyor | Herkes aynı vakayı çözüyor → ortak konuşma konusu |
| Günde bir tane (kıtlık) | Günde bir vaka → "bugünkünü çözdün mü?" |
| Emoji ızgara paylaşımı | **Emoji odyogram** paylaşımı (aşağıda) |
| Seri (streak) kaybetme korkusu | Seri + üniversite ligindeki yerini kaybetme korkusu |
| Sıfır kurulum, tarayıcıda | Sıfır kurulum, tarayıcıda, telefonda |

Odyolojiye özgü ek kaldıraçlar:

1. **Okul rekabeti.** Türkiye'de 60'tan fazla odyoloji programı var. Günlük
   "üniversite ligi" tablosu (Hacettepe mi, İstanbul mu, Başkent mi önde?)
   paylaşımı doğrudan tetikler. Hocalar sınıfta açar.
2. **Sınav kaygısı.** Öğrenciler zaten odyogram yorumlamaya çalışıyor; bu oyun
   "çalışma" sayılır, suçluluk yok.
3. **Meslek gururu.** Çalışan odyolog, öğrencilerden daha iyi skor almak ister.
   Kulak Burun Boğaz hekimleri de oynamaya başlar → camia dışına taşar.
4. **Vaka hazırlayan rozeti.** "Bugünün vakasını Dr. X (Y Üniversitesi)
   hazırladı." Hazırlayan kişi o gün herkese paylaşır. İçerik bedava, dağıtım
   bedava.
5. **Dil engeli yok.** Odyogram evrensel bir grafik. Aynı vaka Türkiye'de,
   Hindistan'da, Brezilya'da aynı gün oynanır.

---

## 2. Oyun tasarımı

### 2.1 Günlük akış

```
00:00 (yerel saat) → yeni vaka açılır
│
├─ Ekran 1: Kısa anamnez (2–3 cümle) + saf ses odyogramı (hava + kemik)
│           + timpanogram tipi
│
├─ Tahmin 1 ............ yanlışsa İPUCU 1 açılır: akustik refleksler
├─ Tahmin 2 ............ yanlışsa İPUCU 2 açılır: konuşma testleri (SRT, WRS)
├─ Tahmin 3 ............ yanlışsa İPUCU 3 açılır: OAE
├─ Tahmin 4 ............ yanlışsa İPUCU 4 açılır: ABR / vestibüler / ek öykü
├─ Tahmin 5 ............ yanlışsa İPUCU 5 açılır: görüntüleme özeti
└─ Tahmin 6 ............ son şans
│
└─ Sonuç ekranı: doğru tanı + 5 satırlık klinik açıklama + kaynak
                 + "hasta dünyayı böyle duyuyor" ses simülasyonu
                 + PAYLAŞ butonu + lig tablosu + yarının geri sayımı
```

Tahmin, yaklaşık 60 tanılık aranabilir listeden seçilir (serbest metin değil;
hem adil hem de dil bağımsız). Liste örneği:

- Presbiakuzi
- Gürültüye bağlı işitme kaybı
- Otoskleroz
- Ménière hastalığı
- Ani sensörinöral işitme kaybı
- Vestibüler schwannom (akustik nörinom)
- Efüzyonlu otitis media
- Timpanik membran perforasyonu
- Kolesteatom
- Ototoksisite
- Süperior semisirküler kanal dehisansı
- İşitsel nöropati spektrum bozukluğu
- Nonorganik (fonksiyonel) işitme kaybı
- Konjenital sitomegalovirüs
- Büyük vestibüler akuadukt sendromu
- Otitis eksterna
- Serumen tıkacı
- Kemikçik zincir kopukluğu
- Meningit sonrası işitme kaybı
- Normal işitme (tuzak vaka)

"Yakın tahmin" mantığı Wordle'daki sarı kareye karşılık gelir: tahmin, doğru
tanıyla aynı kategorideyse (örn. iletim tipi / sensörinöral / mikst /
retrokoklear) sarı, aynı kategoride ve aynı kulak tutulumundaysa turuncu,
tam doğruysa yeşil.

### 2.2 Paylaşım kartı — "emoji odyogram"

Bu ürünün en kritik parçası. Paylaşım metni şöyle görünür:

```
Odyogramle #143  🎯 3/6  🔥 12 gün

🔴 ⬛⬛🟨🟩🟩🟩🟩
🔵 ⬛⬛⬛🟨🟩🟩🟩
   250 500 1k 2k 4k 6k 8k

🏫 Hacettepe — bugün 2. sırada
odyogramle.com
```

Tasarım kararları:

- **🔴 sağ kulak, 🔵 sol kulak.** Odyolojide sağ kulak kırmızı, sol mavi
  çizilir. Bunu gören her odyolog kartı bir saniyede tanır; görmeyen "bu ne?"
  diye sorar. İkisi de yayılmayı besler.
- Satırdaki her kare bir frekans. Kare rengi, oyuncunun o frekansı **hangi
  tahminde "kilitlediğini"** gösterir (oyuncu her tahminde "bu kaybın ağırlık
  merkezi hangi frekanslarda?" sorusuna da cevap verir; bu ikinci bir skor
  üretir). Böylece ızgara her oyuncuda farklı olur, tıpkı Wordle gibi.
- Satırın altında frekans ekseni. Kart, odyogramın kendisine benzer.
- Üniversite ve sıra bilgisi isteğe bağlıdır ama varsayılan açıktır.

Paylaşım butonları: Instagram Story (görsel kart, otomatik oluşturulur),
WhatsApp, X, LinkedIn, Kopyala.

### 2.3 Seri, lig ve rozetler

- **Seri (streak):** Üst üste oynanan gün sayısı. Bir gün kaçırırsa sıfırlanır.
  Haftada bir "seri dondurma" hakkı (Duolingo modeli).
- **Üniversite ligi:** Her gün, o okuldan oynayan herkesin ortalama tahmin
  sayısı ve katılım oranı. Küçük okulların şansı olsun diye katılım yüzdesi
  ağırlıklı. Haftalık ve dönemlik şampiyonluk.
- **Ülke ligi:** Türkiye, ABD, Hindistan, İran, Brezilya, Mısır... Dünya
  odyoloji camiası bunu LinkedIn'de paylaşır.
- **Rozetler:** "İlk denemede bildi", "30 gün seri", "Retrokoklear avcısı"
  (5 nörinom vakasını ilk denemede), "Vaka yazarı", "Tuzak vakayı yakaladı".
- **Hoca modu:** Öğretim üyesi, sınıfı için özel kod açar; sınıfının skorunu
  görür. Bu, ürünü üniversitelere resmi kanaldan sokar.

### 2.4 İkinci mod: Odyogramı Çiz (2. ay)

Tersine oyun. Anamnez ve tanı verilir: "52 yaş erkek, 20 yıl tekstil
fabrikasında çalışmış, çınlama." Oyuncu dokunarak eşikleri çizer. Her
frekansta gerçek eşiğe ±5 dB içindeyse yeşil, ±15 dB sarı, aksi siyah. Bu
modun paylaşım kartı doğrudan oyuncunun çizdiği odyogramdır.

### 2.5 Haftalık özel: Cuma Ligi

Cuma günleri vaka daha zor ve çok adımlıdır (örn. kokleer implant adayı
değerlendirmesi, vestibüler test bataryası). Canlı skor tablosu, üniversiteler
arası doğrudan rekabet. Reels'te "Cuma Ligi'ni kim aldı?" paylaşımı.

---

## 3. İçerik motoru: vaka bankası

Vaka üretimi camiadan gelir; ürün ekibi yalnızca kalite denetimi yapar.

1. **Gönderim formu:** Odyolog/öğrenci, anonimleştirilmiş vakayı yapılandırılmış
   formla gönderir (eşikler, timpanogram, refleksler, öykü, tanı, kaynak).
   Gerçek hasta verisi değil, **öğretici kompozit vaka** istenir; form bunu
   açıkça şart koşar.
2. **Hakem onayı:** 3–5 kişilik gönüllü hakem kurulu (akademisyenler). Onaylı
   vaka takvime girer.
3. **Yazar rozeti ve kredi:** Vaka yayınlandığı gün yazarın adı ve okulu
   görünür. Yazar o gün herkese paylaşır. Yılın en iyi vaka yazarları ödül alır.
4. **Vaka arşivi:** Geçmiş vakalar aiHearX hesabıyla oynanabilir (yeni
   kullanıcı için "geçmişe dön" özelliği). Arşiv, Türkiye'nin en büyük açık
   odyoloji vaka kütüphanesine dönüşür; bu tek başına akademik atıf getirir.

Başlangıç için ilk 60 vakayı ekip kendi yazar (bkz.
[`04-vaka-bankasi-ornekleri.md`](04-vaka-bankasi-ornekleri.md)).

---

## 4. Herkesi aiHearX'e bağlama planı

Oyun, aiHearX'in giriş kapısıdır. Hesapsız oynanır ama şu özellikler hesap
ister ve her biri doğal bir "kaydol" anıdır:

| Özellik | Kaydolma nedeni |
|---|---|
| Seri kaydı ve lig | "Serim kaybolmasın, okulumu temsil edeyim" |
| Vaka arşivi | "Geçmiş vakaları çözeyim" |
| Vaka gönderme | "Benim vakam yayınlansın" |
| Odyolog Kartı | Paylaşılabilir profil: okul, mezuniyet, rozetler, skor |
| Yapay zekâ odyogram yorumlayıcı | Oyunun arkasındaki motor, klinikte de kullanılır |
| İş ve staj ilanları | Ağ büyüdüğünde doğal gelir kapısı |

Kayıt, tek tıkla (Google/Apple) ve yalnızca okul seçimi ister. E-posta
pazarlaması yok; günlük bildirim "bugünün vakası açıldı" yeterli.

Uzun vade: aiHearX hesabı = Türkiye (ve sonra dünya) odyoloji camiasının
LinkedIn'i. Oyun bunu zorla değil, alışkanlıkla kurar.

---

## 5. Riskler ve karşı önlemler

| Risk | Önlem |
|---|---|
| Kopyalanma (başka biri aynı oyunu yapar) | Vaka bankası, lig geçmişi, yazar topluluğu ve marka ilk olanda kalır. Hızlı lansman en iyi savunma. |
| İçerik tükenmesi | Günde 1 vaka, 60 vaka ile 2 ay. Yazar rozeti ilk ay içinde gönderim akışını açar. |
| Klinik doğruluk tartışması | Her vakada kaynak ve hakem adı. "Tartış" butonu ile yorum; itirazlar vakayı iyileştirir, zarar vermez. |
| Hasta gizliliği | Yalnızca kompozit/öğretici vaka kabul edilir; form bunu zorunlu kılar. |
| Günlük oyun sıkıcılaşır | Cuma Ligi, Odyogramı Çiz modu, mevsimlik temalar (Mart: Dünya İşitme Günü haftası özel serisi). |
| Yalnızca öğrenciler oynar | Klinik vakalar (cihaz uygulaması, vestibüler, implant) çalışan odyoloğu çeker. Hoca modu akademisyeni çeker. |

---

## 6. Başarı tanımı

- 30. gün: 2.000 günlük oyuncu, 20 üniversite ligde, 100 kullanıcı gönderimli vaka.
- 90. gün: 10.000 günlük oyuncu, 3 ülke, ilk akademik ders planında kullanım.
- 180. gün: 25.000 aiHearX hesabı, vaka arşivi 200+, ilk iş ilanı geliri.

Metrik tanımları ve lansman takvimi: [`03-mvp-ve-lansman.md`](03-mvp-ve-lansman.md)
