import { supabase } from '@/core/auth/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CategoryId, Role } from '@/core/registry/types';
import type { NetUser, Post, Job, NetEvent, Comment, PostKind, JobType, EventKind, CaseData, Poll } from './types';
import { MOCK_USERS, MOCK_POSTS, MOCK_JOBS, MOCK_EVENTS } from './mock';

export type IdeaSubmission = { userId: string; name: string; title: string; problem: string; solution: string; audience: string; category: CategoryId };

/** Supabase varsa tabloya yazar; yoksa yerelde tutar (çevrimdışı mod). */
export async function submitIdea(i: IdeaSubmission): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.from('ideas').insert({ user_id: i.userId, name: i.name, title: i.title, problem: i.problem, solution: i.solution, audience: i.audience, category: i.category });
  return !error;
}

/* =====================================================================
 * Ağ: sunucu varsa önce sunucuyu dener, hata/boş sonuçta mock'a düşer.
 * Tablolar: profiles, posts, comments, likes, follows, jobs, events
 * ===================================================================== */

type ProfileRow = { id: string; name: string; handle: string; role: Role; title?: string | null; university?: string | null; city?: string | null; bio?: string | null; verified?: boolean | null; followers?: number | null; following?: number | null };
type CommentRow = { id: string; post_id: string; author_id: string; text: string; created_at: string };
type PostRow = { id: string; author_id: string; text: string; created_at: string; kind: PostKind; tags?: string[] | null; likes?: number | null; image_hint?: string | null; case_data?: CaseData | null; poll?: Poll | null; comments?: CommentRow[] | null };
type JobRow = { id: string; title: string; org: string; city: string; type: JobType; salary_hint?: string | null; posted_at: string; description: string; tags?: string[] | null; url?: string | null; email?: string | null };
type EventRow = { id: string; title: string; org: string; date: string; city: string; online?: boolean | null; kind: EventKind; url?: string | null; description: string };

const orUndef = <T,>(v: T | null | undefined): T | undefined => (v == null ? undefined : v);

const mapProfile = (r: ProfileRow): NetUser => ({
  id: r.id, name: r.name, handle: r.handle, role: r.role, title: orUndef(r.title), university: orUndef(r.university), city: orUndef(r.city), bio: orUndef(r.bio), verified: r.verified ?? false, followers: r.followers ?? 0, following: r.following ?? 0,
});
const mapComment = (r: CommentRow): Comment => ({ id: r.id, authorId: r.author_id, text: r.text, createdAt: r.created_at });
const mapPost = (r: PostRow): Post => ({
  id: r.id, authorId: r.author_id, text: r.text, createdAt: r.created_at, kind: r.kind, tags: r.tags ?? [], likes: r.likes ?? 0, comments: (r.comments ?? []).map(mapComment), likedByMe: false, imageHint: orUndef(r.image_hint), caseData: orUndef(r.case_data), poll: orUndef(r.poll),
});
const mapJob = (r: JobRow): Job => ({ id: r.id, title: r.title, org: r.org, city: r.city, type: r.type, salaryHint: orUndef(r.salary_hint), postedAt: r.posted_at, description: r.description, tags: r.tags ?? [], url: orUndef(r.url), email: orUndef(r.email) });
const mapEvent = (r: EventRow): NetEvent => ({ id: r.id, title: r.title, org: r.org, date: r.date, city: r.city, online: r.online ?? false, kind: r.kind, url: orUndef(r.url), description: r.description });

/** Genel okuma: tablo → satırlar; hata ya da boş sonuçta null döner. */
async function readTable<Row>(table: string, order: { column: string; ascending: boolean }, limit: number, select = '*'): Promise<Row[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(table).select(select).order(order.column, { ascending: order.ascending }).limit(limit);
    if (error || !data || data.length === 0) return null;
    return data as unknown as Row[];
  } catch {
    return null;
  }
}

export async function fetchUsers(): Promise<NetUser[]> {
  const rows = await readTable<ProfileRow>('profiles', { column: 'name', ascending: true }, 500);
  return rows ? rows.map(mapProfile) : MOCK_USERS;
}

export async function fetchPosts(): Promise<Post[]> {
  const rows = await readTable<PostRow>('posts', { column: 'created_at', ascending: false }, 200, '*, comments(*)');
  return rows ? rows.map(mapPost) : MOCK_POSTS;
}

export async function fetchJobs(): Promise<Job[]> {
  const rows = await readTable<JobRow>('jobs', { column: 'posted_at', ascending: false }, 100);
  return rows ? rows.map(mapJob) : MOCK_JOBS;
}

export async function fetchEvents(): Promise<NetEvent[]> {
  const rows = await readTable<EventRow>('events', { column: 'date', ascending: true }, 100);
  return rows ? rows.map(mapEvent) : MOCK_EVENTS;
}

/** Sunucuya yazma işlemleri: başarı/başarısızlık döner; çevrimdışıysa true (yerel kayıt yeterli). */
async function write(fn: (db: SupabaseClient) => PromiseLike<{ error: unknown }>): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await fn(supabase);
    return !error;
  } catch {
    return false;
  }
}

export const pushPost = (p: Post) =>
  write((db) => db.from('posts').insert({ id: p.id, author_id: p.authorId, text: p.text, created_at: p.createdAt, kind: p.kind, tags: p.tags, image_hint: p.imageHint ?? null, case_data: p.caseData ?? null, poll: p.poll ?? null }));

export const pushFollow = (userId: string, targetId: string, follow: boolean) =>
  write((db) => (follow ? db.from('follows').insert({ follower_id: userId, followee_id: targetId }) : db.from('follows').delete().match({ follower_id: userId, followee_id: targetId })));

export const pushLike = (userId: string, postId: string, liked: boolean) =>
  write((db) => (liked ? db.from('likes').insert({ user_id: userId, post_id: postId }) : db.from('likes').delete().match({ user_id: userId, post_id: postId })));

export const pushComment = (postId: string, c: Comment) =>
  write((db) => db.from('comments').insert({ id: c.id, post_id: postId, author_id: c.authorId, text: c.text, created_at: c.createdAt }));
