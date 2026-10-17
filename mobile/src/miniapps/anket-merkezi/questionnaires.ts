import { gradients, type Gradient } from '@/core/theme';

export type QId = 'hhie-s' | 'thi' | 'dhi';
export type Grade = { min: number; max: number; label: string; text: string; color: string };
export type Questionnaire = {
  id: QId;
  name: string;
  full: string;
  topic: string;
  intro: string;
  icon: 'ear' | 'pulse' | 'compass';
  gradient: Gradient;
  items: string[];
  max: number;
  grades: Grade[];
};

export const ANSWERS = [
  { label: 'Evet', value: 4 },
  { label: 'Bazen', value: 2 },
  { label: 'Hayır', value: 0 },
] as const;

export const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'hhie-s',
    name: 'HHIE-S',
    full: 'Yaşlılar için İşitme Engeli Envanteri (Kısa Form)',
    topic: 'İşitme',
    intro: 'İşitme güçlüğünün günlük yaşamınızı duygusal ve sosyal olarak ne kadar etkilediğini ölçer. 10 soru, yaklaşık 2 dakika.',
    icon: 'ear',
    gradient: gradients.ocean,
    max: 40,
    items: [
      'İşitme sorunu, yeni insanlarla tanışırken kendinizi mahcup hissetmenize neden oluyor mu?',
      'İşitme sorunu, aile üyelerinizle konuşurken kendinizi sinirli veya kırgın hissettiriyor mu?',
      'Birisi fısıltıyla konuştuğunda anlamakta güçlük çekiyor musunuz?',
      'İşitme sorunu nedeniyle kendinizi engelli hissediyor musunuz?',
      'İşitme sorunu, arkadaş, akraba veya komşularınızı ziyaret ederken güçlük yaratıyor mu?',
      'İşitme sorunu, dini toplantılara veya topluluk etkinliklerine istediğinizden daha az katılmanıza neden oluyor mu?',
      'İşitme sorunu, aile üyelerinizle tartışmanıza neden oluyor mu?',
      'İşitme sorunu, televizyon veya radyo dinlerken güçlük yaratıyor mu?',
      'İşitme sorununun kişisel veya sosyal yaşamınızı kısıtladığını ya da engellediğini hissediyor musunuz?',
      'İşitme sorunu, akraba veya arkadaşlarınızla restoranda bulunurken güçlük yaratıyor mu?',
    ],
    grades: [
      { min: 0, max: 8, label: 'Engel algısı yok', text: 'İşitmenin günlük yaşamı belirgin etkilemediğini bildiriyorsunuz. Yine de güçlük yaşıyorsanız bir işitme testi yaptırmak faydalıdır.', color: '#4ADE80' },
      { min: 10, max: 24, label: 'Hafif-orta engel algısı', text: 'İşitme, sosyal ve duygusal yaşamınızı bir ölçüde etkiliyor. Odyolojik değerlendirme ve işitme cihazı danışmanlığı önerilir.', color: '#FFC25C' },
      { min: 26, max: 40, label: 'Belirgin engel algısı', text: 'İşitme güçlüğü yaşamınızı önemli ölçüde kısıtlıyor. Kapsamlı odyolojik değerlendirme ve rehabilitasyon planı için uzmana başvurun.', color: '#FF5C5C' },
    ],
  },
  {
    id: 'thi',
    name: 'THI',
    full: 'Tinnitus Engellilik Envanteri',
    topic: 'Çınlama',
    intro: 'Kulak çınlamasının işlevsel, duygusal ve yaşamsal etkisini ölçer. 25 soru, yaklaşık 4 dakika.',
    icon: 'pulse',
    gradient: gradients.violet,
    max: 100,
    items: [
      'Çınlamanız nedeniyle dikkatinizi toplamakta güçlük çekiyor musunuz?',
      'Çınlamanızın şiddeti, başkalarını duymanızı zorlaştırıyor mu?',
      'Çınlamanız sizi öfkelendiriyor mu?',
      'Çınlamanız kafanızı karıştırıyor mu?',
      'Çınlamanız nedeniyle kendinizi çaresiz hissediyor musunuz?',
      'Çınlamanız hakkında çok şikâyet ediyor musunuz?',
      'Çınlamanız yüzünden geceleri uykuya dalmakta zorlanıyor musunuz?',
      'Çınlamanızdan kurtulamayacağınızı mı hissediyorsunuz?',
      'Çınlamanız sosyal etkinliklerden (yemeğe çıkmak, sinema gibi) zevk almanızı engelliyor mu?',
      'Çınlamanız nedeniyle kendinizi hayal kırıklığına uğramış hissediyor musunuz?',
      'Çınlamanız nedeniyle korkunç bir hastalığınız olduğunu düşünüyor musunuz?',
      'Çınlamanız hayattan zevk almanızı zorlaştırıyor mu?',
      'Çınlamanız iş veya ev işlerinizi yapmanızı engelliyor mu?',
      'Çınlamanız nedeniyle kendinizi sık sık sinirli hissediyor musunuz?',
      'Çınlamanız nedeniyle okumakta güçlük çekiyor musunuz?',
      'Çınlamanız sizi üzüyor mu?',
      'Çınlamanızın aile üyeleri ve arkadaşlarınızla ilişkilerinizi gerginleştirdiğini düşünüyor musunuz?',
      'Dikkatinizi çınlamadan uzaklaştırıp başka şeylere odaklamakta zorlanıyor musunuz?',
      'Çınlamanız üzerinde hiçbir kontrolünüz olmadığını hissediyor musunuz?',
      'Çınlamanız nedeniyle kendinizi sık sık yorgun hissediyor musunuz?',
      'Çınlamanız nedeniyle kendinizi bunalımda hissediyor musunuz?',
      'Çınlamanız sizi kaygılandırıyor mu?',
      'Çınlamanızla artık baş edemeyeceğinizi hissediyor musunuz?',
      'Stres altındayken çınlamanız kötüleşiyor mu?',
      'Çınlamanız kendinizi güvensiz hissetmenize neden oluyor mu?',
    ],
    grades: [
      { min: 0, max: 16, label: 'Derece 1 · Çok hafif', text: 'Çınlama yalnızca sessiz ortamlarda fark ediliyor ve kolayca maskeleniyor; uykuyu veya günlük işleri etkilemiyor.', color: '#4ADE80' },
      { min: 18, max: 36, label: 'Derece 2 · Hafif', text: 'Çınlama ortam sesiyle kolayca maskeleniyor, zaman zaman uykuyu veya sessiz aktiviteleri etkileyebilir. Bilgilendirme ve ses zenginleştirme faydalı olur.', color: '#2EE6D6' },
      { min: 38, max: 56, label: 'Derece 3 · Orta', text: 'Çınlama gürültülü ortamda bile fark ediliyor; uyku ve dikkat etkileniyor. Odyolojik değerlendirme ve tinnitus danışmanlığı önerilir.', color: '#FFC25C' },
      { min: 58, max: 76, label: 'Derece 4 · Şiddetli', text: 'Çınlama neredeyse her zaman duyuluyor; uyku bozukluğu ve günlük yaşamda belirgin kısıtlama var. Çok disiplinli tinnitus yönetimi (odyoloji, KBB, psikoloji) gerekir.', color: '#FF8C42' },
      { min: 78, max: 100, label: 'Derece 5 · Çok şiddetli', text: 'Çınlama sürekli ve rahatsız edici; uyku ve işlev ciddi şekilde bozulmuş. Gecikmeden uzman desteği alın; ruh sağlığı değerlendirmesi de önerilir.', color: '#FF5C5C' },
    ],
  },
  {
    id: 'dhi',
    name: 'DHI',
    full: 'Baş Dönmesi Engellilik Envanteri',
    topic: 'Denge',
    intro: 'Baş dönmesi veya dengesizliğin fiziksel, duygusal ve işlevsel etkisini ölçer. 25 soru, yaklaşık 4 dakika.',
    icon: 'compass',
    gradient: gradients.gold,
    max: 100,
    items: [
      'Yukarı bakmak sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle kendinizi engellenmiş hissediyor musunuz?',
      'Sorununuz nedeniyle iş veya tatil seyahatlerinizi kısıtlıyor musunuz?',
      'Market reyonlarında yürümek sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle yataktan kalkmakta veya yatağa girmekte zorlanıyor musunuz?',
      'Sorununuz; yemeğe çıkmak, sinemaya gitmek, dansa gitmek veya partilere katılmak gibi sosyal etkinliklere katılımınızı önemli ölçüde kısıtlıyor mu?',
      'Sorununuz nedeniyle okumakta güçlük çekiyor musunuz?',
      'Spor, dans gibi daha zorlu aktiviteler veya süpürme, bulaşıkları kaldırma gibi ev işleri sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle birisi size eşlik etmeden evden çıkmaktan korkuyor musunuz?',
      'Sorununuz nedeniyle başkalarının önünde utanç duyuyor musunuz?',
      'Hızlı baş hareketleri sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle yüksek yerlerden kaçınıyor musunuz?',
      'Yatakta dönmek sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle ağır ev işleri veya bahçe işleri yapmakta zorlanıyor musunuz?',
      'Sorununuz nedeniyle insanların sizin sarhoş olduğunuzu düşünmesinden korkuyor musunuz?',
      'Sorununuz nedeniyle tek başınıza yürüyüşe çıkmakta zorlanıyor musunuz?',
      'Kaldırımda yürümek sorununuzu artırıyor mu?',
      'Sorununuz nedeniyle dikkatinizi toplamakta güçlük çekiyor musunuz?',
      'Sorununuz nedeniyle karanlıkta evinizin içinde yürümekte zorlanıyor musunuz?',
      'Sorununuz nedeniyle evde yalnız kalmaktan korkuyor musunuz?',
      'Sorununuz nedeniyle kendinizi engelli hissediyor musunuz?',
      'Sorununuz aile üyeleri veya arkadaşlarınızla ilişkilerinizde gerginliğe yol açıyor mu?',
      'Sorununuz nedeniyle kendinizi bunalımda hissediyor musunuz?',
      'Sorununuz iş veya ev sorumluluklarınızı etkiliyor mu?',
      'Eğilmek sorununuzu artırıyor mu?',
    ],
    grades: [
      { min: 0, max: 30, label: 'Hafif engel algısı', text: 'Baş dönmesi günlük yaşamı sınırlı etkiliyor. Belirtiler sürüyorsa vestibüler değerlendirme (özellikle pozisyonel vertigo için) faydalı olur.', color: '#4ADE80' },
      { min: 31, max: 60, label: 'Orta engel algısı', text: 'Denge sorunu aktivitelerinizi ve duygu durumunuzu etkiliyor. KBB/odyoloji değerlendirmesi ve vestibüler rehabilitasyon önerilir.', color: '#FFC25C' },
      { min: 61, max: 100, label: 'İleri engel algısı', text: 'Baş dönmesi yaşamınızı ciddi şekilde kısıtlıyor ve düşme riski artmış olabilir. Gecikmeden uzman değerlendirmesi ve yapılandırılmış rehabilitasyon gerekir.', color: '#FF5C5C' },
    ],
  },
];

