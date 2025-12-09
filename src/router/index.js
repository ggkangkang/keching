import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Events from '../views/Events.vue';
import Setup from '../views/Setup.vue';
import AcceptInvitation from '../views/AcceptInvitation.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/events',
        name: 'Events',
        component: Events,
        meta: { requiresAuth: true }
    },
    {
        path: '/setup',
        name: 'Setup',
        component: Setup,
        meta: { requiresAuth: true }
    },
    {
        path: '/invite/:inviteCode',
        name: 'AcceptInvitation',
        component: AcceptInvitation,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const { user } = useAuth();

    if (to.meta.requiresAuth && !user.value) {
        // Save the intended destination for after login
        sessionStorage.setItem('redirectAfterLogin', to.fullPath);
        next('/login');
    } else if (to.meta.requiresGuest && user.value) {
        // Check if there's a redirect path saved
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
            sessionStorage.removeItem('redirectAfterLogin');
            next(redirectPath);
        } else {
            next('/');
        }
    } else {
        next();
    }
});

export default router;
