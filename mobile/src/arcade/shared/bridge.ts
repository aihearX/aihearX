/** DOM (oyun) → native köprü olayları. Serileştirilebilir olmalı. */
export type ArcadeEvent =
  | { type: 'ready' }
  | { type: 'haptic'; kind: 'light' | 'medium' | 'heavy' | 'success' | 'error' }
  | { type: 'progress'; score: number; level?: number }
  | { type: 'gameover'; score: number; stats: Record<string, number | string>; label?: string }
  | { type: 'quit' };

export type ArcadeOptions = {
  onEvent: (e: ArcadeEvent) => void | Promise<void>;
  seed?: number;
  mode?: string;
  /** Harness/test: oyunu hızlandır, otomatik oyna vb. */
  debug?: boolean;
  /** Ses efektleri açık mı */
  sounds?: boolean;
};

export type ArcadeHandle = { destroy: () => void };
