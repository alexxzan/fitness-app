import { getDatabase } from "@/shared/storage/database-adapter";
import type { QuestionnaireResponse } from "../types/questionnaire.types";
import { generateId } from "@/shared/utils/id";

/**
 * Repository for questionnaire responses data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class QuestionnaireRepository {
  private static readonly DEFAULT_USER_ID = "default-user"; // For single-user app

  /**
   * Get all questionnaire responses
   */
  static async getAll(): Promise<QuestionnaireResponse[]> {
    const db = getDatabase();
    return await db.questionnaireResponses.getAll();
  }

  /**
   * Get a questionnaire response by ID
   */
  static async getById(id: string): Promise<QuestionnaireResponse | null> {
    const db = getDatabase();
    return await db.questionnaireResponses.getById(id);
  }

  /**
   * Save a questionnaire response (create or update)
   */
  static async save(response: QuestionnaireResponse): Promise<string> {
    const db = getDatabase();
    return await db.questionnaireResponses.save(response);
  }

  /**
   * Create a new questionnaire response
   */
  static async create(
    responseData: Omit<
      QuestionnaireResponse,
      "id" | "userId" | "completedAt" | "createdAt" | "updatedAt"
    >
  ): Promise<QuestionnaireResponse> {
    const now = new Date().toISOString();
    // Deep clone arrays to avoid DataCloneError in Dexie
    const response: QuestionnaireResponse = {
      ...responseData,
      dietaryRestrictions: JSON.parse(JSON.stringify(responseData.dietaryRestrictions || [])),
      allergies: JSON.parse(JSON.stringify(responseData.allergies || [])),
      intolerances: JSON.parse(JSON.stringify(responseData.intolerances || [])),
      fastingPreferences: JSON.parse(JSON.stringify(responseData.fastingPreferences || [])),
      medicalConditions: responseData.medicalConditions ? JSON.parse(JSON.stringify(responseData.medicalConditions)) : undefined,
      medications: responseData.medications ? JSON.parse(JSON.stringify(responseData.medications)) : undefined,
      foodDislikes: responseData.foodDislikes ? JSON.parse(JSON.stringify(responseData.foodDislikes)) : undefined,
      foodFavorites: responseData.foodFavorites ? JSON.parse(JSON.stringify(responseData.foodFavorites)) : undefined,
      id: generateId(),
      userId: QuestionnaireRepository.DEFAULT_USER_ID,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await this.save(response);
    return response;
  }

  /**
   * Update an existing questionnaire response
   */
  static async update(
    id: string,
    updates: Partial<
      Omit<QuestionnaireResponse, "id" | "userId" | "createdAt">
    >
  ): Promise<QuestionnaireResponse> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Questionnaire response with id ${id} not found`);
    }
    const updated: QuestionnaireResponse = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save(updated);
    return updated;
  }

  /**
   * Delete a questionnaire response
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.questionnaireResponses.delete(id);
  }

  /**
   * Get all questionnaire responses for a user
   */
  static async getByUserId(
    userId: string = QuestionnaireRepository.DEFAULT_USER_ID
  ): Promise<QuestionnaireResponse[]> {
    const db = getDatabase();
    return await db.questionnaireResponses.getByUserId(userId);
  }

  /**
   * Get the latest questionnaire response for a user
   */
  static async getLatestProfile(
    userId: string = QuestionnaireRepository.DEFAULT_USER_ID
  ): Promise<QuestionnaireResponse | null> {
    const db = getDatabase();
    return await db.questionnaireResponses.getLatestByUserId(userId);
  }

  /**
   * Check if user has completed a nutrition profile
   */
  static async hasCompletedProfile(
    userId: string = QuestionnaireRepository.DEFAULT_USER_ID
  ): Promise<boolean> {
    const latest = await this.getLatestProfile(userId);
    return latest !== null;
  }
}

