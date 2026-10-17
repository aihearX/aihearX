import { gradients, type Gradient } from '@/core/theme';

export type TypeId = 'dedektif' | 'sihirbaz' | 'pediatri' | 'vestibuler' | 'arastirmaci' | 'danisman';

export type OdyoType = {
  id: TypeId;
  name: string;
  nameSuffix: string;
  emoji: string;
  gradient: Gradient;
  description: string;
  strength: string;
  watchOut: string;
  ideal: string;
  compatible: TypeId;
};

export const TYPES: Record<TypeId, OdyoType> = {
  dedektif: {
    id: 'dedektif', name: 'Vaka Dedektifi', nameSuffix: 'Vaka Dedektifiyim', emoji: '🔍', gradient: gradients.violet,
    description: 'Odyogramda tutarsız bir nokta gördüğünde içinde bir alarm çalar. Hastanın hikâyesini, timpanogramı ve refleksleri yan yana koyup bulmacayı çözmeden rahat edemezsin. Herkesin "normal" dediği vakada gizli bir ipucu bulan sensin.',
    strength: 'Ayrıntıya dikkat ve sabırlı düşünme. Karmaşık vakalarda ekibin başvurduğu kişi.',
    watchOut: 'Her vaka bir bulmaca değil; bazen hasta sadece dinlenmek ister. Aşırı analiz seni yorabilir.',
    ideal: 'Üniversite hastanesi, zor vakaların toplandığı tanı kliniği.',
    compatible: 'arastirmaci',
  },
  sihirbaz: {
    id: 'sihirbaz', name: 'Cihaz Sihirbazı', nameSuffix: 'Cihaz Sihirbazıyım', emoji: '🪄', gradient: gradients.ocean,
    description: 'Bir işitme cihazının "uğultusunu" dokunmadan tahmin edersin. Yazılım, kazanç eğrileri ve kulak kalıplarıyla aran çok iyidir. Hastanın yüzündeki o "ilk kez net duydum" ifadesi senin en büyük ödülündür.',
    strength: 'Teknik ustalık ve pratik çözüm. Cihazı hastaya değil, hastayı cihaza uydurmazsın.',
    watchOut: 'Her sorun bir ayar sorunu değil; bazen beklenti yönetimi en iyi "fitting"dir.',
    ideal: 'İşitme merkezi, cihaz firmasının eğitim ekibi, implant programlama.',
    compatible: 'danisman',
  },
  pediatri: {
    id: 'pediatri', name: 'Pediatri Kahramanı', nameSuffix: 'Pediatri Kahramanıyım', emoji: '🧸', gradient: gradients.sunset,
    description: 'Ağlayan bir bebeği 30 saniyede oyuna çekebilirsin. Görsel pekiştireçli odyometri senin için bir sahne gösterisidir. Aileye güven vermekte ve ufak başarıları kutlamakta üstüne yoktur.',
    strength: 'Sabır, yaratıcılık ve sıcaklık. Çocuklar ve aileler seni ilk görüşte sever.',
    watchOut: 'Duygusal yük birikebilir; kendine de bakmayı unutma.',
    ideal: 'Çocuk hastanesi, yenidoğan işitme taraması, erken müdahale programları.',
    compatible: 'danisman',
  },
  vestibuler: {
    id: 'vestibuler', name: 'Vestibüler Dengeleyici', nameSuffix: 'Vestibüler Dengeleyiciyim', emoji: '🌀', gradient: gradients.mint,
    description: 'Baş dönmesi anlatan bir hastaya "hangi yöne dönüyor?" diye sormadan duramazsın. Nistagmusu okur, manevrayı uygular, hastayı ayağa kaldırırsın. Kaos içinde sakin kalan tipsin.',
    strength: 'Soğukkanlılık ve sistemli yaklaşım. Panik anında bile adım adım ilerlersin.',
    watchOut: 'Her şeyi tek başına dengelemeye çalışma; ekibe güven.',
    ideal: 'Denge laboratuvarı, KBB ile ortak vestibüler rehabilitasyon ünitesi.',
    compatible: 'dedektif',
  },
  arastirmaci: {
    id: 'arastirmaci', name: 'Araştırmacı Bilim İnsanı', nameSuffix: 'Araştırmacı Bilim İnsanıyım', emoji: '🔬', gradient: gradients.brand,
    description: '"Neden böyle?" sorusu seni hiç bırakmaz. Bir makaleyi okuyup ertesi gün klinikte denersin. Veri, grafik ve yeni yöntemler seni heyecanlandırır; alanın geleceğini sen yazarsın.',
    strength: 'Merak ve kanıta dayalı düşünme. Alışkanlıkları sorgular, pratiği ileri taşırsın.',
    watchOut: 'Mükemmel yöntemi beklerken hastanın bugünkü ihtiyacını kaçırma.',
    ideal: 'Üniversite, araştırma laboratuvarı, klinik çalışmalar.',
    compatible: 'dedektif',
  },
  danisman: {
    id: 'danisman', name: 'Danışmanlık Ustası', nameSuffix: 'Danışmanlık Ustasıyım', emoji: '💬', gradient: gradients.gold,
    description: 'Hasta odadan çıkarken hem sonucu anlamış hem de kendini iyi hissetmiştir. Zor haberi nasıl vereceğini bilirsin; dinlersin, sadeleştirirsin, umut verirsin. İnsanlar seni yıllar sonra hatırlar.',
    strength: 'Empati ve iletişim. Teknik sonucu insan diline çevirirsin.',
    watchOut: 'Herkesi memnun etmeye çalışırken sınır koymayı unutma.',
    ideal: 'Danışmanlık odası, rehabilitasyon, aile eğitimi, hasta derneği.',
    compatible: 'sihirbaz',
  },
};