export const byId = (id: QId): Questionnaire => QUESTIONNAIRES.find((q) => q.id === id)!;

export function gradeFor(q: Questionnaire, score: number): Grade {
  return q.grades.find((g) => score >= g.min && score <= g.max) ?? q.grades.reduce((best, g) => (score >= g.min ? g : best), q.grades[0]!);
}

/** Alt ölçek dökümü (THI: F/E/C; DHI: P/E/F). */
export function subscales(q: Questionnaire, answers: number[]): { label: string; score: number; max: number }[] {
  const sum = (idx: number[]) => idx.reduce((s, i) => s + (answers[i - 1] ?? 0), 0);
  if (q.id === 'thi') {
    const F = [1, 2, 4, 7, 9, 12, 13, 15, 18, 20, 24], E = [3, 6, 10, 14, 16, 17, 21, 22, 25], C = [5, 8, 11, 19, 23];
    return [{ label: 'İşlevsel', score: sum(F), max: F.length * 4 }, { label: 'Duygusal', score: sum(E), max: E.length * 4 }, { label: 'Katastrofik', score: sum(C), max: C.length * 4 }];
  }
  if (q.id === 'dhi') {
    const P = [1, 4, 8, 11, 13, 17, 25], E = [2, 9, 10, 15, 18, 20, 21, 22, 23], F = [3, 5, 6, 7, 12, 14, 16, 19, 24];
    return [{ label: 'Fiziksel', score: sum(P), max: P.length * 4 }, { label: 'Duygusal', score: sum(E), max: E.length * 4 }, { label: 'İşlevsel', score: sum(F), max: F.length * 4 }];
  }
  const E = [2, 4, 7, 9], S = [1, 3, 5, 6, 8, 10];
  return [{ label: 'Duygusal', score: sum(E), max: E.length * 4 }, { label: 'Sosyal', score: sum(S), max: S.length * 4 }];
}
