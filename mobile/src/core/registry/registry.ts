import type { CategoryId, MiniAppManifest, Role } from './types';
import { MINIAPPS } from '@/miniapps';

export const allApps = (): MiniAppManifest[] => MINIAPPS;
export const appById = (id: string): MiniAppManifest | undefined => MINIAPPS.find((a) => a.id === id);
export const appsByCategory = (c: CategoryId): MiniAppManifest[] => MINIAPPS.filter((a) => a.category === c);
export const appsForRole = (r: Role): MiniAppManifest[] => MINIAPPS.filter((a) => a.audience.includes(r));
export const isNew = (a: MiniAppManifest, days = 21) => (Date.now() - new Date(a.releasedAt).getTime()) / 86400000 < days;
