const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', 'node_modules/*', '.expo/*'] },
  {
    rules: {
      // Türkçe metinlerde kesme işareti (Şartları'nı) ve tırnak doğal; HTML varlıkları okunabilirliği bozar.
      'react/no-unescaped-entities': 'off',
      // React Native Animated.Value (useRef(...).current) ve Reanimated shared value (.value = ...) kalıpları
      // React Compiler kurallarınca yanlış pozitif üretir; bu projede bilinçli olarak kullanılır.
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      // Kayıt durumundan türetilmiş state güncellemeleri; uyarı olarak izlenir.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
