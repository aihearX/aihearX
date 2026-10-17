import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card } from '@/core/ui';
import { colors, space } from '@/core/theme';

const TIPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'moon', title: 'Uyku', text: 'Gece tam sessizlik çınlamayı büyütür. Hafif bir fan ya da kahverengi gürültü, uykuya dalmayı kolaylaştırır.' },
  { icon: 'cafe', title: 'Kafein ve tuz', text: 'Herkeste değil ama bazılarında kahve, enerji içeceği ve çok tuz çınlamayı artırır. Bir hafta azaltıp izle.' },
  { icon: 'volume-mute', title: 'Sessizlikten kaçın', text: 'Çok sessiz odalarda beyin çınlamaya odaklanır. Hafif bir arka plan sesi (radyo, doğa sesi) dikkatini dağıtır.' },
  { icon: 'headset', title: 'Gürültüden korun', text: 'Konser, matkap, yüksek sesli kulaklık çınlamayı tetikleyebilir. Kulak tıkacı küçük ama güçlü bir dost.' },
  { icon: 'fitness', title: 'Stres ve hareket', text: 'Stres çınlamayı yükseltir; yürüyüş, nefes egzersizi ve düzenli uyku çoğu kişide belirgin fark yaratır.' },
  { icon: 'medkit', title: 'Ne zaman hekime?', text: 'Tek kulakta ani başlayan, nabız gibi atan, işitme kaybı ya da baş dönmesiyle gelen çınlama için gecikmeden KBB / odyoloğa git.' },
];

export function Tips() {
  return (
    <Card>
      <AppText variant="h3">Çınlamayla yaşamak için ipuçları</AppText>
      <View style={{ gap: 12, marginTop: space.md }}>
        {TIPS.map((t) => (
          <View key={t.title} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={t.icon} size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{t.title}</AppText>
              <AppText variant="small" muted>{t.text}</AppText>
            </View>
          </View>
        ))}
      </View>
      <AppText variant="small" faint style={{ marginTop: space.md }}>Bu uygulama tıbbi tanı yerine geçmez. Bulduğun ses profili, klinisyenine anlatmanı kolaylaştırmak içindir.</AppText>
    </Card>
  );
}
