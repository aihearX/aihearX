import type { NetUser, Post, Job, NetEvent, Comment, PostKind, CaseData, Poll } from './types';

/* ---------- zaman yardımcıları: içerik yüklendiği ana göre göreli ---------- */
const NOW = Date.now();
const H = 3600000;
const ago = (hours: number) => new Date(NOW - hours * H).toISOString();
const inDays = (days: number, hour = 10) => {
  const d = new Date(NOW + days * 24 * H);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/* ---------- kullanıcılar ---------- */
export const MOCK_USERS: NetUser[] = [
  { id: 'u1', name: 'Dr. Elif Kaya', handle: 'elifkaya', role: 'odyolog', title: 'Klinik Odyolog', university: 'Hacettepe Üniversitesi', city: 'Ankara', bio: 'Koklear implant programlama ve pediatrik odyoloji. Vaka paylaşmayı severim.', verified: true, followers: 1240, following: 310 },
  { id: 'u2', name: 'Mehmet Demir', handle: 'mehmetdemir', role: 'odyolog', title: 'İşitme Merkezi Sorumlusu', university: 'İstanbul Üniversitesi-Cerrahpaşa', city: 'İstanbul', bio: 'Cihaz uygulamaları, gerçek kulak ölçümü meraklısı.', verified: true, followers: 860, following: 420 },
  { id: 'u3', name: 'Zeynep Arslan', handle: 'zeyneparslan', role: 'ogrenci', title: '3. sınıf', university: 'Marmara Üniversitesi', city: 'İstanbul', bio: 'Odyoloji öğrencisi. Not paylaşırım, soru sorarım.', followers: 210, following: 390 },
  { id: 'u4', name: 'Prof. Dr. Ahmet Yıldız', handle: 'ahmetyildiz', role: 'kbb', title: 'KBB Anabilim Dalı', university: 'Ege Üniversitesi', city: 'İzmir', bio: 'Otoloji ve nörootoloji. Ani işitme kaybı üzerine çalışıyorum.', verified: true, followers: 2310, following: 140 },
  { id: 'u5', name: 'Ayşe Çelik', handle: 'aysecelik', role: 'odyometrist', title: 'Odyometrist', university: 'Sağlık Bilimleri Üniversitesi', city: 'Ankara', bio: 'Kabinde 9 yıl. Hastayla konuşmayı en çok seven kişi.', followers: 540, following: 275 },
  { id: 'u6', name: 'Burak Şahin', handle: 'buraksahin', role: 'ogrenci', title: '4. sınıf', university: 'Başkent Üniversitesi', city: 'Ankara', bio: 'Mezuniyete az kaldı. Staj ve iş arayışı modundayım.', followers: 180, following: 260 },
  { id: 'u7', name: 'Selin Koç', handle: 'selinkoc', role: 'odyolog', title: 'Uzman Odyolog', university: 'Dokuz Eylül Üniversitesi', city: 'İzmir', bio: 'Vestibüler değerlendirme ve rehabilitasyon.', verified: true, followers: 980, following: 300 },
  { id: 'u8', name: 'Hasan Öztürk', handle: 'hasanozturk', role: 'hasta', city: 'Bursa', bio: '2 yıldır çift taraflı işitme cihazı kullanıyorum. Deneyimlerimi paylaşıyorum.', followers: 95, following: 120 },
  { id: 'u9', name: 'Fatma Aydın', handle: 'fatmaaydin', role: 'aile', city: 'Konya', bio: 'Annemin işitme yolculuğunda yanındayım.', followers: 60, following: 140 },
  { id: 'u10', name: 'Can Yılmaz', handle: 'canyilmaz', role: 'ogrenci', title: '4. sınıf', university: 'Hacettepe Üniversitesi', city: 'Ankara', bio: 'Elektrofizyoloji meraklısı. ABR, ASSR, OAE.', followers: 320, following: 410 },
  { id: 'u11', name: 'Dr. Merve Doğan', handle: 'mervedogan', role: 'kbb', title: 'KBB Uzmanı', university: 'Gazi Üniversitesi', city: 'Ankara', bio: 'Pediatrik KBB. Efüzyonlu otit ve tüp takibi.', verified: true, followers: 1120, following: 210 },
  { id: 'u12', name: 'Emre Kurt', handle: 'emrekurt', role: 'odyometrist', title: 'Odyometrist', university: 'Üsküdar Üniversitesi', city: 'İstanbul', bio: 'Özel işitme merkezinde cihaz uygulaması yapıyorum.', followers: 410, following: 330 },
  { id: 'u13', name: 'Derya Polat', handle: 'deryapolat', role: 'odyolog', title: 'Pediatrik Odyolog', university: 'Bezmialem Vakıf Üniversitesi', city: 'İstanbul', bio: 'Yenidoğan işitme taraması ve erken müdahale.', verified: true, followers: 770, following: 290 },
  { id: 'u14', name: 'Oğuz Kara', handle: 'oguzkara', role: 'ogrenci', title: '2. sınıf', university: 'KTO Karatay Üniversitesi', city: 'Konya', bio: 'Yeni başladım, her şeyi merak ediyorum.', followers: 70, following: 190 },
  { id: 'u15', name: 'Nazlı Erdoğan', handle: 'nazlierdogan', role: 'odyolog', title: 'Odyolog', university: 'Akdeniz Üniversitesi', city: 'Antalya', bio: 'Tinnitus danışmanlığı ve ses terapisi.', followers: 630, following: 280 },
  { id: 'u16', name: 'Kemal Aksoy', handle: 'kemalaksoy', role: 'hasta', city: 'İzmir', bio: 'Emekli öğretmen. Üç aydır cihaz kullanıyorum, dünyam değişti.', followers: 120, following: 80 },
  { id: 'u17', name: 'Büşra Güneş', handle: 'busragunes', role: 'ogrenci', title: '3. sınıf', university: 'Ondokuz Mayıs Üniversitesi', city: 'Samsun', bio: 'Vestibüler sistem beni büyülüyor.', followers: 150, following: 230 },
  { id: 'u18', name: 'Dr. Serkan Taş', handle: 'serkantas', role: 'kbb', title: 'KBB Uzmanı', university: 'Çukurova Üniversitesi', city: 'Adana', bio: 'Otoloji cerrahisi. Koklear implant ekibi.', verified: true, followers: 890, following: 170 },
  { id: 'u19', name: 'Gamze Yücel', handle: 'gamzeyucel', role: 'odyometrist', title: 'Odyometrist', university: 'İstanbul Medipol Üniversitesi', city: 'İstanbul', bio: 'Timpanometri ve refleks testleri.', followers: 290, following: 310 },
  { id: 'u20', name: 'Yusuf Bozkurt', handle: 'yusufbozkurt', role: 'ogrenci', title: '1. sınıf', university: 'Karadeniz Teknik Üniversitesi', city: 'Trabzon', bio: 'Odyolojiye yeni adım attım.', followers: 40, following: 150 },
  { id: 'u21', name: 'İrem Özdemir', handle: 'iremozdemir', role: 'odyolog', title: 'Koklear İmplant Odyoloğu', university: 'İstanbul Aydın Üniversitesi', city: 'İstanbul', bio: 'Kİ programlama, 100+ hasta.', verified: true, followers: 1050, following: 240 },
  { id: 'u22', name: 'Halil Çetin', handle: 'halilcetin', role: 'denge', city: 'Gaziantep', bio: 'BPPV ile tanıştım, denge günlüğü tutuyorum.', followers: 55, following: 90 },
  { id: 'u23', name: 'Pınar Acar', handle: 'pinaracar', role: 'aile', city: 'Eskişehir', bio: 'Kızım 2 yaşında koklear implant oldu. Yolculuğumuzu paylaşıyorum.', followers: 340, following: 180 },
  { id: 'u24', name: 'Doç. Dr. Tolga Ünal', handle: 'tolgaunal', role: 'odyolog', title: 'Öğretim Üyesi', university: 'Ankara Üniversitesi', city: 'Ankara', bio: 'Odyoloji eğitimi, araştırma ve kongre organizasyonu.', verified: true, followers: 1780, following: 220 },
  { id: 'u25', name: 'Ece Karaca', handle: 'ecekaraca', role: 'ogrenci', title: '4. sınıf', university: 'Yeditepe Üniversitesi', city: 'İstanbul', bio: 'Tez dönemi. Tinnitus ve uyku ilişkisi.', followers: 160, following: 250 },
  { id: 'u26', name: 'Mustafa Eren', handle: 'mustafaeren', role: 'odyometrist', title: 'Odyometrist', university: 'Erciyes Üniversitesi', city: 'Kayseri', bio: 'Saha taramaları ve gönüllü projeler.', followers: 230, following: 200 },
  { id: 'u27', name: 'Sibel Tekin', handle: 'sibeltekin', role: 'odyolog', title: 'Odyolog', university: 'Pamukkale Üniversitesi', city: 'Denizli', bio: 'Pediatrik odyoloji ve aile danışmanlığı.', followers: 410, following: 260 },
  { id: 'u28', name: 'Berk Avcı', handle: 'berkavci', role: 'diger', city: 'Mersin', bio: 'Yazılımcıyım, kulak çınlamamı anlamaya çalışıyorum.', followers: 30, following: 70 },
];

/* ---------- gönderiler ---------- */
let pid = 0;
let cid = 0;
const c = (authorId: string, text: string, hoursAgo: number): Comment => ({ id: `c${++cid}`, authorId, text, createdAt: ago(hoursAgo) });

type PostInput = {
  authorId: string;
  kind: PostKind;
  text: string;
  hoursAgo: number;
  tags?: string[];
  likes?: number;
  comments?: Comment[];
  imageHint?: string;
  caseData?: CaseData;
  poll?: Poll;
};
const p = (i: PostInput): Post => ({
  id: `p${++pid}`,
  authorId: i.authorId,
  kind: i.kind,
  text: i.text,
  createdAt: ago(i.hoursAgo),
  tags: i.tags ?? [],
  likes: i.likes ?? 0,
  comments: i.comments ?? [],
  likedByMe: false,
  imageHint: i.imageHint,
  caseData: i.caseData,
  poll: i.poll,
});

export const MOCK_POSTS: Post[] = [
  // --- vakalar ---
  p({
    authorId: 'u1', kind: 'vaka', hoursAgo: 3, likes: 48, tags: ['SNİK', 'presbiakuzi', 'fitting'],
    text: '62 yaş erkek, 3 yıldır ilerleyen bilateral işitme kaybı, ailede öykü var. Yüksek frekans ağırlıklı sensörinöral kayıp. Konuşmayı ayırt etme %72/%76. Siz olsanız ilk cihaz uygulamasında hangi fitting formülüyle başlardınız?',
    caseData: { history: '62 E, bilateral, ilerleyici, aile öyküsü +', audiogram: { right: { ac: [20, 25, 35, 50, 65, 75] }, left: { ac: [15, 25, 30, 45, 60, 70] } } },
    comments: [c('u2', 'NAL-NL2 ile başlar, gerçek kulak ölçümüyle doğrularım. Yüksek frekanslarda hedefe ulaşamazsan frekans düşürme düşünülebilir.', 2), c('u12', 'Konuşma ayırt etme iyi, cihazdan fayda görür. İlk hafta hedefin %80\'i ile başlayıp kademeli artırıyoruz.', 1)],
  }),
  p({
    authorId: 'u4', kind: 'vaka', hoursAgo: 20, likes: 96, tags: ['ani işitme kaybı', 'steroid', 'acil'],
    text: '34 yaş kadın, sol kulakta ani işitme kaybı ve dolgunluk hissi; 48 saat içinde başvurdu. Vertigo yok, tinnitus var. Sistemik steroid başlandı, 1 hafta sonra kontrol odyogramı planlandı. Bu tabloda intratimpanik enjeksiyonu ilk basamakta tercih eden var mı?',
    caseData: { history: '34 K, sol, ani, 48 saat', audiogram: { right: { ac: [10, 10, 15, 15, 20, 20] }, left: { ac: [55, 60, 65, 60, 55, 50] } } },
    comments: [c('u18', 'Sistemik + intratimpanik kombinasyonu bizde standart oldu; erken başvuru büyük avantaj.', 15), c('u11', 'Kontrolde 10 dB ve üzeri kazanç yoksa kurtarma tedavisi için beklemeyin.', 12)],
  }),
  p({
    authorId: 'u13', kind: 'vaka', hoursAgo: 46, likes: 71, tags: ['pediatrik', 'iletim tipi', 'efüzyon'],
    text: '7 yaş erkek, okulda "duymuyor, dikkati dağınık" şikayetiyle geldi. Bilateral iletim tipi kayıp, timpanogram tip B, refleksler alınamadı. Efüzyonlu otit düşünüyoruz; KBB ile birlikte takip. Öğretmene yazılı bilgilendirme verdik, sınıfta ön sıra önerdik.',
    caseData: { history: '7 E, bilateral, timp tip B', audiogram: { right: { ac: [40, 40, 35, 30, 25, 20], bc: [5, 5, 5, 5, 10, 10] }, left: { ac: [35, 40, 35, 30, 25, 20], bc: [5, 5, 5, 10, 10, 10] } } },
    comments: [c('u11', '3 ay izlem + tekrar timpanometri. Dil gelişimi etkileniyorsa tüp kararı erken alınabilir.', 40)],
  }),
  p({
    authorId: 'u7', kind: 'vaka', hoursAgo: 70, likes: 55, tags: ['gürültü', 'mesleki', '4 kHz çentiği'],
    text: '45 yaş erkek, 18 yıldır metal atölyesinde. Klasik 4 kHz çentiği. Koruyucu ekipman kullanmıyormuş. Odyogramı görünce "o kadar da kötü değilmiş" dedi; işyerine rapor ve kulak koruyucu eğitimi planlandı.',
    caseData: { history: '45 E, 18 yıl gürültü maruziyeti', audiogram: { right: { ac: [15, 15, 20, 25, 55, 35] }, left: { ac: [15, 20, 20, 30, 60, 40] } } },
  }),
  p({
    authorId: 'u18', kind: 'vaka', hoursAgo: 100, likes: 40, tags: ['tinnitus', 'presbiakuzi', 'maskeleme'],
    text: '70 yaş kadın, bilateral presbiakuzi ve 2 yıldır sürekli tinnitus. Uyku bozukluğu var. Cihaz + tinnitus ses üreteci kombinasyonu ile başladık. 1. ayda THI skoru 58→41. Ses terapisine devam.',
    caseData: { history: '70 K, presbiakuzi + tinnitus', audiogram: { right: { ac: [30, 35, 40, 50, 60, 70] }, left: { ac: [30, 35, 45, 55, 65, 70] } } },
    comments: [c('u15', 'THI düşüşü güzel. Uyku için gece düşük seviye geniş bant ses önerebilirsiniz.', 90)],
  }),
  p({
    authorId: 'u24', kind: 'vaka', hoursAgo: 150, likes: 83, tags: ['asimetrik', 'retrokoklear', 'MR'],
    text: 'Asimetrik sensörinöral kayıp, sağ kulak belirgin. Konuşma ayırt etme sağda beklenenden düşük (%48). Refleks çürümesi pozitif. Retrokoklear patoloji ekartasyonu için MR istendi. Asimetri kriterlerinizi hatırlatma: 1-2-4 kHz ortalamasında ≥15 dB fark.',
    caseData: { history: 'Asimetrik SNİK, sağ', audiogram: { right: { ac: [35, 45, 55, 65, 70, 75] }, left: { ac: [15, 15, 20, 25, 30, 35] } } },
    comments: [c('u4', 'ABR dalga V latans farkı da yardımcı olur ama MR altın standart.', 140)],
  }),
  p({
    authorId: 'u11', kind: 'vaka', hoursAgo: 200, likes: 64, tags: ['otoskleroz', 'Carhart', 'cerrahi'],
    text: 'Otoskleroz şüphesi: 38 yaş kadın, bilateral iletim tipi kayıp, kemik yolunda 2 kHz\'de Carhart çentiği, refleksler alınamıyor, timpanogram tip As. Stapedotomi için konsey. Odyologlara soru: cerrahi öncesi cihaz denemesini öneriyor musunuz?',
    caseData: { history: '38 K, bilateral, tip As', audiogram: { right: { ac: [45, 45, 40, 45, 40, 35], bc: [10, 10, 15, 25, 15, 10] }, left: { ac: [40, 40, 40, 45, 35, 30], bc: [5, 10, 15, 25, 10, 10] } } },
  }),

  // --- sorular ---
  p({ authorId: 'u3', kind: 'soru', hoursAgo: 5, likes: 22, tags: ['maskeleme', 'sınav'], text: 'Maskeleme kurallarını nasıl ezberlediniz? İnteraural atenüasyon değerlerini (hava 40, kemik 0, insert 55?) sürekli karıştırıyorum. Akılda kalıcı bir yöntemi olan var mı?', comments: [c('u5', 'Şöyle kodladım: Kulaklık Kırk, İnsert Elli beş, Kemik sıfır. KKİEKS 😄', 4), c('u10', 'Hesaplamayı 10 vaka üzerinde elle yapınca oturuyor, ezber işe yaramıyor.', 3)] }),
  p({ authorId: 'u6', kind: 'soru', hoursAgo: 9, likes: 31, tags: ['kariyer', 'yeni mezun'], text: 'Mezuniyet yaklaşıyor. Sizce yeni mezun bir odyolog için ilk iş yeri hangisi daha öğretici?', poll: { options: ['Üniversite hastanesi', 'Özel işitme merkezi', 'Devlet hastanesi', 'Yurt dışı'], votes: [84, 56, 23, 19] } }),
  p({ authorId: 'u10', kind: 'soru', hoursAgo: 28, likes: 14, tags: ['staj', 'İstanbul'], text: 'Yaz stajı için İstanbul\'da elektrofizyoloji ağırlıklı çalışan merkez önerisi var mı? ABR ve ASSR görmek istiyorum.', comments: [c('u13', 'Bezmialem\'de yenidoğan tarama + ABR yoğun, staj kontenjanı için mesaj at.', 24)] }),
  p({ authorId: 'u17', kind: 'soru', hoursAgo: 52, likes: 18, tags: ['VEMP', 'vestibüler', 'kaynak'], text: 'cVEMP ve oVEMP için Türkçe ya da İngilizce iyi bir kaynak önerebilir misiniz? Ders notları yetersiz kaldı.', comments: [c('u7', 'Jacobson & Shepard "Balance Function Assessment and Management" 10. bölüm. Bir de bizim DEÜ ders kayıtları var, yazarım.', 48)] }),
  p({ authorId: 'u12', kind: 'soru', hoursAgo: 75, likes: 27, tags: ['fitting', 'formül'], text: 'Günlük pratikte ilk uygulamada en çok hangi reçete formülünü kullanıyorsunuz?', poll: { options: ['NAL-NL2', 'DSL v5', 'Üretici formülü', 'Vakaya göre değişir'], votes: [61, 18, 34, 42] } }),
  p({ authorId: 'u8', kind: 'soru', hoursAgo: 14, likes: 36, tags: ['işitme cihazı', 'gürültü'], text: 'İşitme cihazımı restoranda kullanırken her şey birbirine karışıyor, sadece gürültü duyuyorum. Bu normal mi, yoksa ayar mı gerekiyor?', comments: [c('u2', 'Çok normal. Gürültülü ortam programı ve yönlü mikrofon ayarı için odyoloğunuza gidin; genelde 1-2 seansta büyük fark olur.', 12), c('u16', 'Bende de aynıydı, "restoran programı" eklendi, şimdi çok daha iyi.', 10)] }),
  p({ authorId: 'u9', kind: 'soru', hoursAgo: 33, likes: 29, tags: ['aile', 'yaşlı', 'uyum'], text: 'Annem 78 yaşında, cihazı aldık ama takmak istemiyor, "ses çok tiz" diyor. Siz nasıl ikna ettiniz? Odyologlardan da tavsiye alırım.', comments: [c('u27', 'İlk hafta günde 2 saat, sessiz ortam; ses şikayetini odyoloğa mutlaka iletin, ilk ayar genelde yumuşatılır.', 30), c('u23', 'Bizde günlük tutmak işe yaradı: hangi ortamda ne duydu.', 28)] }),
  p({ authorId: 'u22', kind: 'soru', hoursAgo: 60, likes: 12, tags: ['BPPV', 'Epley', 'denge'], text: 'BPPV için Epley manevrası yapıldı, baş dönmesi azaldı. Manevra sonrası kaç gün dikkatli olmak gerekiyor? Yatarken yastık yüksek mi olmalı?', comments: [c('u7', 'Güncel kanıtlar manevra sonrası kısıtlamanın çok gerekli olmadığını söylüyor; 1-2 gün ani baş hareketlerinden kaçınmak yeterli.', 55)] }),
  p({ authorId: 'u20', kind: 'soru', hoursAgo: 120, likes: 25, tags: ['eğitim', 'öğrenci'], text: 'Üst sınıflara soru: odyoloji eğitiminde sizi en çok zorlayan ders hangisiydi?', poll: { options: ['Vestibüler sistem', 'Elektrofizyoloji', 'Pediatrik odyoloji', 'Cihaz uygulamaları'], votes: [47, 63, 21, 30] } }),
  p({ authorId: 'u25', kind: 'soru', hoursAgo: 170, likes: 16, tags: ['tez', 'tinnitus', 'uyku'], text: 'Tez konum tinnitus ve uyku kalitesi ilişkisi. Türkçe geçerliliği yapılmış uyku ölçeği önerisi olan var mı? PSQI dışında.', comments: [c('u15', 'Insomnia Severity Index Türkçe geçerliliği var, THI ile birlikte güzel çalışır.', 160)] }),
  p({ authorId: 'u14', kind: 'soru', hoursAgo: 240, likes: 9, tags: ['odyogram', 'temel'], text: 'Odyogramda sağ kulak neden kırmızı ve O, sol kulak neden mavi ve X? Bir mantığı var mı yoksa gelenek mi?', comments: [c('u24', 'Gelenek ama sağlam bir gelenek: "Right-Red", "Left-bLue" diye akılda tutulur. Sembol standardı ASHA\'dan gelir.', 230)] }),

  // --- ilanlar ---
  p({ authorId: 'u2', kind: 'ilan', hoursAgo: 7, likes: 19, tags: ['iş ilanı', 'İstanbul', 'odyolog'], text: 'Kadıköy\'deki işitme merkezimize tam zamanlı odyolog arıyoruz. Gerçek kulak ölçümü deneyimi tercih sebebi. Yeni mezunlar da başvurabilir; detaylar İlanlar bölümünde.' }),
  p({ authorId: 'u15', kind: 'ilan', hoursAgo: 40, likes: 24, tags: ['staj', 'Antalya', 'yaz'], text: 'Antalya\'da yaz stajı için 2 odyoloji öğrencisi alacağız. Tinnitus danışmanlığı ve cihaz uygulaması ağırlıklı. Konaklama desteği var.' }),
  p({ authorId: 'u19', kind: 'ilan', hoursAgo: 90, likes: 11, tags: ['odyometrist', 'İstanbul'], text: 'Bağcılar\'da özel KBB kliniğinde odyometrist pozisyonu açıldı. Timpanometri ve saf ses odyometrisi deneyimi aranıyor. Haftalık 5 gün.' }),
  p({ authorId: 'u26', kind: 'ilan', hoursAgo: 130, likes: 33, tags: ['gönüllü', 'tarama', 'Kayseri'], text: 'Kayseri\'de köy okullarında işitme taraması projesi için gönüllü odyolog/odyometrist/öğrenci arıyoruz. 3 hafta sonu, ulaşım bizden. Öğrenciler için staj belgesi.' }),

  // --- etkinlikler ---
  p({ authorId: 'u24', kind: 'etkinlik', hoursAgo: 2, likes: 67, tags: ['kongre', 'Antalya'], text: 'Ulusal Odyoloji ve Konuşma Bozuklukları Kongresi için erken kayıt başladı! Öğrenci kaydı indirimli. Bildiri özetleri için son tarih 3 hafta. Etkinlikler sekmesinde detaylar var.', imageHint: '🎤' }),
  p({ authorId: 'u7', kind: 'etkinlik', hoursAgo: 30, likes: 41, tags: ['webinar', 'koklear implant'], text: 'Ücretsiz webinar: "Koklear implant adaylığında güncel kriterler ve tek taraflı sağırlık". Soru-cevap bölümü olacak, kayıt linki Etkinlikler\'de.', imageHint: '💻' }),
  p({ authorId: 'u1', kind: 'etkinlik', hoursAgo: 95, likes: 52, tags: ['kurs', 'VNG', 'Ankara'], text: 'Hacettepe\'de 2 günlük uygulamalı VNG/vHIT kursu. Kontenjan 16 kişi, sertifikalı. Vestibüler alana girmek isteyenler için ideal başlangıç.', imageHint: '🌀' }),
  p({ authorId: 'u13', kind: 'etkinlik', hoursAgo: 180, likes: 38, tags: ['buluşma', 'İstanbul'], text: 'İstanbul odyolog buluşması: kahve + vaka tartışması + biraz da dertleşme. Öğrenciler de davetli. Yer: Kadıköy, cumartesi 15:00.', imageHint: '☕' }),

  // --- başarılar ---
  p({ authorId: 'u3', kind: 'basari', hoursAgo: 12, likes: 88, tags: ['sınav', 'odyometri'], text: 'Odyometri finalinden 95 aldım! Maskeleme sorularının hepsini doğru yaptım. Bu uygulamadaki maskeleme hesabı pratiklerinin payı büyük 🎉', imageHint: '🎉', comments: [c('u5', 'Tebrikler! Artık klinikte de kafan rahat olur.', 10), c('u6', 'Helal, bana da öğret 😅', 9)] }),
  p({ authorId: 'u10', kind: 'basari', hoursAgo: 36, likes: 104, tags: ['kongre', 'poster'], text: 'Bitirme projem "Yenidoğan ABR\'de gürültü artefaktlarının azaltılması" kongreye poster olarak kabul edildi! İlk kongre deneyimim olacak.', imageHint: '📊', comments: [c('u24', 'Tebrikler Can, posterin önünde görüşürüz.', 30), c('u1', 'Harika bir konu, sonuçları merakla bekliyorum.', 28)] }),
  p({ authorId: 'u14', kind: 'basari', hoursAgo: 58, likes: 45, tags: ['staj'], text: 'İlk staj yerim belli oldu: Konya\'da bir KBB kliniğinde odyometri kabini. Heyecanlıyım, tavsiyelere açığım!', imageHint: '🎓', comments: [c('u5', 'İlk gün hastaya "size sesler vereceğim, en hafifini bile duyunca basın" demeyi unutma. Gerisi gelir.', 50)] }),
  p({ authorId: 'u16', kind: 'basari', hoursAgo: 80, likes: 212, tags: ['hasta deneyimi', 'işitme cihazı'], text: 'İlk cihazımla 3. ay. Bu sabah balkonda kuş seslerini duydum. Yıllardır duymadığımı fark etmemişim bile. Odyoloğum Selin Hanım\'a teşekkürler.', imageHint: '🐦', comments: [c('u7', 'Bu mesaj günümü yaptı Kemal Bey!', 75), c('u8', 'Çok iyi anlıyorum, bende de yağmur sesi öyleydi.', 70), c('u9', 'Annem için umut oldu bu yazı.', 60)] }),
  p({ authorId: 'u17', kind: 'basari', hoursAgo: 110, likes: 76, tags: ['TÜBİTAK', 'araştırma'], text: 'TÜBİTAK 2209-A projemiz kabul edildi: "Üniversite öğrencilerinde kulaklık kullanım alışkanlıkları ve işitme eşikleri". Ekibim ve danışmanımla gurur duyuyorum!', imageHint: '🔬' }),
  p({ authorId: 'u21', kind: 'basari', hoursAgo: 160, likes: 131, tags: ['koklear implant', 'programlama'], text: 'Bugün 100. koklear implant programlamamı yaptım. 100 farklı hikâye, 100 farklı "ilk ses" anı. Bu meslek ne güzel.', imageHint: '💯', comments: [c('u18', 'Ekibin en iyisi. Tebrikler İrem.', 150)] }),
  p({ authorId: 'u23', kind: 'basari', hoursAgo: 190, likes: 287, tags: ['aile', 'koklear implant', 'çocuk'], text: 'Kızım implant aktivasyonundan 4 ay sonra bugün ilk kez "anne" dedi. Ağlamaktan yazamıyorum. Bu yolda yanımızda olan tüm odyologlara minnettarım.', imageHint: '❤️', comments: [c('u13', 'Gözlerim doldu. Tüm emekleriniz için siz de tebrikleri hak ediyorsunuz.', 185), c('u21', 'En güzel haber.', 180)] }),

  // --- gönderiler ---
  p({ authorId: 'u5', kind: 'gonderi', hoursAgo: 1, likes: 93, tags: ['mizah', 'klinik'], text: 'Hasta: "Duyuyorum ama anlamıyorum." Her odyometristin günde en az 10 kez duyduğu cümle. Ve her seferinde yüksek frekans kaybını açıklamaya başlıyoruz 😄', comments: [c('u12', 'Benim versiyonum: "Eşim mırıldanıyor, benim kulağımda sorun yok."', 1)] }),
  p({ authorId: 'u11', kind: 'gonderi', hoursAgo: 6, likes: 142, tags: ['ani işitme kaybı', 'farkındalık'], text: 'Ani işitme kaybında ilk 72 saat altın değerinde. "Kulağım tıkandı, geçer" diyerek bekleyen her hasta kazanılabilir işitmeyi kaybediyor. Lütfen çevrenize anlatın: tek taraflı ani tıkanıklık = aynı gün KBB.', comments: [c('u4', 'Tamamen katılıyorum. Eczane ve aile hekimi düzeyinde farkındalık şart.', 5)] }),
  p({ authorId: 'u28', kind: 'gonderi', hoursAgo: 16, likes: 34, tags: ['tinnitus', 'merak'], text: 'Merak ettim: kulak çınlamam gündüz hiç yokmuş gibi, gece yatınca ortaya çıkıyor. Neden? Odyologlar açıklayabilir mi?', comments: [c('u15', 'Gündüz çevre sesleri çınlamayı maskeler; sessizlikte beyin iç sese odaklanır. Gece düşük seviyeli fan/yağmur sesi çok yardımcı olur.', 14)] }),
  p({ authorId: 'u12', kind: 'gonderi', hoursAgo: 24, likes: 77, tags: ['mizah', 'kabin'], text: 'Kabine giren hastanın test boyunca her tonda "bip" diye yüksek sesle bağırması... Butona basın demiştik, ses taklidi yapın değil 😅' }),
  p({ authorId: 'u6', kind: 'gonderi', hoursAgo: 44, likes: 58, tags: ['ders notu', 'desibel'], text: 'Desibel logaritmik, akılda kalsın diye: +3 dB = güç 2 katı, +10 dB = güç 10 katı, +10 dB ≈ algılanan ses 2 katı. 85 dB\'de 8 saat güvenli, her +3 dB süreyi yarıya indirir.', comments: [c('u20', 'Bunu ezberledim, teşekkürler!', 40)] }),
  p({ authorId: 'u27', kind: 'gonderi', hoursAgo: 66, likes: 44, tags: ['pediatrik', 'Denizli'], text: 'Denizli\'de pediatrik odyoloji gelişiyor: yenidoğan tarama sonrası ilk 3 ayda tanı oranımız %90\'a çıktı. Aile danışmanlığı programımız da başladı. Küçük şehirlerde de olur.' }),
  p({ authorId: 'u22', kind: 'gonderi', hoursAgo: 85, likes: 21, tags: ['denge günlüğü', 'BPPV'], text: 'Denge günlüğü 3. hafta: atak sayısı 7→2. Sabah yataktan kalkarken yavaş kalkmak ve tetikleyici pozisyonları not etmek işe yaradı. Aynı dertten muzdarip olanlara: kayıt tutun, doktorunuz çok işine yarıyor.' }),
  p({ authorId: 'u2', kind: 'gonderi', hoursAgo: 105, likes: 49, tags: ['gürültüde konuşma', 'klinik'], text: 'Gürültüde konuşmayı anlama testini rutin yapıyor musunuz? Biz cihaz öncesi ve sonrası ölçüyoruz; hastanın "iyileşmeyi görmesi" uyumu inanılmaz artırıyor.', comments: [c('u21', 'Evet, Kİ adaylarında da zorunlu tutuyoruz.', 100), c('u19', 'Zaman sorunu var ama memnuniyete yansıyor.', 95)] }),
  p({ authorId: 'u5', kind: 'gonderi', hoursAgo: 135, likes: 66, tags: ['kulaklık', 'koruma'], text: 'Kulaklık kullanan herkes için 60/60 kuralı: en fazla %60 ses, en fazla 60 dakika, sonra kulağa mola. Gençlerde gürültüye bağlı kayıp giderek artıyor; en etkili tedavi önlemek.' }),
  p({ authorId: 'u20', kind: 'gonderi', hoursAgo: 210, likes: 39, tags: ['mizah', 'öğrenci'], text: 'Kemik yolu vibratörünü mastoide yerleştirirken "burası mı, biraz daha yukarı mı" diye 5 dakika uğraşmak... 1. sınıf olmanın tatlı telaşı.' }),
  p({ authorId: 'u9', kind: 'gonderi', hoursAgo: 260, likes: 53, tags: ['aile', 'deneyim'], text: 'Annem cihazını 2 haftadır düzenli takıyor. Sırrımız: televizyonu açmadan önce cihazı takmak ve altyazıyı kapatmak. İlk günler zorlandı, şimdi "sen de tak" diyor babama 😊' }),
  p({ authorId: 'u8', kind: 'gonderi', hoursAgo: 300, likes: 61, tags: ['hasta deneyimi', 'pil'], text: 'İşitme cihazı kullananlara küçük bir tavsiye: yedek pili her zaman cüzdanda taşıyın. Önemli bir toplantının ortasında pil bitmesini bir kez yaşadım, bir daha yaşamadım.' }),
  p({ authorId: 'u1', kind: 'gonderi', hoursAgo: 320, likes: 118, tags: ['koklear implant', 'aile'], text: 'Kİ aktivasyonunda ailelere hep aynı şeyi söylüyorum: ilk gün "duydu mu" diye kaygılanmayın, beyin yeni bir dil öğreniyor. Sabır, tekrar ve bolca konuşma. Sonuçlar aylar içinde gelir.' }),
];

/* ---------- ilanlar ---------- */
export const MOCK_JOBS: Job[] = [
  { id: 'j1', title: 'Odyolog', org: 'Kadıköy İşitme Merkezi', city: 'İstanbul', type: 'tam zamanlı', salaryHint: 'Deneyime göre + prim', postedAt: ago(7), description: 'Cihaz uygulaması, gerçek kulak ölçümü ve hasta takibi. Yeni mezunlar başvurabilir; oryantasyon programı var. Haftada 5 gün, cumartesi dönüşümlü.', tags: ['cihaz uygulaması', 'REM', 'İstanbul'], email: 'ik@kadikoyisitme.example' },
  { id: 'j2', title: 'Yaz Stajı – Odyoloji Öğrencisi', org: 'Akdeniz Tinnitus Merkezi', city: 'Antalya', type: 'staj', salaryHint: 'Konaklama desteği', postedAt: ago(40), description: '2 öğrenci alınacak. Tinnitus danışmanlığı, ses terapisi ve cihaz uygulaması gözlemi. 4 hafta, staj belgesi verilir.', tags: ['staj', 'tinnitus', 'Antalya'], email: 'staj@akdeniztinnitus.example' },
  { id: 'j3', title: 'Odyometrist', org: 'Bağcılar Özel KBB Kliniği', city: 'İstanbul', type: 'tam zamanlı', postedAt: ago(90), description: 'Saf ses odyometrisi, timpanometri ve refleks testleri. En az 1 yıl kabin deneyimi. Haftalık 5 gün.', tags: ['odyometri', 'timpanometri'], email: 'basvuru@bagcilarkbb.example' },
  { id: 'j4', title: 'Gönüllü – Okul İşitme Taraması', org: 'Kayseri Sağlık Gönüllüleri', city: 'Kayseri', type: 'gönüllü', postedAt: ago(130), description: 'Köy okullarında 3 hafta sonu işitme taraması. Odyolog, odyometrist ve öğrenciler başvurabilir. Ulaşım karşılanır; öğrencilere staj belgesi.', tags: ['gönüllü', 'tarama', 'pediatrik'], url: 'https://example.org/kayseri-tarama' },
  { id: 'j5', title: 'Koklear İmplant Odyoloğu', org: 'Çukurova Üniversitesi Hastanesi', city: 'Adana', type: 'tam zamanlı', salaryHint: 'Kamu ücret tarifesi', postedAt: ago(160), description: 'Kİ ekibinde programlama ve takip. Deneyimli adaylar öncelikli; eğitim verilir. Ameliyathane içi ölçümlere katılım.', tags: ['koklear implant', 'programlama', 'Adana'], url: 'https://example.org/cu-ki-odyolog' },
  { id: 'j6', title: 'Pediatrik Odyolog', org: 'Bezmialem İşitme ve Konuşma Merkezi', city: 'İstanbul', type: 'tam zamanlı', postedAt: ago(200), description: 'Yenidoğan tarama, ABR/ASSR ve davranışsal odyometri. Aile danışmanlığı deneyimi tercih sebebi.', tags: ['pediatrik', 'ABR', 'tarama'], email: 'ik@bezmialemisitme.example' },
  { id: 'j7', title: 'Yarı Zamanlı Odyolog', org: 'Ege Duyu İşitme Cihazları', city: 'İzmir', type: 'yarı zamanlı', salaryHint: 'Saatlik ücret', postedAt: ago(230), description: 'Haftada 3 gün cihaz uygulaması ve kontrol seansları. Yüksek lisans öğrencileri için esnek saat.', tags: ['yarı zamanlı', 'İzmir', 'cihaz'], email: 'ik@egeduyu.example' },
  { id: 'j8', title: 'Vestibüler Laboratuvar Odyoloğu', org: 'Dokuz Eylül Üniversitesi Hastanesi', city: 'İzmir', type: 'tam zamanlı', postedAt: ago(260), description: 'VNG, vHIT, VEMP ve kalorik test uygulamaları. Vestibüler rehabilitasyon programına katılım. Kurs sertifikası tercih sebebi.', tags: ['vestibüler', 'VNG', 'vHIT'], url: 'https://example.org/deu-vestibuler' },
  { id: 'j9', title: 'Staj – Elektrofizyoloji', org: 'Hacettepe Odyoloji Birimi', city: 'Ankara', type: 'staj', postedAt: ago(280), description: 'ABR, ASSR ve OAE uygulamalarında gözlem ve destek. 4. sınıf öğrencileri için 6 haftalık program.', tags: ['staj', 'elektrofizyoloji', 'Ankara'], email: 'odyoloji.staj@hacettepe.example' },
  { id: 'j10', title: 'Odyometrist', org: 'Konya Medikal İşitme', city: 'Konya', type: 'tam zamanlı', salaryHint: 'Asgari + %40', postedAt: ago(300), description: 'Kabin testleri ve cihaz bakım-onarım takibi. Hasta iletişimi güçlü adaylar.', tags: ['odyometri', 'Konya'], email: 'ik@konyamedikal.example' },
  { id: 'j11', title: 'Gönüllü – Yaşlı Bakım Evi İşitme Günü', org: 'Ankara Yaşam Derneği', city: 'Ankara', type: 'gönüllü', postedAt: ago(310), description: 'Huzurevinde 1 günlük işitme taraması ve cihaz bakımı etkinliği. Odyolog ve öğrenci gönüllüler.', tags: ['gönüllü', 'yaşlı', 'Ankara'], email: 'gonullu@ankarayasam.example' },
  { id: 'j12', title: 'Araştırma Asistanı (Tinnitus)', org: 'Akdeniz Üniversitesi Odyoloji', city: 'Antalya', type: 'yarı zamanlı', salaryHint: 'Proje bursu', postedAt: ago(320), description: 'TÜBİTAK projesinde veri toplama ve analiz. Yüksek lisans öğrencileri öncelikli. 12 ay.', tags: ['araştırma', 'tinnitus', 'burs'], url: 'https://example.org/akdeniz-tinnitus-ra' },
  { id: 'j13', title: 'Odyolog – Saha Ekibi', org: 'Karadeniz İşitme Taraması Projesi', city: 'Trabzon', type: 'yarı zamanlı', postedAt: ago(330), description: 'Mobil tarama aracıyla ilçe ziyaretleri. Sürücü belgesi ve seyahat uygunluğu gerekli.', tags: ['saha', 'tarama', 'Trabzon'], email: 'saha@karadenizisitme.example' },
];

/* ---------- etkinlikler ---------- */
export const MOCK_EVENTS: NetEvent[] = [
  { id: 'e1', title: 'Ulusal Odyoloji ve Konuşma Bozuklukları Kongresi', org: 'Odyoloji Derneği', date: inDays(26, 9), city: 'Antalya', kind: 'kongre', url: 'https://example.org/odyoloji-kongre', description: '4 günlük kongre: kurslar, sözlü bildiriler, poster alanı ve sektör fuarı. Öğrenci kaydı indirimli.' },
  { id: 'e2', title: 'Koklear İmplant Adaylığında Güncel Kriterler', org: 'DEÜ Odyoloji', date: inDays(4, 20), city: 'Online', online: true, kind: 'webinar', url: 'https://example.org/ki-webinar', description: 'Tek taraflı sağırlık, asimetrik kayıp ve yaşlı adaylarda karar süreci. Soru-cevap bölümü.' },
  { id: 'e3', title: 'Uygulamalı VNG / vHIT Kursu', org: 'Hacettepe Üniversitesi', date: inDays(12, 9), city: 'Ankara', kind: 'kurs', url: 'https://example.org/vng-kursu', description: '2 gün, 16 kişilik kontenjan, sertifikalı. Vestibüler alana giriş için ideal.' },
  { id: 'e4', title: 'İstanbul Odyolog Buluşması', org: 'aihearX Topluluğu', date: inDays(8, 15), city: 'İstanbul', kind: 'buluşma', description: 'Kahve, vaka tartışması ve dertleşme. Öğrenciler de davetli. Kadıköy.' },
  { id: 'e5', title: 'Pediatrik Odyolojide Aile Danışmanlığı', org: 'Bezmialem Vakıf Üniversitesi', date: inDays(18, 10), city: 'İstanbul', kind: 'kurs', url: 'https://example.org/aile-danismanligi', description: 'Tanı anından cihaz uyumuna kadar aileyle iletişim becerileri. Rol oyunları ve vaka örnekleri.' },
  { id: 'e6', title: 'Tinnitus Yönetiminde Ses Terapisi', org: 'Akdeniz Üniversitesi', date: inDays(6, 19), city: 'Online', online: true, kind: 'webinar', url: 'https://example.org/tinnitus-webinar', description: 'TRT, CBT temelli yaklaşımlar ve cihaz entegrasyonu. 90 dakika.' },
  { id: 'e7', title: 'Ankara Öğrenci Odyoloji Günü', org: 'Ankara Üniversitesi Odyoloji Kulübü', date: inDays(21, 10), city: 'Ankara', kind: 'buluşma', description: 'Öğrenci sunumları, mezunlarla kariyer sohbeti ve ödüllü vaka yarışması.' },
  { id: 'e8', title: 'Gerçek Kulak Ölçümü Atölyesi', org: 'İzmir İşitme Platformu', date: inDays(15, 13), city: 'İzmir', kind: 'kurs', url: 'https://example.org/rem-atolye', description: 'Prob tüp yerleşimi, hedef eşleştirme ve sık yapılan hatalar. Uygulamalı, 12 kişi.' },
  { id: 'e9', title: 'Uluslararası Otoloji Sempozyumu', org: 'Ege Üniversitesi KBB', date: inDays(40, 9), city: 'İzmir', kind: 'kongre', url: 'https://example.org/otoloji-sempozyum', description: 'Otoskleroz, kolesteatom ve implant cerrahisinde güncel yaklaşımlar. Canlı cerrahi yayını.' },
  { id: 'e10', title: 'Yenidoğan İşitme Taramasında Kalite', org: 'Sağlık Bakanlığı & Odyoloji Derneği', date: inDays(10, 14), city: 'Online', online: true, kind: 'webinar', description: 'Tarama protokolleri, sevk oranları ve kayıp vaka takibi.' },
  { id: 'e11', title: 'Samsun Denge ve Vestibüler Günü', org: 'OMÜ Odyoloji', date: inDays(33, 9), city: 'Samsun', kind: 'buluşma', description: 'Vestibüler rehabilitasyon uygulamaları ve hasta hikâyeleri. Halka açık oturum var.' },
  { id: 'e12', title: 'Odyolojide Yapay Zekâ Uygulamaları', org: 'aihearX', date: inDays(2, 18), city: 'Online', online: true, kind: 'webinar', url: 'https://example.org/aihearx-ai', description: 'Fitting önerileri, otomatik odyogram yorumu ve etik sınırlar. Odyologlar ve öğrenciler için.' },
];
