import { FoodRepository } from "../repositories/food.repository";
import { FoodLogRepository } from "../repositories/food-log.repository";
import { NutritionTargetsRepository } from "../repositories/nutrition-targets.repository";
import { BodyMetricsRepository } from "../repositories/body-metrics.repository";
import type { Food, ServingSize, FoodLog } from "../types/food.types";
import type { NutritionTarget } from "../types/nutrition.types";
import type { BodyMetric, BodyMeasurements } from "../types/body-metrics.types";
import { generateId } from "@/shared/utils/id";

/**
 * Service for seeding dummy food data for testing
 */
export class DummyDataService {
  /**
   * Seed all nutrition data (foods, logs, targets, metrics)
   */
  static async seedAll(): Promise<void> {
    await this.seedFoods();
    await this.seedFoodLogs();
    await this.seedNutritionTargets();
    await this.seedBodyMetrics();
    console.log("✅ Seeded all nutrition dummy data");
  }

  /**
   * Seed the database with sample foods
   */
  static async seedFoods(): Promise<void> {
    const foods = this.getSampleFoods();

    try {
      // Check if foods already exist
      const existingFoods = await FoodRepository.getAll();
      if (existingFoods.length > 0) {
        console.log("Foods already exist, skipping seed");
        return;
      }

      // Insert all foods
      await FoodRepository.bulkInsert(foods);
      console.log(`✅ Seeded ${foods.length} sample foods`);
    } catch (error) {
      console.error("Failed to seed foods:", error);
      throw error;
    }
  }

  /**
   * Seed food logs for the past week
   */
  static async seedFoodLogs(): Promise<void> {
    try {
      const existingLogs = await FoodLogRepository.getAll();
      if (existingLogs.length > 0) {
        console.log("Food logs already exist, skipping seed");
        return;
      }

      const foods = await FoodRepository.getAll();
      if (foods.length === 0) {
        console.log("No foods available, skipping food logs seed");
        return;
      }

      const logs = this.getSampleFoodLogs(foods);
      for (const log of logs) {
        await FoodLogRepository.create(log);
      }
      console.log(`✅ Seeded ${logs.length} food log entries`);
    } catch (error) {
      console.error("Failed to seed food logs:", error);
      throw error;
    }
  }

  /**
   * Seed nutrition targets
   */
  static async seedNutritionTargets(): Promise<void> {
    try {
      const existingTargets = await NutritionTargetsRepository.getAll();
      if (existingTargets.length > 0) {
        console.log("Nutrition targets already exist, skipping seed");
        return;
      }

      const targets = this.getSampleNutritionTargets();
      for (const target of targets) {
        await NutritionTargetsRepository.create(target);
      }
      console.log(`✅ Seeded ${targets.length} nutrition targets`);
    } catch (error) {
      console.error("Failed to seed nutrition targets:", error);
      throw error;
    }
  }

  /**
   * Seed body metrics for the past month
   */
  static async seedBodyMetrics(): Promise<void> {
    try {
      const existingMetrics = await BodyMetricsRepository.getAll();
      if (existingMetrics.length > 0) {
        console.log("Body metrics already exist, skipping seed");
        return;
      }

      const metrics = this.getSampleBodyMetrics();
      for (const metric of metrics) {
        await BodyMetricsRepository.create(metric);
      }
      console.log(`✅ Seeded ${metrics.length} body metric entries`);
    } catch (error) {
      console.error("Failed to seed body metrics:", error);
      throw error;
    }
  }

  /**
   * Clear all foods (use with caution)
   */
  static async clearFoods(): Promise<void> {
    const foods = await FoodRepository.getAll();
    for (const food of foods) {
      await FoodRepository.delete(food.id);
    }
    console.log("✅ Cleared all foods");
  }

  /**
   * Clear all food logs
   */
  static async clearFoodLogs(): Promise<void> {
    const logs = await FoodLogRepository.getAll();
    for (const log of logs) {
      await FoodLogRepository.delete(log.id);
    }
    console.log("✅ Cleared all food logs");
  }

  /**
   * Clear all nutrition data
   */
  static async clearAll(): Promise<void> {
    await this.clearFoodLogs();
    await this.clearFoods();
    const targets = await NutritionTargetsRepository.getAll();
    for (const target of targets) {
      await NutritionTargetsRepository.delete(target.id);
    }
    const metrics = await BodyMetricsRepository.getAll();
    for (const metric of metrics) {
      await BodyMetricsRepository.delete(metric.id);
    }
    console.log("✅ Cleared all nutrition data");
  }

