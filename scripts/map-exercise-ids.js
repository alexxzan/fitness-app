/**
 * Script to map exercise names in workout-templates.json to exercise IDs from exercises.json
 * This ensures templates properly reference exercises from the database
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const exercisesPath = path.join(
  __dirname,
  "../src/features/exercises/data/exercises.json"
);
const templatesPath = path.join(
  __dirname,
  "../src/features/workouts/data/workout-templates.json"
);
const mappingPath = path.join(__dirname, "exercise-name-mapping.json");

const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf8"));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, "utf8"));
const nameMapping = JSON.parse(fs.readFileSync(mappingPath, "utf8")).mappings;

// Create a map of normalized exercise names to exercise IDs
const exerciseMap = new Map();
exercises.forEach((exercise) => {
  const normalizedName = exercise.name.toLowerCase().trim();
  exerciseMap.set(normalizedName, {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
  });
});

console.log(`Loaded ${exercises.length} exercises from database`);
console.log(
  `Processing ${templatesData.templates.length} workout templates...\n`
);

// Track missing exercises
const missingExercises = new Set();
let updatedCount = 0;

// Update templates with exercise IDs
templatesData.templates.forEach((template) => {
  template.exercises.forEach((exercise) => {
    let normalizedName = exercise.exerciseName.toLowerCase().trim();

    // Check if there's a manual mapping for this exercise name
    if (nameMapping[exercise.exerciseName]) {
      normalizedName = nameMapping[exercise.exerciseName].toLowerCase().trim();
    }

    const match = exerciseMap.get(normalizedName);

    if (match) {
      // Add exerciseId to the exercise
      exercise.exerciseId = match.exerciseId;
      // Ensure exerciseName matches the exact name from database
      exercise.exerciseName = match.name;
      updatedCount++;
    } else {
      // Track missing exercises
      missingExercises.add(exercise.exerciseName);
      console.warn(
        `⚠️  No match found for: "${exercise.exerciseName}" in template "${template.name}"`
      );
    }
  });
});

// Report results
console.log(`\n✅ Successfully mapped ${updatedCount} exercises`);

if (missingExercises.size > 0) {
  console.log(`\n❌ Missing ${missingExercises.size} exercises:`);
  missingExercises.forEach((name) => console.log(`   - ${name}`));
  console.log("\nThese exercises need to be:");
  console.log("1. Added to exercises.json, OR");
  console.log(
    "2. Names corrected in workout-templates.json to match existing exercises\n"
  );
}

// Write updated templates back to file
fs.writeFileSync(templatesPath, JSON.stringify(templatesData, null, 2), "utf8");
console.log(`\n✅ Updated workout-templates.json with exercise IDs`);

// Create a mapping reference file for review
const mappingReport = {
  totalExercises: updatedCount,
  missingExercises: Array.from(missingExercises),
  mappings: {},
};

templatesData.templates.forEach((template) => {
  template.exercises.forEach((exercise) => {
    if (exercise.exerciseId) {
      mappingReport.mappings[exercise.exerciseName] = exercise.exerciseId;
    }
  });
});

const reportPath = path.join(__dirname, "../EXERCISE_MAPPING_REPORT.json");
fs.writeFileSync(reportPath, JSON.stringify(mappingReport, null, 2), "utf8");
console.log(`📊 Mapping report saved to EXERCISE_MAPPING_REPORT.json\n`);
