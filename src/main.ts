import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores";
import { dbAdapter } from "./shared/storage/database-adapter";
import { DatabaseReset } from "./shared/storage/database-reset";
import { ExerciseInitialization } from "./features/exercises/services/exercise.initialization";
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

// Initialize exercises if not already initialized
async function initializeExercises() {
  try {
    const isInitialized = await ExerciseInitialization.isInitialized();

    if (!isInitialized) {
      console.log("🔄 Exercises not initialized, loading exercise library...");
      await ExerciseInitialization.initialize((progress) => {
        // Log progress every 10%
        if (progress % 10 === 0 || progress === 100) {
          console.log(
            `📚 Exercise initialization progress: ${Math.round(progress)}%`
          );
        }
      });
      console.log("✅ Exercise library initialized successfully");
    } else {
      console.log("✅ Exercise library already initialized");
    }
  } catch (err) {
    console.error("❌ Failed to initialize exercise library:", err);
    throw err;
  }
}

// Expose database reset utilities globally in development (handy for testing)
if (import.meta.env.DEV) {
  (window as any).__FITNESS_APP_DEBUG__ = {
    resetExerciseData: DatabaseReset.resetExerciseData.bind(DatabaseReset),
  };

  console.log(
    "%c🔧 Development Mode",
    "color: #4CAF50; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cDatabase utilities available:",
    "color: #2196F3; font-weight: bold;"
  );
  console.log(
    "  - window.__FITNESS_APP_DEBUG__.resetExerciseData() - Reset and reload exercise data"
  );
  console.log("");
  console.log("%c💡 Tip:", "color: #FF9800; font-weight: bold;");
  console.log(
    "Run resetExerciseData() then refresh to see the splash screen again!"
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

// Initialize database, then exercises, then wait for router, then mount app
initializeDatabase()
  .then(() => initializeExercises())
  .then(() => router.isReady())
  .then(() => {
    app.mount("#app");
  })
  .catch((err) => {
    console.error("Failed to start app:", err);
    showErrorUI(err);
  });

// Show simple developer error UI
function showErrorUI(error: unknown) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const errorText = errorStack
    ? `${errorMessage}\n\n${errorStack}`
    : errorMessage;

  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      padding: 20px;
      padding-top: 100px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="color: #f48771; font-weight: 600;">
          ⚠️ App Initialization Error
        </div>
        <button
          id="copy-error-btn"
          style="
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
          "
          onmouseover="this.style.background='#5568d3'"
          onmouseout="this.style.background='#667eea'"
        >
          📋 Copy Error
        </button>
      </div>
      <pre style="
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #d4d4d4;
      ">${escapeHtml(errorText)}</pre>
    </div>
    <script>
      (function() {
        const errorText = ${JSON.stringify(errorText)};
        const copyBtn = document.getElementById('copy-error-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(errorText).then(() => {
              copyBtn.textContent = '✅ Copied!';
              setTimeout(() => {
                copyBtn.textContent = '📋 Copy Error';
              }, 2000);
            }).catch(() => {
              // Fallback for older browsers
              const textarea = document.createElement('textarea');
              textarea.value = errorText;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              copyBtn.textContent = '✅ Copied!';
              setTimeout(() => {
                copyBtn.textContent = '📋 Copy Error';
              }, 2000);
            });
          });
        }
      })();
    </script>
  `;
}

// Helper to escape HTML for safe display
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
