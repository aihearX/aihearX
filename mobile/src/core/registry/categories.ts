import type { Ionicons } from '@expo/vector-icons';
import { gradients, type Gradient } from '@/core/theme';
import type { CategoryId } from './types';

export type Category = { id: CategoryId; name: string; short: string; description: string; icon: keyof typeof Ionicons.glyphMap; gradient: Gradient };

export const CATEGORIES: Category[] = [
  { id: 'ogren', name: 'Öğren', short: 'Öğren', description: 'Odyogram, timpanogram, maskeleme: klinik beceriyi oyunlaştırılmış pratikle öğren.', icon: 'school', gradient: gradients.ocean },
  { id: 'klinik', name: 'Klinik Araçlar', short: 'Klinik', description: 'Her gün masada kullanılan hesaplayıcılar, anketler ve hasta kartları.', icon: 'medkit', gradient: gradients.mint },
  { id: 'yarisma', name: 'Yarışmalar & Bulmacalar', short: 'Yarış', description: 'Günlük vakalar, kelime bulmacaları ve üniversiteler arası lig.', icon: 'trophy', gradient: gradients.gold },
  { id: 'oyun', name: 'Oyunlar', short: 'Oyun', description: 'Kulağını ve refleksini test eden, önce eğlendiren oyunlar.', icon: 'game-controller', gradient: gradients.rose },
  { id: 'hasta', name: 'Hasta & Aile', short: 'Hasta', description: 'İşitme, çınlama ve denge için herkesin kullanabileceği araçlar.', icon: 'heart', gradient: gradients.sunset },
];

export const categoryById = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!;
