/**
 * Body metrics-related TypeScript types and interfaces
 */

export interface BodyMeasurements {
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  bicep?: number; // cm
  thigh?: number; // cm
  neck?: number; // cm
  forearm?: number; // cm
  calf?: number; // cm
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string; // ISO date string
  weight?: number; // kg
  bodyFat?: number; // percentage
  measurements?: string; // JSON string of BodyMeasurements
  photoPaths?: string; // JSON string array of file paths
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface WeightTrend {
  date: string;
  weight: number;
  change?: number; // Change from previous measurement
}

export interface MeasurementTrend {
  date: string;
  measurements: BodyMeasurements;
}

