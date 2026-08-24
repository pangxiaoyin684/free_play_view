import { useUserStore } from '../stores/user'
import { useAppStore } from '../stores/app'

// 白名单页面，无需登录即可访问
const WHITE_LIST = [
  'pages/auth/login'
]

/**
 * 检查是否需要登录并拦截
 * @param {string} targetUrl 目标页面路径 (如 'pages/games/match3/index')
 * @returns {boolean} 是否允许继续访问
 */
export function checkAuthGuard(targetUrl = '') {
  const appStore = useAppStore()
  const userStore = useUserStore()

  // 如果 .env 配置了不强制登录 (VITE_REQUIRE_LOGIN=false)，则全部放行
  if (!appStore.requireLogin) {
    return true
  }

  // 白名单页面直接放行
  const cleanUrl = targetUrl.split('?')[0].replace(/^\//, '')
  if (WHITE_LIST.includes(cleanUrl)) {
    return true
  }

  // 已登录放行
  if (userStore.isLoggedIn) {
    return true
  }

  // 未登录，拦截并跳转到登录页
  uni.showToast({
    title: '请先登录后继续使用',
    icon: 'none',
    duration: 1500
  })

  setTimeout(() => {
    uni.reLaunch({
      url: `/pages/auth/login?redirect=${encodeURIComponent(targetUrl || '/pages/tabbar/games/index')}`
    })
  }, 300)

  return false
}

/**
 * 注册全局 uni 路由跳转拦截器
 */
export function setupRouteGuard() {
  const guardMethod = {
    invoke(args) {
      if (!args || !args.url) return true
      const url = args.url.split('?')[0].replace(/^\//, '')
      const appStore = useAppStore()
      const userStore = useUserStore()

      if (appStore.requireLogin && !userStore.isLoggedIn && !WHITE_LIST.includes(url)) {
        console.log('[Auth Guard] 拦截未登录访问:', args.url)
        uni.reLaunch({
          url: `/pages/auth/login?redirect=${encodeURIComponent(args.url)}`
        })
        return false
      }
      return true
    }
  }

  uni.addInterceptor('navigateTo', guardMethod)
  uni.addInterceptor('redirectTo', guardMethod)
  uni.addInterceptor('reLaunch', guardMethod)
  uni.addInterceptor('switchTab', guardMethod)
}
