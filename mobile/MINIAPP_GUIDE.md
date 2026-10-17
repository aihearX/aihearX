# Mini Uygulama Yazım Kılavuzu (aihearX)

Her mini uygulama `src/miniapps/<id>/` klasöründe yaşar ve iki dosya dışa aktarır:

```
src/miniapps/<id>/manifest.ts   → MiniAppManifest (component dahil)
src/miniapps/<id>/App.tsx       → React bileşeni: (props: MiniAppProps) => JSX
```

## Sözleşme

- `component`, `MiniAppProps` alır: `{ onResult, role }`.
  - Anlamlı bir sonuç oluştuğunda `onResult({ score?, label?, shareText?, xp?, points?, meta? })` çağır. Kabuk XP/seri/rozet işler. Bir oturumda birden fazla kez çağrılabilir ama oyun bitişinde bir kez çağırmak idealdir.
  - `xp` önerisi: kısa araç 15-25, oyun 25-40, günlük yarışma 40-60.
- Ayrı üyelik, ayrı giriş, ayrı onboarding YOK. Kullanıcı `useUser()` ile hazırdır.
- Kalıcı veri gerekiyorsa `zustand` + `persist` + `jsonStorage()` ile kendi küçük store'unu `src/miniapps/<id>/store.ts` içinde kur (`name: 'aihearx.miniapp.<id>'`).
- Tasarım: yalnızca `@/core/ui` bileşenleri ve `@/core/theme` tokenleri. Kendi renk kodu yazma; `colors`, `gradients`, `radius`, `space` kullan. Koyu tema tek tema.
- Paylaşılabilir sonuç: `ShareCard` (`@/core/ui`) ile. `makerName` ver. `shareText` kısa ve paylaşılabilir olsun; sonunda "aihearX" geçsin.
- Ses: `@/core/audio` → `playTone({freq, duration, amplitude, ear})`, `playNoise`, `playSequence`, `renderTone`, `renderNoise`, `concat`, `silence`, `mix`, `levelToAmplitude`. Ses kalibre değildir; "göreli" uyarısı göster.
- Odyogram çizimi: `Audiogram` bileşeni (`@/core/ui`), `AUDIOGRAM_FREQS`, `pta`, `degreeLabel`.
- Günlük içerik: `pickDaily(items, offset)` ve `dayKey()` (`@/core/util/day`). Aynı gün herkese aynı içerik.
- Haptik: `expo-haptics` (hafif kullan). Animasyon: `react-native-reanimated` (`FadeInDown` vb.) ve `Animated`.
- Ekran kabuğu: bileşen tam ekran bir `View` içinde çalışır; üstte kabuk çubuğu zaten var. İçeride `ScrollView` + `padding: 16` kullan, altta 32 boşluk bırak.
- Türkçe arayüz. Tıbbi ifadelerde ölçülü ol; her sağlıkla ilgili sonuçta "tanı yerine geçmez" notu.
- Kod kalitesi: `strict` TypeScript, `npx tsc --noEmit` sıfır hata. `any` yok. Dosya başına makul uzunluk; gerekirse `components/` alt klasörü.

## Manifest örneği

```ts
import { gradients } from '@/core/theme';
import { maker } from '@/core/registry/makers';
import type { MiniAppManifest } from '@/core/registry/types';
import App from './App';

export const manifest: MiniAppManifest = {
  id: 'frekans-avi',
  name: 'Frekans Avı',
  tagline: 'Duyduğun tonun frekansını tahmin et',
  description: 'Rastgele saf ses tonları çalar; 250 Hz ile 8 kHz arasında hangi frekans olduğunu tahmin edersin. Seviye yükseldikçe aralıklar daralır.',
  category: 'oyun',
  icon: 'pulse',
  gradient: gradients.rose,
  maker: maker('Odyometri dersinde frekansları kulaktan tanıyabilen öğrenciler hep bir adım öndeydi. Bu oyunu o kulağı herkese kazandırmak için yaptım.'),
  audience: ['ogrenci', 'odyolog', 'odyometrist', 'diger'],
  minutes: 3,
  tags: ['saf ses', 'frekans', 'kulak eğitimi'],
  dailyHook: 'Her gün yeni seri, haftalık en iyi skor',
  shareable: true,
  version: '1.0.0',
  releasedAt: '2026-10-17',
  component: App,
};
```

## Grup dosyası

Her ajan kendi grup dosyasına manifestleri ekler (`src/miniapps/group-<x>.ts`):

```ts
import { manifest as frekansAvi } from './frekans-avi/manifest';
export const GROUP_X = [frekansAvi];
```

`src/miniapps/index.ts` dosyasına DOKUNMA; entegrasyon merkezi yapılır.
