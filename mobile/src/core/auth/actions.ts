import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import { useUser } from '@/core/store/user';

/**
 * Tek üyelik sistemi: tüm mini uygulamalar bu oturumu kullanır, alt uygulamalarda ayrı üyelik yoktur.
 * Supabase yoksa Apple kimliği yerel profile yazılır; Supabase varsa identityToken ile oturum açılır.
 */
export async function signInWithApple(): Promise<'ok' | 'cancel' | 'error'> {
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ') || 'aihearX kullanıcısı';
    if (supabase && cred.identityToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken });
      if (error || !data.user) return 'error';
      useUser.getState().signInWith('supabase', { id: data.user.id, name });
      return 'ok';
    }
    useUser.getState().signInWith('apple', { id: `apple-${cred.user}`, name });
    return 'ok';
  } catch (e) {
    const code = (e as { code?: string }).code;
    return code === 'ERR_REQUEST_CANCELED' ? 'cancel' : 'error';
  }
}

export async function signInWithEmail(email: string): Promise<'sent' | 'local' | 'error'> {
  if (!supabase) {
    useUser.getState().signInWith('email', { id: `email-${email.toLowerCase()}`, name: email.split('@')[0] ?? 'kullanici' });
    return 'local';
  }
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'aihearx://giris' } });
  return error ? 'error' : 'sent';
}

export async function signOut() {
  try { await supabase?.auth.signOut(); } catch { /* */ }
  useUser.getState().signOut();
}
