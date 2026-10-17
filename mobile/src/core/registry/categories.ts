import type { Ionicons } from '@expo/vector-icons';
import { gradients, type Gradient } from '@/core/theme';
import type { CategoryId } from './types';

export type Category = { id: CategoryId; name: string; short: string; what: string; description: string; icon: keyof typeof Ionicons.glyphMap; gradient: Gradient };

/** Üç kategori. `what`: tek satırda "ne işe yarar". Az ama derin. */
export const CATEGORIES: Category[] = [
  { id: 'oyun', name: 'Oyunlar', short: 'Oyun', what: 'Herkesin oynayacağı, kulağını sınayan oyunlar', description: 'Ses tahmini, ton hafızası, perde düellosu, gürültüde rakam ve kulak yaşı. Odyoloji temalı, eğlence odaklı; odyolog olmana gerek yok.', icon: 'game-controller', gradient: gradients.rose },
  { id: 'klinik', name: 'Klinik', short: 'Klinik', what: 'Odyolog ve öğrenciler için günlük vaka ve araçlar', description: 'Günün vakası ve antrenman, maskeleme hesabı, HHIE-S / THI / DHI anketleri ve hastaya gönderilecek sonuç kartları.', icon: 'medkit', gradient: gradients.ocean },
  { id: 'hasta', name: 'Hasta & Aile', short: 'Hasta', what: 'Çınlama ve denge için kişisel takip araçları', description: 'Çınlamanı eşleştir ve kaydet, baş dönmesi günlüğü tut, hekimine özet götür.', icon: 'heart', gradient: gradients.sunset },
];

export const categoryById = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[1]!;
