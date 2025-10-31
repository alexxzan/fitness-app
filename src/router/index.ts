import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'exercises',
        component: () => import('@/views/ExerciseLibraryPage.vue')
      },
      {
        path: 'workout',
        component: () => import('@/views/WorkoutPage.vue')
      },
      {
        path: 'progress',
        component: () => import('@/views/ProgressPage.vue')
      },
      {
        path: 'macros',
        component: () => import('@/views/MacrosPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
