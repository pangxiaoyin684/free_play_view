<template>
  <view class="login-container">
    <!-- 顶部流光氛围背景 -->
    <view class="header-bg">
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>

      <view class="header-content">
        <view class="logo-box flex-center animate-float">
          <text class="logo-icon">🎮</text>
        </view>
        <text class="app-title">{{ appStore.appName }}</text>
        <text class="app-subtitle">休闲竞技 · 实用百宝箱 · 沉浸体验</text>
      </view>
    </view>

    <!-- 登录主卡片区域 (立体毛玻璃质感) -->
    <view class="login-card card-box">
      <!-- #ifdef MP-WEIXIN -->
      <view class="weixin-login-section">
        <view class="section-title">微信一键授权</view>
        <view class="section-desc">授权微信账号即可同步全服游戏战绩与资产</view>

        <button 
          class="btn-wechat flex-center" 
          hover-class="btn-hover"
          @click="handleWeixinLogin"
          :loading="loading"
        >
          <text class="wx-icon">💬</text>
          <text class="wx-text">微信快捷一键登录</text>
        </button>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view class="h5-login-section">
        <view class="login-tabs flex-between">
          <view 
            class="tab-item" 
            :class="{ active: loginTab === 'phone' }"
            @click="loginTab = 'phone'"
          >
            手机号登录
          </view>
          <view 
            class="tab-item" 
            :class="{ active: loginTab === 'email' }"
            @click="loginTab = 'email'"
          >
            邮箱账号登录
          </view>
        </view>

        <!-- 手机号登录表单 -->
        <view v-if="loginTab === 'phone'" class="form-body">
          <view class="input-group flex-center">
            <text class="input-icon">📱</text>
            <input 
              v-model="phoneForm.phone" 
              type="number" 
              maxlength="11" 
              placeholder="请输入11位手机号码" 
              class="input-control" 
            />
          </view>

          <view class="input-group flex-between">
            <view class="flex-center" style="flex: 1;">
              <text class="input-icon">🔒</text>
              <input 
                v-model="phoneForm.code" 
                type="number" 
                maxlength="6" 
                placeholder="请输入短信验证码" 
                class="input-control" 
              />
            </view>
            <button 
              class="btn-code flex-center" 
              :disabled="phoneCountDown > 0" 
              @click="sendPhoneCode"
            >
              {{ phoneCountDown > 0 ? `${phoneCountDown}s` : '获取验证码' }}
            </button>
          </view>

          <button 
            class="btn-primary-gradient flex-center" 
            hover-class="btn-hover"
            :loading="loading"
            @click="handlePhoneLogin"
          >
            立即登录 / 注册
          </button>
        </view>

        <!-- 邮箱登录表单 -->
        <view v-if="loginTab === 'email'" class="form-body">
          <view class="input-group flex-center">
            <text class="input-icon">✉️</text>
            <input 
              v-model="emailForm.email" 
              type="text" 
              placeholder="请输入电子邮箱地址" 
              class="input-control" 
            />
          </view>

          <view class="input-group flex-between">
            <view class="flex-center" style="flex: 1;">
              <text class="input-icon">🔑</text>
              <input 
                v-model="emailForm.code" 
                type="text" 
                placeholder="请输入邮箱验证码" 
                class="input-control" 
              />
            </view>
            <button 
              class="btn-code flex-center" 
              :disabled="emailCountDown > 0" 
              @click="sendEmailCode"
            >
              {{ emailCountDown > 0 ? `${emailCountDown}s` : '获取验证码' }}
            </button>
          </view>

          <button 
            class="btn-primary-gradient flex-center" 
            hover-class="btn-hover"
            :loading="loading"
            @click="handleEmailLogin"
          >
            邮箱快捷登录
          </button>
        </view>
      </view>
      <!-- #endif -->

      <!-- 全端模拟登录体验通道 -->
      <view v-if="appStore.enableMockLogin" class="mock-section">
        <view class="divider flex-center">
          <text class="divider-text">免密体验通道</text>
        </view>

        <view class="mock-btn-group flex-between">
          <button 
            class="btn-mock-item btn-guest flex-center" 
            hover-class="btn-hover"
            @click="handleMockLogin('gamer')"
          >
            <text>🎮 模拟普通玩家</text>
          </button>
          <button 
            class="btn-mock-item btn-vip flex-center" 
            hover-class="btn-hover"
            @click="handleMockLogin('vip')"
          >
            <text>👑 模拟 VIP 账号</text>
          </button>
        </view>
      </view>

      <!-- 游客通道 -->
      <view v-if="!appStore.requireLogin" class="visitor-box flex-center">
        <text class="visitor-link" @click="handleVisitor">暂不登录，以游客身份进入体验 ➔</text>
      </view>
    </view>

    <!-- 底部条款说明 -->
    <view class="footer-agreement flex-center">
      <text class="agreement-text">登录即代表已同意</text>
      <text class="agreement-highlight" @click="showAgreement('service')">《用户协议》</text>
      <text class="agreement-text">与</text>
      <text class="agreement-highlight" @click="showAgreement('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../stores/user'
