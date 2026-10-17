import React, { useCallback, useRef, useState } from 'react';
import { GameResult, rankFor } from '@/core/game';
import { AppText, Button, Card } from '@/core/ui';
import { colors, gradients } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { duelShareText, fmtPct, fmtSemi, ratioFor, soloShareText } from './logic';
import { usePerdeStore } from './store';
import { Intro } from './components/Intro';
import { SoloGame, type SoloSummary } from './components/SoloGame';
import { DuelSetup } from './components/DuelSetup';
import { DuelGame } from './components/DuelGame';
import { DuelWinner } from './components/DuelWinner';

type Phase = 'intro' | 'solo' | 'result' | 'duelSetup' | 'duel' | 'duelDone';
type Names = { a: string; b: string };
type Scores = { a: number; b: number };

export default function App({ onResult }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [summary, setSummary] = useState<SoloSummary | null>(null);
  const [names, setNames] = useState<Names>({ a: 'Oyuncu 1', b: 'Oyuncu 2' });
  const [scores, setScores] = useState<Scores>({ a: 0, b: 0 });
  const [duelKey, setDuelKey] = useState(0);
  const store = usePerdeStore();
  const reported = useRef(false);

  const startSolo = useCallback(() => { reported.current = false; setSummary(null); setPhase('solo'); }, []);
  const home = useCallback(() => setPhase('intro'), []);

  const finishSolo = useCallback((s: SoloSummary) => {
    if (reported.current) return;
    reported.current = true;
    const minP = s.minReliable ?? s.minCorrect;
    const rank = rankFor(ratioFor(minP));
    usePerdeStore.getState().recordSolo({ score: s.score, minP: s.minReliable });
    setSummary(s);
    setPhase('result');
    onResult({ score: s.score, points: s.score, label: rank.name, xp: 35, shareText: soloShareText(s.score, minP, rank.name), meta: { minP, trials: s.trials, correct: s.correct } });
  }, [onResult]);

  const startDuel = useCallback((a: string, b: string) => { reported.current = false; setNames({ a, b }); setDuelKey((k) => k + 1); setPhase('duel'); }, []);
  const finishDuel = useCallback((sc: Scores) => {
    setScores(sc);
    setPhase('duelDone');
    if (reported.current) return;
    reported.current = true;
    usePerdeStore.getState().recordDuel();
    const aWon = sc.a > sc.b;
    const shareText = duelShareText(aWon ? names.a : names.b, Math.max(sc.a, sc.b), aWon ? names.b : names.a, Math.min(sc.a, sc.b));
    onResult({ score: Math.max(sc.a, sc.b), label: 'Düello', xp: 35, shareText, meta: { mode: 'duel', ...sc } });
  }, [names, onResult]);

  if (phase === 'solo') return <SoloGame onFinish={finishSolo} onQuit={home} />;
  if (phase === 'duelSetup') return <DuelSetup onStart={startDuel} onBack={home} />;
  if (phase === 'duel') return <DuelGame key={duelKey} names={names} onFinish={finishDuel} onQuit={home} />;
  if (phase === 'duelDone') {
    return <DuelWinner names={names} scores={scores} onRematch={() => startDuel(names.a, names.b)} onNewPlayers={() => setPhase('duelSetup')} onHome={home} />;
  }
  if (phase === 'result' && summary) {
    const minP = summary.minReliable ?? summary.minCorrect;
    const ratio = ratioFor(minP);
    const rank = rankFor(ratio);
    return (
      <GameResult
        title="Perde Düellosu"
        score={summary.score}
        ratio={ratio}
        best={store.bestScore}
        gradient={gradients.ocean}
        shareText={soloShareText(summary.score, minP, rank.name)}
        makerName="Sebahattin Ünlü"
        stats={[
          { label: 'En küçük fark', value: minP !== null ? fmtPct(minP) : '—' },
          { label: 'Doğru', value: `${summary.correct}/${summary.trials}` },
          { label: 'En iyi kombo', value: summary.bestStreak },
        ]}
        onReplay={startSolo}
        extra={<Button title="Ana ekran" variant="secondary" icon="home" onPress={home} />}
      >
        <Card>
          {minP !== null ? (
            <AppText center>Ayırt edebildiğin en küçük fark: <AppText variant="bodyStrong" color={colors.accent}>{fmtPct(minP)}</AppText> (yaklaşık {fmtSemi(minP)}).</AppText>
          ) : (
            <AppText center muted>Bu kez doğru cevap çıkmadı; bir daha dene, fark bir oktavdan başlar.</AppText>
          )}
          {summary.minReliable === null && summary.minCorrect !== null ? <AppText variant="small" faint center style={{ marginTop: 4 }}>Üst üste iki doğruyla "güvenilir" sayılır.</AppText> : null}
        </Card>
      </GameResult>
    );
  }
  return <Intro bestScore={store.bestScore} bestMinP={store.bestMinP} duels={store.duels} onSolo={startSolo} onDuel={() => setPhase('duelSetup')} />;
}
