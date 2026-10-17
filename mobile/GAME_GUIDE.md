# Oyun Kalite Çıtası (aihearX)

Hedef: odyolog olmayan birinin de "bir tur daha" diyeceği oyunlar. Tema odyoloji, odak eğlence.

## Her oyunda zorunlu
1. **Çekirdek döngü 10-20 saniyede anlaşılır.** İlk ekranda 1 cümle + "Oyna". Uzun açıklama yok; öğrenme oynarken.
2. **Ortak oyun çekirdeği kullanılır** (`@/core/game`): `GameHud` (skor, can, kombo, tur, süre), `Countdown` (3-2-1), `FeedbackFlash` (doğru/yanlış flaşı), `ScorePop` (+120 uçan yazı), `GameResult` (rütbe, rekor, istatistik, paylaşım, tekrar oyna), `useGameTimer`, `sfx('ding'|'buzz'|'combo'|'levelUp'|'gameOver'|'tick')`, `rankFor`.
3. **Zorluk yükselir.** Seviyeler; her seviyede ölçülebilir bir şey zorlaşır (süre kısalır, aralık daralır, seçenek artar, hız artar).
4. **Juice.** Haptik (expo-haptics; `useSettings().haptics` kapalıysa yok), reanimated ile pop/shake/zoom, kombo çarpanı, "yeni rekor" anı.
5. **Can ya da süre baskısı.** Oyunun bitme sebebi olmalı; sonsuz tur yok.
6. **Rütbe.** `GameResult` ratio (0-1) ile `rankFor` verir: Çırak → Dikkatli → Keskin → Usta → Altın → Koklea Efsanesi.
7. **Rekor kalıcı.** `zustand persist` (`aihearx.miniapp.<id>`): best, toplam oyun, en yüksek seviye.
8. **Günlük meydan okuma (varsa).** `pickDaily` ile aynı gün herkese aynı dizi; "Günün skorunu paylaş".
9. **Paylaşım metni** kısa: "Ses Dedektifi 🔍 2.340 puan · Altın Kulak · aihearX".
10. **onResult** oyun bitince bir kez: `{ score, points: score, label: '<rütbe>', xp: 30-50, shareText }`.
11. **Kulaklık ve ses uyarısı** ilk ekranda tek satır: "Kulaklıkla daha iyi. Ses göreli, test değil."
12. **Hata yok.** `npx tsc --noEmit` ve `npx eslint src/miniapps/<id>` sıfır hata. Yeni npm paketi yok (expo-speech kurulu, kullanılabilir).
13. **Türkçe, sade, açık tema** (`@/core/ui`, `@/core/theme` tokenleri; sabit renk yok).

## Ses üretimi
`@/core/audio`: `renderTone({freq,duration,amplitude,kind:'sine'|'warble',ear,ramp})`, `renderNoise({duration,amplitude,color,ear})`, `concat`, `silence`, `mix`, `playSignal(channels, volume)` → `{stop, done}`, `playTone`, `playNoise`, `levelToAmplitude`. Kendi DSP'ni yazabilirsin (frekans süpürmesi, zarf, AM/FM, basit alçak geçiren filtre); 44.1 kHz, Float32Array çiftleri [L, R].
Ses çalmadan önce önceki `Playback.stop()` çağrılmalı; bileşen unmount'ta durdur.
