<template>
  <div class="admin-layout">
    <!-- 侧边栏导航 -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon-box">
          <span>🎮</span>
        </div>
        <div>
          <span class="brand-title">休闲百宝箱</span>
          <span class="brand-subtitle">Console 控制台 v1.0</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          v-for="item in navList" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute.path === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-user-card">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
            class="admin-avatar" 
          />
          <div>
            <span class="user-info-text">超级管理员</span>
            <span class="user-role-badge">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主视口内容区 -->
    <div class="admin-main">
      <header class="admin-header">
        <h1 class="header-title">
          <span>{{ currentRoute.meta?.icon }}</span>
          <span>{{ currentRoute.meta?.title || '管理后台' }}</span>
        </h1>
        <div class="header-actions">
          <a href="/" target="_blank" class="btn-client-link">
            📱 打开移动端前台
          </a>
          <button class="btn-logout" @click="handleLogout">
            退出登录
          </button>
        </div>
      </header>

      <main class="admin-body">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route)

const navList = [
  { path: '/dashboard', title: '运营监控大盘', icon: '📊' },
  { path: '/users', title: '玩家与资产管理', icon: '👥' },
  { path: '/games', title: '无尽游戏难度调控', icon: '🎮' },
  { path: '/leaderboards', title: '全服排行榜监控', icon: '🏆' },
  { path: '/ai-settings', title: 'AI 图像模型配置', icon: '🤖' },
  { path: '/tools', title: '百宝箱工具管理', icon: '🧰' }
]

function handleLogout() {
  if (confirm('确定要退出管理后台吗？')) {
    localStorage.removeItem('admin_token')
    router.push('/login')
  }
}
</script>
