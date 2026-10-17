import React from 'react';
import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest, MiniAppProps } from '@/core/registry/types';
import { ArcadeShell } from '@/core/arcade/ArcadeShell';
import Dom from './Dom';

function App(props: MiniAppProps) {
  return <ArcadeShell {...props} Dom={Dom} title="Örnek" tagline="Boru hattı testi" howTo={['Dokun', 'Zıpla']} gradient={gradients.brand} makerName="aiHear" best={0} games={0} onSave={() => {}} ratioOf={(s) => Math.min(1, s / 100)} shareTextOf={(s) => `Örnek ${s} · aihearX`} />;
}
export const manifest: MiniAppManifest = { id: '_ornek', name: 'Örnek', tagline: 'test', description: 'test', category: 'oyun', icon: 'flask', gradient: gradients.brand, maker: maker('test'), audience: ['diger'], minutes: 1, tags: [], shareable: false, version: '0.0.1', releasedAt: '2026-10-17', component: App };
