/** Her mini uygulama için "Nasıl çalışır?" üç adımı. Giriş ekranında gösterilir. */
export const HOW_IT_WORKS: Record<string, [string, string, string]> = {
  'koklea-kosusu': ['Odi kokleanın içinde kendiliğinden koşar', 'Dokun: zıpla; aşağı kaydır: kay; gürültü dikenlerinden kaç', 'Frekans jetonlarını topla, derine indikçe renk ve ses değişir'],
  'kulak-yolculugu': ['Sesi dış kulaktan beyne taşı: 4 bölüm', 'Sol/sağ basılı tut, zıpla butonuna dokun', 'Kulak zarı trambolin, kemikçikler platform, koklea su altı'],
  'zar-ziplamasi': ['Odi kendiliğinden zıplar; sen sağa sola yönlendir', 'Kemikçik, zar ve kıl hücresi platformlarına tutun', 'Kulak kanalından işitme sinirine kadar tırman'],
  'ses-dedektifi': ['Gizemli bir ses çalar', 'Dört seçenekten doğrusunu süre bitmeden seçersin', 'Kombo yap, seviye atla, rütbeni paylaş'],
  'ton-hafizasi': ['Pedler sırayla ses çıkarır', 'Diziyi aynı sırayla tekrarlarsın', 'Her tur bir nota eklenir; ileri seviyede sadece kulağınla'],
  'perde-duellosu': ['İki ton çalar', 'Hangisi daha ince, hızlıca seç', 'Fark küçüldükçe puan artar; arkadaşınla düello yap'],
  'gurultu-avcisi': ['Gürültü içinde üç rakam söylenir', 'Rakamları tuşlarsın', 'Doğru bildikçe gürültü artar; nereye kadar dayanırsın?'],
  'kulagin-kac-yasinda': ['Kulaklık takarsın, sesi yarıya alırsın', 'İnce tonlar çalar, duyduğuna "duydum" dersin', 'Yaklaşık kulak yaşın çıkar; kartı paylaşırsın'],
  'odyogramle': ['Günün vakası: odyogram + öykü, 6 tahmin, her yanlışta yeni ipucu', 'Arşivden 40 vakayı çöz, tartışmaya götür', 'Antrenman modunda süreye karşı odyogram yorumla, rütbe kazan'],
  'maskeleme-ustasi': ['İki kulağın eşiklerini girersin', 'Maskeleme gerekli mi, kaç dB ile başlanır hesaplanır', 'Formülü adım adım görürsün; pratik moduyla çalışırsın'],
  'anket-merkezi': ['HHIE-S, THI veya DHI seçersin', 'Soruları tek tek cevaplarsın', 'Puan, yorum ve klinisyene gönderilecek kart çıkar'],
  'cinlama-eslestir': ['"Daha ince / daha kalın" diyerek çınlamanı bulursun', 'Şiddetini ve tipini kaydedersin', 'Ses terapisi dinler, profili odyoloğuna gösterirsin'],
  'denge-gunlugu': ['Baş dönmesi atağını 30 saniyede kaydedersin', 'Tetikleyici ve belirtileri işaretlersin', '30 günlük özet hekimine hazır gelir'],
};
export const howItWorks = (id: string): [string, string, string] | undefined => HOW_IT_WORKS[id];
