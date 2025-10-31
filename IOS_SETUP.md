# Running the App in iOS Simulator

## Prerequisites

1. **macOS** with Xcode installed
2. **Xcode Command Line Tools**: `xcode-select --install`
3. **CocoaPods** (if not installed): `sudo gem install cocoapods`

## Step-by-Step Instructions

### Option 1: Quick Setup (Recommended)

#### 1. Build the Web App

```bash
npm run build
```

#### 2. Add iOS Platform (if not already added)

```bash
npx cap add ios
```

This creates the `ios/` folder and sets up the native iOS project.

#### 3. Sync Web Assets to iOS

```bash
npx cap sync ios
```

This copies your built web app (`dist/`) to the iOS project.

#### 4. Open in Xcode

```bash
npx cap open ios
```

This opens Xcode with your project.

#### 5. Run in Simulator

1. In Xcode, select a simulator from the device dropdown (top toolbar)
2. Click the Play button (▶️) or press `Cmd + R`
3. Wait for the simulator to launch and install the app

### Option 2: Using Capacitor CLI (Faster)

After initial setup (steps 1-3 above), you can use:

```bash
# Build and sync in one command
npm run build && npx cap sync ios

# Open and run in simulator
npx cap run ios
```

The `npx cap run ios` command will:

- Open Xcode
- Build the project
- Launch the simulator
- Install and run the app

### Option 3: Live Reload (Development)

For development with live reload, you can use:

1. **Terminal 1** - Start the Vite dev server:

```bash
npm run dev
```

2. **Terminal 2** - Run Capacitor with live reload:

```bash
npx cap run ios -l --external
```

This will:

- Use your local dev server (usually `http://localhost:5173`)
- Auto-reload when you make changes
- Open in iOS simulator

## Troubleshooting

### "Platform ios is not installed"

Run: `npx cap add ios`

### "Build failed" in Xcode

1. Clean build folder: `Product > Clean Build Folder` (Shift+Cmd+K)
2. Update pods: `cd ios/App && pod install`
3. Try building again

### "Cannot find module" errors

Make sure you've run `npm run build` before syncing:

```bash
npm run build && npx cap sync ios
```

### Simulator not launching

1. Open Xcode manually: `open ios/App/App.xcworkspace`
2. Select a simulator device
3. Click Run

### App shows blank screen

1. Check browser console (Safari > Develop > Simulator > [Your App])
2. Make sure all assets are synced: `npx cap sync ios`
3. Rebuild: `npm run build && npx cap sync ios`

### IndexedDB not working in simulator

IndexedDB works in iOS simulator. If you have issues:

1. Clear app data in simulator: `Device > Erase All Content and Settings`
2. Reinstall the app

## Quick Commands Reference

```bash
# Build web app
npm run build

# Add iOS platform (first time only)
npx cap add ios

# Sync web assets to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run in simulator (builds and launches)
npx cap run ios

# Run with live reload (development)
npm run dev  # Terminal 1
npx cap run ios -l --external  # Terminal 2
```

## Development Workflow

1. **Make changes** to your Vue components
2. **Build**: `npm run build`
3. **Sync**: `npx cap sync ios`
4. **Reload** in simulator: Swipe down or `Cmd + R` in Xcode

Or use live reload for faster iteration:

1. **Terminal 1**: `npm run dev`
2. **Terminal 2**: `npx cap run ios -l --external`
3. **Make changes** - app auto-reloads

## Debugging

### View Console Logs

1. Open Safari
2. Go to `Develop > Simulator > [Your App]`
3. See console logs and debug

### View Network Requests

Use Safari's Web Inspector (same menu as above) to inspect network requests.

### Check Database

IndexedDB data in simulator can be inspected via Safari Web Inspector:

1. Open Web Inspector
2. Go to Storage tab
3. Expand IndexedDB
4. View your `FitnessDatabase`

## Notes

- First build in Xcode may take a few minutes
- Simulator performance depends on your Mac's resources
- Use `npx cap sync ios` after every `npm run build` to update native app
- For production builds, use Xcode's Archive feature
