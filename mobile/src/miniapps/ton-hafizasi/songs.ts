/**
 * Ton Hafızası — Gizli Ezgi şarkı verisi. Tek yer, kolay düzenlenir.
 *
 * Nota yazımı: 'E4:1' → nota adı + ':' + vuruş (çeyrek = 1). ':' yoksa 1 vuruş. 'R:0.5' → es (sus).
 * Nota adları C4…C6 (gerekirse ♯: 'F#4'). Her satır bir cümleyi (phrase) oluşturur; `melody()` satırlardan
 * `notes` dizisini ve cümle bitiş indekslerini (`phrases`, dahil) üretir.
 *
 * Yalnızca anonim / kamu malı ezgiler. "kulaktan; doğrulanacak" notu olanlar hafızadan yazılmış denemelerdir.
 */
export type Origin = 'türkü' | 'çocuk şarkısı' | 'klasik' | 'anonim';

export type Song = {
  id: string;
  title: string;
  /** Paylaşım cümlesi için -i hâli: "Üsküdar'a Gider İken'i" */
  titleAcc: string;
  /** Sözlerin ilk satırı (ipucu). */
  lyricHint: string;
  origin: Origin;
  bpm: number;
  /** 'E4:1', 'D4:0.5', 'R:0.5' biçiminde notalar. */
  notes: string[];
  /** Her cümlenin son notasının `notes` içindeki indeksi (dahil). */
  phrases: number[];
  /** Cümle başına söz satırı (phrases ile aynı uzunlukta). */
  lines: string[];
  /** Kulaktan yazılmış, doğrulanması gereken aktarım. */
  unverified?: boolean;
};

/** Satır başına bir cümle; boşlukla ayrılmış notalar. */
function melody(lines: string[]): { notes: string[]; phrases: number[] } {
  const notes: string[] = [];
  const phrases: number[] = [];
  for (const line of lines) {
    for (const n of line.trim().split(/\s+/)) if (n) notes.push(n);
    phrases.push(notes.length - 1);
  }
  return { notes, phrases };
}

