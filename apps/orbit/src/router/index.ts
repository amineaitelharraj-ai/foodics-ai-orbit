import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/assistant',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../layouts/OrbitLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'assistant',
        name: 'Assistant',
        component: () => import('../pages/Assistant.vue'),
      },
      {
        path: 'insights',
        name: 'Insights',
        component: () => import('../pages/Insights.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/Settings.vue'),
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('../pages/Help.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/assistant',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  try {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false);

    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.name === 'Login' && authStore.isAuthenticated) {
      next({ name: 'Assistant' });
    } else {
      next();
    }
  } catch (error) {
    console.error('Router guard error:', error);
    if (to.name !== 'Login') {
      next({ name: 'Login' });
    } else {
      next();
    }
  }
});

export default router;
