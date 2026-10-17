import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { useUser, type Profile } from '@/core/store/user';
import type { NetUser, Post, Job, NetEvent, Comment } from './types';
import { MOCK_USERS, MOCK_POSTS, MOCK_JOBS, MOCK_EVENTS } from './mock';
import { fetchUsers, fetchPosts, fetchJobs, fetchEvents } from './api';
import { useNetwork } from './store';

/* ---------- uzak/mock veri önbelleği (kalıcı değil) ---------- */
type DataState = {
  users: NetUser[];
  posts: Post[];
  jobs: Job[];
  events: NetEvent[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
};

export const useNetData = create<DataState>()((set, get) => ({
  users: MOCK_USERS,
  posts: MOCK_POSTS,
  jobs: MOCK_JOBS,
  events: MOCK_EVENTS,
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [users, posts, jobs, events] = await Promise.all([fetchUsers(), fetchPosts(), fetchJobs(), fetchEvents()]);
      set({ users, posts, jobs, events, loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },
}));

/** İlk kullanımda veriyi bir kez yükler. */
export function useEnsureNetData() {
  const loaded = useNetData((s) => s.loaded);
  const load = useNetData((s) => s.load);
  useEffect(() => {
    if (!loaded) load().catch(() => {});
  }, [loaded, load]);
}

/* ---------- kullanıcı çözümleme ---------- */
export function profileToNetUser(p: Profile, following: number): NetUser {
  return { id: p.id, name: p.name, handle: p.handle, role: p.role, title: p.title, university: p.university, city: p.city, bio: p.bio, verified: p.verified ?? false, followers: 0, following };
}

/** Kimliği mock dizinde ya da kendi profilimizde bulur. */
export function resolveUser(id: string, users: NetUser[], profile: Profile | null, following: string[]): NetUser | undefined {
  if (profile && profile.id === id) return profileToNetUser(profile, following.length);
  const u = users.find((x) => x.id === id);
  if (!u) return undefined;
  return following.includes(id) ? { ...u, followers: u.followers + 1 } : u;
}

export function useResolveUser(): (id: string) => NetUser | undefined {
  const users = useNetData((s) => s.users);
  const profile = useUser((s) => s.profile);
  const following = useNetwork((s) => s.following);
  return useMemo(() => (id: string) => resolveUser(id, users, profile, following), [users, profile, following]);
}

/** Beni temsil eden NetUser (misafir dahil). */
export function useMe(): NetUser | null {
  const profile = useUser((s) => s.profile);
  const following = useNetwork((s) => s.following);
  return useMemo(() => (profile ? profileToNetUser(profile, following.length) : null), [profile, following]);
}

/* ---------- gönderi birleştirme ---------- */
type LocalBits = { likes: Record<string, boolean>; comments: Record<string, Comment[]>; pollVotes: Record<string, number> };

/** Sunucu/mock gönderisini yerel beğeni, yorum ve anket oylarıyla birleştirir. */
export function mergePost(p: Post, local: LocalBits): Post {
  const liked = local.likes[p.id] ?? p.likedByMe;
  const delta = liked === p.likedByMe ? 0 : liked ? 1 : -1;
  const extra = local.comments[p.id] ?? [];
  const vote = local.pollVotes[p.id];
  const poll = p.poll && typeof vote === 'number' ? { options: p.poll.options, votes: p.poll.votes.map((v, i) => (i === vote ? v + 1 : v)) } : p.poll;
  return { ...p, likedByMe: liked, likes: Math.max(0, p.likes + delta), comments: extra.length ? [...p.comments, ...extra] : p.comments, poll };
}

/** Tüm gönderiler (benimkiler + ağ), yerel durumla birleşik, yeniden eskiye sıralı. */
export function useAllPosts(): Post[] {
  const remote = useNetData((s) => s.posts);
  const myPosts = useNetwork((s) => s.myPosts);
  const likes = useNetwork((s) => s.likes);
  const comments = useNetwork((s) => s.comments);
  const pollVotes = useNetwork((s) => s.pollVotes);
  return useMemo(() => {
    const local = { likes, comments, pollVotes };
    const ids = new Set(myPosts.map((p) => p.id));
    const all = [...myPosts, ...remote.filter((p) => !ids.has(p.id))].map((p) => mergePost(p, local));
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [remote, myPosts, likes, comments, pollVotes]);
}

/* ---------- zaman ---------- */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} hf`;
  return `${Math.floor(d / 30)} ay`;
}

/** Etkinlik geri sayımı: "12 gün kaldı", "bugün", "yarın", "geçti". */
export function countdown(iso: string, now = new Date()): string {
  const target = new Date(iso);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tday = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const days = Math.round((tday - start) / 86400000);
  if (days < 0) return 'geçti';
  if (days === 0) return 'bugün';
  if (days === 1) return 'yarın';
  return `${days} gün kaldı`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
