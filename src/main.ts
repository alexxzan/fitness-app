import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { pinia } from './stores'
import { db } from './shared/storage/database'
import { DatabaseReset } from './shared/storage/database-reset'

import { IonicVue } from '@ionic/vue';

// Initialize database
db.open().catch((err) => {
  console.error('Failed to open database:', err)
})

// Expose database reset utilities globally in development (handy for testing)
if (import.meta.env.DEV) {
  (window as any).__FITNESS_APP_DEBUG__ = {
    resetDatabase: DatabaseReset.resetToCleanState.bind(DatabaseReset),
    deleteDatabase: DatabaseReset.deleteDatabase.bind(DatabaseReset),
    resetAndReinitialize: DatabaseReset.resetAndReinitialize.bind(DatabaseReset),
    getStateInfo: DatabaseReset.getStateInfo.bind(DatabaseReset),
  };
  
  console.log(
    '%c🔧 Development Mode',
    'color: #4CAF50; font-weight: bold; font-size: 14px;'
  );
  console.log(
    '%cDatabase reset utilities available:',
    'color: #2196F3; font-weight: bold;'
  );
  console.log('  - window.__FITNESS_APP_DEBUG__.resetDatabase() - Reset to clean state');
  console.log('  - window.__FITNESS_APP_DEBUG__.deleteDatabase() - Delete entire database');
  console.log('  - window.__FITNESS_APP_DEBUG__.resetAndReinitialize() - Reset and reload exercises');
  console.log('  - window.__FITNESS_APP_DEBUG__.getStateInfo() - Get current database state');
  console.log('');
  console.log(
    '%c💡 Tip:',
    'color: #FF9800; font-weight: bold;'
  );
  console.log('Run resetDatabase() then refresh to see the splash screen again!');
}

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});
