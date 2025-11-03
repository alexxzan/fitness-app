# Fitness App

A fitness tracking application built with Vue 3, Ionic, and Capacitor.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development

#### Web Development
```bash
npm run dev
```

#### iOS Simulator with Live Reload (iPhone 16)
```bash
npm run dev:ios
```

This command:
- Starts the Vite dev server
- Waits for it to be ready
- Boots the iPhone 16 simulator (if not already running)
- Opens your app in the simulator with live reload enabled

**Note:** Make sure you've run `npx cap add ios` and `npx cap sync ios` at least once before using this command.

### Building

```bash
npm run build
```

### Testing

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## iOS Development

### Initial Setup (First Time Only)

1. **Add iOS platform:**
   ```bash
   npx cap add ios
   ```

2. **Sync web assets:**
   ```bash
   npm run build
   npx cap sync ios
   ```

### Development Commands

- `npm run dev:ios` - Start dev server + iOS simulator with live reload (iPhone 16)
- `npx cap open ios` - Open project in Xcode
- `npx cap sync ios` - Sync web assets to iOS project
- `npx cap run ios` - Build and run in simulator

### Available Simulators

To list available iOS simulators:
```bash
npx cap run ios --list
```

To change the target device, edit the `dev:ios` script in `package.json` and update the `--target` flag.

## Project Structure

```
src/
├── features/           # Feature modules (domain-driven)
│   ├── workouts/      # Workout feature
│   └── exercises/     # Exercise feature
├── components/        # Shared UI components (Atomic Design)
│   ├── atoms/        # Basic building blocks
│   ├── molecules/    # Combined atoms
│   └── organisms/    # Complex components
├── views/            # Route pages
├── shared/           # Cross-cutting concerns
│   └── storage/      # Database abstraction layer (adapters & schema)
└── router/           # Vue Router config
```

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Ionic Vue** - UI component library
- **Capacitor** - Native runtime
- **Dexie.js** - IndexedDB wrapper (web development)
- **Drizzle ORM** - TypeScript ORM for SQLite
- **SQLite** - Native database via @capacitor-community/sqlite
- **Pinia** - State management
- **TypeScript** - Type safety
- **Vite** - Build tool

## Database

The app uses a **database abstraction layer** that automatically selects the appropriate database implementation based on the platform:

- **Web (Development)**: Dexie.js with IndexedDB - Fast development experience ⚡
- **Native (iOS/Android)**: SQLite with Drizzle ORM - Optimized native performance 📱

The abstraction layer ensures your code works seamlessly across both platforms. See [Database Abstraction Layer](./ABSTRACTION_LAYER.md) for details.

## Documentation

- [Database Abstraction Layer](./ABSTRACTION_LAYER.md) - Database architecture and usage guide
- [iOS Setup](./IOS_SETUP.md) - Detailed iOS development guide
- [Plan](./plan.md) - Project plan and roadmap

