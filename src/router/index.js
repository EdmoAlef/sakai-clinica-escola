import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import {useAuthStore} from '@/service/authService/AuthService.js';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    meta: { requiresAuth: true, roles: ['user', 'admin'] },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/users',
                    name: 'users',
                    meta: { requiresAuth: true, roles: ['professor'] },
                    component: () => import('@/views/pages/Users.vue')
                },
                {
                    path: '/appointments',
                    name: 'appointments',
                    meta: { requiresAuth: true, roles: ['user'] },
                    component: () => import('@/views/pages/Appointments.vue')
                },
                {
                    path: '/consultations',
                    name: 'consultations',
                    meta: { requiresAuth: true, roles: ['user'] },
                    component: () => import('@/views/pages/Consultations.vue')
                }, {
                    path: '/consultation',
                    name: 'consultation',
                    meta: { requiresAuth: true, roles: ['user'] },
                    component: () => import('@/views/pages/Consultation.vue')
                }
                
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {

    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const userRoles = authStore.roles;

    if (requiresAuth && !authStore.isAuthenticated) {
        next('/auth/login');
    } else if (requiresAuth && to.meta.roles && !to.meta.roles.some(role => userRoles.includes(role))) {
        next('auth/access'); // ou redirecione para outra rota
    } else {
        next();
    }
});

export default router;
