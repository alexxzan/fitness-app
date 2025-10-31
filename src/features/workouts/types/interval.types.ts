/**
 * Interval workout specific types
 */

export interface IntervalExercise {
  exerciseId: string
  exerciseName: string
  order: number
}

export interface IntervalConfig {
  workDuration: number // seconds
  restDuration: number // seconds
  rounds: number
  exercises: IntervalExercise[]
  autoAdvance?: boolean
}

export interface IntervalProgress {
  currentRound: number
  currentInterval: number
  completedIntervals: number
  currentPhase: 'work' | 'rest'
  phaseStartTime: string
  isPaused: boolean
}

