import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '运营监控大盘', icon: '📊' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue'),
        meta: { title: '玩家与资产管理', icon: '👥' }
      },
      {
        path: 'games',
        name: 'Games',
        component: () => import('../views/games/index.vue'),
        meta: { title: '无尽游戏难度调控', icon: '🎮' }
      },
      {
        path: 'leaderboards',
        name: 'Leaderboards',
        component: () => import('../views/leaderboards/index.vue'),
        meta: { title: '全服排行榜管理', icon: '🏆' }
      },
      {
        path: 'ai-settings',
        name: 'AiSettings',
        component: () => import('../views/ai-settings/index.vue'),
        meta: { title: 'AI 图像模型配置', icon: '🤖' }
      },
      {
        path: 'tools',
        name: 'Tools',
        component: () => import('../views/tools/index.vue'),
        meta: { title: '百宝箱工具管理', icon: '🧰' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '管理后台'} - 休闲游戏与百宝箱`
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
