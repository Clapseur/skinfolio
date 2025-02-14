import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InventaireUser from '../components/InventaireUser.vue'
import ElMordjen from '../components/ElMordjen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventaireUser,
    },
    {
      path: '/mordjen',
      name: 'mordjen',
      component: ElMordjen,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
