import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jcaa.usersclient',
  appName: 'Users Client',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true, // permite http:// en desarrollo; usa HTTPS en producción
  },
};

export default config;
