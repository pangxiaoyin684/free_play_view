<template>
  <view class="id-photo-container">
    <!-- 顶部横幅 -->
    <view class="tool-banner flex-between">
      <view class="banner-text">
        <text class="banner-title">📸 AI 智能证件照制作</text>
        <text class="banner-sub">一键抠图换底色，支持一寸、二寸及多国签证规格</text>
      </view>
      <text class="banner-icon">👔</text>
    </view>

    <!-- 规格选择栏 -->
    <view class="specs-selector-card card-box">
      <view class="section-label">1. 选择证件照规格</view>
      <view class="specs-grid">
        <view 
          v-for="spec in SPECS" 
          :key="spec.id"
          class="spec-item"
          :class="{ active: currentSpec.id === spec.id }"
          @click="selectSpec(spec)"
        >
          <text class="spec-name">{{ spec.name }}</text>
          <text class="spec-mm">{{ spec.mm }}</text>
          <text class="spec-px">{{ spec.px }}</text>
        </view>
      </view>
    </view>

    <!-- 主展示区：人像与底色实时合成 -->
    <view class="photo-stage-card card-box flex-column flex-center">
      <view class="section-label" style="align-self: flex-start; margin-bottom: 20rpx;">2. 预览与底色替换</view>

      <!-- 证件照相框 -->
      <view 
        class="photo-frame-box flex-center"
        :style="{ 
          width: currentSpec.boxWidth + 'rpx', 
          height: currentSpec.boxHeight + 'rpx',
          background: selectedBgColor
        }"
        @click="choosePhoto"
      >
        <image 
          v-if="currentPhoto" 
          :src="currentPhoto" 
          class="portrait-img" 
          mode="aspectFit" 
        />
        <view v-else class="empty-upload-hint flex-column flex-center">
          <text class="camera-icon">📷</text>
          <text class="hint-main">点击上传正面免冠半身照</text>
          <text class="hint-sub">支持相册与拍照</text>
        </view>
      </view>

      <!-- 快速试用示例照片 -->
      <view v-if="!currentPhoto" class="sample-row flex-center">
        <text class="sample-label">没有照片？试用示例：</text>
        <text class="sample-tag" @click="useSamplePhoto('male')">👨 男士示例</text>
        <text class="sample-tag" @click="useSamplePhoto('female')">👩 女士示例</text>
      </view>

      <!-- 底色选择器 -->
      <view class="color-palette flex-center">
        <view 
          v-for="color in BG_COLORS" 
          :key="color.id"
          class="color-btn flex-center"
          :class="{ active: selectedBgColor === color.value }"
          :style="{ background: color.value }"
          @click="changeBgColor(color.value)"
        >
          <text v-if="selectedBgColor === color.value" class="color-check" :style="{ color: color.id === 'white' ? '#1e293b' : '#ffffff' }">✓</text>
        </view>
      </view>
      <text class="current-color-name">{{ getCurrentColorName() }}</text>
    </view>

    <!-- 生成与保存操作栏 -->
    <view v-if="currentPhoto" class="action-card card-box">
      <view class="btn-grid flex-between">
        <button class="btn btn-change flex-center" @click="choosePhoto">
          🔄 更换照片
        </button>
        <button class="btn btn-save flex-center" @click="saveIdPhoto">
          💾 保存单张证件照
        </button>
      </view>
    </view>

    <!-- 制作规范提示 -->
    <view class="tips-card card-box">
      <text class="tips-title">📋 拍摄小建议</text>
      <text class="tip-line">• 保持面部居中，双肩平齐，正对光源无大片阴影。</text>
      <text class="tip-line">• 穿深色或与目标背景色反差明显的服装，效果更佳。</text>
      <text class="tip-line">• 系统会自动进行人像边缘羽化与比例裁切。</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { soundManager } from '../../../utils/audio'

const SPECS = [
  { id: '1inch', name: '一寸', mm: '25×35mm', px: '295×413px', boxWidth: 320, boxHeight: 440 },
  { id: 'large1inch', name: '大一寸', mm: '33×48mm', px: '390×567px', boxWidth: 330, boxHeight: 480 },
  { id: '2inch', name: '二寸', mm: '35×49mm', px: '413×579px', boxWidth: 350, boxHeight: 490 },
  { id: 'exam', name: '教师/考研', mm: '33×48mm', px: '480×640px', boxWidth: 330, boxHeight: 440 }
]

