# Arcade Oyun Kılavuzu (Phaser 3 + Expo DOM bileşeni)

Hedef: profesyonel his veren, karakterli, fizikli, "bir tur daha" dedirten oyunlar. Tema odyoloji; odak eğlence; odyolog olmayan herkes oynar.

## Mimari
- Oyun kodu **web tarafında**: `src/arcade/<id>/index.ts` → `export function mount(parent: HTMLElement, opts: ArcadeOptions): ArcadeHandle`. Phaser 3.90, TypeScript strict. Sadece tarayıcı API'leri; React Native import YOK.
- Ortak kit: `src/arcade/shared` → `bootGame`, `getOpts`, `sfx` (Web Audio sentez), `emojiTexture`, `heroTexture`, `roundRectTexture`, `tonotopyColor/Freq`, `Hud`, `title/label/pill/flash/floatText/tapToStart`, `GAME_W=390`, `GAME_H=780` (dikey, FIT ölçek).
- Native sarmalayıcı: `src/miniapps/<id>/Dom.tsx` (`'use dom'`; `src/miniapps/koklea-kosusu/Dom.tsx` kopyala), `src/miniapps/<id>/manifest.tsx` (`ArcadeShell` ile; `koklea-kosusu/manifest.tsx` örneği), `store.ts` (zustand persist `aihearx.miniapp.<id>`: best, games, en yüksek seviye).
- Köprü: oyun `opts.onEvent({type:'gameover', score, stats, label})` ile biter; `{type:'haptic', kind}` vuruş/ödül anlarında; `{type:'quit'}` menüden çıkışta. `ArcadeShell` giriş ve sonuç ekranlarını (rütbe, rekor, paylaşım) native çizer; oyun içinde ayrıca sonuç ekranı YAPMA, sadece kısa "Oyun bitti" anı + olay gönder.

## Kalite çıtası (zorunlu)
1. **Akıcılık:** 60 fps hedef; parçacık ve tween ölçülü; nesne havuzu (group reuse) kullan; her karede `add.*` yapma.
2. **Karakter:** `heroTexture` (mutlu / acı / şaşkın halleri) veya kendi Graphics çizimin; zıplamada squash & stretch tween'i, hasarda kırmızı yanıp sönme + sarsıntı (`cameras.main.shake`).
3. **Kontrol:** tek elle, dokunma. Sol/sağ yarım ekran, basılı tutma, kaydırma; ilk 5 saniyede ipucu metni ("Zıplamak için dokun").
4. **Dünya:** odyolojik anatomi görsel olarak okunabilir (koklea spirali, kulak zarı, kemikçikler, kıl hücreleri, işitme siniri). Arka plan paralaks 2-3 katman (`Graphics` ile çizilmiş, `TileSprite` ile kaydırılan).
5. **Tonotopi hilesi:** koklea içindeki ilerleme renk ve sesi değiştirir (`tonotopyColor`, `sfx.toneAt(tonotopyFreq(t))`). Taban ince ses mor, apeks kalın ses turuncu.
6. **Ses:** `sfx.*`; ses `unlock()` dokunuşla açılır (bootGame halleder). Ekrana ilk dokunuş `tapToStart` ile.
7. **Zorluk eğrisi:** hız/sıklık zamanla artar; seviye geçişi görünür (banner + `sfx.levelUp`). Can: 3. Dokunulmazlık süresi hasar sonrası 1 s.
8. **Skor:** mesafe/zaman + toplanan + kombo. `stats` içinde en fazla 3 anahtar (Türkçe etiket), örn `{ 'Mesafe': 1240, 'Jeton': 32, 'Seviye': 4 }`.
9. **Debug modu (`opts.debug`)**: oyun 12-15 s içinde kendiliğinden gameover olayı göndersin (harness bitmeli) ve `window.__arcade = { score, level }` güncellesin.
10. **Harness ile doğrula:** `ARCADE_OUT=<scratch> PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node tools/arcade-harness/run.mjs <id> 20`. Çıktıda `errors: []` ve `gameover` dolu olmalı. Ekran görüntülerini (`shot-*.png`) Read ile AÇ ve BAK: boş ekran, üst üste binmiş yazı, görünmez karakter kabul edilmez. Görseli beğenene kadar düzelt.
11. **Tip ve lint:** `npx tsc --noEmit` ve `npx eslint src/arcade/<id> src/miniapps/<id>` sıfır hata. Yeni npm paketi yok.
12. **Türkçe metin, açık tema** (beyaz zemin, mor #6c4cf1 vurgu, oyun içinde canlı renkler serbest).
