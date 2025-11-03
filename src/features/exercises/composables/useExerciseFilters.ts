import { ref, computed, type Ref } from "vue";
import type { Exercise } from "../types/exercise.types";

/**
 * Composable for managing exercise filters
 * Handles filter state and filtering logic
 */
export function useExerciseFilters(exercises: Ref<Exercise[]>) {
  // Filter state
  const selectedBodyParts = ref<string[]>([]);
  const selectedEquipments = ref<string[]>([]);
  const selectedTargetMuscles = ref<string[]>([]);

  // Filtered exercises based on active filters
  const filteredExercises = computed(() => {
    let filtered = exercises.value;

    // Apply body parts filter
    if (selectedBodyParts.value.length > 0) {
      filtered = filtered.filter((ex) =>
        selectedBodyParts.value.some((bp) =>
          ex.bodyParts.some((ebp) => ebp.toLowerCase() === bp.toLowerCase())
        )
      );
    }

    // Apply equipment filter
    if (selectedEquipments.value.length > 0) {
      filtered = filtered.filter((ex) =>
        selectedEquipments.value.some((eq) =>
          ex.equipments.some((eeq) => eeq.toLowerCase() === eq.toLowerCase())
        )
      );
    }

    // Apply target muscles filter
    if (selectedTargetMuscles.value.length > 0) {
      filtered = filtered.filter((ex) =>
        selectedTargetMuscles.value.some((tm) =>
          ex.targetMuscles.some((etm) => etm.toLowerCase() === tm.toLowerCase())
        )
      );
    }

    return filtered;
  });

  // Count of active filters
  const activeFilterCount = computed(() => {
    return (
      selectedBodyParts.value.length +
      selectedEquipments.value.length +
      selectedTargetMuscles.value.length
    );
  });

  /**
   * Apply filters
   */
  function applyFilters(filters: {
    bodyParts: string[];
    equipments: string[];
    targetMuscles: string[];
  }) {
    selectedBodyParts.value = filters.bodyParts;
    selectedEquipments.value = filters.equipments;
    selectedTargetMuscles.value = filters.targetMuscles;
  }

  /**
   * Remove a specific filter
   */
  function removeFilter(
    category: "bodyParts" | "equipments" | "targetMuscles",
    name: string
  ) {
    switch (category) {
      case "bodyParts":
        selectedBodyParts.value = selectedBodyParts.value.filter(
          (bp) => bp !== name
        );
        break;
      case "equipments":
        selectedEquipments.value = selectedEquipments.value.filter(
          (eq) => eq !== name
        );
        break;
      case "targetMuscles":
        selectedTargetMuscles.value = selectedTargetMuscles.value.filter(
          (tm) => tm !== name
        );
        break;
    }
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    selectedBodyParts.value = [];
    selectedEquipments.value = [];
    selectedTargetMuscles.value = [];
  }

  /**
   * Reset filters (same as clear, but named for consistency)
   */
  function resetFilters() {
    clearFilters();
  }

  return {
    selectedBodyParts,
    selectedEquipments,
    selectedTargetMuscles,
    filteredExercises,
    activeFilterCount,
    applyFilters,
    removeFilter,
    clearFilters,
    resetFilters,
  };
}
