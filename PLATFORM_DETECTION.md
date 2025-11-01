# Platform Detection for SQLite

## Overview

The app now includes **platform detection** to handle the difference between running on:
- **Native platforms** (iOS/Android) - Uses SQLite via `@capacitor-community/sqlite`
- **Web browser** - Shows a warning message (SQLite not supported)

## How It Works

### 1. Main App Initialization (`main.ts`)

```typescript
import { Capacitor } from "@capacitor/core";

async function initializeDatabase() {
  if (Capacitor.isNativePlatform()) {
    // Initialize SQLite on iOS/Android
    await dbManager.initialize();
  } else {
    // Log warning on web
    console.warn("⚠️ Running on web platform - SQLite not available");
  }
}
```

The database initialization is **awaited** before the router is ready, ensuring the database is fully initialized before any routes try to access it.

### 2. Router Navigation Guard (`router/index.ts`)

```typescript
router.beforeEach(async (to, from, next) => {
  // Skip database checks on web
  if (!Capacitor.isNativePlatform()) {
    console.warn("⚠️ Running on web - skipping database checks");
    next();
    return;
  }
  
  // Check initialization status on native platforms
  const isInitialized = await AppState.isInitialized();
  // ... routing logic
});
```

### 3. Database Manager (`database.ts`)

```typescript
getDb() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error(
      "SQLite database is only available on native platforms (iOS/Android). " +
      "This app must be run on a device or simulator."
    );
  }
  // ... return database instance
}
```

## Development Workflow

### Running on iOS (Recommended)
```bash
npm run dev:ios
# or
npm run build
npx cap sync ios
npx cap open ios
```

### Running on Web (Limited)
```bash
npm run dev
```

**Note:** When running on web:
- ✅ App will load without crashing
- ⚠️ Database functionality will not work
- ⚠️ You'll see warnings in the console
- ⚠️ Any features requiring the database will fail gracefully

The app will display:
```
⚠️ Running on web platform - SQLite not available.
This app requires a native platform (iOS/Android).
```

## Why Native-Only?

The `@capacitor-community/sqlite` plugin:
- ✅ **Excellent performance** on native (iOS/Android)
- ✅ **Native SQLite engine** optimized for mobile
- ❌ **Web support is complex** and requires additional setup
- ❌ **Web performance** would be slower than native

For this app, we prioritized native performance over web support.

## Future: Adding Web Support

If you need web support later, you could:

1. **Option A: Add web SQLite**
   - Use `sql.js` or similar for web
   - Keep Capacitor SQLite for native
   - Create an abstraction layer

2. **Option B: Keep Dexie for web**
   - Use Dexie (IndexedDB) on web
   - Use SQLite on native
   - Platform-specific repository implementations

3. **Option C: Backend + API**
   - Move database to a backend server
   - Use API calls from the app
   - Works on all platforms

## Error Handling

If a user somehow accesses database functions on web:

```typescript
try {
  const db = getDb();
  // ... database operations
} catch (error) {
  if (error.message.includes("native platforms")) {
    // Show user-friendly message
    alert("This feature requires the native app");
  }
}
```

## Checking Platform in Code

Anywhere in your code, you can check the platform:

```typescript
import { Capacitor } from "@capacitor/core";

// Check if native
if (Capacitor.isNativePlatform()) {
  // iOS or Android
}

// Check specific platform
if (Capacitor.getPlatform() === 'ios') {
  // iOS specific code
}

if (Capacitor.getPlatform() === 'android') {
  // Android specific code
}

if (Capacitor.getPlatform() === 'web') {
  // Web browser
}
```

## Testing

### iOS Simulator
```bash
npm run dev:ios
```

### Physical iOS Device
1. Build: `npm run build`
2. Sync: `npx cap sync ios`
3. Open Xcode: `npx cap open ios`
4. Select your device and run

### Web (for UI testing only)
```bash
npm run dev
```
**Remember:** Database features won't work!

## Summary

✅ **App is fully native-optimized**  
✅ **No crashes on web** - graceful degradation  
✅ **Clear error messages** for users  
✅ **Production ready** for iOS/Android  
⚠️ **Web is view-only** - no database functionality

