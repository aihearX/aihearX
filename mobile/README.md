# aihearX mobil

Expo SDK 58 · React Native 0.88 · TypeScript strict · expo-router.

- Mini uygulama yazmak için: `MINIAPP_GUIDE.md`
- Ekranlar: `src/app/`, çekirdek: `src/core/`, mini uygulamalar: `src/miniapps/`, ağ: `src/network/`
- Tip kontrolü: `npm run typecheck`
- Supabase: `.env` içine `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY`; şema `../supabase/schema.sql`
- EAS: `eas.json`; `app.json` içindeki `extra.eas.projectId` ilk `eas init` ile dolar.
