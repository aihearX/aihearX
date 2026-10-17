import type { Ionicons } from '@expo/vector-icons';
import { gradients, type Gradient } from '@/core/theme';
import type { CategoryId } from './types';

export type Category = { id: CategoryId; name: string; short: string; what: string; description: string; icon: keyof typeof Ionicons.glyphMap; gradient: Gradient };

/** Beş kategori. `what`: tek satırda "ne işe yarar". */
export const CATEGORIES: Category[] = [
  { id: 'ogren', name: 'Öğren', short: 'Öğren', what: 'Odyogram, timpanogram ve terimleri pratikle öğren', description: 'Sınav ve klinik için beceri çalışması: odyogram yorumlama, timpanogram tipleri, aralıklı tekrar kartları.', icon: 'school', gradient: gradients.ocean },
  { id: 'klinik', name: 'Klinik Araçlar', short: 'Klinik', what: 'Masada kullanılan hesaplayıcı ve anketler', description: 'Maskeleme hesabı, kazanç hedefi, HHIE-S / THI / DHI anketleri ve hastaya gönderilecek sonuç kartları.', icon: 'medkit', gradient: gradients.mint },
  { id: 'yarisma', name: 'Yarışmalar', short: 'Yarış', what: 'Günlük vaka, kelime bulmacası ve üniversite ligi', description: 'Her gün herkese aynı vaka ve kelime; haftalık üniversiteler arası sıralama.', icon: 'trophy', gradient: gradients.gold },
  { id: 'oyun', name: 'Oyunlar', short: 'Oyun', what: 'Kulağını ve refleksini test eden kısa oyunlar', description: 'Frekans tahmini, desibel tahmini, tepki süresi ve eğlenceli kişilik testi.', icon: 'game-controller', gradient: gradients.rose },
  { id: 'hasta', name: 'Hasta & Aile', short: 'Hasta', what: 'İşitme, çınlama ve denge için herkese açık araçlar', description: 'Kulak yaşı testi, konuşma sesleri haritası, çınlama eşleştirme, denge günlüğü, gürültü ölçer.', icon: 'heart', gradient: gradients.sunset },
];

export const categoryById = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!;
