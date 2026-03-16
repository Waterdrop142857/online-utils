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
    path: '/tools/base64',
    name: 'base64',
    component: () => import('../views/Base64Tool.vue')
  },
  {
    path: '/tools/hash',
    name: 'hash',
    component: () => import('../views/HashTool.vue')
  },
  {
    path: '/tools/url',
    name: 'url',
    component: () => import('../views/UrlTool.vue')
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
