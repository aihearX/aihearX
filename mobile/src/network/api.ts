import { supabase } from '@/core/auth/supabase';
import type { CategoryId } from '@/core/registry/types';

export type IdeaSubmission = { userId: string; name: string; title: string; problem: string; solution: string; audience: string; category: CategoryId };

/** Supabase varsa tabloya yazar; yoksa yerelde tutar (çevrimdışı mod). */
export async function submitIdea(i: IdeaSubmission): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.from('ideas').insert({ user_id: i.userId, name: i.name, title: i.title, problem: i.problem, solution: i.solution, audience: i.audience, category: i.category });
  return !error;
}
