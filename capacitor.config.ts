
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8b0f96867e2840c6adea83f8c4dca767',
  appName: 'rental-solutions',
  webDir: 'dist',
  server: {
    url: 'https://8b0f9686-7e28-40c6-adea-83f8c4dca767.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      backgroundLocationAccuracy: 'high',
      backgroundLocationTargetDistance: 10, // meters
      backgroundLocationUpdateInterval: 30000, // 30 seconds
      backgroundLocationAllowBackgroundPermissions: true,
      requireAccuratePermissions: true
    }
  },
  ios: {
    backgroundColor: '#ffffff',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: true,
    // Add background location capabilities
    backgroundColor: '#ffffff',
    scheme: 'rental-solutions',
    includePlugins: ['@capacitor/geolocation']
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Add background location capabilities
    includePlugins: ['@capacitor/geolocation'],
    backgroundColor: '#ffffff'
  }
};

export default config;
