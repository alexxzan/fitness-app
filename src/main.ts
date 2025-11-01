import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores";
import { dbAdapter } from "./shared/storage/database-adapter";
import { DatabaseReset } from "./shared/storage/database-reset";
import { Capacitor } from "@capacitor/core";

import { IonicVue } from "@ionic/vue";

// Initialize database (async, must complete before router is ready)
// Automatically uses Dexie (IndexedDB) for web, SQLite for native
async function initializeDatabase() {
  try {
    await dbAdapter.initialize();

    if (Capacitor.isNativePlatform()) {
      console.log("✅ SQLite database initialized for native platform");
    } else {
      console.log("✅ Dexie (IndexedDB) initialized for web development");
    }
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
    throw err;
  }
}

// Expose database reset utilities globally in development (handy for testing)
if (import.meta.env.DEV) {
  (window as any).__FITNESS_APP_DEBUG__ = {
    resetDatabase: DatabaseReset.resetToCleanState.bind(DatabaseReset),
    deleteDatabase: DatabaseReset.deleteDatabase.bind(DatabaseReset),
    resetAndReinitialize:
      DatabaseReset.resetAndReinitialize.bind(DatabaseReset),
    getStateInfo: DatabaseReset.getStateInfo.bind(DatabaseReset),
  };

  console.log(
    "%c🔧 Development Mode",
    "color: #4CAF50; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cDatabase reset utilities available:",
    "color: #2196F3; font-weight: bold;"
  );
  console.log(
    "  - window.__FITNESS_APP_DEBUG__.resetDatabase() - Reset to clean state"
  );
  console.log(
    "  - window.__FITNESS_APP_DEBUG__.deleteDatabase() - Delete entire database"
  );
  console.log(
    "  - window.__FITNESS_APP_DEBUG__.resetAndReinitialize() - Reset and reload exercises"
  );
  console.log(
    "  - window.__FITNESS_APP_DEBUG__.getStateInfo() - Get current database state"
  );
  console.log("");
  console.log("%c💡 Tip:", "color: #FF9800; font-weight: bold;");
  console.log(
    "Run resetDatabase() then refresh to see the splash screen again!"
  );
}

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import "@ionic/vue/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

const app = createApp(App).use(IonicVue).use(pinia).use(router);

// Initialize database, then wait for router, then mount app
initializeDatabase()
  .then(() => router.isReady())
  .then(() => {
    app.mount("#app");
  })
  .catch((err) => {
    console.error("Failed to start app:", err);
    // Show error to user
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1>⚠️ App Initialization Error</h1>
        <p>This app requires a native platform (iOS or Android).</p>
        <p>Please run the app on a device or simulator.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${err}</pre>
      </div>
    `;
  });
