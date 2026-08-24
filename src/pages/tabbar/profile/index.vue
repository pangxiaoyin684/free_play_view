<template>
  <view class="profile-container">
    <!-- 个人核心资料卡 (深色优雅质感) -->
    <view class="user-profile-card">
      <view class="user-main-row flex-between">
        <view class="user-avatar-wrap flex-center">
          <image class="user-avatar" :src="userStore.userAvatar" mode="aspectFill" />
        </view>

        <view class="user-text-info flex-1">
          <view class="name-row flex-center">
            <text class="user-name">{{ userStore.userNickname }}</text>
            <text class="vip-badge">VIP 玩家</text>
          </view>
          <text class="user-uid">UID: {{ userStore.userInfo?.id || '888888' }} · 状态正常</text>
        </view>

        <button class="btn-edit-avatar flex-center" @click="changeAvatar">
          更换头像
        </button>
      </view>

      <!-- 资产与战绩数据栏 -->
      <view class="assets-strip flex-between">
        <view class="asset-item flex-column flex-center">
          <text class="asset-val">{{ userStore.userCoins }}</text>
          <text class="asset-lbl">🪙 金币余额</text>
        </view>
        <view class="divider-line"></view>
        <view class="asset-item flex-column flex-center">
          <text class="asset-val">{{ (userStore.userInfo?.highScores?.planeWar || 0).toLocaleString() }}</text>
          <text class="asset-lbl">🚀 战机最佳</text>
        </view>
        <view class="divider-line"></view>
        <view class="asset-item flex-column flex-center">
          <text class="asset-val">{{ (userStore.userInfo?.highScores?.match3 || 0).toLocaleString() }}</text>
          <text class="asset-lbl">💎 消消乐最佳</text>
        </view>
      </view>
    </view>

    <!-- 游戏段位荣誉勋章 -->
    <view class="honor-card card-box">
      <view class="card-section-head flex-between">
        <text class="section-heading">游戏荣誉勋章</text>
        <text class="honor-count">已点亮 3 枚</text>
      </view>

      <view class="badges-row flex-between">
        <view class="badge-box flex-column flex-center">
          <view class="badge-icon-box bg-gold flex-center">
            <text class="badge-emoji">🥇</text>
          </view>
          <text class="badge-title">空天王牌</text>
          <text class="badge-sub">飞机大战无尽</text>
        </view>
        <view class="badge-box flex-column flex-center">
          <view class="badge-icon-box bg-purple flex-center">
            <text class="badge-emoji">💎</text>
          </view>
          <text class="badge-title">消除宗师</text>
          <text class="badge-sub">宝石消消乐</text>
        </view>
        <view class="badge-box flex-column flex-center">
          <view class="badge-icon-box bg-green flex-center">
            <text class="badge-emoji">⚡</text>
          </view>
          <text class="badge-title">极速神手</text>
          <text class="badge-sub">欢乐连连看</text>
        </view>
      </view>
    </view>

    <!-- 设置选项列表 -->
    <view class="settings-card card-box">
      <text class="section-heading" style="margin-bottom: 8rpx; display: block;">系统与偏好设置</text>

      <view class="setting-row flex-between">
        <view class="setting-left flex-center">
          <text class="setting-icon">🔊</text>
          <text class="setting-label">全端游戏音效与音乐</text>
        </view>
        <switch :checked="appStore.soundEnabled" @change="toggleSound" color="#4f46e5" />
      </view>

      <view class="setting-row flex-between">
        <view class="setting-left flex-center">
          <text class="setting-icon">📳</text>
          <text class="setting-label">按键触感震动反馈</text>
        </view>
        <switch :checked="appStore.vibrateEnabled" @change="toggleVibrate" color="#4f46e5" />
      </view>

      <view class="setting-row flex-between" @click="showClearCacheModal">
        <view class="setting-left flex-center">
          <text class="setting-icon">🧹</text>
          <text class="setting-label">清理本地临时数据缓存</text>
        </view>
        <text class="setting-arrow">→</text>
      </view>
    </view>

    <!-- 退出账号 -->
    <button class="btn-logout-card flex-center" @click="handleLogout">
      退出当前账号
    </button>
  </view>
</template>

