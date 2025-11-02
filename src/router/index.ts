import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
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

// No navigation guard needed - initialization happens on app startup in main.ts
// The splash screen is still available as a fallback/error recovery route

export default router;
