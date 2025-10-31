# Plan van Aanpak voor Fitness App

## Doel

Bouwen van een gebruiksvriendelijke fitness app met optionele gebruikerslogin, macro tracking en een goede code architectuur volgens feature-based pattern met composables.

## Architecture

### Feature-Based Architecture

De app gebruikt een **feature-based architectuur** geoptimaliseerd voor Vue 3 + Ionic:

- **Features**: Zelfstandige modules gegroepeerd per domein (workouts, exercises, etc.)
- **Composables**: Primaire abstractie voor business logica en reactive state (Vue 3 best practice)
- **Repositories**: Data access layer abstractie (makkelijk migratie naar API later)
- **Stores (Pinia)**: Alleen voor echt globale/gedeelde state tussen features
- **Views**: Route pages die features samenstellen
- **Atomic Design**: Gedeelde UI componenten georganiseerd als Atoms → Molecules → Organisms

**Voordelen**: Betere schaalbaarheid, feature isolatie, Vue 3 aligned, makkelijker testen

### Project Structuur

```
src/
├── features/               # Feature modules (domain-driven)
│   ├── workouts/
│   │   ├── components/    # Feature-specific organisms
│   │   ├── composables/   # useWorkout, useWorkoutHistory
│   │   ├── repositories/  # workout.repository.ts
│   │   └── types/         # workout.types.ts
│   ├── exercises/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── repositories/
│   │   └── types/
│   └── macros/            # Future feature
├── components/            # Shared UI (Atomic Design)
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Combined atoms
│   └── organisms/         # Complex shared components
├── views/                 # Route pages
├── shared/                # Cross-cutting concerns
│   ├── storage/          # local-storage.ts
│   └── utils/            # Helpers
└── router/
```

## Features

### Phase 1: Foundation & Core Workout Logging (IMPLEMENTED)

1. ✅ **Core Architecture Setup**
   - Feature-based folder structure
   - Pinia store setup
   - TypeScript types voor workouts en exercises
   - Local storage abstraction layer (Capacitor Preferences)

2. ✅ **Data Layer**
   - Workout repository met CRUD operaties
   - Exercise repository met search functionaliteit
   - Type-safe data models

3. ✅ **Atomic Design Components**
   - **Atoms**: AppButton, AppInput, AppLabel, AppCard, AppBadge
   - **Molecules**: FormField, SetInput, SearchBar, CounterButton

4. ✅ **Feature Composables**
   - `useWorkout`: Workout state management en business logica
   - `useWorkoutHistory`: Workout history queries
   - `useExercise`: Exercise CRUD operaties
   - `useExerciseLibrary`: Exercise library queries en filtering

5. ✅ **Feature Components (Organisms)**
   - SetTracker: Set logging tijdens workout
   - WorkoutCard: Display workout summary
   - ExerciseCard: Display exercise details
   - ExerciseSelector: Search en select exercise

6. ✅ **Views (Pages)**
   - WorkoutPage: Actieve workout sessie
   - WorkoutHistoryPage: Lijst van workout geschiedenis
   - ExerciseLibraryPage: Browse/maak exercises
   - RoutinePage: Beheer routines (basic)

7. ✅ **Router & Navigation**
   - Tab navigation met 4 tabs: Workout, History, Exercises, Routines
   - Router configuratie voor alle pagina's

### Core Features (Phase 1 - IMPLEMENTED)

- ✅ Workout creation en editing
- ✅ Exercise library management (CRUD)
- ✅ Set logging (reps, weight, rest time)
- ✅ Workout saving en history
- ✅ Basic routine management (UI only)

### Phase 2: Polish & Enhancement (TODO)

1. Form validation
2. Error handling en user feedback verbeteren
3. Loading states verbeteren
4. Unit tests voor composables
5. E2E tests voor core workout flow

### Future Phases

- Phase 3: User profiles en optionele authenticatie
- Phase 4: Macro tracker
- Phase 5: Progress visualisatie (grafieken)
- Phase 6: Advanced workout features (supersets, dropsets)
- Phase 7: Social features en gamification
- Phase 8: Integraties (wearables, health apps)
- Phase 9: Notificaties en herinneringen
- Phase 10: Offline modus en responsive design
- Phase 11: Meertalige ondersteuning

## Technische Beslissingen

- **Architectuur**: Feature-based modules met composables als primaire abstractie (Vue 3 best practice)
- **Storage**: Capacitor Preferences voor key-value storage, IndexedDB via idb library indien complexe queries nodig
- **State Management**: Composables voor feature state, Pinia stores alleen voor echt globale state
- **Type Safety**: Strict TypeScript met interfaces voor alle data models
- **Validatie**: Zod voor runtime type validatie (optioneel maar aanbevolen)
- **Styling**: Ionic CSS variables + custom theme in `variables.css`
- **Component Organisatie**: Atomic Design voor shared UI, feature-specific componenten in feature folders

## Planning en Prioriteiten

- ✅ **Start met core feature**: Workout logging - VOLTOOID
- ⏭️ **Uitbreiden** met validatie en testing
- ⏭️ **Dan** user profiles en authenticatie
- ⏭️ **Vervolgens** macro tracker
- ⏭️ **Daarna** social en gamification in volgende iteraties
- ⏭️ **Integraties** en offline modus als laatste

## Status

**Phase 1: COMPLETED** ✅

De basis workout logging functionaliteit is volledig geïmplementeerd en werkt. De app heeft:
- Feature-based architectuur met composables
- Volledige workout CRUD functionaliteit
- Exercise library management
- Set tracking tijdens workouts
- Workout history
- Atomic Design component systeem

**Next Steps:**
1. Testen van de implementatie
2. Validatie toevoegen
3. Error handling verbeteren
4. Testing toevoegen
5. UI/UX polish

