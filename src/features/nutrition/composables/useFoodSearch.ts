import { ref } from "vue";
import { FoodSearchService, type FoodSearchFilters } from "../services/food-search.service";
import { FoodRepository } from "../repositories/food.repository";
import type { Food } from "../types/food.types";

/**
 * Composable for food search functionality
 */
export function useFoodSearch() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchResults = ref<Food[]>([]);
  const searchQuery = ref("");

  /**
   * Search foods with filters
   */
  async function search(filters: FoodSearchFilters = {}): Promise<Food[]> {
    isLoading.value = true;
    error.value = null;
    searchQuery.value = filters.query || "";
    try {
      const results = await FoodSearchService.search(filters);
      searchResults.value = results;
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to search foods";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Search by barcode
   */
  async function searchByBarcode(barcode: string): Promise<Food | null> {
    isLoading.value = true;
    error.value = null;
    try {
      const food = await FoodSearchService.findByBarcode(barcode);
      if (food) {
        searchResults.value = [food];
      }
      return food;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to search by barcode";
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get recent foods
   */
  async function getRecent(limit: number = 10): Promise<Food[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const results = await FoodSearchService.getRecent(limit);
      searchResults.value = results;
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to get recent foods";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get frequent foods
   */
  async function getFrequent(limit: number = 10): Promise<Food[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const results = await FoodSearchService.getFrequent(limit);
      searchResults.value = results;
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to get frequent foods";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear search results
   */
  function clearSearch(): void {
    searchResults.value = [];
    searchQuery.value = "";
  }

  return {
    isLoading,
    error,
    searchResults,
    searchQuery,
    search,
    searchByBarcode,
    getRecent,
    getFrequent,
    clearSearch,
  };
}

