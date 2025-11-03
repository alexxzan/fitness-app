/**
 * Mock data for workouts and exercises
 * Used for testing and development purposes
 */

import type { Exercise } from "@/features/exercises/types/exercise.types";
import type {
  Workout,
  WorkoutRoutine,
  WorkoutStatistics,
  WorkoutProgram,
  WorkoutTemplate,
} from "@/features/workouts/types/workout.types";
import type { IntervalConfig } from "@/features/workouts/types/interval.types";

/**
 * Mock Exercises
 * These match the exercise IDs used in mock workouts
 */
export const mockExercises: Exercise[] = [
  {
    exerciseId: "1",
    name: "Bench Press",
    gifUrl: "https://static.exercisedb.dev/media/bench-press.gif",
    targetMuscles: ["chest", "triceps"],
    bodyParts: ["chest"],
    equipments: ["barbell", "bench"],
    secondaryMuscles: ["shoulders", "triceps"],
    instructions: [
      "Lie on a flat bench with your feet on the floor",
      "Grip the barbell with hands slightly wider than shoulder-width",
      "Lower the barbell to your chest with control",
      "Press the barbell up until your arms are fully extended",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "2",
    name: "Overhead Press",
    gifUrl: "https://static.exercisedb.dev/media/overhead-press.gif",
    targetMuscles: ["shoulders", "triceps"],
    bodyParts: ["shoulders"],
    equipments: ["barbell"],
    secondaryMuscles: ["core", "triceps"],
    instructions: [
      "Stand with feet shoulder-width apart",
      "Hold the barbell at shoulder height",
      "Press the barbell overhead until arms are fully extended",
      "Lower back to shoulder height with control",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "3",
    name: "Deadlift",
    gifUrl: "https://static.exercisedb.dev/media/deadlift.gif",
    targetMuscles: ["back", "hamstrings", "glutes"],
    bodyParts: ["back", "legs"],
    equipments: ["barbell"],
    secondaryMuscles: ["core", "traps", "forearms"],
    instructions: [
      "Stand with feet hip-width apart, barbell over mid-foot",
      "Bend at hips and knees to grip the barbell",
      "Keep back straight and chest up",
      "Drive through heels and stand up, lifting the barbell",
      "Lower the barbell back to the floor with control",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "4",
    name: "Pull-ups",
    gifUrl: "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    targetMuscles: ["back", "biceps"],
    bodyParts: ["back"],
    equipments: ["pull-up bar"],
    secondaryMuscles: ["shoulders", "core"],
    instructions: [
      "Hang from a pull-up bar with palms facing away",
      "Pull your body up until your chin clears the bar",
      "Lower yourself back down with control",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "5",
    name: "Squat",
    gifUrl: "https://static.exercisedb.dev/media/squat.gif",
    targetMuscles: ["quadriceps", "glutes"],
    bodyParts: ["legs"],
    equipments: ["barbell"],
    secondaryMuscles: ["core", "hamstrings"],
    instructions: [
      "Stand with feet shoulder-width apart",
      "Place barbell on upper back",
      "Lower down by bending knees and hips",
      "Keep chest up and back straight",
      "Drive through heels to stand back up",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "6",
    name: "Bicep Curl",
    gifUrl: "https://static.exercisedb.dev/media/bicep-curl.gif",
    targetMuscles: ["biceps"],
    bodyParts: ["arms"],
    equipments: ["dumbbell"],
    secondaryMuscles: ["forearms"],
    instructions: [
      "Stand holding dumbbells at your sides",
      "Keep elbows close to your body",
      "Curl the weights up to your shoulders",
      "Lower back down with control",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "7",
    name: "Tricep Dip",
    gifUrl: "https://static.exercisedb.dev/media/tricep-dip.gif",
    targetMuscles: ["triceps"],
    bodyParts: ["arms"],
    equipments: ["dip bar"],
    secondaryMuscles: ["shoulders", "chest"],
    instructions: [
      "Support your weight on parallel bars",
      "Lower your body by bending your arms",
      "Push back up to starting position",
      "Repeat for desired number of reps",
    ],
  },
  {
    exerciseId: "8",
    name: "Leg Press",
    gifUrl: "https://static.exercisedb.dev/media/leg-press.gif",
    targetMuscles: ["quadriceps", "glutes"],
    bodyParts: ["legs"],
    equipments: ["leg press machine"],
    secondaryMuscles: ["hamstrings"],
    instructions: [
      "Sit in the leg press machine",
      "Place feet on the platform",
      "Lower the weight by bending your knees",
      "Press back up to starting position",
      "Repeat for desired number of reps",
    ],
  },
];

/**
 * Mock Workouts
 */
export const mockRecentWorkouts: Workout[] = [
  {
    id: "mock-1",
    name: "Push Day",
    type: "regular",
    exercises: [
      {
        id: "ex-1",
        exerciseId: "1",
        exerciseName: "Bench Press",
        sets: [
          { id: "set-1", reps: 8, weight: 80, completed: true },
          { id: "set-2", reps: 8, weight: 80, completed: true },
          { id: "set-3", reps: 6, weight: 85, completed: true },
        ],
        order: 1,
      },
      {
        id: "ex-2",
        exerciseId: "2",
        exerciseName: "Overhead Press",
        sets: [
          { id: "set-4", reps: 10, weight: 50, completed: true },
          { id: "set-5", reps: 8, weight: 55, completed: true },
        ],
        order: 2,
      },
    ],
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000
    ).toISOString(),
    completed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    name: "Pull Day",
    type: "regular",
    exercises: [
      {
        id: "ex-3",
        exerciseId: "3",
        exerciseName: "Deadlift",
        sets: [
          { id: "set-6", reps: 5, weight: 140, completed: true },
          { id: "set-7", reps: 5, weight: 145, completed: true },
        ],
        order: 1,
      },
      {
        id: "ex-4",
        exerciseId: "4",
        exerciseName: "Pull-ups",
        sets: [
          { id: "set-8", reps: 10, completed: true },
          { id: "set-9", reps: 8, completed: true },
        ],
        order: 2,
      },
    ],
    startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000
    ).toISOString(),
    completed: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    name: "Leg Day",
    type: "regular",
    exercises: [
      {
        id: "ex-5",
        exerciseId: "5",
        exerciseName: "Squat",
        sets: [
          { id: "set-10", reps: 10, weight: 100, completed: true },
          { id: "set-11", reps: 8, weight: 110, completed: true },
          { id: "set-12", reps: 6, weight: 120, completed: true },
        ],
        order: 1,
      },
      {
        id: "ex-8",
        exerciseId: "8",
        exerciseName: "Leg Press",
        sets: [
          { id: "set-13", reps: 12, weight: 180, completed: true },
          { id: "set-14", reps: 10, weight: 200, completed: true },
        ],
        order: 2,
      },
    ],
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000
    ).toISOString(),
    completed: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock Active Workout (not completed)
 */
export const mockActiveWorkout: Workout = {
  id: "active-1",
  name: "Push Day",
  type: "regular",
  exercises: [
    {
      id: "ex-active-1",
      exerciseId: "1",
      exerciseName: "Bench Press",
      sets: [
        { id: "set-active-1", reps: 8, weight: 80, completed: true },
        { id: "set-active-2", reps: 8, weight: 80, completed: false },
        { id: "set-active-3", reps: 6, weight: 85, completed: false },
      ],
      order: 1,
    },
    {
      id: "ex-active-2",
      exerciseId: "2",
      exerciseName: "Overhead Press",
      sets: [
        { id: "set-active-4", reps: 10, weight: 50, completed: false },
        { id: "set-active-5", reps: 8, weight: 55, completed: false },
      ],
      order: 2,
    },
  ],
  startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  completed: false,
  createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
};

/**
 * Mock Interval Workout
 */
export const mockIntervalWorkout: Workout = {
  id: "interval-1",
  name: "HIIT Circuit",
  type: "interval",
  intervalConfig: {
    workDuration: 30,
    restDuration: 15,
    rounds: 4,
    exercises: [
      { exerciseId: "5", exerciseName: "Squat", order: 1 },
      { exerciseId: "6", exerciseName: "Bicep Curl", order: 2 },
      { exerciseId: "7", exerciseName: "Tricep Dip", order: 3 },
    ],
    autoAdvance: true,
  },
  intervalProgress: {
    currentRound: 2,
    currentInterval: 1,
    completedIntervals: 5,
    currentPhase: "work",
    phaseStartTime: new Date().toISOString(),
    isPaused: false,
  },
  exercises: [],
  startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  completed: false,
  createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock Routines
 */
export const mockFavoriteRoutines: WorkoutRoutine[] = [
  {
    id: "routine-1",
    name: "Push Pull Legs",
    description: "Classic 3-day split for balanced muscle development",
    exercises: [
      {
        id: "routine-ex-1",
        exerciseId: "1",
        exerciseName: "Bench Press",
        targetSets: 3,
        targetReps: "8-10",
        order: 1,
      },
      {
        id: "routine-ex-2",
        exerciseId: "2",
        exerciseName: "Overhead Press",
        targetSets: 3,
        targetReps: "8-10",
        order: 2,
      },
    ],
    type: "custom",
    isFavorite: true,
    estimatedDuration: 60,
    difficulty: "intermediate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "routine-2",
    name: "Full Body HIIT",
    description: "High-intensity interval training for full body conditioning",
    exercises: [
      {
        id: "routine-ex-3",
        exerciseId: "5",
        exerciseName: "Squat",
        targetSets: 4,
        targetReps: "12-15",
        order: 1,
      },
      {
        id: "routine-ex-4",
        exerciseId: "6",
        exerciseName: "Bicep Curl",
        targetSets: 4,
        targetReps: "12-15",
        order: 2,
      },
    ],
    type: "custom",
    isFavorite: true,
    estimatedDuration: 30,
    difficulty: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "routine-3",
    name: "Upper Body Focus",
    description: "Target chest, back, and arms",
    exercises: [
      {
        id: "routine-ex-5",
        exerciseId: "1",
        exerciseName: "Bench Press",
        targetSets: 4,
        targetReps: "6-8",
        order: 1,
      },
      {
        id: "routine-ex-6",
        exerciseId: "4",
        exerciseName: "Pull-ups",
        targetSets: 3,
        targetReps: "8-12",
        order: 2,
      },
      {
        id: "routine-ex-7",
        exerciseId: "6",
        exerciseName: "Bicep Curl",
        targetSets: 3,
        targetReps: "10-12",
        order: 3,
      },
    ],
    type: "custom",
    isFavorite: false,
    estimatedDuration: 45,
    difficulty: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Mock Programs
 */
export const mockPrograms: WorkoutProgram[] = [
  {
    id: "program-1",
    name: "Push Pull Legs Split",
    description: "A balanced 6-day training program",
    workouts: [
      {
        id: "program-routine-1",
        name: "Push Day",
        exercises: [
          {
            id: "prog-ex-1",
            exerciseId: "1",
            exerciseName: "Bench Press",
            targetSets: 4,
            targetReps: "6-8",
            order: 1,
          },
          {
            id: "prog-ex-2",
            exerciseId: "2",
            exerciseName: "Overhead Press",
            targetSets: 3,
            targetReps: "8-10",
            order: 2,
          },
        ],
        type: "custom",
        estimatedDuration: 60,
        difficulty: "intermediate",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "program-routine-2",
        name: "Pull Day",
        exercises: [
          {
            id: "prog-ex-3",
            exerciseId: "3",
            exerciseName: "Deadlift",
            targetSets: 3,
            targetReps: "5",
            order: 1,
          },
          {
            id: "prog-ex-4",
            exerciseId: "4",
            exerciseName: "Pull-ups",
            targetSets: 4,
            targetReps: "8-12",
            order: 2,
          },
        ],
        type: "custom",
        estimatedDuration: 60,
        difficulty: "intermediate",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "program-routine-3",
        name: "Leg Day",
        exercises: [
          {
            id: "prog-ex-5",
            exerciseId: "5",
            exerciseName: "Squat",
            targetSets: 4,
            targetReps: "8-10",
            order: 1,
          },
          {
            id: "prog-ex-6",
            exerciseId: "8",
            exerciseName: "Leg Press",
            targetSets: 3,
            targetReps: "12-15",
            order: 2,
          },
        ],
        type: "custom",
        estimatedDuration: 60,
        difficulty: "intermediate",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Mock Statistics
 */
export const mockWorkoutStatistics: WorkoutStatistics = {
  totalVolume: 5680, // Total weight lifted (kg)
  totalSets: 8,
  totalReps: 58,
  duration: 45,
  exercisesCount: 2,
};

export const mockCompletedWorkoutStatistics: WorkoutStatistics = {
  totalVolume: 7840,
  totalSets: 12,
  totalReps: 92,
  duration: 65,
  exercisesCount: 3,
};

/**
 * Mock Templates
 */
export const mockTemplates: WorkoutTemplate[] = [
  {
    id: "template-1",
    name: "Beginner Full Body",
    description: "Perfect for those just starting out",
    difficulty: "beginner",
    durationWeeks: 4,
    workouts: [
      {
        name: "Full Body A",
        exercises: [
          { exerciseId: "5", exerciseName: "Squat" },
          { exerciseId: "1", exerciseName: "Bench Press" },
          { exerciseId: "4", exerciseName: "Pull-ups" },
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          { exerciseId: "3", exerciseName: "Deadlift" },
          { exerciseId: "2", exerciseName: "Overhead Press" },
          { exerciseId: "6", exerciseName: "Bicep Curl" },
        ],
      },
    ],
  },
];

/**
 * Helper Functions
 */

/**
 * Get mock exercise by ID
 */
export function getMockExercise(exerciseId: string): Exercise | undefined {
  return mockExercises.find((ex) => ex.exerciseId === exerciseId);
}

/**
 * Get mock exercise by name
 */
export function getMockExerciseByName(name: string): Exercise | undefined {
  return mockExercises.find(
    (ex) => ex.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get mock workout by ID
 */
export function getMockWorkout(workoutId: string): Workout | undefined {
  return [...mockRecentWorkouts, mockActiveWorkout, mockIntervalWorkout].find(
    (w) => w.id === workoutId
  );
}

/**
 * Get all mock workouts (recent, active, interval)
 */
export function getAllMockWorkouts(): Workout[] {
  return [...mockRecentWorkouts, mockActiveWorkout, mockIntervalWorkout];
}

/**
 * Get mock routine by ID
 */
export function getMockRoutine(routineId: string): WorkoutRoutine | undefined {
  return mockFavoriteRoutines.find((r) => r.id === routineId);
}

/**
 * Get mock program by ID
 */
export function getMockProgram(programId: string): WorkoutProgram | undefined {
  return mockPrograms.find((p) => p.id === programId);
}

/**
 * Create a mock workout from a routine
 */
export function createMockWorkoutFromRoutine(
  routine: WorkoutRoutine,
  workoutId?: string
): Workout {
  const exercises = routine.exercises.map((routineEx, index) => ({
    id: `ex-${routineEx.exerciseId}-${index}`,
    exerciseId: routineEx.exerciseId,
    exerciseName: routineEx.exerciseName,
    sets: [],
    order: routineEx.order,
  }));

  return {
    id: workoutId || `workout-${Date.now()}`,
    name: routine.name,
    type: "regular",
    exercises,
    startTime: new Date().toISOString(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate statistics for a mock workout
 */
export function calculateMockStatistics(workout: Workout): WorkoutStatistics {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;

  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (set.completed && set.weight && set.reps) {
        totalVolume += set.weight * set.reps;
        totalSets += 1;
        totalReps += set.reps;
      }
    });
  });

  const startTime = workout.startTime
    ? new Date(workout.startTime)
    : new Date();
  const endTime = workout.endTime ? new Date(workout.endTime) : new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return {
    totalVolume,
    totalSets,
    totalReps,
    duration: duration > 0 ? duration : 0,
    exercisesCount: workout.exercises.length,
  };
}

