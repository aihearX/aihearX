export type Tymp = { pressure: number; compliance: number; volume: number };
export type JergerType = 'A' | 'As' | 'Ad' | 'B' | 'C';
export type Classification = { type: JergerType; title: string; summary: string; findings: string[]; color: string };

export const TYPES: JergerType[] = ['A', 'As', 'Ad', 'B', 'C'];
export const RANGES = { pressure: [-400, 200], compliance: [0, 3], volume: [0.3, 3] } as const;

export function classify(t: Tymp): Classification {
  if (t.compliance <= 0.1) {
    if (t.volume > 2.0) return { type: 'B', title: 'Tip B · büyük hacim', summary: 'Düz eğri, kulak kanalı hacmi büyük: zar bütünlüğü bozuk.', findings: ['Timpan membran perforasyonu', 'Açık ventilasyon tüpü', 'Hacim yüksek çünkü orta kulak boşluğu da ölçüme katılır'], color: '#FF8C42' };
    if (t.volume < 0.5) return { type: 'B', title: 'Tip B · küçük hacim', summary: 'Düz eğri, hacim çok küçük: prob kanala ulaşamıyor.', findings: ['Serumen tıkacı', 'Prob kanal duvarına dayalı / prob tıkalı', 'Probu yeniden yerleştirip tekrarla'], color: '#FF8C42' };
    return { type: 'B', title: 'Tip B · normal hacim', summary: 'Düz eğri, hacim normal: orta kulakta sıvı veya kitle.', findings: ['Efüzyonlu otitis media (en sık)', 'Ciddi timpanoskleroz / kolesteatom', 'Akustik refleks genelde alınamaz'], color: '#FF5C5C' };
  }
  if (t.pressure < -100) return { type: 'C', title: 'Tip C', summary: 'Tepe negatif basınçta: östaki tüpü yeterince açılmıyor.', findings: ['Östaki tüpü disfonksiyonu', 'ÜSYE sonrası / alerji', 'Efüzyon gelişiminin öncüsü olabilir; takip'], color: '#FFC25C' };
  if (t.compliance < 0.3) return { type: 'As', title: 'Tip As (sığ)', summary: 'Tepe normal basınçta ama komplians düşük: sistem sert.', findings: ['Otoskleroz (stapes fiksasyonu)', 'Timpanoskleroz, kemikçik fiksasyonu', 'Orta kulak sıvısının erken dönemi'], color: '#4C9BFF' };
  if (t.compliance > 1.5) return { type: 'Ad' , title: 'Tip Ad (derin)', summary: 'Tepe normal basınçta, komplians çok yüksek: sistem aşırı gevşek.', findings: ['Kemikçik zinciri kopukluğu (ABG büyükse)', 'Atrofik / monomerik timpan membran', 'Zar skarı; işitme normalse zar kaynaklı'], color: '#7C5CFF' };
  return { type: 'A', title: 'Tip A', summary: 'Tepe normal basınçta (−100…+50 daPa), komplians normal (0,3–1,5 ml).', findings: ['Orta kulak basıncı ve hareketliliği normal', 'İletim tipi kayıp varsa zar/kemikçik dışı sebep düşün', 'Sensörinöral kayıpla birlikte görülebilir'], color: '#4ADE80' };
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const r = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** Hedef tipe uygun rastgele timpanogram. */
export function randomFor(type: JergerType): Tymp {
  switch (type) {
    case 'A': return { pressure: Math.round(rnd(-80, 40) / 5) * 5, compliance: r(rnd(0.4, 1.3)), volume: r(rnd(0.7, 1.6)) };
    case 'As': return { pressure: Math.round(rnd(-70, 30) / 5) * 5, compliance: r(rnd(0.15, 0.28), 2), volume: r(rnd(0.7, 1.5)) };
    case 'Ad': return { pressure: Math.round(rnd(-60, 30) / 5) * 5, compliance: r(rnd(1.7, 2.9)), volume: r(rnd(0.8, 1.6)) };
    case 'B': { const v = Math.random(); return { pressure: 0, compliance: r(rnd(0, 0.1), 2), volume: v < 0.33 ? r(rnd(2.2, 3)) : v < 0.66 ? r(rnd(0.3, 0.45), 2) : r(rnd(0.7, 1.6)) }; }
    case 'C': return { pressure: Math.round(rnd(-350, -120) / 5) * 5, compliance: r(rnd(0.4, 1.2)), volume: r(rnd(0.7, 1.6)) };
  }
}

export function randomTymp(): { tymp: Tymp; type: JergerType } {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)]!;
  return { tymp: randomFor(type), type };
}

export const TYPE_HINT: Record<JergerType, string> = {
  A: 'Normal tepe, normal komplians',
  As: 'Normal basınç, sığ tepe (<0,3 ml)',
  Ad: 'Normal basınç, çok derin tepe (>1,5 ml)',
  B: 'Tepe yok, düz eğri',
  C: 'Tepe −100 daPa altında',
};
