import { ref, computed, watch } from 'vue'
import type { IntervalConfig, IntervalProgress } from '../types/interval.types'

/**
 * Composable for managing interval workout timer
 */
export function useIntervalTimer(config: IntervalConfig, initialProgress?: IntervalProgress) {
  const currentTime = ref(0)
  const currentPhase = ref<'work' | 'rest'>(initialProgress?.currentPhase || 'work')
  const currentRound = ref(initialProgress?.currentRound || 1)
  const currentExerciseIndex = ref(0)
  const completedIntervals = ref(initialProgress?.completedIntervals || 0)
  const isPaused = ref(initialProgress?.isPaused || false)
  const phaseStartTime = ref<number | null>(null)
  
  let intervalId: number | null = null
  let animationFrameId: number | null = null

  // Current exercise based on index
  const currentExercise = computed(() => {
    if (config.exercises.length === 0) return null
    return config.exercises[currentExerciseIndex.value % config.exercises.length]
  })

  // Total intervals in the workout
  const totalIntervals = computed(() => {
    return config.rounds * config.exercises.length
  })

  // Is workout complete
  const isComplete = computed(() => {
    return currentRound.value > config.rounds
  })

  // Progress percentage
  const progressPercentage = computed(() => {
    if (totalIntervals.value === 0) return 0
    return Math.min((completedIntervals.value / totalIntervals.value) * 100, 100)
  })

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formattedTime = computed(() => formatTime(currentTime.value))

  /**
   * Start the timer
   */
  function startTimer() {
    if (isComplete.value) return
    
    isPaused.value = false
    phaseStartTime.value = Date.now()
    
    // Set initial time based on current phase
    if (currentTime.value === 0) {
      currentTime.value = currentPhase.value === 'work' 
        ? config.workDuration 
        : config.restDuration
    }
    
    // Use a combination of setInterval and time-based calculation for accuracy
    const startTime = Date.now()
    const initialTime = currentTime.value
    
    intervalId = window.setInterval(() => {
      if (isPaused.value) return
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const newTime = initialTime - elapsed
      
      if (newTime <= 0) {
        currentTime.value = 0
        advancePhase()
      } else {
        currentTime.value = newTime
      }
    }, 100) // Update every 100ms for smooth display
  }

  /**
   * Pause the timer
   */
  function pauseTimer() {
    isPaused.value = true
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * Resume the timer
   */
  function resumeTimer() {
    if (!isPaused.value) return
    isPaused.value = false
    startTimer()
  }

  /**
   * Advance to the next phase (work -> rest -> work)
   */
  function advancePhase() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    if (currentPhase.value === 'work') {
      // Work phase complete, move to rest
      completedIntervals.value++
      currentPhase.value = 'rest'
      currentTime.value = config.restDuration
      
      // Move to next exercise
      currentExerciseIndex.value++
      
      // Start rest timer if auto-advance is enabled
      if (config.autoAdvance !== false) {
        startTimer()
      }
    } else {
      // Rest phase complete, check if round is complete
      currentPhase.value = 'work'
      currentTime.value = config.workDuration
      
      // Check if we've completed all exercises in this round
      if (currentExerciseIndex.value >= config.exercises.length) {
        currentRound.value++
        currentExerciseIndex.value = 0
      }
      
      // Check if workout is complete
      if (currentRound.value > config.rounds) {
        // Workout complete
        return
      }
      
      // Start work timer if auto-advance is enabled
      if (config.autoAdvance !== false) {
        startTimer()
      }
    }
  }

  /**
   * Skip to the next interval
   */
  function skipInterval() {
    advancePhase()
  }

  /**
   * Reset the timer
   */
  function resetTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    
    currentTime.value = config.workDuration
    currentPhase.value = 'work'
    currentRound.value = 1
    currentExerciseIndex.value = 0
    completedIntervals.value = 0
    isPaused.value = false
    phaseStartTime.value = null
  }

  /**
   * Stop and cleanup the timer
   */
  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  /**
   * Get current progress state
   */
  function getProgress(): IntervalProgress {
    return {
      currentRound: currentRound.value,
      currentInterval: completedIntervals.value,
      completedIntervals: completedIntervals.value,
      currentPhase: currentPhase.value,
      phaseStartTime: phaseStartTime.value ? new Date(phaseStartTime.value).toISOString() : new Date().toISOString(),
      isPaused: isPaused.value
    }
  }

  return {
    // State
    currentTime,
    currentPhase,
    currentRound,
    currentExercise,
    currentExerciseIndex,
    completedIntervals,
    isPaused,
    isComplete,
    totalIntervals,
    progressPercentage,
    formattedTime,
    
    // Methods
    startTimer,
    pauseTimer,
    resumeTimer,
    advancePhase,
    skipInterval,
    resetTimer,
    stopTimer,
    getProgress,
    formatTime
  }
}

