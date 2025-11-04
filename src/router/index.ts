import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/splash",
    component: () => import("@/views/SplashScreen.vue"),
  },
  {
    path: "/active-workout",
    component: () => import("@/views/ActiveWorkoutPage.vue"),
  },
  {
    path: "/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/home",
      },
      {
        path: "home",
        component: () => import("@/views/HomePage.vue"),
      },
      {
        path: "exercises",
        component: () => import("@/views/ExerciseLibraryPage.vue"),
      },
      {
        path: "workout",
        component: () => import("@/views/WorkoutPage.vue"),
      },
      {
        path: "progress",
        component: () => import("@/views/ProgressPage.vue"),
      },
      {
        path: "macros",
        component: () => import("@/views/MacrosPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard to check initialization and active workouts
router.beforeEach(async (to, from, next) => {
  // Don't redirect if already going to active workout page or splash
  if (to.path === "/active-workout" || to.path === "/splash") {
    next();
    return;
  }

  // Check if exercises are initialized (required for app to function)
  try {
    const isInitialized = await ExerciseInitialization.isInitialized();

    // If not initialized, redirect to splash screen
    if (!isInitialized) {
      console.log(
        "🔄 Exercises not initialized, redirecting to splash screen..."
      );
      next("/splash");
      return;
    }
  } catch (error) {
    console.error("Error checking initialization status:", error);
    // On error, redirect to splash screen to allow retry
    next("/splash");
    return;
  }

  // Check for active workout
  try {
    const { WorkoutRepository } = await import(
      "@/features/workouts/repositories/workout.repository"
    );
    const activeWorkout = await WorkoutRepository.getActiveWorkout();

    // If there's an active workout, always redirect to full-screen workout page
    // This ensures users see their active workout instead of the empty state
    if (activeWorkout && to.path !== "/active-workout") {
      next("/active-workout");
      return;
    }
  } catch (error) {
    console.error("Error checking for active workout:", error);
    // Continue with normal navigation on error
  }

  next();
});

export default router;
