# Vaka Bankası: Şema ve İlk 14 Gün

Tüm vakalar **öğretici kompozit** vakalardır; gerçek hasta verisi değildir.
Eşikler dB HL, frekanslar Hz. `null` = ölçülmedi / maskeleme sorunu.

## 1. Vaka JSON şeması

```json
{
  "id": 1,
  "author": { "name": "aiHearX ekibi", "school": null },
  "difficulty": 1,
  "history": {
    "tr": "68 yaşında erkek. Kalabalık ortamda konuşmaları anlamakta zorlanıyor. Çınlama var. Gürültü maruziyeti yok.",
    "en": "68-year-old male. Difficulty understanding speech in noise. Tinnitus. No noise exposure."
  },
  "audiogram": {
    "freqs": [250, 500, 1000, 2000, 4000, 8000],
    "right": { "ac": [15, 20, 25, 40, 55, 70], "bc": [15, 20, 25, 40, 55, null] },
    "left":  { "ac": [15, 20, 30, 40, 60, 70], "bc": [15, 20, 30, 40, 60, null] }
  },
  "tympanogram": { "right": "A", "left": "A" },
  "hints": [
    { "type": "reflex",  "tr": "Akustik refleksler bilateral 1–2 kHz'de mevcut, 4 kHz'de alınamadı.", "en": "..." },
    { "type": "speech",  "tr": "SRT sağ 25 / sol 30 dB HL. WRS sağ %76, sol %72.", "en": "..." },
    { "type": "oae",     "tr": "DPOAE 2 kHz üzerinde bilateral alınamadı.", "en": "..." },
    { "type": "abr",     "tr": "ABR: dalga V latansları bilateral simetrik, normal sınırlarda.", "en": "..." },
    { "type": "imaging", "tr": "Görüntüleme istenmedi.", "en": "..." }
  ],
  "answer": "presbycusis",
  "answer_category": "sensorineural",
  "laterality": "bilateral",
  "key_freqs": [2000, 4000, 8000],
  "explanation": {
    "tr": "Bilateral, simetrik, yüksek frekanslara doğru eğimli sensörinöral kayıp; yaşa bağlı. Konuşmayı ayırt etme skorlarının eşiklerle uyumlu olması retrokoklear patolojiyi düşündürmez.",
    "en": "..."
  },
  "source": "Katz, Handbook of Clinical Audiology, 7th ed."
}
```

Alanlar:

- `answer`: tanı listesindeki sabit anahtar (dil bağımsız).
- `answer_category`: `conductive` · `sensorineural` · `mixed` · `retrocochlear` · `functional` · `normal`. Sarı kare için kullanılır.
- `laterality`: `right` · `left` · `bilateral`. Turuncu kare için.
- `key_freqs`: Emoji odyogramda "kilitlenen" frekanslar; kaybın ağırlık merkezi.
- `difficulty`: 1 (öğrenci) – 3 (Cuma Ligi).

## 2. İlk 14 günün vakaları (özet)

| Gün | Tanı | Öne çıkan ipucu | Zorluk |
|---|---|---|---|
| 1 | Presbiakuzi | Bilateral simetrik eğimli SNHL, tip A | 1 |
| 2 | Gürültüye bağlı işitme kaybı | 4 kHz'de çentik, öyküde fabrika | 1 |
| 3 | Efüzyonlu otitis media (çocuk) | Düz iletim tipi kayıp, tip B timpanogram, normal kanal hacmi | 1 |
| 4 | Otoskleroz | Hava-kemik aralığı, 2 kHz'de Carhart çentiği, tip As, refleksler yok | 2 |
| 5 | Ménière hastalığı | Tek taraflı alçak frekans yükselen SNHL, dalgalanma, vertigo öyküsü | 2 |
| 6 | Ani sensörinöral işitme kaybı | Tek taraflı, 3 gün önce başlamış, aciliyet vurgusu | 1 |
| 7 (Cuma) | Vestibüler schwannom | Asimetrik SNHL, eşiklere göre beklenenden kötü WRS, refleks çürümesi, ABR V latans gecikmesi | 3 |
| 8 | Timpanik membran perforasyonu | Tip B, **büyük** kanal hacmi; iletim tipi | 1 |
| 9 | Ototoksisite | Kemoterapi öyküsü, bilateral yüksek frekans, seri odyogramda ilerleme | 2 |
| 10 | Normal işitme (tuzak) | Eşikler 20 dB içinde; şikâyet gürültüde anlama; "gizli işitme kaybı" tartışması | 2 |
| 11 | Nonorganik işitme kaybı | SRT ile saf ses ortalaması uyumsuz, Stenger pozitif | 2 |
| 12 | İşitsel nöropati spektrum bozukluğu | OAE mevcut, ABR yok; bebek | 2 |
| 13 | Süperior semisirküler kanal dehisansı | Alçak frekans hava-kemik aralığı, refleksler **mevcut**, ses kaynaklı vertigo | 3 |
| 14 (Cuma) | Kolesteatom | İletim tipi kayıp, kötü kokulu akıntı, tip B, hazırlık: cerrahi öncesi değerlendirme | 3 |

Tuzak vaka (10. gün) kasıtlıdır: "her odyogramda kayıp vardır" refleksini kırar
ve "Normal işitme" seçeneğini anlamlı kılar. Paylaşımda en çok konuşulan gün
olması beklenir.

## 3. Tanı anahtarları (ilk sürüm, 24 tanı)

```
presbycusis, noise_induced, otosclerosis, meniere, ssnhl, vestibular_schwannoma,
otitis_media_effusion, tm_perforation, cholesteatoma, ototoxicity, sscd, ansd,
nonorganic, congenital_cmv, evas, otitis_externa, cerumen, ossicular_discontinuity,
post_meningitis, normal, acute_otitis_media, chronic_otitis_media,
noise_acoustic_trauma, auditory_processing_disorder
```

Türkçe ve İngilizce etiketler `i18n/diagnoses.json` dosyasında tutulur; aynı
tanının eş anlamlıları (örn. "akustik nörinom" = "vestibüler schwannom")
aramada aynı anahtara çözülür.
