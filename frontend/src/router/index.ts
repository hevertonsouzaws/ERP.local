import { createRouter, createWebHashHistory } from 'vue-router'; 
import Home from '@/pages/HomePage.vue';
import ClientePage from '@/pages/ClientPage.vue';
import PedidosPage from '@/pages/OrdersPage.vue';
import BackupPage from '@/pages/BackupPage.vue';
import ServiceCatologPage from '@/pages/ServiceCatologPage.vue';
import FinancesPage from '@/pages/FinancesPage.vue';
import CreateOrderPage from '@/pages/CreateOrderPage.vue';
import PedidoSelectorPage from '@/pages/PedidoSelectorPage.vue';
import { useUserStore } from '@/shared/stores/user.store'; 
import AuthLoginPage from '@/pages/AuthLoginPage.vue';
import LogsPage from '@/pages/LogsPage.vue';
import UserManagementPage from '@/pages/UserManagementPage.vue';

const router = createRouter({
  history: createWebHashHistory(), 
  routes: [
    {
      path: '/login', 
      name: 'login',
      component: AuthLoginPage,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/criarpedido',
      name: 'criarpedido',
      component: CreateOrderPage,
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientePage,
    },
    {
      path: '/pedidos',
      name: 'pedidos',
      component: PedidosPage,
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: ServiceCatologPage,
    },
    {
      path: '/backup',
      name: 'backup',
      component: BackupPage,
    },
    {
      path: '/financas',
      name: 'financas',
      component: FinancesPage,
    },
    {
      path: '/zap',
      name: 'zap',
      component: PedidoSelectorPage,
    },
    {
      path: '/log',
      name: 'log',
      component: LogsPage,
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagementPage,
    },
  ],
});

router.beforeEach((to) => {
    const userStore = useUserStore();
    const publicPages = ['/login']; 
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !userStore.isLoggedIn) {
        return { name: 'login' };
    }

    if (userStore.isLoggedIn && to.name === 'login') {
      return { name: 'home' };
    }
});

export default router;