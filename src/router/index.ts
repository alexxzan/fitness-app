import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/workout'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/workout'
      },
      {
        path: 'workout',
        component: () => import('@/views/WorkoutPage.vue')
      },
      {
        path: 'history',
        component: () => import('@/views/WorkoutHistoryPage.vue')
      },
      {
        path: 'exercises',
        component: () => import('@/views/ExerciseLibraryPage.vue')
      },
      {
        path: 'routines',
        component: () => import('@/views/RoutinePage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
