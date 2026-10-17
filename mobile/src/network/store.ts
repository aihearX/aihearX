import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import type { Post, Comment } from './types';

/**
 * Ağ modülünün kalıcı yerel durumu.
 * Takip, kendi gönderilerim, beğeniler, yerel yorumlar, anket oyları ve etkinlik katılımı burada tutulur.
 * Sunucu varsa api.ts aynı eylemleri sunucuya da iletir; yerel kopya her zaman güvenilir kaynaktır.
 */
type State = {
  following: string[];
  myPosts: Post[];
  likes: Record<string, boolean>;
  comments: Record<string, Comment[]>;
  pollVotes: Record<string, number>;
  attending: string[];
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  toggleFollow: (id: string) => boolean;
  addPost: (p: Post) => void;
  removePost: (id: string) => void;
  toggleLike: (postId: string, serverLiked: boolean) => boolean;
  addComment: (postId: string, c: Comment) => void;
  vote: (postId: string, option: number) => void;
  toggleAttend: (eventId: string) => boolean;
};

export const useNetwork = create<State>()(
  persist(
    (set, get) => ({
      following: [],
      myPosts: [],
      likes: {},
      comments: {},
      pollVotes: {},
      attending: [],
      follow: (id) => set((s) => (s.following.includes(id) ? s : { following: [...s.following, id] })),
      unfollow: (id) => set((s) => ({ following: s.following.filter((x) => x !== id) })),
      toggleFollow: (id) => {
        const now = get().following.includes(id);
        if (now) get().unfollow(id);
        else get().follow(id);
        return !now;
      },
      addPost: (p) => set((s) => ({ myPosts: [p, ...s.myPosts] })),
      removePost: (id) => set((s) => ({ myPosts: s.myPosts.filter((p) => p.id !== id) })),
      toggleLike: (postId, serverLiked) => {
        const cur = get().likes[postId] ?? serverLiked;
        const next = !cur;
        set((s) => ({ likes: { ...s.likes, [postId]: next } }));
        return next;
      },
      addComment: (postId, c) => set((s) => ({ comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), c] } })),
      vote: (postId, option) => set((s) => ({ pollVotes: { ...s.pollVotes, [postId]: option } })),
      toggleAttend: (eventId) => {
        const now = get().attending.includes(eventId);
        set((s) => ({ attending: now ? s.attending.filter((x) => x !== eventId) : [...s.attending, eventId] }));
        return !now;
      },
    }),
    { name: 'aihearx.network', storage: jsonStorage() },
  ),
);