export const SONGS: readonly Song[] = [
  {
    // Twinkle Twinkle ezgisi · Do Do Sol Sol La La Sol | Fa Fa Mi Mi Re Re Do | Sol Sol Fa Fa Mi Mi Re (×2) | ilk iki satır tekrar
    id: 'daha-dun-annemizin',
    title: 'Daha Dün Annemizin',
    titleAcc: "Daha Dün Annemizin'i",
    lyricHint: 'Daha dün annemizin kollarında yaşarken…',
    origin: 'çocuk şarkısı',
    bpm: 108,
    lines: ['Daha dün annemizin', 'Kollarında yaşarken', 'Çiçekli bahçemizin', 'Yollarında koşarken', 'Şimdi okullu olduk', 'Sınıfları doldurduk'],
    ...melody([
      'C4 C4 G4 G4 A4 A4 G4:2', // Da-ha dün an-ne-mi-zin
      'F4 F4 E4 E4 D4 D4 C4:2', // Kol-la-rın-da ya-şar-ken
      'G4 G4 F4 F4 E4 E4 D4:2', // Çi-çek-li bah-çe-mi-zin
      'G4 G4 F4 F4 E4 E4 D4:2', // Yol-la-rın-da ko-şar-ken
      'C4 C4 G4 G4 A4 A4 G4:2', // Şim-di o-kul-lu ol-duk
      'F4 F4 E4 E4 D4 D4 C4:2', // Sı-nıf-la-rı dol-dur-duk
    ]),
  },
  {
    // Happy Birthday · Sol Sol La Sol Do' Si | Sol Sol La Sol Re' Do' | Sol Sol Sol' Mi' Do' Si La | Fa' Fa' Mi' Do' Re' Do'
    id: 'iyi-ki-dogdun',
    title: 'İyi ki Doğdun',
    titleAcc: "İyi ki Doğdun'u",
    lyricHint: 'İyi ki doğdun… 🎂',
    origin: 'anonim',
    bpm: 120,
    lines: ['İyi ki doğdun', 'İyi ki doğdun', 'İyi ki doğdun, iyi ki doğdun', 'İyi ki doğdun sen!'],
    ...melody([
      'G4:0.5 G4:0.5 A4 G4 C5 B4:2', // İ-yi ki doğ-dun
      'G4:0.5 G4:0.5 A4 G4 D5 C5:2', // İ-yi ki doğ-dun
      'G4:0.5 G4:0.5 G5 E5 C5 B4 A4:2', // İ-yi ki doğ-dun, i-yi ki doğ-dun
      'F5:0.5 F5:0.5 E5 C5 D5 C5:2', // İ-yi ki doğ-dun sen
    ]),
  },
  {
    // Beethoven, 9. Senfoni · Mi Mi Fa Sol Sol Fa Mi Re Do Do Re Mi Mi Re Re | Mi Mi Fa Sol Sol Fa Mi Re Do Do Re Mi Re Do Do
    id: 'neseye-ovgu',
    title: 'Neşeye Övgü',
    titleAcc: "Neşeye Övgü'yü",
    lyricHint: 'Beethoven, 9. Senfoni — Avrupa marşı 🎻',
    origin: 'klasik',
    bpm: 112,
    lines: ['Ta ta ta ta, ta ta ta ta', 'Ta ta ta ta, taa-ta taa', 'Ta ta ta ta, ta ta ta ta', 'Ta ta ta ta, taa-ta taa'],
    ...melody([
      'E4 E4 F4 G4 G4 F4 E4 D4',
      'C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2',
      'E4 E4 F4 G4 G4 F4 E4 D4',
      'C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2',
    ]),
  },
  {
    // Frère Jacques · Do Re Mi Do (×2) | Mi Fa Sol (×2) | Sol La Sol Fa Mi Do (×2) | Do Sol Do (×2)
    // Son satırdaki Sol orijinalde bir oktav alttadır (Sol3); pad sayısını 6'da tutmak için Sol4 kullanıldı.
    id: 'uyuyor-musun',
    title: 'Uyuyor musun? (Tembel Çocuk)',
    titleAcc: "Uyuyor musun?'u",
    lyricHint: 'Uyuyor musun, uyuyor musun, kardeşim?',
    origin: 'çocuk şarkısı',
    bpm: 120,
    lines: ['Uyuyor musun, uyuyor musun', 'Kardeşim, kardeşim', 'Sabah oldu kalksana, sabah oldu kalksana', 'Ding dang dong, ding dang dong'],
    ...melody([
      'C4 D4 E4 C4 C4 D4 E4 C4', // U-yu-yor mu-sun, u-yu-yor mu-sun
      'E4 F4 G4:2 E4 F4 G4:2', // kar-de-şim, kar-de-şim
      'G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4 C4 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4 C4', // Sa-bah ol-du kalk-sa-na (×2)
      'C4 G4 C4:2 C4 G4 C4:2', // Ding dang dong, ding dang dong
    ]),
  },
  {
    // Jingle Bells (Pierpont, 1857) · Mi Mi Mi | Mi Mi Mi | Mi Sol Do Re Mi | Fa Fa Fa Fa Fa Mi Mi Mi Mi | Mi Re Re Mi Re Sol
    id: 'jingle-bells',
    title: 'Jingle Bells',
    titleAcc: "Jingle Bells'i",
    lyricHint: 'Jingle bells, jingle bells… 🔔',
    origin: 'anonim',
    bpm: 130,
    lines: ['Jingle bells, jingle bells', 'Jingle all the way', 'Oh what fun it is to ride', 'In a one-horse open sleigh, hey!'],
    ...melody([
      'E4 E4 E4:2 E4 E4 E4:2', // Jin-gle bells, jin-gle bells
      'E4 G4 C4:1.5 D4:0.5 E4:4', // jin-gle all the way
      'F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5', // oh what fun it is to ride in a
      'E4 D4 D4 E4 D4:2 G4:2', // one-horse o-pen sleigh, hey
    ]),
  },
  {
    // Kâtibim — anonim İstanbul türküsü, Nihavend (la minör hissi). kulaktan; doğrulanacak
    // La La La La Sol La Si La Sol Fa Sol La Sol Fa Mi | (tekrar) | Mi Mi Fa Sol La Sol Fa Mi Re Mi Fa Mi Re Do | (tekrar)
    id: 'uskudara-gider-iken',
    title: "Üsküdar'a Gider İken",
    titleAcc: "Üsküdar'a Gider İken'i",
    lyricHint: "Üsküdar'a gider iken aldı da bir yağmur… 🎵",
    origin: 'türkü',
    bpm: 100,
    unverified: true,
    lines: ["Üsküdar'a gider iken aldı da bir yağmur", 'Kâtibimin setresi uzun, eteği çamur', 'Kâtip uykudan uyanmış, gözleri mahmur', 'Kâtip uykudan uyanmış, gözleri mahmur'],
    ...melody([
      'A4 A4 A4 A4 G4 A4 B4 A4 G4 F4 G4 A4 G4 F4 E4:2', // Üs-kü-dar'a gi-der i-ken al-dı da bir yağ-mur
      'A4 A4 A4 A4 G4 A4 B4 A4 G4 F4 G4 A4 G4 F4 E4:2', // Kâ-ti-bi-min se-tre-si u-zun e-te-ği ça-mur
      'E4 E4 F4 G4 A4 G4 F4 E4 D4 E4 F4 E4 D4 C4:2', // Kâ-tip uy-ku-dan u-yan-mış göz-le-ri mah-mur
      'E4 E4 F4 G4 A4 G4 F4 E4 D4 E4 F4 E4 D4 C4:2', // (tekrar)
    ]),
  },
  {
    // Çanakkale Türküsü — anonim, re minör. kulaktan; doğrulanacak
    // Re Re Re Mi Fa Fa Mi Re Do Re Re | (tekrar) | La La Sol Fa Mi Re
    id: 'canakkale-turkusu',
    title: 'Çanakkale Türküsü',
    titleAcc: "Çanakkale Türküsü'nü",
    lyricHint: 'Çanakkale içinde aynalı çarşı…',
    origin: 'türkü',
    bpm: 96,
    unverified: true,
    lines: ['Çanakkale içinde aynalı çarşı', 'Ana ben gidiyorum düşmana karşı', 'Of gençliğim eyvah'],
    ...melody([
      'D4 D4 D4 E4 F4 F4 E4 D4 C4 D4 D4:2', // Ça-nak-ka-le i-çin-de ay-na-lı çar-şı
      'D4 D4 D4 E4 F4 F4 E4 D4 C4 D4 D4:2', // A-na ben gi-di-yo-rum düş-ma-na kar-şı
      'A4 A4 G4 F4 E4 D4:2', // Of genç-li-ğim ey-vah
    ]),
  },
  {
    // Mini Mini Bir Kuş — anonim çocuk şarkısı. kulaktan; doğrulanacak
    // Sol Sol Mi Mi Sol Sol Mi La La Sol | Sol Sol Mi Mi Fa Fa Re | Mi Mi Fa Sol Sol Fa Mi | Re Re Mi Fa Fa Mi Re Do
    id: 'mini-mini-bir-kus',
    title: 'Mini Mini Bir Kuş',
    titleAcc: "Mini Mini Bir Kuş'u",
    lyricHint: 'Mini mini bir kuş donmuştu…',
    origin: 'çocuk şarkısı',
    bpm: 120,
    unverified: true,
    lines: ['Mini mini bir kuş donmuştu', 'Pencereme konmuştu', 'Aldım onu içeri', 'Cık cık cık cık ötüyordu'],
    ...melody([
      'G4 G4 E4 E4 G4 G4 E4 A4 A4 G4:2', // Mi-ni mi-ni bir kuş don-muş-tu
      'G4 G4 E4 E4 F4 F4 D4:2', // Pen-ce-re-me kon-muş-tu
      'E4 E4 F4 G4 G4 F4 E4:2', // Al-dım o-nu i-çe-ri
      'D4 D4 E4 F4 F4 E4 D4 C4:2', // Cık cık cık cık ö-tü-yor-du
    ]),
  },
  {
    // Old MacDonald · Sol Sol Sol Re Mi Mi Re | Si Si La La Sol | Re Sol Sol Sol Re Mi Mi Re | Si Si La La Sol
    id: 'ali-babanin-ciftligi',
    title: "Ali Baba'nın Çiftliği",
    titleAcc: "Ali Baba'nın Çiftliği'ni",
    lyricHint: "Ali Baba'nın bir çiftliği var, iya iya o…",
    origin: 'çocuk şarkısı',
    bpm: 120,
    lines: ["Ali Baba'nın bir çiftliği var", 'İya iya o', 'Çiftliğinde kuzuları var', 'İya iya o'],
    ...melody([
      'G4 G4 G4 D4 E4 E4 D4:2', // A-li Ba-ba-nın çift-li-ği var
      'B4 B4 A4 A4 G4:2', // i-ya i-ya o
      'D4 G4 G4 G4 D4 E4 E4 D4:2', // çift-li-ğin-de ku-zu-la-rı var
      'B4 B4 A4 A4 G4:2', // i-ya i-ya o
    ]),
  },
  {
    // Portakalı Soydum — anonim çocuk şarkısı; Twinkle ezgisinin bir varyantı olarak yazıldı. kulaktan; doğrulanacak
    // Do Do Sol Sol La La Sol | Fa Fa Mi Mi Re Re Do | Sol Sol Fa Fa Mi Mi Re | Sol Sol Fa Fa Mi Mi Re
    id: 'portakali-soydum',
    title: 'Portakalı Soydum',
    titleAcc: "Portakalı Soydum'u",
    lyricHint: 'Portakalı soydum, başucuma koydum…',
    origin: 'çocuk şarkısı',
    bpm: 116,
    unverified: true,
    lines: ['Portakalı soydum', 'Başucuma koydum', 'Ben bir yalan uydurdum', 'Duma duma dum'],
    ...melody([
      'C4 C4 G4 G4 A4 A4 G4:2', // Por-ta-ka-lı soy-dum
      'F4 F4 E4 E4 D4 D4 C4:2', // Ba-şu-cu-ma koy-dum
      'G4 G4 F4 F4 E4 E4 D4:2', // Ben bir ya-lan uy-dur-dum
      'G4 G4 F4 F4 E4 E4 D4:2', // Du-ma du-ma dum
    ]),
  },
];

export const songById = (id: string): Song | undefined => SONGS.find((s) => s.id === id);
