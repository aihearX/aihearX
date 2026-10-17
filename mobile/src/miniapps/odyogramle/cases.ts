import type { AudiogramData } from '@/core/ui';
import type { DxCategory, Laterality } from './diagnoses';

/**
 * Öğretici kompozit vakalar; gerçek hasta verisi değildir.
 * Eşikler dB HL, sıra 250-500-1000-2000-4000-8000 Hz. null = ölçülmedi.
 * İpucu sırası: refleksler, konuşma testleri, OAE, ABR/vestibüler, görüntüleme.
 */
export type Case = {
  id: number;
  difficulty: 1 | 2 | 3;
  history: string;
  audiogram: AudiogramData;
  tympanogram: { right: string; left: string };
  hints: [string, string, string, string, string];
  answer: string;
  category: DxCategory;
  laterality: Laterality;
  keyFreqs: number[];
  explanation: string;
  source: string;
};

const N = 'A (normal)';
const KATZ = 'Katz, Handbook of Clinical Audiology, 7. baskı';
const GELFAND = 'Gelfand, Essentials of Audiology, 4. baskı';
const CUMMINGS = 'Cummings Otolaryngology, 7. baskı';

export const CASES: Case[] = [
  {
    id: 1, difficulty: 1,
    history: '68 yaşında erkek. Kalabalık ortamda konuşmaları anlamakta zorlanıyor, televizyonu yüksek açıyor. Çınlama var, gürültü maruziyeti ve ototoksik ilaç öyküsü yok.',
    audiogram: { right: { ac: [15, 20, 25, 40, 55, 70], bc: [15, 20, 25, 40, 55, null] }, left: { ac: [15, 20, 30, 40, 60, 70], bc: [15, 20, 30, 40, 60, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Akustik refleksler 500-2000 Hz bilateral mevcut, 4 kHz alınamadı.', 'SRT sağ 25 / sol 30 dB HL. WRS sağ %76, sol %72; eşiklerle uyumlu.', 'DPOAE 2 kHz üstünde bilateral alınamadı.', 'ABR dalga V latansları bilateral simetrik, normal sınırlarda.', 'Görüntüleme istenmedi.'],
    answer: 'presbycusis', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [2000, 4000, 8000],
    explanation: 'Bilateral, simetrik, yüksek frekanslara doğru eğimli sensörinöral kayıp; yaş ile uyumlu. WRS eşiklerle orantılı, asimetri yok; retrokoklear patoloji düşündürmez.',
    source: KATZ,
  },
  {
    id: 2, difficulty: 1,
    history: '42 yaşında erkek, 18 yıldır metal fabrikasında çalışıyor; koruyucu kullanımı düzensiz. Vardiya sonrası kulaklarda dolgunluk ve çınlama tarif ediyor.',
    audiogram: { right: { ac: [10, 10, 15, 25, 55, 30], bc: [10, 10, 15, 25, 55, null] }, left: { ac: [10, 15, 15, 30, 60, 35], bc: [10, 15, 15, 30, 60, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler 500-2000 Hz mevcut.', 'WRS bilateral %92; sessizde konuşma iyi.', 'DPOAE 3-6 kHz bantlarında alınamadı, alçak frekanslarda mevcut.', 'ABR normal.', 'Görüntüleme endikasyonu yok.'],
    answer: 'noise_induced', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [4000],
    explanation: '4 kHz çentiği ve 8 kHz\'de toparlanma gürültüye bağlı işitme kaybının klasik imzasıdır; öykü destekler.',
    source: 'NIOSH Criteria for a Recommended Standard: Occupational Noise Exposure',
  },
  {
    id: 3, difficulty: 1,
    history: '5 yaşında erkek çocuk. Anaokulu öğretmeni "duymuyor gibi" diyor; sık üst solunum yolu enfeksiyonu geçiriyor. Ağrı yok, geceleri horluyor.',
    audiogram: { right: { ac: [40, 40, 35, 30, 30, 30], bc: [5, 5, 5, 5, 10, null] }, left: { ac: [40, 35, 35, 30, 30, 25], bc: [5, 5, 5, 5, 10, null] } },
    tympanogram: { right: 'B (normal kanal hacmi)', left: 'B (normal kanal hacmi)' },
    hints: ['Akustik refleksler bilateral alınamadı.', 'SRT bilateral 35 dB HL; WRS %100.', 'TEOAE bilateral alınamadı (iletim komponenti).', 'ABR istenmedi.', 'Otoskopi: zar mat, hava-sıvı seviyesi; adenoid hipertrofisi şüphesi.'],
    answer: 'otitis_media_effusion', category: 'conductive', laterality: 'bilateral', keyFreqs: [250, 500, 1000],
    explanation: 'Düz/alçak frekans ağırlıklı iletim tipi kayıp, tip B timpanogram ve normal kanal hacmi efüzyonu işaret eder. Çocuklarda en sık iletim tipi kayıp nedeni.',
    source: 'AAO-HNS Clinical Practice Guideline: Otitis Media with Effusion (2016)',
  },
  {
    id: 4, difficulty: 2,
    history: '34 yaşında kadın. İkinci gebeliğinden sonra her iki kulakta yavaş ilerleyen işitme azlığı; annesinde de benzer öykü var. Gürültülü ortamda daha iyi duyduğunu söylüyor (paracusis).',
    audiogram: { right: { ac: [45, 45, 40, 45, 35, 30], bc: [10, 15, 20, 30, 15, null] }, left: { ac: [40, 40, 35, 40, 30, 25], bc: [10, 10, 15, 25, 10, null] } },
    tympanogram: { right: 'As', left: 'As' },
    hints: ['Akustik refleksler bilateral alınamadı; erken dönemde "on-off" etkisi.', 'SRT bilateral 40 dB HL; WRS %100.', 'OAE bilateral alınamadı.', 'ABR: dalga latansları iletim kaybıyla uyumlu kaymış, interpeak normal.', 'Temporal BT: fissula ante fenestram\'da otospongiotik odak.'],
    answer: 'otosclerosis', category: 'conductive', laterality: 'bilateral', keyFreqs: [250, 500, 1000, 2000],
    explanation: 'Hava-kemik aralığı, 2 kHz\'de kemik yolunda Carhart çentiği, tip As ve refleks yokluğu; aile öyküsü ve gebelikle ilerleme otosklerozu destekler.',
    source: CUMMINGS,
  },
  {
    id: 5, difficulty: 2,
    history: '45 yaşında kadın. Sol kulakta dolgunluk ve uğultulu çınlama ile birlikte saatler süren, bulantılı baş dönmesi atakları. İşitme ataklarda kötüleşip sonra kısmen düzeliyor.',
    audiogram: { right: { ac: [10, 10, 10, 10, 15, 15], bc: [10, 10, 10, 10, 15, null] }, left: { ac: [50, 45, 40, 30, 25, 25], bc: [50, 45, 40, 30, 25, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler bilateral mevcut; solda eşikler yükselmiş ama alınabiliyor.', 'SRT sol 40 dB HL; WRS sol %80, sağ %100.', 'DPOAE solda alçak frekanslarda alınamadı.', 'ABR normal; cVEMP solda amplitüd düşük; kalorik testte sol zayıflık %35.', 'MRG: iç kulak ve pontoserebellar köşe normal.'],
    answer: 'meniere', category: 'sensorineural', laterality: 'left', keyFreqs: [250, 500, 1000],
    explanation: 'Tek taraflı, alçak frekans ağırlıklı yükselen SNİK, dalgalanma ve epizodik vertigo üçlüsü Ménière hastalığının tanımlayıcı tablosudur.',
    source: 'Bárány Society Diagnostic Criteria for Menière\'s Disease (2015)',
  },
  {
    id: 6, difficulty: 1,
    history: '52 yaşında erkek. Üç gün önce sabah uyandığında sağ kulağının "tıkanmış" olduğunu fark etmiş; çınlama eşlik ediyor, baş dönmesi yok. Geçmişte kulak sorunu yok.',
    audiogram: { right: { ac: [60, 65, 70, 70, 75, 80], bc: [60, 65, 70, 70, 75, null] }, left: { ac: [10, 10, 10, 15, 15, 20], bc: [10, 10, 10, 15, 15, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Sağ ipsilateral refleksler alınamadı; sol normal.', 'SRT sağ 70 dB HL, WRS sağ %48.', 'DPOAE sağda tüm bantlarda alınamadı.', 'ABR sağda dalga V 80 dB nHL\'de güçlükle elde edildi.', 'Aciliyet: 72 saat içinde değerlendirme; MRG retrokoklear patolojiyi dışlamak için planlandı.'],
    answer: 'ssnhl', category: 'sensorineural', laterality: 'right', keyFreqs: [250, 500, 1000, 2000, 4000, 8000],
    explanation: '72 saat içinde gelişen, ardışık üç frekansta ≥30 dB tek taraflı SNİK: ani işitme kaybı tanımı. Odyolojik acildir; erken tedavi sonucu etkiler.',
    source: 'AAO-HNS Clinical Practice Guideline: Sudden Hearing Loss (2019)',
  },
  {
    id: 7, difficulty: 3,
    history: '48 yaşında kadın. Sol kulakta bir yıldır yavaş artan işitme azlığı ve sürekli çınlama; telefonu hep sağ kulağına tutuyor. Dengesizlik hissi ara ara.',
    audiogram: { right: { ac: [10, 10, 15, 15, 20, 25], bc: [10, 10, 15, 15, 20, null] }, left: { ac: [25, 30, 40, 55, 65, 70], bc: [25, 30, 40, 55, 65, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Sol refleksler yükselmiş eşikte alınıyor; 500-1000 Hz\'de belirgin refleks çürümesi.', 'WRS sol %36 (eşiklere göre beklenenden kötü, rollover pozitif); sağ %100.', 'DPOAE solda 1-4 kHz arasında kısmen mevcut (koklea görece korunmuş).', 'ABR: sol dalga V latansı 0,6 ms gecikmiş, interaural fark anlamlı.', 'Kontrastlı MRG: sol iç kulak yolunda 11 mm kitle.'],
    answer: 'vestibular_schwannoma', category: 'retrocochlear', laterality: 'left', keyFreqs: [2000, 4000, 8000],
    explanation: 'Asimetrik SNİK + eşiklere göre orantısız kötü WRS + refleks çürümesi + ABR gecikmesi retrokoklear dörtlüsüdür; MRG tanıyı doğrular.',
    source: KATZ,
  },
  {
    id: 8, difficulty: 1,
    history: '29 yaşında erkek. Kulak temizleme çubuğuyla temizlerken ani ağrı ve ardından sağ kulakta işitme azlığı. Az miktarda kanlı akıntı olmuş.',
    audiogram: { right: { ac: [35, 35, 30, 30, 25, 25], bc: [5, 5, 5, 5, 10, null] }, left: { ac: [5, 5, 5, 10, 10, 10], bc: [5, 5, 5, 10, 10, null] } },
    tympanogram: { right: 'B (kanal hacmi büyük: 3,2 ml)', left: N },
    hints: ['Sağ refleksler alınamadı (sonda sızdırıyor gibi davranıyor).', 'SRT sağ 30 dB HL; WRS %100.', 'OAE sağda alınamadı; solda normal.', 'ABR istenmedi.', 'Otoskopi: sağ zar pars tensada düzensiz kenarlı santral delik.'],
    answer: 'tm_perforation', category: 'conductive', laterality: 'right', keyFreqs: [250, 500, 1000],
    explanation: 'Tip B timpanogramın anahtar ayırıcısı kanal hacmidir: büyük hacim perforasyonu, normal hacim efüzyonu düşündürür. Travmatik perforasyonların çoğu kendiliğinden iyileşir.',
    source: GELFAND,
  },
  {
    id: 9, difficulty: 2,
    history: '61 yaşında kadın, over kanseri için sisplatin bazlı kemoterapinin üçüncü kürünü tamamladı. Yüksek perdeli çınlama başladı; seri odyogramlarda yüksek frekansların kötüleştiği görülüyor.',
    audiogram: { right: { ac: [10, 10, 15, 30, 60, 80], bc: [10, 10, 15, 30, 60, null] }, left: { ac: [10, 15, 15, 35, 65, 85], bc: [10, 15, 15, 35, 65, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler 500-1000 Hz mevcut, 2-4 kHz alınamadı.', 'WRS bilateral %88.', 'DPOAE yüksek frekanslarda ilk kürden sonra kaybolmaya başlamış; yüksek frekans odyometri (10-16 kHz) daha erken etkilenmiş.', 'ABR normal morfoloji.', 'Görüntüleme endikasyonu yok; onkolojiye doz bildirimi yapıldı.'],
    answer: 'ototoxicity', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [4000, 8000],
    explanation: 'Sisplatin önce bazal koklea yani yüksek frekansları etkiler; bilateral simetrik, seri ölçümde ilerleyen SNİK ve ilaç öyküsü ototoksisiteyi gösterir. Takipte ultra yüksek frekans odyometri ve OAE kritik.',
    source: 'ASHA Guidelines for the Audiologic Management of Individuals Receiving Cochleotoxic Drug Therapy',
  },
  {
    id: 10, difficulty: 2,
    history: '24 yaşında kadın, üniversite öğrencisi. Kafede arkadaşlarını anlamakta zorlandığını söylüyor; sık konser ve kulaklıkla müzik dinleme öyküsü var. Sessiz ortamda sorun yok.',
    audiogram: { right: { ac: [5, 5, 5, 10, 15, 15], bc: [5, 5, 5, 10, 15, null] }, left: { ac: [5, 5, 10, 10, 15, 10], bc: [5, 5, 10, 10, 15, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler bilateral normal eşiklerde.', 'WRS sessizde %100; gürültüde konuşma testi (SNR) yaşıtlarına göre hafif kötü.', 'DPOAE bilateral mevcut, amplitüdler normal sınırlarda.', 'ABR dalga I amplitüdü görece düşük; kesin tanı ölçütü değil.', 'Görüntüleme gerekmiyor.'],
    answer: 'normal', category: 'normal', laterality: 'bilateral', keyFreqs: [],
    explanation: 'Tüm eşikler 20 dB HL içinde: odyometrik olarak normal işitme. Gürültüde anlama güçlüğü "gizli işitme kaybı" (sinaptopati) tartışmasını açar ama standart odyogramda tanı "normal"dir. Her odyogramda kayıp aramayın.',
    source: 'Liberman & Kujawa, Hear Res 2017; Hidden hearing loss literatürü',
  },
  {
    id: 11, difficulty: 2,
    history: '19 yaşında erkek, iş kazası sonrası tazminat sürecinde. Her iki kulakta ciddi işitme kaybı tarif ediyor ancak muayene odasında normal ses seviyesinde rahat sohbet ediyor.',
    audiogram: { right: { ac: [55, 60, 60, 60, 65, 65], bc: [50, 55, 55, 60, 60, null] }, left: { ac: [55, 55, 60, 60, 65, 70], bc: [50, 55, 55, 60, 60, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Akustik refleksler bilateral 85-90 dB HL\'de alınıyor (eşiklere göre beklenmedik ölçüde normal).', 'SRT bilateral 20 dB HL; saf ses ortalaması 60 dB ile uyumsuz. Tekrar testlerde eşikler ±15 dB oynuyor.', 'DPOAE bilateral tüm bantlarda güçlü.', 'ABR: dalga V 20 dB nHL\'e kadar izlenebiliyor; Stenger testi pozitif.', 'Görüntüleme endikasyonu yok.'],
    answer: 'nonorganic', category: 'functional', laterality: 'bilateral', keyFreqs: [500, 1000, 2000],
    explanation: 'SRT-PTA uyumsuzluğu, tutarsız eşikler, normal refleks ve OAE, objektif testte normal işitme: nonorganik (fonksiyonel) işitme kaybı. Yargılamadan, objektif testlerle belgeleyin.',
    source: KATZ,
  },
  {
    id: 12, difficulty: 2,
    history: '8 aylık bebek. Yenidoğan tarama testinden (ABR) iki kez "kaldı". Prematüre doğmuş, yenidoğan yoğun bakımda 3 hafta kalmış, sarılık nedeniyle fototerapi almış. Seslere tepkisi değişken.',
    audiogram: { right: { ac: [50, 55, 55, 60, 60, 60] }, left: { ac: [50, 50, 55, 60, 60, 60] } },
    tympanogram: { right: 'A (1000 Hz sonda tonu, normal)', left: 'A (1000 Hz sonda tonu, normal)' },
    hints: ['Akustik refleksler bilateral alınamadı.', 'Davranışsal eşikler (VRA) tutarsız; konuşma farkındalığı eşiklerle uyumsuz.', 'TEOAE ve DPOAE bilateral MEVCUT, amplitüdler normal.', 'ABR: koklear mikrofonik belirgin ve polarite ile tersleniyor; nöral dalgalar (I-V) 90 dB nHL\'de dahi yok.', 'MRG: koklear sinir her iki tarafta mevcut.'],
    answer: 'ansd', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [250, 500, 1000, 2000, 4000, 8000],
    explanation: 'OAE mevcut + ABR yok + koklear mikrofonik var: işitsel nöropati spektrum bozukluğu. Dış tüylü hücreler sağlam, iç tüylü hücre/sinaps/sinir düzeyinde sorun. Prematürite ve hiperbilirubinemi risk faktörleri.',
    source: 'JCIH 2019 Position Statement; Starr et al., Brain 1996',
  },
  {
    id: 13, difficulty: 3,
    history: '38 yaşında kadın. Yüksek seslerde baş dönmesi (Tullio), kendi sesini ve göz hareketlerini kulağında duyma (otofoni). Merdiven çıkarken ayak seslerinin sağ kulakta yankılandığını söylüyor.',
    audiogram: { right: { ac: [35, 30, 20, 10, 10, 10], bc: [-5, 0, 5, 10, 10, null] }, left: { ac: [5, 5, 5, 10, 10, 10], bc: [5, 5, 5, 10, 10, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Akustik refleksler bilateral MEVCUT (iletim tipi kayıpta beklenmez).', 'WRS bilateral %100.', 'OAE bilateral mevcut.', 'cVEMP sağda eşik 65 dB nHL\'e düşmüş, amplitüd belirgin yüksek.', 'Yüksek çözünürlüklü temporal BT (Pöschl): sağ süperior semisirküler kanal tavanında kemik defekti.'],
    answer: 'sscd', category: 'conductive', laterality: 'right', keyFreqs: [250, 500],
    explanation: 'Alçak frekanslarda hava-kemik aralığı, 0 dB\'nin altında "süpranormal" kemik yolu, refleksler ve OAE mevcut: orta kulak kaynaklı olmayan "yalancı iletim" kaybı. Üçüncü pencere etkisi; cVEMP eşiği düşük, BT tanıyı koyar.',
    source: 'Minor LB, Arch Otolaryngol Head Neck Surg 1998',
  },
  {
    id: 14, difficulty: 3,
    history: '31 yaşında erkek. Sol kulakta yıllardır aralıklı, kötü kokulu akıntı ve giderek artan işitme azlığı. Çocuklukta sık otit geçirmiş; son aylarda hafif baş dönmesi eklendi.',
    audiogram: { right: { ac: [10, 10, 10, 15, 15, 20], bc: [10, 10, 10, 15, 15, null] }, left: { ac: [55, 55, 50, 50, 45, 45], bc: [15, 20, 25, 30, 35, null] } },
    tympanogram: { right: N, left: 'B (düz)' },
    hints: ['Sol refleksler alınamadı.', 'SRT sol 50 dB HL; WRS %92.', 'OAE solda alınamadı.', 'Fistül testi solda pozitif (nistagmus); kalorik testte sol zayıflık.', 'Temporal BT: sol attik/antrumda kemik erozyonu yapan yumuşak doku kitlesi, lateral semisirküler kanal fistülü şüphesi.'],
    answer: 'cholesteatoma', category: 'mixed', laterality: 'left', keyFreqs: [250, 500, 1000, 2000],
    explanation: 'Kötü kokulu kronik akıntı, kemik erozyonu ve fistül bulgusu kolesteatomu işaret eder. Kemikçik erozyonu iletim komponentini, iç kulak tutulumu sensörinöral komponenti açıklar: mikst kayıp. Cerrahi öncesi değerlendirme gerekir.',
    source: CUMMINGS,
  },
  {
    id: 15, difficulty: 2,
    history: '2 yaşında kız çocuk. Yenidoğan taramasından sağ kulakta "kaldı", sol geçti. Doğumda düşük doğum ağırlığı ve ciltte peteşi; doğum sonrası idrar örneğinde virüs saptanmış. Son 6 ayda sol kulak da kötüleşmiş.',
    audiogram: { right: { ac: [70, 75, 80, 85, 90, 95] }, left: { ac: [40, 45, 50, 55, 60, 65] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler sağ alınamadı, sol yükselmiş eşikte.', 'Konuşma farkındalık eşiği oyun odyometrisiyle sağ 75, sol 45 dB HL.', 'OAE bilateral alınamadı.', 'ABR: sağ 90 dB nHL\'de dalga V yok; sol 55 dB nHL\'de izleniyor. Seri ABR\'de ilerleme.', 'Kraniyal MRG: periventriküler kalsifikasyon ve beyaz cevher değişiklikleri.'],
    answer: 'congenital_cmv', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [1000, 2000, 4000, 8000],
    explanation: 'Asimetrik, ilerleyici ve geç başlangıçlı olabilen SNİK ile doğumda viral bulgular: konjenital sitomegalovirüs, kalıtsal olmayan konjenital işitme kaybının en sık nedeni. Seri takip şart.',
    source: 'Goderis et al., Pediatrics 2014; JCIH 2019',
  },
  {
    id: 16, difficulty: 2,
    history: '9 yaşında erkek çocuk. Kaykaydan düşüp başını çarptıktan sonra her iki kulakta işitmede belirgin düşüş; aile daha önce de "bazen iyi bazen kötü duyuyor" diyor. Orta kulak muayenesi normal.',
    audiogram: { right: { ac: [40, 45, 50, 55, 55, 60], bc: [20, 30, 45, 55, 55, null] }, left: { ac: [45, 45, 50, 55, 60, 60], bc: [25, 30, 45, 55, 60, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler bilateral mevcut ancak eşikler yükselmiş.', 'SRT bilateral 45-50 dB HL; WRS %84.', 'OAE bilateral alınamadı.', 'ABR: dalga V 55 dB nHL\'de bilateral; cVEMP eşikleri düşük.', 'Temporal BT: vestibüler akuadukt orta noktada 2,1 mm (>1,5 mm).'],
    answer: 'evas', category: 'mixed', laterality: 'bilateral', keyFreqs: [250, 500, 1000, 2000],
    explanation: 'Dalgalanan, kafa travmasıyla basamaklı kötüleşen çocukluk çağı kaybı; normal orta kulağa rağmen alçak frekanslarda hava-kemik aralığı (üçüncü pencere) geniş vestibüler akuadukt için tipiktir. Temas sporlarından kaçınma önerilir.',
    source: 'Valvassori & Clemis, Laryngoscope 1978; Cummings',
  },
  {
    id: 17, difficulty: 1,
    history: '27 yaşında kadın, tatilde her gün havuza girmiş. Üç gündür sağ kulakta şiddetli ağrı, kulak kepçesine dokununca artıyor; kanalda şişlik ve akıntı.',
    audiogram: { right: { ac: [30, 30, 25, 25, 25, 30], bc: [5, 5, 5, 5, 10, null] }, left: { ac: [5, 5, 5, 5, 10, 10], bc: [5, 5, 5, 5, 10, null] } },
    tympanogram: { right: 'Ölçülemedi (sonda yerleştirilemedi, kanal ödemli)', left: N },
    hints: ['Sağ refleks ölçümü yapılamadı; sol normal.', 'SRT sağ 25 dB HL; WRS %100.', 'OAE sağda alınamadı (kanal tıkalı), solda normal.', 'ABR istenmedi.', 'Otoskopi: sağ dış kulak yolu ödemli, eritemli, deskuamasyon; zar görülemiyor.'],
    answer: 'otitis_externa', category: 'conductive', laterality: 'right', keyFreqs: [250, 500],
    explanation: 'Tragus hassasiyeti, kanal ödemi ve su maruziyeti akut otitis eksterna ("yüzücü kulağı") için klasik tablodur. Hafif iletim tipi kayıp kanal tıkanıklığına bağlıdır ve tedaviyle düzelir.',
    source: 'AAO-HNS Clinical Practice Guideline: Acute Otitis Externa (2014)',
  },
  {
    id: 18, difficulty: 1,
    history: '70 yaşında erkek, 4 yıldır iki taraflı işitme cihazı kullanıyor. Son iki haftada sol cihazının "bozulduğunu", sesin boğuk geldiğini söylüyor. Cihaz kontrolünde arıza yok.',
    audiogram: { right: { ac: [20, 25, 35, 45, 55, 65], bc: [20, 25, 35, 45, 55, null] }, left: { ac: [45, 50, 55, 60, 65, 75], bc: [20, 25, 35, 45, 55, null] } },
    tympanogram: { right: N, left: 'Ölçülemedi (düz çizgi, çok küçük hacim)' },
    hints: ['Sol refleks ölçümü yapılamadı.', 'SRT sağ 30 / sol 50 dB HL; WRS her iki tarafta %80.', 'OAE bilateral alınamadı (sağ presbiakuzi, sol kanal tıkalı).', 'ABR istenmedi.', 'Otoskopi: sol dış kulak yolu tamamen serumenle tıkalı; cihaz kalıbı serumenle dolu.'],
    answer: 'cerumen', category: 'mixed', laterality: 'left', keyFreqs: [250, 500, 1000],
    explanation: 'Var olan simetrik SNİK üzerine solda yeni hava-kemik aralığı ve çok küçük kanal hacmi: serumen tıkacı. Cihaz kullanıcılarında en sık "cihaz bozuldu" nedenidir; önce kanala bakın.',
    source: 'AAO-HNS Clinical Practice Guideline: Earwax (Cerumen Impaction) (2017)',
  },
  {
    id: 19, difficulty: 3,
    history: '33 yaşında erkek, motosiklet kazasında temporal kemik kırığı. Taburculuk sonrası sağ kulakta belirgin işitme azlığı; zar sağlam, akıntı yok, baş dönmesi yok.',
    audiogram: { right: { ac: [60, 60, 55, 55, 55, 55], bc: [5, 5, 5, 10, 10, null] }, left: { ac: [5, 5, 5, 10, 10, 15], bc: [5, 5, 5, 10, 10, null] } },
    tympanogram: { right: 'Ad (çok yüksek komplians)', left: N },
    hints: ['Sağ refleksler alınamadı; sol normal.', 'SRT sağ 55 dB HL; WRS %100.', 'OAE sağda alınamadı.', 'ABR istenmedi.', 'Temporal BT: sağ inkudostapedial eklem ayrışması; zar ve koklea sağlam.'],
    answer: 'ossicular_discontinuity', category: 'conductive', laterality: 'right', keyFreqs: [250, 500, 1000, 2000],
    explanation: 'Sağlam zar ile 55-60 dB\'lik "maksimal" iletim kaybı ve tip Ad timpanogram kemikçik zincir kopukluğunu düşündürür; travma öyküsü tipiktir. Ossikuloplasti ile düzeltilebilir.',
    source: CUMMINGS,
  },
  {
    id: 20, difficulty: 2,
    history: '4 yaşında kız çocuk. İki ay önce bakteriyel menenjit nedeniyle yoğun bakımda yatmış. Taburculuktan sonra seslere tepki vermiyor, konuşması gerilemeye başladı.',
    audiogram: { right: { ac: [95, 100, 110, 115, 120, null] }, left: { ac: [95, 100, 110, 115, 120, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Akustik refleksler bilateral alınamadı.', 'Konuşma farkındalığı 100 dB HL\'de yok.', 'OAE bilateral alınamadı.', 'ABR: 95 dB nHL\'de bilateral yanıt yok.', 'MRG/BT: her iki kokleada bazal turda ossifikasyon başlangıcı (labirentitis ossifikans).'],
    answer: 'post_meningitis', category: 'sensorineural', laterality: 'bilateral', keyFreqs: [250, 500, 1000, 2000, 4000, 8000],
    explanation: 'Menenjit sonrası bilateral çok ileri SNİK; koklear ossifikasyon hızla ilerleyebildiğinden koklear implant değerlendirmesi acildir. Çocuklarda edinilmiş derin kaybın önde gelen nedeni.',
    source: 'Cummings; JCIH 2019 risk faktörleri',
  },
  {
    id: 21, difficulty: 1,
    history: '3 yaşında erkek çocuk. İki gündür ateş, huzursuzluk ve sağ kulağını çekiştirme; geceleri ağlayarak uyanıyor. Bir hafta önce nezle geçirmiş.',
    audiogram: { right: { ac: [45, 45, 40, 35, 35, 35], bc: [10, 10, 10, 10, 15, null] }, left: { ac: [10, 10, 10, 10, 15, 15], bc: [10, 10, 10, 10, 15, null] } },
    tympanogram: { right: 'B (normal kanal hacmi)', left: N },
    hints: ['Sağ refleksler alınamadı; sol mevcut.', 'Oyun odyometrisi: SRT sağ 40 / sol 10 dB HL.', 'TEOAE sağda alınamadı, solda mevcut.', 'ABR istenmedi.', 'Otoskopi: sağ zar hiperemik, bombe, ışık reflesi kaybolmuş.'],
    answer: 'acute_otitis_media', category: 'conductive', laterality: 'right', keyFreqs: [250, 500, 1000],
    explanation: 'Akut başlangıç, ateş ve ağrı ile bombe-hiperemik zar: akut otitis media. Efüzyonlu otitten farkı akut enfeksiyon bulgularıdır; işitme kaybı tedaviyle geriler, 3 ay sonra kontrol odyogramı önerilir.',
    source: 'AAP Clinical Practice Guideline: Acute Otitis Media (2013)',
  },
  {
    id: 22, difficulty: 2,
    history: '55 yaşında kadın. Yirmi yıldır sağ kulakta aralıklı, kokusuz akıntı; grip olunca artıyor. Sağda ilerleyen işitme azlığı ve ara ara çınlama. Ağrı yok.',
    audiogram: { right: { ac: [60, 60, 55, 60, 65, 70], bc: [20, 25, 30, 40, 45, null] }, left: { ac: [20, 20, 20, 25, 30, 35], bc: [20, 20, 20, 25, 30, null] } },
    tympanogram: { right: 'B (kanal hacmi büyük)', left: N },
    hints: ['Sağ refleksler alınamadı.', 'SRT sağ 55 / sol 20 dB HL; WRS sağ %84, sol %96.', 'OAE sağda alınamadı.', 'ABR istenmedi.', 'Otoskopi: sağda büyük santral perforasyon, mukoza ödemli; BT\'de mastoid hücrelerde skleroz, kolesteatom lehine erozyon yok.'],
    answer: 'chronic_otitis_media', category: 'mixed', laterality: 'right', keyFreqs: [250, 500, 1000, 2000],
    explanation: 'Yıllardır süren akıntı, kalıcı santral perforasyon ve büyük kanal hacimli tip B: kronik otitis media. Uzun süreli enflamasyonun iç kulağa etkisi sensörinöral komponenti açıklar; kemik erozyonu yoksa kolesteatomsuz tip.',
    source: CUMMINGS,
  },
  {
    id: 23, difficulty: 2,
    history: '22 yaşında erkek, askerlikte atış eğitimi sırasında koruyucusuz tek bir yakın patlamaya maruz kalmış. O günden beri sol kulakta sürekli tiz çınlama ve işitme azlığı; sağ kulak (tüfek omzu tarafı) daha az etkilenmiş.',
    audiogram: { right: { ac: [10, 10, 10, 15, 20, 15], bc: [10, 10, 10, 15, 20, null] }, left: { ac: [10, 10, 15, 35, 65, 45], bc: [10, 10, 15, 35, 65, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler 500-1000 Hz bilateral mevcut; sol 4 kHz alınamadı.', 'WRS sağ %100, sol %88.', 'DPOAE sol 3-6 kHz\'de alınamadı.', 'ABR normal.', 'Görüntüleme gerekmiyor.'],
    answer: 'noise_acoustic_trauma', category: 'sensorineural', laterality: 'left', keyFreqs: [2000, 4000, 8000],
    explanation: 'Tek bir yoğun impuls sesten sonra gelişen, 4 kHz çentikli asimetrik SNİK: akustik travma. Kronik gürültü kaybından farkı ani ve tek olaylı olmasıdır; sağ elini kullanan atıcıda sol kulak daha çok etkilenir (baş gölgesi).',
    source: 'Katz; Military audiology literatürü',
  },
  {
    id: 24, difficulty: 3,
    history: '9 yaşında kız çocuk. Öğretmeni sınıfta yönergeleri takip edemediğini, gürültülü ortamda "duymamış gibi" davrandığını bildiriyor. Sessiz odada bire bir konuşmada sorun yok. Tekrarlayan otit öyküsü var, şu an orta kulak normal.',
    audiogram: { right: { ac: [5, 5, 5, 5, 10, 10], bc: [5, 5, 5, 5, 10, null] }, left: { ac: [5, 5, 5, 10, 10, 10], bc: [5, 5, 5, 10, 10, null] } },
    tympanogram: { right: N, left: N },
    hints: ['Refleksler bilateral normal.', 'Sessizde WRS %100; gürültüde konuşma anlama ve dikotik kelime testlerinde sol kulak skoru yaşa göre belirgin düşük.', 'OAE bilateral normal.', 'ABR normal; frekans paterni ve boşluk tespiti testleri yaş normunun altında.', 'MRG normal; dil ve dikkat değerlendirmesi normal sınırda.'],
    answer: 'auditory_processing_disorder', category: 'retrocochlear', laterality: 'bilateral', keyFreqs: [],
    explanation: 'Normal odyogram ve periferik testlerle birlikte dikotik, temporal ve gürültüde konuşma testlerinde bozukluk: işitsel işlemleme bozukluğu. Tanı için dikkat/dil sorunlarının dışlanması ve test bataryasında en az iki testte 2 SS altı gerekir.',
    source: 'AAA Clinical Practice Guidelines: Diagnosis, Treatment and Management of Children and Adults with CAPD (2010)',
  },
];

export const caseById = (id: number): Case | undefined => CASES.find((c) => c.id === id);