  /**
   * Get sample foods data
   */
  private static getSampleFoods(): Food[] {
    return [
      // Fast Food
      this.createFood({
        name: "Big Mac",
        brand: "McDonald's",
        barcode: "0000000000001",
        servingSize: { amount: 1, unit: "sandwich" },
        calories: 563,
        protein: 25,
        carbs: 45,
        fats: 33,
        verified: 1,
      }),
      this.createFood({
        name: "Quarter Pounder with Cheese",
        brand: "McDonald's",
        barcode: "0000000000002",
        servingSize: { amount: 1, unit: "sandwich" },
        calories: 520,
        protein: 26,
        carbs: 42,
        fats: 26,
        verified: 1,
      }),
      this.createFood({
        name: "McChicken",
        brand: "McDonald's",
        barcode: "0000000000003",
        servingSize: { amount: 1, unit: "sandwich" },
        calories: 400,
        protein: 14,
        carbs: 39,
        fats: 21,
        verified: 1,
      }),
      this.createFood({
        name: "Whopper",
        brand: "Burger King",
        barcode: "0000000000004",
        servingSize: { amount: 1, unit: "sandwich" },
        calories: 660,
        protein: 28,
        carbs: 49,
        fats: 40,
        verified: 1,
      }),
      this.createFood({
        name: "Chicken McNuggets (10 piece)",
        brand: "McDonald's",
        barcode: "0000000000005",
        servingSize: { amount: 10, unit: "pieces" },
        calories: 420,
        protein: 24,
        carbs: 26,
        fats: 24,
        verified: 1,
      }),

      // Common Proteins
      this.createFood({
        name: "Chicken Breast",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        verified: 1,
      }),
      this.createFood({
        name: "Salmon Fillet",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 208,
        protein: 20,
        carbs: 0,
        fats: 13,
        verified: 1,
      }),
      this.createFood({
        name: "Ground Beef (80/20)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 254,
        protein: 17,
        carbs: 0,
        fats: 20,
        verified: 1,
      }),
      this.createFood({
        name: "Eggs",
        brand: "Generic",
        servingSize: { amount: 1, unit: "large egg" },
        calories: 70,
        protein: 6,
        carbs: 0.6,
        fats: 5,
        verified: 1,
      }),
      this.createFood({
        name: "Greek Yogurt (Non-fat)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 59,
        protein: 10,
        carbs: 3.6,
        fats: 0.4,
        verified: 1,
      }),

      // Carbs
      this.createFood({
        name: "White Rice (cooked)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fats: 0.3,
        verified: 1,
      }),
      this.createFood({
        name: "Brown Rice (cooked)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 111,
        protein: 2.6,
        carbs: 23,
        fats: 0.9,
        verified: 1,
      }),
      this.createFood({
        name: "Quinoa (cooked)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 120,
        protein: 4.4,
        carbs: 22,
        fats: 1.9,
        verified: 1,
      }),
      this.createFood({
        name: "Whole Wheat Bread",
        brand: "Generic",
        servingSize: { amount: 1, unit: "slice" },
        calories: 81,
        protein: 4,
        carbs: 14,
        fats: 1,
        verified: 1,
      }),
      this.createFood({
        name: "Sweet Potato (baked)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 90,
        protein: 2,
        carbs: 21,
        fats: 0.2,
        verified: 1,
      }),

      // Vegetables
      this.createFood({
        name: "Broccoli",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 34,
        protein: 2.8,
        carbs: 7,
        fats: 0.4,
        verified: 1,
      }),
      this.createFood({
        name: "Spinach (raw)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fats: 0.4,
        verified: 1,
      }),
      this.createFood({
        name: "Avocado",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 160,
        protein: 2,
        carbs: 9,
        fats: 15,
        verified: 1,
      }),

      // Fruits
      this.createFood({
        name: "Banana",
        brand: "Generic",
        servingSize: { amount: 1, unit: "medium" },
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fats: 0.4,
        verified: 1,
      }),
      this.createFood({
        name: "Apple",
        brand: "Generic",
        servingSize: { amount: 1, unit: "medium" },
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fats: 0.3,
        verified: 1,
      }),
      this.createFood({
        name: "Blueberries",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 57,
        protein: 0.7,
        carbs: 14,
        fats: 0.3,
        verified: 1,
      }),

      // Nuts & Seeds
      this.createFood({
        name: "Almonds",
        brand: "Generic",
        servingSize: { amount: 28, unit: "g" },
        calories: 164,
        protein: 6,
        carbs: 6,
        fats: 14,
        verified: 1,
      }),
      this.createFood({
        name: "Peanut Butter",
        brand: "Generic",
        servingSize: { amount: 16, unit: "g" },
        calories: 94,
        protein: 4,
        carbs: 3,
        fats: 8,
        verified: 1,
      }),

      // Dairy
      this.createFood({
        name: "Whole Milk",
        brand: "Generic",
        servingSize: { amount: 240, unit: "ml" },
        calories: 150,
        protein: 8,
        carbs: 12,
        fats: 8,
        verified: 1,
      }),
      this.createFood({
        name: "Cheddar Cheese",
        brand: "Generic",
        servingSize: { amount: 28, unit: "g" },
        calories: 113,
        protein: 7,
        carbs: 0.4,
        fats: 9,
        verified: 1,
      }),

      // Protein Powders & Supplements
      this.createFood({
        name: "Whey Protein Powder",
        brand: "Generic",
        servingSize: { amount: 30, unit: "g" },
        calories: 120,
        protein: 24,
        carbs: 3,
        fats: 1,
        verified: 1,
      }),
      this.createFood({
        name: "Casein Protein Powder",
        brand: "Generic",
        servingSize: { amount: 30, unit: "g" },
        calories: 110,
        protein: 25,
        carbs: 2,
        fats: 0.5,
        verified: 1,
      }),

      // Common Snacks
      this.createFood({
        name: "Protein Bar",
        brand: "Generic",
        servingSize: { amount: 1, unit: "bar" },
        calories: 200,
        protein: 20,
        carbs: 20,
        fats: 6,
        verified: 1,
      }),
      this.createFood({
        name: "Oatmeal (cooked)",
        brand: "Generic",
        servingSize: { amount: 100, unit: "g" },
        calories: 68,
        protein: 2.4,
        carbs: 12,
        fats: 1.4,
        verified: 1,
      }),
    ];
  }

