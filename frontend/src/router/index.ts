import { createRouter, createWebHashHistory } from 'vue-router'; // MUDANÇA AQUI: de createWebHistory para createWebHashHistory
import Home from '@/pages/HomePage.vue';
import ClientePage from '@/pages/ClientePage.vue';
import PedidosPage from '@/pages/PedidosPage.vue';
import BackupPage from '@/pages/BackupPage.vue';

const router = createRouter({
  // MUDANÇA AQUI: Agora usando createWebHashHistory()
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
      path: '/backup',
      name: 'backup',
      component: BackupPage,
    },
  ],
});

export default router;