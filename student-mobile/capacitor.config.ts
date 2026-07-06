import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.system4learn.student',
  appName: 'System4Learn',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    backgroundColor: '#0f0f23',
    allowMixedContent: true,
  },
};

export default config;