  /**
   * Create a Food object with defaults
   */
  private static createFood(data: {
    name: string;
    brand?: string;
    barcode?: string;
    servingSize: ServingSize;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    micronutrients?: { [key: string]: number };
    verified?: 0 | 1;
    userSubmitted?: 0 | 1;
  }): Food {
    const now = new Date().toISOString();

    return {
      id: generateId(),
      name: data.name,
      brand: data.brand,
      barcode: data.barcode,
      servingSize: JSON.stringify(data.servingSize),
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
      micronutrients: data.micronutrients
        ? JSON.stringify(data.micronutrients)
        : undefined,
      verified: data.verified ?? 1,
      userSubmitted: data.userSubmitted ?? 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get sample food logs for the past week
   */
  private static getSampleFoodLogs(
    foods: Food[]
  ): Omit<FoodLog, "id" | "userId" | "createdAt">[] {
    const logs: Omit<FoodLog, "id" | "userId" | "createdAt">[] = [];

    // Helper to find food by name
    const findFood = (name: string): Food | undefined => {
      return foods.find((f) =>
        f.name.toLowerCase().includes(name.toLowerCase())
      );
    };

    // Generate logs for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Breakfast
      const eggs = findFood("Eggs");
      const oatmeal = findFood("Oatmeal");
      const banana = findFood("Banana");

      if (eggs)
        logs.push({
          date: dateStr,
          foodId: eggs.id,
          quantity: 2,
          mealType: "breakfast",
        });
      if (oatmeal)
        logs.push({
          date: dateStr,
          foodId: oatmeal.id,
          quantity: 1,
          mealType: "breakfast",
        });
      if (banana)
        logs.push({
          date: dateStr,
          foodId: banana.id,
          quantity: 1,
          mealType: "breakfast",
        });

      // Lunch
      const chickenBreast = findFood("Chicken Breast");
      const brownRice = findFood("Brown Rice");
      const broccoli = findFood("Broccoli");

      if (chickenBreast)
        logs.push({
          date: dateStr,
          foodId: chickenBreast.id,
          quantity: 1.5,
          mealType: "lunch",
        });
      if (brownRice)
        logs.push({
          date: dateStr,
          foodId: brownRice.id,
          quantity: 1,
          mealType: "lunch",
        });
      if (broccoli)
        logs.push({
          date: dateStr,
          foodId: broccoli.id,
          quantity: 1,
          mealType: "lunch",
        });

      // Dinner
      const salmon = findFood("Salmon");
      const sweetPotato = findFood("Sweet Potato");
      const spinach = findFood("Spinach");

      if (salmon)
        logs.push({
          date: dateStr,
          foodId: salmon.id,
          quantity: 1.2,
          mealType: "dinner",
        });
      if (sweetPotato)
        logs.push({
          date: dateStr,
          foodId: sweetPotato.id,
          quantity: 1,
          mealType: "dinner",
        });
      if (spinach)
        logs.push({
          date: dateStr,
          foodId: spinach.id,
          quantity: 1,
          mealType: "dinner",
        });

      // Snacks (only some days)
      if (i % 2 === 0) {
        const proteinBar = findFood("Protein Bar");
        const almonds = findFood("Almonds");
        const apple = findFood("Apple");

        if (proteinBar)
          logs.push({
            date: dateStr,
            foodId: proteinBar.id,
            quantity: 1,
            mealType: "snack",
          });
        if (almonds)
          logs.push({
            date: dateStr,
            foodId: almonds.id,
            quantity: 0.5,
            mealType: "snack",
          });
        if (apple && i === 0)
          logs.push({
            date: dateStr,
            foodId: apple.id,
            quantity: 1,
            mealType: "snack",
          });
      }

      // Add some fast food on weekends (for variety)
      if (date.getDay() === 0 || date.getDay() === 6) {
        const bigMac = findFood("Big Mac");
        const nuggets = findFood("Chicken McNuggets");

        if (bigMac && i === 0)
          logs.push({
            date: dateStr,
            foodId: bigMac.id,
            quantity: 1,
            mealType: "lunch",
          });
        if (nuggets && i === 1)
          logs.push({
            date: dateStr,
            foodId: nuggets.id,
            quantity: 0.5,
            mealType: "snack",
          });
      }
    }

    return logs;
  }

  /**
   * Get sample nutrition targets
   */
  private static getSampleNutritionTargets(): Omit<
    NutritionTarget,
    "id" | "userId" | "createdAt" | "updatedAt"
  >[] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    return [
      // Historical target (cutting phase)
      {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 65,
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: fifteenDaysAgo.toISOString().split("T")[0],
        goalType: "cutting",
      },
      // Current active target (maintenance)
      {
        calories: 2400,
        protein: 180,
        carbs: 240,
        fats: 80,
        startDate: fifteenDaysAgo.toISOString().split("T")[0],
        goalType: "maintenance",
      },
    ];
  }

