import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/tools/aes',
    name: 'aes',
    component: () => import('../views/AesTool.vue')
  },
  {
    path: '/tools/:toolId',
    name: 'tool',
    component: () => import('../views/ToolView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
