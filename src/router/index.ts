import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { AppState } from "@/shared/storage/app.state";
import TabsPage from "../views/TabsPage.vue";

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

// Navigation guard to check initialization status
// Works on both web (Dexie) and native (SQLite)
router.beforeEach(async (to, from, next) => {
  try {
    // Check if app is initialized
    const isInitialized = await AppState.isInitialized();

    // If trying to access splash screen
    if (to.path === "/splash") {
      // If already initialized, redirect to home
      if (isInitialized) {
        next("/home");
      } else {
        // Allow navigation to splash if not initialized
        next();
      }
      return;
    }

    // For all other routes, check initialization
    if (!isInitialized) {
      // Redirect to splash screen if not initialized
      next("/splash");
    } else {
      // Allow navigation if initialized
      next();
    }
  } catch (error) {
    console.error("Error in navigation guard:", error);
    // On error, allow navigation to prevent blocking the app
    next();
  }
});

export default router;
