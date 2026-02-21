import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bigboardwin',
  appName: 'Five Strike',
  webDir: 'dist',
  server: {
    url: 'https://2b0b89a7-5ab4-49c6-a80c-228712d01c20.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
