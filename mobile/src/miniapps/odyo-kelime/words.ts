/**
 * OdyoKelime sözlüğü. Tümü büyük harf, 5 harfli, Türkçe karakterli (İ/I ayrımı korunur).
 * Hedef kelimeler: işitme, KBB, anatomi, ses fiziği ve klinik terimleri.
 */
export const TARGET_WORDS: readonly string[] = [
  'KULAK', 'SİNİR', 'KANAL', 'ORGAN', 'TONUS', 'SKALA', 'DALGA', 'HERTZ', 'MASKE', 'SESLİ',
  'DUYMA', 'DUYUM', 'PERDE', 'OKTAV', 'YANKI', 'KEMİK', 'ÇEKİÇ', 'TÜYLÜ', 'HÜCRE', 'BAZAL',
  'APEKS', 'BUŞON', 'DENGE', 'SAKÜL', 'SİNÜS', 'BURUN', 'BOĞAZ', 'GENİZ', 'DAMAK', 'POLİP',
  'TÜMÖR', 'KİTLE', 'NÖRON', 'AKSON', 'BEYİN', 'TEPKİ', 'YANIT', 'ÖLÇÜM', 'ÖLÇEK', 'ÖLÇÜT',
  'DEĞER', 'DÜZEY', 'CİHAZ', 'KALIP', 'ALICI', 'KABLO', 'SEANS', 'HASTA', 'HEKİM', 'KABİN',
  'ÜNSÜZ', 'DÜŞÜŞ', 'KAYIP', 'ALÇAK', 'HAFİF', 'İLERİ', 'AYGIT', 'SONDA', 'TIKAÇ', 'ORTAM',
  'SİREN', 'KORNA', 'DARBE', 'KEPÇE', 'LOBÜL', 'FOSSA', 'VAGUS', 'ANKET', 'SAPMA', 'RAPOR',
  'DOĞUM', 'BEBEK', 'YAŞLI', 'ÇOCUK', 'SÖZEL', 'DUDAK', 'MİMİK', 'MÜZİK', 'RİTİM', 'TEMPO',
  'DAVUL', 'KISIK', 'BOĞUK', 'KALIN', 'YUTMA', 'NEZLE', 'YÜZME', 'DALIŞ', 'KORTİ', 'KAYIT',
  'İZLEM', 'İŞLEM', 'BİLİŞ', 'ZİHİN', 'SONAR', 'DÖNGÜ', 'KÜTLE', 'HACİM', 'SAĞIR', 'ÇATAL',
  'RİNNE', 'TARAF', 'KARŞI', 'GEÇİŞ', 'KAÇAK', 'ISLIK', 'SİLAH', 'DİSKO', 'ZURNA', 'KEMAN',
  'GİTAR', 'TENOR', 'VURGU', 'FONEM', 'CÜMLE', 'LİSTE', 'İDRAK', 'ZEHİR', 'DAMAR', 'KUVÖZ',
  'DİNLE', 'KONUŞ', 'BAĞIR', 'ŞARKI', 'ALARM', 'UYARI', 'TABLO', 'DOSYA', 'KANÜL', 'SAHNE',
  'DÜĞÜN', 'KAVAL', 'METRO', 'SALON', 'MOTOR', 'TÜFEK', 'ÇİZGİ', 'ÖRNEK', 'HESAP',
];

/** Tahmin olarak kabul edilen ek günlük kelimeler. */
export const COMMON_WORDS: readonly string[] = [
  'ARABA', 'BAHÇE', 'BALIK', 'BARIŞ', 'BAYAN', 'BEYAZ', 'BİLGİ', 'BULUT', 'ÇİÇEK', 'ÇANTA',
  'ÇORAP', 'DENİZ', 'DÜNYA', 'EKMEK', 'FİKİR', 'GÜNEŞ', 'GÜZEL', 'HAVUÇ', 'HAYAT', 'HAYAL',
  'İNSAN', 'KADIN', 'KAHVE', 'KALEM', 'KAPAK', 'KAVUN', 'KİTAP', 'KÖPEK', 'KUMAŞ', 'LİMON',
  'MASAL', 'MEYVE', 'MUTLU', 'ORMAN', 'PAMUK', 'PARÇA', 'SABAH', 'SAHİL', 'SALÇA', 'SEBZE',
  'SEPET', 'SOKAK', 'ŞEHİR', 'ŞEKER', 'TARİH', 'TAVUK', 'TOPUK', 'TURŞU', 'YAZAR', 'YEMEK',
  'YOLCU', 'ZAMAN', 'ZEMİN', 'AKŞAM', 'TEYZE', 'ÖĞLEN', 'YARIN', 'BUGÜN', 'HAFTA', 'NİSAN',
  'MAYIS', 'EYLÜL', 'KASIM', 'ŞUBAT', 'YEŞİL', 'SİYAH', 'PEMBE', 'BİLET', 'DUVAR', 'TAVAN',
  'TABAN', 'DOLAP', 'HAVLU', 'SABUN', 'FIRÇA', 'TARAK', 'ÇEŞME', 'CADDE', 'KÖPRÜ', 'TÜNEL',
  'TAKSİ', 'VAPUR', 'LAMBA', 'BİBER', 'SOĞAN', 'ÇİLEK', 'İNCİR', 'VİŞNE', 'CEVİZ', 'BADEM',
  'SICAK', 'SOĞUK', 'SERİN', 'NEHİR', 'TOHUM', 'ÇİMEN', 'KOYUN', 'HOROZ', 'ÖRDEK', 'YILAN',
  'SİNEK', 'ASLAN', 'TİLKİ', 'GEYİK', 'ZEBRA', 'PANDA', 'KOALA', 'YUNUS', 'KİRAZ', 'ARMUT',
  'ELMAS', 'KIRIK', 'DOĞRU', 'SAHTE', 'DERİN', 'GİRİŞ', 'ÇIKIŞ', 'MEZUN', 'YAPAY', 'ESNEK',
];

const ALLOWED = new Set<string>([...TARGET_WORDS, ...COMMON_WORDS]);
export const isAllowed = (w: string): boolean => ALLOWED.has(w);
