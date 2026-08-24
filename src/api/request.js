const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mock.api.local'

/**
 * 封装通用网络请求
 */
export function request({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    let token = ''
    try {
      token = uni.getStorageSync('auth_token') || ''
    } catch (e) {}

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...header
    }
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`
    }

    // 如果是 mock api，可直接由客户端 api 模块模拟返回
    if (BASE_URL.includes('mock.api.local')) {
      // 交由 mock 处理
      return resolve({ code: 200, message: 'mock success', data: null })
    }

    uni.request({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method,
      data,
      header: reqHeaders,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          uni.removeStorageSync('auth_token')
          uni.navigateTo({ url: '/pages/auth/login' })
          reject(res.data)
        } else {
          uni.showToast({ title: res.data?.message || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接异常，请重试', icon: 'none' })
        reject(err)
      }
    })
  })
}
