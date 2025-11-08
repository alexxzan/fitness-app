import { getDatabase } from "@/shared/storage/database-adapter";
import type { BodyMetric } from "../types/body-metrics.types";
import { generateId } from "@/shared/utils/id";

/**
 * Repository for body metrics data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class BodyMetricsRepository {
  private static readonly DEFAULT_USER_ID = "default-user"; // For single-user app

  /**
   * Get all body metrics
   */
  static async getAll(): Promise<BodyMetric[]> {
    const db = getDatabase();
    return await db.bodyMetrics.getAll();
  }

  /**
   * Get a body metric by ID
   */
  static async getById(id: string): Promise<BodyMetric | null> {
    const db = getDatabase();
    return await db.bodyMetrics.getById(id);
  }

  /**
   * Save a body metric (create or update)
   */
  static async save(metric: BodyMetric): Promise<string> {
    const db = getDatabase();
    return await db.bodyMetrics.save(metric);
  }

  /**
   * Create a new body metric entry
   */
  static async create(
    metricData: Omit<BodyMetric, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<BodyMetric> {
    const now = new Date().toISOString();
    const metric: BodyMetric = {
      ...metricData,
      id: generateId(),
      userId: BodyMetricsRepository.DEFAULT_USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await this.save(metric);
    return metric;
  }

  /**
   * Update an existing body metric
   */
  static async update(
    id: string,
    updates: Partial<Omit<BodyMetric, "id" | "userId" | "createdAt">>
  ): Promise<BodyMetric> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Body metric with id ${id} not found`);
    }
    const updated: BodyMetric = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save(updated);
    return updated;
  }

  /**
   * Delete a body metric
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.bodyMetrics.delete(id);
  }

  /**
   * Get all body metrics for a user
   */
  static async getByUserId(userId: string = BodyMetricsRepository.DEFAULT_USER_ID): Promise<BodyMetric[]> {
    const db = getDatabase();
    return await db.bodyMetrics.getByUserId(userId);
  }

  /**
   * Get body metrics for a date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    userId: string = BodyMetricsRepository.DEFAULT_USER_ID
  ): Promise<BodyMetric[]> {
    const db = getDatabase();
    return await db.bodyMetrics.getByDateRange(userId, startDate, endDate);
  }

  /**
   * Get the most recent weight entry
   */
  static async getLatestWeight(userId: string = BodyMetricsRepository.DEFAULT_USER_ID): Promise<number | null> {
    const metrics = await this.getByUserId(userId);
    const weightMetrics = metrics.filter((m) => m.weight !== undefined && m.weight !== null);
    if (weightMetrics.length === 0) {
      return null;
    }
    // Sort by date descending and get the most recent
    weightMetrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return weightMetrics[0].weight || null;
  }

  /**
   * Get weight trend data
   */
  static async getWeightTrend(
    days: number = 30,
    userId: string = BodyMetricsRepository.DEFAULT_USER_ID
  ): Promise<Array<{ date: string; weight: number }>> {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const metrics = await this.getByDateRange(startDate, endDate, userId);
    return metrics
      .filter((m) => m.weight !== undefined && m.weight !== null)
      .map((m) => ({
        date: m.date,
        weight: m.weight!,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

