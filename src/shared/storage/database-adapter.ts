/**
 * Database Adapter Factory
 * Automatically selects the appropriate database implementation:
 * - Dexie (IndexedDB) for web development (fast!)
 * - SQLite for native platforms (iOS/Android)
 */

import { Capacitor } from "@capacitor/core";
import type { IDatabaseAdapter } from "./adapters/types";
import { DexieAdapter } from "./adapters/dexie.adapter";
import { SQLiteAdapter } from "./adapters/sqlite.adapter";

class DatabaseAdapterFactory {
  private adapter: IDatabaseAdapter | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Get the appropriate database adapter for the current platform
   */
  private getAdapter(): IDatabaseAdapter {
    if (this.adapter) {
      return this.adapter;
    }

    if (Capacitor.isNativePlatform()) {
      console.log("📱 Using SQLite adapter for native platform");
      this.adapter = new SQLiteAdapter();
    } else {
      console.log("🌐 Using Dexie adapter for web platform");
      this.adapter = new DexieAdapter();
    }

    return this.adapter;
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    // If already initialized, return
    if (this.adapter && this.initPromise === null) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = (async () => {
      const adapter = this.getAdapter();
      await adapter.initialize();
      this.initPromise = null; // Clear after completion
    })();

    await this.initPromise;
  }

  /**
   * Get the database adapter instance
   * Must call initialize() first
   */
  getDatabase(): IDatabaseAdapter {
    if (!this.adapter) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.adapter;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.adapter) {
      await this.adapter.close();
    }
  }

  /**
   * Delete the database completely
   */
  async deleteDatabase(): Promise<void> {
    if (this.adapter) {
      await this.adapter.deleteDatabase();
    }
  }
}

// Export singleton instance
export const dbAdapter = new DatabaseAdapterFactory();

// Export convenience function to get the database
export const getDatabase = () => dbAdapter.getDatabase();