export const TYPE_ORDER: TypeId[] = ['dedektif', 'sihirbaz', 'pediatri', 'vestibuler', 'arastirmaci', 'danisman'];

export type Question = { q: string; answers: { text: string; type: TypeId }[] };

export const QUESTIONS: Question[] = [
  { q: 'Hasta "cihaz uğulduyor" dedi. İlk hareketin?', answers: [
    { text: 'Cihazı alıp bilgisayara bağlarım, geri besleme eğrisine bakarım', type: 'sihirbaz' },
    { text: '"Ne zaman, hangi ortamda?" diye sorgulamaya başlarım', type: 'dedektif' },
    { text: 'Önce "Bu sizi çok rahatsız etmiş olmalı" derim, sonra bakarım', type: 'danisman' },
    { text: 'Literatürde bu şikâyetin en sık nedeni neydi diye hatırlarım', type: 'arastirmaci' },
  ] },
  { q: 'Boş bir öğleden sonran var. Ne yaparsın?', answers: [
    { text: 'Yeni bir makale okurum', type: 'arastirmaci' },
    { text: 'Geçen haftanın garip vakasını tekrar düşünürüm', type: 'dedektif' },
    { text: 'Oyuncak dolabını yeniden düzenlerim', type: 'pediatri' },
    { text: 'Denge rehabilitasyon egzersiz videosu hazırlarım', type: 'vestibuler' },
  ] },
  { q: 'Odada 3 yaşında bir çocuk ağlıyor. Sen?', answers: [
    { text: 'Elimde bir kukla belirir, ağlama 20 saniyede biter', type: 'pediatri' },
    { text: 'Anneyle konuşup çocuğu sakinleştirmesine yardım ederim', type: 'danisman' },
    { text: 'Ortamdaki gürültüyü ve ışığı azaltırım', type: 'vestibuler' },
    { text: 'Oyun odyometrisi için düzeneği hızlıca kurarım', type: 'sihirbaz' },
  ] },
  { q: 'Baş dönmesi anlatan bir hasta geldi. Aklından ilk geçen?', answers: [
    { text: '"Hangi yöne dönüyor, kaç saniye sürüyor?"', type: 'vestibuler' },
    { text: '"İşitme kaybı da var mı? Bu bir bulmaca."', type: 'dedektif' },
    { text: '"Ne kadar korkmuş olmalı, önce rahatlatayım."', type: 'danisman' },
    { text: '"Bunu bir vaka raporu yapsam?"', type: 'arastirmaci' },
  ] },
  { q: 'Ekipte en çok hangi lakapla anılırsın?', answers: [
    { text: 'Teknik Destek', type: 'sihirbaz' },
    { text: 'Sherlock', type: 'dedektif' },
    { text: 'Çocukların Favorisi', type: 'pediatri' },
    { text: 'Ekibin Psikoloğu', type: 'danisman' },
  ] },
  { q: 'Bir hastaya zor bir sonuç söylemen gerekiyor. Nasıl yaparsın?', answers: [
    { text: 'Oturur, göz teması kurar, sade kelimeler seçerim', type: 'danisman' },
    { text: 'Odyogramı birlikte adım adım yorumlarız', type: 'dedektif' },
    { text: 'Hemen çözümü anlatırım: "Şu cihazla şu kadar fark olur"', type: 'sihirbaz' },
    { text: 'Güncel çalışmalardan umut verici verileri paylaşırım', type: 'arastirmaci' },
  ] },
  { q: 'Hayalindeki iş ortamı?', answers: [
    { text: 'Rengârenk bir çocuk kliniği', type: 'pediatri' },
    { text: 'Son teknoloji bir cihaz laboratuvarı', type: 'sihirbaz' },
    { text: 'Döner sandalyeli, videonistagmografi cihazlı bir denge ünitesi', type: 'vestibuler' },
    { text: 'Verilerin aktığı bir araştırma merkezi', type: 'arastirmaci' },
  ] },
  { q: 'Bir arkadaşın "kulağım çınlıyor" dedi. Cevabın?', answers: [
    { text: '"Anlat bakalım, ne zaman başladı, tek taraflı mı?"', type: 'dedektif' },
    { text: '"Uyku, kahve, stres... birlikte bir plan yapalım"', type: 'danisman' },
    { text: '"Gürültü maskeleyici bir uygulama kuralım hemen"', type: 'sihirbaz' },
    { text: '"İlginç, son çalışmalar bunu şöyle açıklıyor..."', type: 'arastirmaci' },
  ] },
  { q: 'Seni en çok ne mutlu eder?', answers: [
    { text: 'Bir çocuğun ilk kez sese dönüp gülümsemesi', type: 'pediatri' },
    { text: 'Hastanın "artık düşmüyorum" demesi', type: 'vestibuler' },
    { text: 'Doğru ayarla hastanın yüzünün aydınlanması', type: 'sihirbaz' },
    { text: 'Kimsenin çözemediği vakayı çözmek', type: 'dedektif' },
  ] },
  { q: 'Seminerde hangi oturuma koşarsın?', answers: [
    { text: 'Yeni araştırma sonuçları', type: 'arastirmaci' },
    { text: 'Hasta iletişimi ve danışmanlık', type: 'danisman' },
    { text: 'Vestibüler değerlendirme atölyesi', type: 'vestibuler' },
    { text: 'Erken çocukluk müdahalesi', type: 'pediatri' },
  ] },
];

export function computeType(answers: TypeId[]): TypeId {
  const score: Record<TypeId, number> = { dedektif: 0, sihirbaz: 0, pediatri: 0, vestibuler: 0, arastirmaci: 0, danisman: 0 };
  answers.forEach((a) => { score[a] += 1; });
  let best: TypeId = TYPE_ORDER[0]!;
  for (const t of TYPE_ORDER) if (score[t] > score[best]) best = t;
  return best;
}
