import { ref, computed } from "vue";
import { ExerciseRepository } from "../repositories/exercise.repository";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";

/**
 * Composable for managing exercise library
 */
export function useExerciseLibrary() {
  const exercises = ref<Exercise[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref("");
  const selectedBodyParts = ref<string[]>([]);
  const selectedEquipments = ref<string[]>([]);
  const selectedTargetMuscles = ref<string[]>([]);

  /**
   * Helper to safely sort exercises by name
   */
  function sortExercisesByName(exercisesList: Exercise[]): Exercise[] {
    return exercisesList.sort((a, b) => {
      const nameA = (a?.name || "").toLowerCase();
      const nameB = (b?.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Helper to filter out invalid exercises
   */
  function filterValidExercises(exercisesList: Exercise[]): Exercise[] {
    return exercisesList.filter(
      (ex) =>
        ex &&
        ex.name &&
        ex.exerciseId &&
        ex.name.trim().length > 0 &&
        ex.exerciseId.trim().length > 0
    );
  }

  /**
   * Load all exercises from storage
   */
  async function loadExercises() {
    isLoading.value = true;
    error.value = null;
    try {
      exercises.value = await ExerciseRepository.getAll();
      exercises.value = filterValidExercises(exercises.value);
      exercises.value = sortExercisesByName(exercises.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load exercises";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Search exercises with filters
   */
  async function searchExercises(filters: ExerciseFilters) {
    isLoading.value = true;
    error.value = null;
    try {
      exercises.value = await ExerciseRepository.search(filters);
      exercises.value = filterValidExercises(exercises.value);
      exercises.value = sortExercisesByName(exercises.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to search exercises";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get exercises by body part
   */
  async function loadExercisesByBodyPart(bodyPart: string) {
    isLoading.value = true;
    error.value = null;
    try {
      exercises.value = await ExerciseRepository.getByBodyPart(bodyPart);
      exercises.value = filterValidExercises(exercises.value);
      exercises.value = sortExercisesByName(exercises.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load exercises";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get exercises by equipment
   */
  async function loadExercisesByEquipment(equipment: string) {
    isLoading.value = true;
    error.value = null;
    try {
      exercises.value = await ExerciseRepository.getByEquipment(equipment);
      exercises.value = filterValidExercises(exercises.value);
      exercises.value = sortExercisesByName(exercises.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load exercises";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get exercises by target muscle
   */
  async function loadExercisesByTargetMuscle(targetMuscle: string) {
    isLoading.value = true;
    error.value = null;
    try {
      exercises.value = await ExerciseRepository.getByTargetMuscle(
        targetMuscle
      );
      exercises.value = filterValidExercises(exercises.value);
      exercises.value = sortExercisesByName(exercises.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load exercises";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Apply current filters and search
   */
  async function applyFilters() {
    const filters: ExerciseFilters = {
      searchQuery: searchQuery.value || undefined,
      bodyParts:
        selectedBodyParts.value.length > 0
          ? selectedBodyParts.value
          : undefined,
      equipments:
        selectedEquipments.value.length > 0
          ? selectedEquipments.value
          : undefined,
      targetMuscles:
        selectedTargetMuscles.value.length > 0
          ? selectedTargetMuscles.value
          : undefined,
    };
    await searchExercises(filters);
  }

  /**
   * Filtered exercises based on current search (for client-side filtering if needed)
   */
  const filteredExercises = computed(() => {
    // First filter out invalid exercises
    let filtered = filterValidExercises(exercises.value);

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((ex) => {
        if (!ex || !ex.name) return false;
        return (
          ex.name.toLowerCase().includes(query) ||
          (ex.targetMuscles || []).some((m) =>
            m.toLowerCase().includes(query)
          ) ||
          (ex.bodyParts || []).some((bp) => bp.toLowerCase().includes(query)) ||
          (ex.equipments || []).some((eq) => eq.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  });

  return {
    exercises,
    filteredExercises,
    isLoading,
    error,
    searchQuery,
    selectedBodyParts,
    selectedEquipments,
    selectedTargetMuscles,
    loadExercises,
    searchExercises,
    loadExercisesByBodyPart,
    loadExercisesByEquipment,
    loadExercisesByTargetMuscle,
    applyFilters,
  };
}
