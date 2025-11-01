# SQLite Migration Complete

## Overview
Successfully migrated from Dexie.js (IndexedDB) to native SQLite using `@capacitor-community/sqlite` and Drizzle ORM.

## What Changed

### Dependencies
- ✅ Added: `@capacitor-community/sqlite@7.0.2`
- ✅ Added: `drizzle-orm`
- ✅ Added: `drizzle-kit` (dev dependency)
- ✅ Removed: `dexie`

### Files Created
1. **`src/shared/storage/schema.ts`** - Drizzle schema definitions for all tables
2. **`drizzle.config.ts`** - Drizzle Kit configuration for migrations and tooling
3. **`MIGRATION_NOTES.md`** - This file

### Files Refactored
1. **`src/shared/storage/database.ts`**
   - Replaced Dexie class with SQLite connection manager
   - Uses `@capacitor-community/sqlite` for native SQLite
   - Exports Drizzle ORM instance via `getDb()`
   - Includes `DatabaseManager` class for connection lifecycle

2. **`src/shared/storage/app.state.ts`**
   - Updated to use Drizzle queries instead of Dexie API

3. **`src/shared/storage/database-reset.ts`**
   - Updated to use Drizzle delete operations
   - Maintains all debug utilities

4. **`src/main.ts`**
   - Changed from `db.open()` to `dbManager.initialize()`
   - SQLite is initialized before app mount

5. **All Repository Files:**
   - `WorkoutRepository` - Now uses Drizzle queries
   - `ExerciseRepository` - Now uses Drizzle queries
   - `BodyPartRepository` - Now uses Drizzle queries
   - `EquipmentRepository` - Now uses Drizzle queries
   - `MuscleRepository` - Now uses Drizzle queries

## Database Schema

### Tables
- **workouts** - Stores workout sessions with JSON-encoded exercises
- **routines** - Stores workout templates
- **exercises** - Exercise library with JSON arrays for equipments, bodyParts, muscles
- **body_parts** - Lookup table for body parts
- **equipment** - Lookup table for equipment
- **muscles** - Lookup table for muscles
- **app_settings** - Key-value store for app configuration

### Indexes
- `idx_workouts_created_at` - For ordering workouts by date
- `idx_workouts_name` - For workout name searches
- `idx_exercises_name` - For exercise name searches

## Key Technical Details

### JSON Storage
Since SQLite doesn't have native array support, arrays and complex objects are stored as JSON strings:
- `workout.exercises` → JSON string
- `workout.intervalConfig` → JSON string
- `exercise.equipments` → JSON array as string
- `exercise.bodyParts` → JSON array as string
- etc.

The repositories handle serialization/deserialization automatically.

### Date Handling
Dates are stored as ISO 8601 strings (e.g., `"2024-12-01T10:30:00.000Z"`) in SQLite TEXT columns.

### Filtering
Since SQLite doesn't support native array operations, filtering by arrays (e.g., bodyParts, equipments) is done in-memory after fetching results. This is acceptable for the current dataset size.

## Usage

### Accessing the Database
```typescript
import { getDb, schema } from "@/shared/storage/database";

const db = getDb(); // Returns Drizzle instance
```

### Example Query
```typescript
// Select with Drizzle
const workouts = await db
  .select()
  .from(schema.workouts)
  .orderBy(desc(schema.workouts.createdAt));

// Insert with conflict resolution
await db
  .insert(schema.workouts)
  .values(workout)
  .onConflictDoUpdate({
    target: schema.workouts.id,
    set: workout,
  });

// Delete
await db
  .delete(schema.workouts)
  .where(eq(schema.workouts.id, workoutId));
```

### Repository Pattern
All database access should go through repositories. Example:
```typescript
import { WorkoutRepository } from "@/features/workouts/repositories/workout.repository";

// Get all workouts
const workouts = await WorkoutRepository.getAll();

// Save a workout
await WorkoutRepository.save(workout);
```

## Development Tools

The debug utilities are still available in development mode:
```javascript
// In browser console:
window.__FITNESS_APP_DEBUG__.resetDatabase()
window.__FITNESS_APP_DEBUG__.deleteDatabase()
window.__FITNESS_APP_DEBUG__.resetAndReinitialize()
window.__FITNESS_APP_DEBUG__.getStateInfo()
```

## Platform Detection
✅ **Implemented**: The app now includes platform detection to gracefully handle web vs native environments.

### How it works:
- **Native (iOS/Android)**: SQLite initializes normally
- **Web browser**: Shows warning, skips database initialization, prevents crashes

### Key Changes:
1. `main.ts` - Only initializes SQLite on `Capacitor.isNativePlatform()`
2. `router/index.ts` - Skips database checks on web
3. `database.ts` - Throws helpful error if accessed on web

### Running the app:
```bash
# iOS (full functionality)
npm run dev:ios

# Web (view-only, no database)
npm run dev
```

See `PLATFORM_DETECTION.md` for complete details.

## Testing
After migration:
1. ✅ All dependencies installed
2. ✅ Capacitor plugins synced
3. ⚠️ Database will start fresh (no data migration per requirements)
4. ⚠️ Users will need to re-initialize exercises on first launch

## Next Steps
1. Build and test on iOS device/simulator
2. Verify all CRUD operations work correctly
3. Test exercise initialization flow
4. Test workout creation and history
5. Monitor performance with SQLite vs previous IndexedDB

## Rollback (if needed)
If you need to rollback:
```bash
npm uninstall @capacitor-community/sqlite drizzle-orm
npm uninstall -D drizzle-kit
npm install dexie
git checkout HEAD -- src/
```

## Performance Considerations
- SQLite is generally faster than IndexedDB for structured queries
- JSON parsing adds slight overhead but is negligible for current dataset size
- Consider adding more indexes if queries become slow (use `CREATE INDEX` in database.ts)
- Batch operations should use transactions for better performance

## Resources
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Capacitor SQLite Plugin](https://github.com/capacitor-community/sqlite)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

