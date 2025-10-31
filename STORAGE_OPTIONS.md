# Storage & ORM Options for Fitness App

## Current Setup
Currently using `@capacitor/preferences` (key-value storage). This works but has limitations:
- ✅ Simple to use
- ✅ Persists data between restarts
- ❌ Limited to key-value pairs
- ❌ No querying capabilities
- ❌ Not optimized for relational data
- ❌ Manual JSON serialization needed

## Recommended Options

### 1. **Dexie.js** ⭐ RECOMMENDED (Best Balance)

**Why it's great for your app:**
- ✅ Works on **both web and native** (IndexedDB on web, SQLite on native via wrapper)
- ✅ ORM-like API with TypeScript support
- ✅ Excellent performance
- ✅ Simple migration system
- ✅ Query capabilities (filtering, sorting, indexing)
- ✅ Well-maintained and actively developed

**Installation:**
```bash
npm install dexie
npm install dexie-vuejs  # Vue 3 integration
```

**Example Usage:**
```typescript
import Dexie, { Table } from 'dexie'

class FitnessDatabase extends Dexie {
  workouts!: Table<Workout>
  exercises!: Table<Exercise>
  routines!: Table<WorkoutRoutine>

  constructor() {
    super('FitnessDatabase')
    this.version(1).stores({
      workouts: '++id, name, createdAt, startTime',
      exercises: '++id, name, category',
      routines: '++id, name, createdAt'
    })
  }
}

const db = new FitnessDatabase()
```

**Pros:**
- Universal (web + native)
- Simple API
- Good TypeScript support
- Fast queries with indexes

**Cons:**
- Uses IndexedDB (web) - not native SQLite
- No complex joins (but not needed for your use case)

---

### 2. **SQLite + TypeORM** (Most Robust)

**Why it's great:**
- ✅ True relational database
- ✅ Full SQL capabilities
- ✅ TypeORM provides excellent TypeScript ORM
- ✅ Migrations system
- ✅ Complex queries and relationships
- ✅ Industry standard

**Installation:**
```bash
npm install @capacitor-community/sqlite
npm install typeorm
npm install reflect-metadata
npx cap sync
```

**Example Usage:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, DataSource } from 'typeorm'

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column('datetime')
  createdAt: Date
}
```

**Pros:**
- Most powerful option
- Full relational database
- Excellent for complex data relationships
- Strong typing with TypeORM

**Cons:**
- More complex setup
- Only works on native platforms (not web PWA)
- Heavier bundle size
- More boilerplate code

---

### 3. **SQLite + Prisma** (Modern Alternative)

**Why consider it:**
- ✅ Modern, developer-friendly ORM
- ✅ Excellent TypeScript support
- ✅ Auto-generated types
- ✅ Migration system
- ✅ Growing ecosystem

**Installation:**
```bash
npm install @capacitor-community/sqlite
npm install prisma @prisma/client
npm install @capacitor-community/prisma
npx cap sync
```

**Pros:**
- Great developer experience
- Strong TypeScript integration
- Modern tooling

**Cons:**
- Newer, less mature ecosystem for Capacitor
- Only works on native (not web)
- Requires additional adapter setup

---

### 4. **@ionic/storage** (Simple Wrapper)

**Why consider it:**
- ✅ Simple abstraction over multiple storage engines
- ✅ Works on web and native
- ✅ Easy migration from Preferences

**Installation:**
```bash
npm install @ionic/storage
npm install localforage  # Driver for IndexedDB
```

**Pros:**
- Simple API
- Multiple storage backends
- Easy to use

**Cons:**
- **Not an ORM** - just a wrapper
- Still key-value based
- Limited querying
- Less powerful than Dexie or SQLite

---

## Recommendation for Your Fitness App

### 🏆 **Best Choice: Dexie.js**

**Reasons:**
1. **Universal compatibility** - Works on web (PWA) and native apps
2. **Perfect for your data structure** - Workouts, exercises, sets have simple relationships
3. **Great TypeScript support** - Fits your current stack
4. **Easy migration** - Can gradually migrate from current LocalStorage
5. **Performance** - IndexedDB is fast for your use case
6. **Simple API** - Less complexity than TypeORM

### When to Consider SQLite + TypeORM Instead:
- If you need complex joins across many tables
- If you're building native-only (no web support needed)
- If you have very large datasets (>100k records)
- If you need advanced SQL features

## Migration Path

### Phase 1: Add Dexie.js alongside current storage
- Keep LocalStorage for now
- Add Dexie for new features
- Gradually migrate repositories

### Phase 2: Full migration
- Replace all LocalStorage calls with Dexie
- Remove LocalStorage abstraction
- Add migrations for existing data

## Example Implementation with Dexie.js

```typescript
// src/shared/storage/database.ts
import Dexie, { Table } from 'dexie'
import type { Workout, WorkoutRoutine } from '@/features/workouts/types/workout.types'
import type { Exercise } from '@/features/exercises/types/exercise.types'

export class FitnessDatabase extends Dexie {
  workouts!: Table<Workout, string>
  routines!: Table<WorkoutRoutine, string>
  exercises!: Table<Exercise, string>

  constructor() {
    super('FitnessDatabase')
    
    this.version(1).stores({
      workouts: '++id, name, createdAt, startTime, endTime',
      exercises: '++id, name, category, createdAt',
      routines: '++id, name, createdAt'
    })
  }
}

export const db = new FitnessDatabase()
```

**Repository Example:**
```typescript
// src/features/workouts/repositories/workout.repository.ts
import { db } from '@/shared/storage/database'
import type { Workout } from '../types/workout.types'

export class WorkoutRepository {
  static async getAll(): Promise<Workout[]> {
    return await db.workouts.toArray()
  }

  static async getById(id: string): Promise<Workout | undefined> {
    return await db.workouts.get(id)
  }

  static async save(workout: Workout): Promise<string> {
    return await db.workouts.put(workout)
  }

  static async delete(id: string): Promise<void> {
    await db.workouts.delete(id)
  }

  static async searchByName(query: string): Promise<Workout[]> {
    return await db.workouts
      .where('name')
      .startsWithIgnoreCase(query)
      .toArray()
  }
}
```

## Decision Matrix

| Feature | Dexie.js | TypeORM + SQLite | @ionic/storage |
|---------|----------|------------------|----------------|
| Web Support | ✅ | ❌ | ✅ |
| Native Support | ✅ | ✅ | ✅ |
| ORM Features | ✅ | ✅✅ | ❌ |
| TypeScript | ✅✅ | ✅✅ | ✅ |
| Complexity | Low | High | Low |
| Query Power | Medium | High | Low |
| Migrations | ✅ | ✅✅ | ❌ |
| Bundle Size | Small | Large | Small |
| Learning Curve | Easy | Moderate | Easy |

## Next Steps

1. **Decide on approach** (recommend Dexie.js)
2. **Install dependencies**
3. **Create database schema**
4. **Migrate one repository as proof of concept**
5. **Gradually migrate remaining repositories**
6. **Add data migration from LocalStorage if needed**

