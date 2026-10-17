import type { Role } from '@/core/registry/types';
import type { AudiogramData } from '@/core/ui';

/** Ağ kullanıcısı: mock dizinden ya da kendi profilimizden türetilir. */
export type NetUser = {
  id: string;
  name: string;
  handle: string;
  role: Role;
  title?: string;
  university?: string;
  city?: string;
  bio?: string;
  verified?: boolean;
  followers: number;
  following: number;
};

export type PostKind = 'gonderi' | 'vaka' | 'soru' | 'ilan' | 'etkinlik' | 'basari';

export type Comment = { id: string; authorId: string; text: string; createdAt: string };

/** Vaka gönderisi: kısa öykü + 6 frekanslı odyogram. */
export type CaseData = { history: string; audiogram: AudiogramData };

export type Poll = { options: string[]; votes: number[] };

export type Post = {
  id: string;
  authorId: string;
  text: string;
  /** ISO tarih */
  createdAt: string;
  kind: PostKind;
  tags: string[];
  likes: number;
  comments: Comment[];
  likedByMe: boolean;
  /** Emoji/illüstrasyon yer tutucusu */
  imageHint?: string;
  caseData?: CaseData;
  poll?: Poll;
};

export type JobType = 'tam zamanlı' | 'yarı zamanlı' | 'staj' | 'gönüllü';

export type Job = {
  id: string;
  title: string;
  org: string;
  city: string;
  type: JobType;
  salaryHint?: string;
  /** ISO tarih */
  postedAt: string;
  description: string;
  tags: string[];
  url?: string;
  email?: string;
};

export type EventKind = 'kongre' | 'webinar' | 'kurs' | 'buluşma';

export type NetEvent = {
  id: string;
  title: string;
  org: string;
  /** ISO tarih */
  date: string;
  /** Şehir adı; çevrim içi etkinlikte 'Online' */
  city: string;
  online?: boolean;
  kind: EventKind;
  url?: string;
  description: string;
};

export const KIND_LABEL: Record<PostKind, string> = {
  gonderi: 'Gönderi',
  vaka: 'Vaka',
  soru: 'Soru',
  ilan: 'İlan',
  etkinlik: 'Etkinlik',
  basari: 'Başarı',
};

export const EVENT_KIND_LABEL: Record<EventKind, string> = { kongre: 'Kongre', webinar: 'Webinar', kurs: 'Kurs', buluşma: 'Buluşma' };
