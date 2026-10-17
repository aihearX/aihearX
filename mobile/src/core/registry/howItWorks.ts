/** Her mini uygulama için "Nasıl çalışır?" üç adımı. Giriş ekranında gösterilir; kullanıcı ne yapacağını önceden bilir. */
export const HOW_IT_WORKS: Record<string, [string, string, string]> = {
  'odyogram-okulu': ['Bir odyogram görürsün', 'Tip, derece veya konfigürasyonu seçersin', 'Anında açıklama ve 10 soruluk skor'],
  'maskeleme-ustasi': ['İki kulağın eşiklerini girersin', 'Maskeleme gerekli mi, kaç dB ile başlanır hesaplanır', 'Formülü adım adım görürsün; pratik moduyla çalışırsın'],
  'timpanogram-atlasi': ['Üç kaydırıcıyla eğriyi kendin çizersin', 'Tip (A, As, Ad, B, C) anında belirir', 'Tahmin modunda 10 eğriyi sınıflarsın'],
  'odyo-kartlar': ['Bugün sana düşen 15 kart gelir', 'Kartı çevirir, "bildim / bilemedim" dersin', 'Bilmediklerin daha sık, bildiklerin daha seyrek döner'],
  'kazanc-hedefi': ['Eşikleri gir ya da hazır profil seç', 'Frekans frekans hedef kazanç çizilir', 'Hastaya anlatacağın iki cümle hazır gelir'],
  'anket-merkezi': ['HHIE-S, THI veya DHI seçersin', 'Soruları tek tek cevaplarsın', 'Puan, yorum ve klinisyene gönderilecek kart çıkar'],
  'frekans-avi': ['Bir ton çalar', 'Dört frekanstan doğrusunu seçersin', '10 tur, 3 can, kombo ile puan'],
  'desibel-dedektifi': ['Gündelik bir ses gösterilir', 'Kaç desibel olduğunu tahmin edersin', 'Yakınlığa göre puan ve güvenli süre bilgisi'],
  'odyo-kelime': ['Günün 5 harfli odyoloji kelimesi', '6 denemede bulursun', 'Renkli ızgarayı paylaşırsın'],
  'odyogramle': ['Günün vakası: odyogram + öykü', '6 tahmin, her yanlışta yeni ipucu', 'Emoji odyogramını paylaşırsın'],
  'kulak-refleksi': ['Kulaklık takarsın', 'Ses hangi kulaktan geldiyse o tarafa dokunursun', 'Tepki süren ve doğruluğun ölçülür'],
  'haftalik-lig': ['Oynadıkça okuluna puan gider', 'Üniversite ve oyuncu sıralamasını görürsün', 'Her pazartesi sıfırlanır'],
  'kulagin-kac-yasinda': ['Kulaklık takarsın, sesi yarıya alırsın', '9 ince ton çalar, duyduğuna evet dersin', 'Yaklaşık kulak yaşın çıkar; kartı paylaşırsın'],
  'konusma-muzu': ['Konuşma seslerinin haritasını görürsün', 'Bir işitme kaybı profili seçersin', 'Hangi harflerin kaybolduğunu duyar ve görürsün'],
  'cinlama-eslestir': ['"Daha ince / daha kalın" diyerek çınlamanı bulursun', 'Şiddetini ve tipini kaydedersin', 'Ses terapisi dinler, profili odyoloğuna gösterirsin'],
  'denge-gunlugu': ['Baş dönmesi atağını 30 saniyede kaydedersin', 'Tetikleyici ve belirtileri işaretlersin', '30 günlük özet hekimine hazır gelir'],
  'gurultu-olcer': ['Mikrofon izni verirsin, ses kaydedilmez', '1 dakika ortam sesi ölçülür', 'Ortalama, tepe ve güvenli süre çıkar'],
  'hangi-odyolog': ['10 eğlenceli soru', 'Cevaplarına göre tipin bulunur', 'Sonuç kartını paylaşırsın'],
};
export const howItWorks = (id: string): [string, string, string] | undefined => HOW_IT_WORKS[id];