<script setup>
import { useUserStore } from '../../../stores/user'
import { useAppStore } from '../../../stores/app'
import { soundManager } from '../../../utils/audio'

const userStore = useUserStore()
const appStore = useAppStore()

function toggleSound() {
  appStore.toggleSound()
  soundManager.playPop()
}

function toggleVibrate() {
  appStore.toggleVibrate()
  soundManager.playPop()
}

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        userStore.updateAvatar(res.tempFilePaths[0])
        soundManager.playCoin()
        uni.showToast({ title: '头像已更新', icon: 'success' })
      }
    }
  })
}

function showClearCacheModal() {
  soundManager.playPop()
  uni.showModal({
    title: '清理缓存',
    content: '确定要清理本地临时缓存吗？最高记录与金币资产不受影响。',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '清理完成', icon: 'success' })
      }
    }
  })
}

function handleLogout() {
  soundManager.playPop()
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前登录的账号吗？',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/auth/login' })
      }
    }
  })
}
</script>

<style scoped>
.profile-container {
  padding: 24rpx;
  min-height: 100vh;
}

/* 个人信息卡 */
.user-profile-card {
  background: #18181b;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  color: #ffffff;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(24, 24, 27, 0.12);
}

.user-main-row {
  margin-bottom: 28rpx;
  gap: 18rpx;
}

.user-avatar-wrap {
  width: 96rpx;
  height: 96rpx;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2rpx solid #3f3f46;
}

.name-row {
  justify-content: flex-start;
  gap: 10rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #fafafa;
}

.vip-badge {
  font-size: 18rpx;
  font-weight: 600;
  background: #27272a;
  color: #fbbf24;
  border: 1rpx solid #3f3f46;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.user-uid {
  font-size: 20rpx;
  color: #71717a;
  margin-top: 4rpx;
  display: block;
}

.btn-edit-avatar {
  height: 52rpx;
  background: #27272a;
  color: #d4d4d8;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 12rpx;
  border: 1rpx solid #3f3f46;
  padding: 0 18rpx;
  margin: 0;
}

/* 资产栏 */
.assets-strip {
  background: #27272a;
  border-radius: 16rpx;
  padding: 18rpx 12rpx;
  border: 1rpx solid #3f3f46;
}

.asset-item {
  flex: 1;
}

.asset-val {
  font-size: 30rpx;
  font-weight: 700;
  color: #fafafa;
  line-height: 1.2;
}

.asset-lbl {
  font-size: 18rpx;
  color: #a1a1aa;
  margin-top: 4rpx;
}

.divider-line {
  width: 1rpx;
  height: 40rpx;
  background: #3f3f46;
}

/* 勋章墙 */
.honor-card {
  padding: 24rpx;
}

.card-section-head {
  margin-bottom: 20rpx;
}

.section-heading {
  font-size: 28rpx;
  font-weight: 700;
  color: #1d2129;
}

.honor-count {
  font-size: 20rpx;
  color: #4f46e5;
  font-weight: 600;
}

.badges-row {
  gap: 14rpx;
}

.badge-box {
  flex: 1;
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  border-radius: 16rpx;
  padding: 18rpx 10rpx;
}

.badge-icon-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
}

.bg-gold { background: #fff7e8; }
.bg-purple { background: #fdf2f8; }
.bg-green { background: #e8ffea; }

.badge-emoji {
  font-size: 36rpx;
}

.badge-title {
  font-size: 22rpx;
  font-weight: 600;
  color: #1d2129;
}

.badge-sub {
  font-size: 18rpx;
  color: #86909c;
  margin-top: 2rpx;
}

/* 设置项 */
.settings-card {
  padding: 24rpx;
}

.setting-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f3f5;
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-left {
  gap: 14rpx;
}

.setting-icon {
  font-size: 30rpx;
}

.setting-label {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
}

.setting-arrow {
  font-size: 28rpx;
  color: #86909c;
}

/* 退出登录 */
.btn-logout-card {
  height: 84rpx;
  background: #ffffff;
  color: #f53f3f;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 16rpx;
  border: 1rpx solid #f53f3f30;
  margin-top: 24rpx;
  margin-bottom: 40rpx;
}
</style>
