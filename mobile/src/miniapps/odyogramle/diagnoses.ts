export type DxCategory = 'conductive' | 'sensorineural' | 'mixed' | 'retrocochlear' | 'functional' | 'normal';
export type Laterality = 'right' | 'left' | 'bilateral';

export type Diagnosis = { key: string; name: string; category: DxCategory; synonyms: string[] };

export const CATEGORY_NAME: Record<DxCategory, string> = {
  conductive: 'İletim tipi',
  sensorineural: 'Sensörinöral',
  mixed: 'Mikst',
  retrocochlear: 'Retrokoklear / santral',
  functional: 'Nonorganik',
  normal: 'Normal işitme',
};

/** Tanı seçicide bölüm sırası. */
export const CATEGORY_ORDER: DxCategory[] = ['conductive', 'sensorineural', 'mixed', 'retrocochlear', 'functional', 'normal'];

export const LATERALITY_NAME: Record<Laterality, string> = { right: 'Sağ', left: 'Sol', bilateral: 'Bilateral' };

export const DIAGNOSES: Diagnosis[] = [
  { key: 'presbycusis', name: 'Presbiakuzi', category: 'sensorineural', synonyms: ['yaşa bağlı', 'yaşlılık'] },
  { key: 'noise_induced', name: 'Gürültüye bağlı işitme kaybı', category: 'sensorineural', synonyms: ['GBİK', 'NIHL', 'çentik'] },
  { key: 'otosclerosis', name: 'Otoskleroz', category: 'conductive', synonyms: ['stapes fiksasyonu', 'carhart'] },
  { key: 'meniere', name: 'Ménière hastalığı', category: 'sensorineural', synonyms: ['meniere', 'endolenfatik hidrops'] },
  { key: 'ssnhl', name: 'Ani sensörinöral işitme kaybı', category: 'sensorineural', synonyms: ['ani', 'SSNHL', 'ASNİK'] },
  { key: 'vestibular_schwannoma', name: 'Vestibüler schwannom', category: 'retrocochlear', synonyms: ['akustik nörinom', 'nörinom', 'schwannoma'] },
  { key: 'otitis_media_effusion', name: 'Efüzyonlu otitis media', category: 'conductive', synonyms: ['seröz otit', 'EOM', 'sıvı'] },
  { key: 'tm_perforation', name: 'Timpanik membran perforasyonu', category: 'conductive', synonyms: ['zar deliği', 'perforasyon', 'kulak zarı'] },
  { key: 'cholesteatoma', name: 'Kolesteatom', category: 'mixed', synonyms: ['kolesteatoma', 'retraksiyon cebi'] },
  { key: 'ototoxicity', name: 'Ototoksisite', category: 'sensorineural', synonyms: ['ilaç', 'sisplatin', 'aminoglikozid', 'tobramisin'] },
  { key: 'sscd', name: 'Süperior semisirküler kanal dehisansı', category: 'conductive', synonyms: ['SSKD', 'dehisans', 'minor', 'üçüncü pencere'] },
  { key: 'ansd', name: 'İşitsel nöropati spektrum bozukluğu', category: 'sensorineural', synonyms: ['ANSD', 'nöropati', 'auditory neuropathy'] },
  { key: 'nonorganic', name: 'Nonorganik işitme kaybı', category: 'functional', synonyms: ['fonksiyonel', 'psikojenik', 'simülasyon', 'stenger'] },
  { key: 'congenital_cmv', name: 'Konjenital CMV', category: 'sensorineural', synonyms: ['sitomegalovirüs', 'doğumsal enfeksiyon'] },
  { key: 'evas', name: 'Geniş vestibüler akuadukt', category: 'mixed', synonyms: ['EVA', 'LVAS', 'akuadukt', 'pendred'] },
  { key: 'otitis_externa', name: 'Otitis eksterna', category: 'conductive', synonyms: ['dış kulak yolu enfeksiyonu', 'yüzücü kulağı'] },
  { key: 'cerumen', name: 'Serumen tıkacı', category: 'conductive', synonyms: ['buşon', 'kulak kiri', 'serümen'] },
  { key: 'ossicular_discontinuity', name: 'Kemikçik zincir kopukluğu', category: 'conductive', synonyms: ['diskontinüite', 'kemikçik', 'inkus'] },
  { key: 'post_meningitis', name: 'Menenjit sonrası işitme kaybı', category: 'sensorineural', synonyms: ['menenjit', 'ossifikasyon'] },
  { key: 'normal', name: 'Normal işitme', category: 'normal', synonyms: ['normal', 'gizli işitme kaybı'] },
  { key: 'acute_otitis_media', name: 'Akut otitis media', category: 'conductive', synonyms: ['AOM', 'orta kulak iltihabı'] },
  { key: 'chronic_otitis_media', name: 'Kronik otitis media', category: 'mixed', synonyms: ['KOM', 'kronik akıntı', 'timpanoskleroz'] },
  { key: 'noise_acoustic_trauma', name: 'Akustik travma', category: 'sensorineural', synonyms: ['patlama', 'silah sesi', 'blast'] },
  { key: 'auditory_processing_disorder', name: 'İşitsel işlemleme bozukluğu', category: 'retrocochlear', synonyms: ['İİB', 'APD', 'santral işitsel işlemleme'] },
  { key: 'vestibular_neuritis', name: 'Vestibüler nörit', category: 'normal', synonyms: ['nöronit', 'vestibüler nöronit', 'akut vestibüler sendrom'] },
  { key: 'bppv', name: 'BPPV', category: 'normal', synonyms: ['pozisyonel vertigo', 'benign paroksismal', 'dix-hallpike', 'kristal'] },
  { key: 'ventilation_tube', name: 'Ventilasyon tüpü (açık)', category: 'normal', synonyms: ['tüp', 'grommet', 'havalandırma tüpü'] },
  { key: 'cochlear_nerve_deficiency', name: 'Koklear sinir yetmezliği', category: 'sensorineural', synonyms: ['sinir aplazisi', 'hipoplazi', 'CND', 'dar iç kulak yolu'] },
];

export const dxByKey = (key: string): Diagnosis | undefined => DIAGNOSES.find((d) => d.key === key);

const fold = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[̇]/g, '');
export function searchDx(q: string): Diagnosis[] {
  const f = fold(q.trim());
  if (!f) return DIAGNOSES;
  return DIAGNOSES.filter((d) => fold(d.name).includes(f) || fold(CATEGORY_NAME[d.category]).includes(f) || d.synonyms.some((s) => fold(s).includes(f)));
}

/** Kategoriye göre bölümlenmiş liste (seçici için). */
export function groupDx(list: Diagnosis[]): { category: DxCategory; items: Diagnosis[] }[] {
  return CATEGORY_ORDER.map((category) => ({ category, items: list.filter((d) => d.category === category) })).filter((g) => g.items.length > 0);
}
