import { registerRootComponent } from 'expo';

// Workaround for expo-constants protocol error in Expo Go
if (typeof URL !== 'undefined') {
  const OriginalURL = URL;
  global.URL = class extends OriginalURL {
    constructor(...args) {
      super(...args);
    }
    set protocol(value) {
      // Ignore attempts to set protocol (read-only property)
    }
    get protocol() {
      return super.protocol;
    }
  };
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