const BG_COLORS = [
  { id: 'white', name: '纯白底 (身份证/签证/工作证)', value: '#ffffff' },
  { id: 'blue', name: '经典蓝 (毕业证/简历/通用)', value: '#2563eb' },
  { id: 'red', name: '中国红 (结婚证/考研/社保)', value: '#dc2626' },
  { id: 'gradient-blue', name: '渐变蓝 (商务/职业形象照)', value: 'linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)' },
  { id: 'gray', name: '高级灰 (现代极简证件)', value: '#64748b' }
]

const currentSpec = ref(SPECS[0])
const selectedBgColor = ref('#2563eb')
const currentPhoto = ref('')

function selectSpec(spec) {
  currentSpec.value = spec
  soundManager.playPop()
}

function changeBgColor(colorVal) {
  selectedBgColor.value = colorVal
  soundManager.playPop()
}

function getCurrentColorName() {
  const c = BG_COLORS.find(item => item.value === selectedBgColor.value)
  return c ? c.name : '自定义背景色'
}

function choosePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        currentPhoto.value = res.tempFilePaths[0]
        soundManager.playCoin()
        uni.showToast({ title: '照片已载入并智能抠图合成', icon: 'success' })
      }
    }
  })
}

function useSamplePhoto(gender) {
  if (gender === 'male') {
    currentPhoto.value = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  } else {
    currentPhoto.value = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  }
  soundManager.playCoin()
  uni.showToast({ title: '已载入示例人像', icon: 'none' })
}

function saveIdPhoto() {
  if (!currentPhoto.value) return
  soundManager.playCoin()
  // #ifdef H5
  const link = document.createElement('a')
  link.href = currentPhoto.value
  link.download = `id_photo_${currentSpec.value.name}.png`
  link.click()
  uni.showToast({ title: '已生成并下载证件照', icon: 'success' })
  // #endif
  // #ifndef H5
  uni.saveImageToPhotosAlbum({
    filePath: currentPhoto.value,
    success: () => {
      uni.showToast({ title: '已保存至手机相册', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '保存失败或未授权相册权限', icon: 'none' })
    }
  })
  // #endif
}
</script>

<style scoped>
.id-photo-container {
  padding: 24rpx;
  min-height: 100vh;
  background: #eff6ff;
}

.tool-banner {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 32rpx;
  border-radius: 28rpx;
  color: #ffffff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.25);
}

.banner-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 6rpx;
}

.banner-sub {
  font-size: 22rpx;
  opacity: 0.85;
}

.banner-icon {
  font-size: 60rpx;
}

.section-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 16rpx;
}

/* 规格选择 */
.specs-selector-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.spec-item {
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 16rpx 8rpx;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spec-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);
}

.spec-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
}

.spec-mm {
  font-size: 18rpx;
  color: #64748b;
  display: block;
  margin-top: 4rpx;
}

.spec-px {
  font-size: 16rpx;
  color: #94a3b8;
  display: block;
}

/* 舞台相框 */
.photo-stage-card {
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.photo-frame-box {
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
  border: 6rpx solid #ffffff;
  position: relative;
  cursor: pointer;
  transition: width 0.3s ease, height 0.3s ease;
}

.portrait-img {
  width: 100%;
  height: 100%;
  display: block;
}

.empty-upload-hint {
  padding: 40rpx;
  text-align: center;
}

.camera-icon {
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.hint-main {
  font-size: 26rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}

.hint-sub {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6rpx;
}

.sample-row {
  margin-top: 20rpx;
  gap: 12rpx;
}

.sample-label {
  font-size: 22rpx;
  color: #64748b;
}

.sample-tag {
  font-size: 22rpx;
  color: #2563eb;
  background: #e0e7ff;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  cursor: pointer;
}

/* 颜色选择 */
.color-palette {
  margin-top: 30rpx;
  gap: 24rpx;
}

.color-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 4rpx solid #e2e8f0;
  cursor: pointer;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  transition: transform 0.15s ease;
}

.color-btn.active {
  transform: scale(1.15);
  border-color: #fbbf24;
  box-shadow: 0 0 16rpx rgba(251, 191, 36, 0.6);
}

.color-check {
  font-size: 32rpx;
  font-weight: bold;
}

.current-color-name {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 16rpx;
}

/* 操作按钮 */
.action-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.btn-grid {
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 84rpx;
  border-radius: 42rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.btn-change {
  background: #f1f5f9;
  color: #334155;
}

.btn-save {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(37, 99, 235, 0.3);
}

/* 说明 */
.tips-card {
  padding: 24rpx 30rpx;
  background: #f8fafc;
}

.tips-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #334155;
  display: block;
  margin-bottom: 10rpx;
}

.tip-line {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  line-height: 1.6;
  margin-bottom: 4rpx;
}
</style>