  /**
   * Get sample body metrics for the past month
   */
  private static getSampleBodyMetrics(): Omit<
    BodyMetric,
    "id" | "userId" | "createdAt" | "updatedAt"
  >[] {
    const metrics: Omit<
      BodyMetric,
      "id" | "userId" | "createdAt" | "updatedAt"
    >[] = [];

    // Start weight (30 days ago)
    let currentWeight = 85.0; // kg
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Generate weight entries every 2-3 days
    for (let i = 0; i < 30; i += Math.floor(Math.random() * 2) + 2) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      // Simulate gradual weight loss (0.1-0.3 kg per measurement)
      const weightChange = Math.random() * 0.2 - 0.1; // -0.1 to +0.1 kg variation
      currentWeight = Math.max(82.0, currentWeight + weightChange - 0.15); // Slight downward trend

      const measurements: BodyMeasurements = {
        chest: 100 + Math.random() * 2,
        waist: 85 - (30 - i) * 0.1 + Math.random() * 1,
        hips: 95 + Math.random() * 1,
        bicep: 35 + Math.random() * 1,
        thigh: 60 + Math.random() * 1,
      };

      metrics.push({
        date: dateStr,
        weight: Math.round(currentWeight * 10) / 10,
        bodyFat:
          Math.round((18 - (30 - i) * 0.05 + Math.random() * 0.5) * 10) / 10,
        measurements: JSON.stringify(measurements),
        notes:
          i === 0
            ? "Starting new program"
            : i === 29
            ? "End of month check-in"
            : undefined,
      });
    }

    return metrics;
  }
}
