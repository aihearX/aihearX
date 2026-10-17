import type { Maker } from './types';

/** Ana yapımcı. Topluluk yapımcıları "Yapımcı Ol" programıyla eklenir. */
export const SEBAHATTIN: Omit<Maker, 'note'> = {
  name: 'Sebahattin Ünlü',
  title: 'aiHear kurucusu',
};

export const maker = (note: string, extra?: Partial<Maker>): Maker => ({ ...SEBAHATTIN, note, ...extra });
