/**
 * Verification script to ensure all exercises in workout templates
 * have valid exercise IDs that exist in exercises.json
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

const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf8"));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, "utf8"));

// Create a Set of valid exercise IDs for fast lookup
const validExerciseIds = new Set(exercises.map((ex) => ex.exerciseId));

console.log(`✅ Loaded ${exercises.length} exercises from database`);
console.log(`✅ Loaded ${templatesData.templates.length} workout templates\n`);

let totalExercises = 0;
let validExercises = 0;
let missingIds = 0;
let invalidIds = 0;

const errors = [];

// Verify each template
templatesData.templates.forEach((template) => {
  template.exercises.forEach((exercise) => {
    totalExercises++;

    // Check if exerciseId exists
    if (!exercise.exerciseId) {
      missingIds++;
      errors.push({
        template: template.name,
        exercise: exercise.exerciseName,
        issue: "Missing exerciseId field",
      });
      return;
    }

    // Check if exerciseId is valid
    if (!validExerciseIds.has(exercise.exerciseId)) {
      invalidIds++;
      errors.push({
        template: template.name,
        exercise: exercise.exerciseName,
        exerciseId: exercise.exerciseId,
        issue: "Invalid exerciseId - not found in exercises.json",
      });
      return;
    }

    validExercises++;
  });
});

// Print results
console.log("=".repeat(60));
console.log("VERIFICATION RESULTS");
console.log("=".repeat(60));
console.log(`Total exercises in templates: ${totalExercises}`);
console.log(`Valid exercises: ${validExercises} ✅`);
console.log(`Missing IDs: ${missingIds} ${missingIds > 0 ? "❌" : "✅"}`);
console.log(`Invalid IDs: ${invalidIds} ${invalidIds > 0 ? "❌" : "✅"}`);
console.log("=".repeat(60));

if (errors.length > 0) {
  console.log("\n❌ ERRORS FOUND:\n");
  errors.forEach((error, index) => {
    console.log(`${index + 1}. Template: "${error.template}"`);
    console.log(`   Exercise: "${error.exercise}"`);
    if (error.exerciseId) {
      console.log(`   Exercise ID: "${error.exerciseId}"`);
    }
    console.log(`   Issue: ${error.issue}\n`);
  });
  process.exit(1);
} else {
  console.log("\n🎉 SUCCESS! All exercises have valid IDs!\n");

  // Print some statistics
  const templatesWithExercises = templatesData.templates.map((t) => ({
    name: t.name,
    exerciseCount: t.exercises.length,
    difficulty: t.difficulty,
  }));

  console.log("Template Statistics:");
  console.log("-".repeat(60));
  templatesWithExercises.forEach((t) => {
    console.log(`${t.name} (${t.difficulty}): ${t.exerciseCount} exercises`);
  });

  process.exit(0);
}
