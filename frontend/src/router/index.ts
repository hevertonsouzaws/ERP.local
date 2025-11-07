import { createRouter, createWebHashHistory } from 'vue-router'; 
import Home from '@/pages/HomePage.vue';
import ClientePage from '@/pages/ClientPage.vue';
import PedidosPage from '@/pages/OrdersPage.vue';
import BackupPage from '@/pages/BackupPage.vue';
import ServiceCatologPage from '@/pages/ServiceCatologPage.vue';
import FinancesPage from '@/pages/FinancesPage.vue';

const router = createRouter({
  history: createWebHashHistory(), 
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
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
  ],
});

export default router;