import { useAppStore } from '../../stores/app'
import { apiWeixinLogin, apiPhoneLogin, apiEmailLogin, apiSendPhoneCode, apiSendEmailCode } from '../../api/auth'

const userStore = useUserStore()
const appStore = useAppStore()

const loading = ref(false)
const redirectUrl = ref('')
const loginTab = ref('phone')

const phoneForm = reactive({ phone: '', code: '' })
const phoneCountDown = ref(0)
let phoneTimer = null

const emailForm = reactive({ email: '', code: '' })
const emailCountDown = ref(0)
let emailTimer = null

onLoad((options) => {
  if (options && options.redirect) {
    redirectUrl.value = decodeURIComponent(options.redirect)
  }
})

function finishLogin(nickname) {
  uni.showToast({
    title: `欢迎，${nickname || '玩家'}!`,
    icon: 'success'
  })

  setTimeout(() => {
    if (redirectUrl.value) {
      const isTab = ['pages/tabbar/games/index', 'pages/tabbar/tools/index', 'pages/tabbar/profile/index']
        .some(tab => redirectUrl.value.includes(tab))
      if (isTab) {
        uni.switchTab({ url: redirectUrl.value })
      } else {
        uni.redirectTo({ url: redirectUrl.value })
      }
    } else {
      uni.switchTab({ url: '/pages/tabbar/games/index' })
    }
  }, 500)
}

async function handleWeixinLogin() {
  loading.value = true
  try {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          const res = await apiWeixinLogin({
            code: loginRes.code,
            userInfo: { nickName: '微信特邀玩家' }
          })
          userStore.setLoginInfo(res.token, res.data)
          finishLogin(res.data.nickname)
        } catch (e) {
          uni.showToast({ title: '登录异常', icon: 'none' })
        } finally {
          loading.value = false
        }
      },
      fail: () => {
        uni.showToast({ title: '微信授权取消', icon: 'none' })
        loading.value = false
      }
    })
    // #endif
    // #ifndef MP-WEIXIN
    const mockUser = userStore.mockLogin('gamer')
    finishLogin(mockUser.nickname)
    loading.value = false
    // #endif
  } catch (e) {
    loading.value = false
  }
}

async function sendPhoneCode() {
  if (!phoneForm.phone || phoneForm.phone.length !== 11) {
    uni.showToast({ title: '请输入有效的11位手机号', icon: 'none' })
    return
  }
  try {
    const res = await apiSendPhoneCode(phoneForm.phone)
    uni.showModal({
      title: '验证码已发送',
      content: res.message,
      showCancel: false,
      confirmText: '自动填入',
      success: () => {
        phoneForm.code = '666888'
      }
    })
    phoneCountDown.value = 60
    phoneTimer = setInterval(() => {
      phoneCountDown.value--
      if (phoneCountDown.value <= 0) clearInterval(phoneTimer)
    }, 1000)
  } catch (e) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}

async function handlePhoneLogin() {
  if (!phoneForm.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!phoneForm.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await apiPhoneLogin(phoneForm)
    userStore.setLoginInfo(res.token, res.data)
    finishLogin(res.data.nickname)
  } catch (e) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function sendEmailCode() {
  if (!emailForm.email || !emailForm.email.includes('@')) {
    uni.showToast({ title: '请输入有效邮箱地址', icon: 'none' })
    return
  }
  try {
    const res = await apiSendEmailCode(emailForm.email)
    uni.showModal({
      title: '验证码已发送',
      content: res.message,
      showCancel: false,
      confirmText: '自动填入',
      success: () => {
        emailForm.code = '888999'
      }
    })
    emailCountDown.value = 60
    emailTimer = setInterval(() => {
      emailCountDown.value--
      if (emailCountDown.value <= 0) clearInterval(emailTimer)
    }, 1000)
  } catch (e) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}

async function handleEmailLogin() {
  if (!emailForm.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!emailForm.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await apiEmailLogin(emailForm)
    userStore.setLoginInfo(res.token, res.data)
    finishLogin(res.data.nickname)
  } catch (e) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function handleMockLogin(role) {
  const user = userStore.mockLogin(role)
  finishLogin(user.nickname)
}

function handleVisitor() {
  uni.switchTab({ url: '/pages/tabbar/games/index' })
}

function showAgreement(type) {
  uni.showModal({
    title: type === 'service' ? '用户服务协议' : '隐私保护政策',
    content: '欢迎使用本平台，我们严格遵守相关法律法规，全面保护您的账户与数据资产安全。',
    showCancel: false
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
}

/* 顶部流光氛围 */
.header-bg {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%);
  padding: 120rpx 40rpx 90rpx;
  text-align: center;
  color: #ffffff;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}

.orb-1 {
  top: -40rpx;
  left: -40rpx;
  width: 220rpx;
  height: 220rpx;
  background: rgba(99, 102, 241, 0.4);
}

.orb-2 {
  top: 40rpx;
  right: -40rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(236, 72, 153, 0.35);
}

.logo-box {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border-radius: 40rpx;
  margin: 0 auto 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.3);
}

.logo-icon {
  font-size: 72rpx;
}

.app-title {
  display: block;
  font-size: 46rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
  margin-bottom: 8rpx;
}

.app-subtitle {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
}

/* 登录卡片 */
.login-card {
  margin: -40rpx 32rpx 0;
  padding: 44rpx 36rpx;
  border-radius: 36rpx;
  background: #ffffff;
}

/* 微信登录 */
.weixin-login-section {
  text-align: center;
  padding: 10rpx 0;
}

.section-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #64748b;
  margin-bottom: 36rpx;
}

.btn-wechat {
  background: linear-gradient(135deg, #07c160 0%, #059669 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
  height: 96rpx;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.35);
}

.wx-icon {
  font-size: 40rpx;
  margin-right: 14rpx;
}

/* H5 Tabs */
.login-tabs {
  border-bottom: 2rpx solid #e2e8f0;
  margin-bottom: 32rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #64748b;
  padding-bottom: 18rpx;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #4f46e5;
  font-weight: 800;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 25%;
  right: 25%;
  height: 6rpx;
  background: #4f46e5;
  border-radius: 4rpx;
}

/* 表单控件 */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-group {
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 24rpx;
  padding: 10rpx 24rpx;
}

.input-icon {
  font-size: 32rpx;
  margin-right: 18rpx;
}

.input-control {
  flex: 1;
  height: 74rpx;
  font-size: 26rpx;
  color: #0f172a;
}

.btn-code {
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 22rpx;
  font-weight: 700;
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 30rpx;
  border: none;
  margin-left: 14rpx;
}

.btn-primary-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  height: 92rpx;
  border-radius: 46rpx;
  border: none;
  margin-top: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 70, 229, 0.35);
}

/* 模拟体验 */
.mock-section {
  margin-top: 36rpx;
}

.divider {
  position: relative;
  margin-bottom: 24rpx;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1rpx;
  background: #e2e8f0;
}

.divider-text {
  position: relative;
  background: #ffffff;
  padding: 0 16rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.mock-btn-group {
  gap: 16rpx;
}

.btn-mock-item {
  flex: 1;
  height: 76rpx;
  border-radius: 38rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
}

.btn-guest {
  background: #eff6ff;
  color: #2563eb;
  border: 2rpx solid #bfdbfe;
}

.btn-vip {
  background: #fffbeb;
  color: #d97706;
  border: 2rpx solid #fde68a;
}

.visitor-box {
  margin-top: 26rpx;
}

.visitor-link {
  font-size: 24rpx;
  color: #64748b;
  text-decoration: underline;
  cursor: pointer;
}

.footer-agreement {
  margin-top: auto;
  padding: 36rpx 30rpx 60rpx;
  flex-wrap: wrap;
}

.agreement-text {
  font-size: 22rpx;
  color: #64748b;
}

.agreement-highlight {
  font-size: 22rpx;
  color: #818cf8;
  cursor: pointer;
}
</style>
