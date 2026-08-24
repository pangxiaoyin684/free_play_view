<template>
  <view class="remover-container">
    <!-- 顶部横幅 -->
    <view class="tool-banner flex-between">
      <view class="banner-text">
        <text class="banner-title">✨ AI 智能消除与去水印</text>
        <text class="banner-sub">基于 Agnes 图像大模型，涂抹即消，智能重构修复背景</text>
      </view>
      <text class="banner-icon">🪄</text>
    </view>

    <!-- 主操作区：图片上传与画布涂抹 -->
    <view class="workspace-card card-box">
      <!-- 模式切换：涂抹模式 / 对比预览模式 -->
      <view v-if="currentImage" class="mode-bar flex-between">
        <view class="view-switch flex-center">
          <view 
            class="switch-btn" 
            :class="{ active: activeTab === 'brush' }"
            @click="activeTab = 'brush'"
          >
            ✏️ 涂抹消除
          </view>
          <view 
            v-if="resultImage"
            class="switch-btn" 
            :class="{ active: activeTab === 'compare' }"
            @click="activeTab = 'compare'"
          >
            👁️ 效果对比
          </view>
        </view>

        <view class="right-tools flex-center">
          <text class="tool-action-link" @click="resetBrush">重置涂抹</text>
          <text class="tool-action-link" @click="chooseImage">更换图片</text>
        </view>
      </view>

      <!-- 1. 未上传图片状态 -->
      <view v-if="!currentImage" class="upload-placeholder flex-column flex-center" @click="chooseImage">
        <view class="upload-icon-circle flex-center">
          <text class="upload-emoji">🖼️</text>
        </view>
        <text class="upload-tip">点击上传需要去水印或消除的图片</text>
        <text class="upload-sub">支持手机相册、拍照，PNG/JPG 格式</text>

        <view class="sample-box">
          <text class="sample-title">或快速体验预设示例：</text>
          <view class="sample-btns flex-center">
            <button class="sample-btn" @click.stop="useSample('watermark')">🌊 去除文字水印</button>
            <button class="sample-btn" @click.stop="useSample('passerby')">🚶 消除路人杂物</button>
          </view>
        </view>
      </view>

      <!-- 2. 涂抹画布区域 -->
      <view v-else-if="activeTab === 'brush'" class="canvas-editor-wrap flex-center">
        <view class="image-stage" :style="{ width: stageWidth + 'px', height: stageHeight + 'px' }">
          <image :src="currentImage" class="base-image" mode="aspectFit" />
          <canvas 
            canvas-id="maskCanvas" 
            id="maskCanvas" 
            class="mask-canvas"
            @touchstart="onDrawStart"
            @touchmove="onDrawMove"
            @touchend="onDrawEnd"
          ></canvas>
        </view>
      </view>

      <!-- 3. 修复对比视图 -->
      <view v-else-if="activeTab === 'compare'" class="compare-stage flex-column flex-center">
        <view class="compare-card">
          <text class="compare-tag tag-after">AI 修复后</text>
          <image :src="resultImage" class="compare-img" mode="aspectFit" />
        </view>
        <view class="compare-card" style="margin-top: 20rpx;">
          <text class="compare-tag tag-before">原图</text>
          <image :src="currentImage" class="compare-img" mode="aspectFit" />
        </view>
      </view>

      <!-- 画笔粗细调节 -->
      <view v-if="currentImage && activeTab === 'brush'" class="brush-controls flex-between">
        <text class="ctrl-label">笔刷粗细:</text>
        <slider 
          :value="brushSize" 
          @change="onBrushSizeChange" 
          min="5" 
          max="40" 
          activeColor="#7c3aed" 
          style="flex: 1; margin: 0 20rpx;"
        />
        <text class="size-val">{{ brushSize }}px</text>
      </view>
    </view>

    <!-- AI 消除操作指令与按钮 -->
    <view v-if="currentImage" class="action-card card-box">
      <view class="prompt-input-row flex-center">
        <text class="ai-badge">AI Agent</text>
        <input 
          v-model="aiPrompt" 
          placeholder="输入消除指令 (如：去除右下角水印/去除路人)" 
          class="prompt-input"
        />
      </view>

      <view class="btn-group flex-between">
        <button 
          class="btn-process flex-center" 
          :loading="isProcessing"
          :disabled="isProcessing"
          @click="startAiRemove"
        >
          <text class="btn-icon">🪄</text>
          <text>{{ isProcessing ? 'AI 深度重构修复中...' : '开始 AI 智能消除' }}</text>
        </button>

        <button 
          v-if="resultImage" 
          class="btn-save flex-center" 
          @click="saveResultImage"
        >
          💾 保存修复图片
        </button>
      </view>
    </view>

    <!-- 功能使用说明小卡片 -->
    <view class="guide-card card-box">
      <view class="guide-title flex-center">
        <text>💡 使用小技巧</text>
      </view>
      <text class="guide-item">1. 上传图片后，用手指涂抹需要消除的水印、杂物或路人区域（显示为半透明红色高亮）。</text>
      <text class="guide-item">2. 点击【开始 AI 智能消除】，AI 将分析周边材质并自动完成无痕纹理合成。</text>
      <text class="guide-item">3. 修复完毕后可点击【效果对比】查看前后变化，并保存到本地相册。</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAiRemoveWatermark } from '../../../api/ai'
import { soundManager } from '../../../utils/audio'

const currentImage = ref('')
const resultImage = ref('')
const activeTab = ref('brush')
const brushSize = ref(18)
const isProcessing = ref(false)
const aiPrompt = ref('智能消除选中区域水印并平滑填充背景')

const stageWidth = ref(320)
const stageHeight = ref(320)

let maskCtx = null
let isDrawing = false
let lastX = 0
let lastY = 0

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        currentImage.value = res.tempFilePaths[0]
        resultImage.value = ''
        activeTab.value = 'brush'
        soundManager.playPop()
        setTimeout(initMaskCanvas, 200)
      }
    }
  })
}

function useSample(type) {
  if (type === 'watermark') {
    currentImage.value = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    aiPrompt.value = '去除海滩图片中的半透明水印标记'
  } else {
    currentImage.value = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'
    aiPrompt.value = '消除多余杂物并与自然风景无痕融合'
  }
  resultImage.value = ''
  activeTab.value = 'brush'
  soundManager.playPop()
  setTimeout(initMaskCanvas, 200)
}

function initMaskCanvas() {
  // #ifdef H5
  const el = document.getElementById('maskCanvas')
  if (el) {
    const canvas = el.querySelector('canvas') || el
    canvas.width = stageWidth.value
    canvas.height = stageHeight.value
    maskCtx = canvas.getContext('2d')
  }
  // #endif
  // #ifndef H5
  maskCtx = uni.createCanvasContext('maskCanvas', this)
  // #endif
  resetBrush()
}

function onDrawStart(e) {
  isDrawing = true
  const touch = e.touches[0]
  lastX = touch.x || touch.clientX
  lastY = touch.y || touch.clientY
  drawPoint(lastX, lastY)
}

function onDrawMove(e) {
  if (!isDrawing) return
  const touch = e.touches[0]
  const curX = touch.x || touch.clientX
  const curY = touch.y || touch.clientY
  drawLine(lastX, lastY, curX, curY)
  lastX = curX
  lastY = curY
}

function onDrawEnd() {
  isDrawing = false
}

function drawPoint(x, y) {
  if (!maskCtx) return
  maskCtx.fillStyle = 'rgba(239, 68, 68, 0.65)'
  maskCtx.beginPath()
  maskCtx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2)
  maskCtx.fill()
  // #ifndef H5
  maskCtx.draw(true)
  // #endif
}

function drawLine(x1, y1, x2, y2) {
  if (!maskCtx) return
  maskCtx.strokeStyle = 'rgba(239, 68, 68, 0.65)'
  maskCtx.lineWidth = brushSize.value
  maskCtx.lineCap = 'round'
  maskCtx.lineJoin = 'round'
  maskCtx.beginPath()
  maskCtx.moveTo(x1, y1)
  maskCtx.lineTo(x2, y2)
  maskCtx.stroke()
  // #ifndef H5
  maskCtx.draw(true)
  // #endif
}

function resetBrush() {
  if (!maskCtx) return
  // #ifdef H5
  if (maskCtx.clearRect) {
    maskCtx.clearRect(0, 0, stageWidth.value, stageHeight.value)
  }
  // #endif
  // #ifndef H5
  maskCtx.clearRect(0, 0, stageWidth.value, stageHeight.value)
  maskCtx.draw()
  // #endif
  soundManager.playPop()
}

function onBrushSizeChange(e) {
  brushSize.value = e.detail.value
}

async function startAiRemove() {
  if (!currentImage.value) {
    uni.showToast({ title: '请先上传图片', icon: 'none' })
    return
  }
  isProcessing.value = true
  soundManager.playLaser()

  try {
    const res = await apiAiRemoveWatermark({
      imageUrl: currentImage.value,
      maskArea: 'masked',
      prompt: aiPrompt.value
    })
    resultImage.value = res.resultUrl
    activeTab.value = 'compare'
    soundManager.playCoin()
    uni.showToast({ title: 'AI 消除修复成功！', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '处理失败，请重试', icon: 'none' })
  } finally {
    isProcessing.value = false
  }
}

function saveResultImage() {
  if (!resultImage.value) return
  soundManager.playCoin()
  // #ifdef H5
  const link = document.createElement('a')
  link.href = resultImage.value
  link.download = 'ai_repaired_image.png'
  link.click()
  uni.showToast({ title: '已开始下载修复图片', icon: 'success' })
  // #endif
  // #ifndef H5
  uni.saveImageToPhotosAlbum({
    filePath: resultImage.value,
    success: () => {
      uni.showToast({ title: '已保存至手机相册', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '保存失败或未授予相册权限', icon: 'none' })
    }
  })
  // #endif
}
</script>

<style scoped>
.remover-container {
  padding: 24rpx;
  min-height: 100vh;
  background: #f5f3ff;
}

.tool-banner {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  padding: 32rpx;
  border-radius: 28rpx;
  color: #ffffff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(124, 58, 237, 0.25);
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

/* 工作台 */
.workspace-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.mode-bar {
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f1f5f9;
}

.view-switch {
  background: #f1f5f9;
  border-radius: 24rpx;
  padding: 4rpx;
}

.switch-btn {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #64748b;
  border-radius: 20rpx;
  cursor: pointer;
}

.switch-btn.active {
  background: #7c3aed;
  color: #ffffff;
  font-weight: bold;
}

.right-tools {
  gap: 16rpx;
}

.tool-action-link {
  font-size: 22rpx;
  color: #7c3aed;
  cursor: pointer;
}

/* 上传占位 */
.upload-placeholder {
  padding: 60rpx 30rpx;
  border: 4rpx dashed #ddd6fe;
  border-radius: 24rpx;
  background: #faf5ff;
  cursor: pointer;
}

.upload-icon-circle {
  width: 120rpx;
  height: 120rpx;
  background: #ede9fe;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.upload-emoji {
  font-size: 56rpx;
}

.upload-tip {
  font-size: 28rpx;
  font-weight: bold;
  color: #4c1d95;
  margin-bottom: 6rpx;
}

.upload-sub {
  font-size: 22rpx;
  color: #8b5cf6;
}

.sample-box {
  margin-top: 36rpx;
  text-align: center;
}

.sample-title {
  font-size: 22rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 12rpx;
}

.sample-btns {
  gap: 16rpx;
}

.sample-btn {
  background: #ffffff;
  border: 2rpx solid #c4b5fd;
  color: #6d28d9;
  font-size: 22rpx;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  margin: 0;
}

/* 画布舞台 */
.canvas-editor-wrap {
  width: 100%;
  overflow: hidden;
  padding: 10rpx 0;
}

.image-stage {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  background: #000000;
}

.base-image {
  width: 100%;
  height: 100%;
  display: block;
}

.mask-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}

/* 对比视图 */
.compare-stage {
  width: 100%;
}

.compare-card {
  width: 100%;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.compare-img {
  width: 100%;
  height: 360rpx;
  display: block;
  background: #000000;
}

.compare-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  padding: 4rpx 16rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
  z-index: 10;
}

.tag-after {
  background: #10b981;
}

.tag-before {
  background: #64748b;
}

/* 画笔调节 */
.brush-controls {
  margin-top: 24rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f1f5f9;
}

.ctrl-label {
  font-size: 24rpx;
  color: #64748b;
}

.size-val {
  font-size: 24rpx;
  font-weight: bold;
  color: #7c3aed;
}

/* 操作面板 */
.action-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.prompt-input-row {
  background: #f1f5f9;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  margin-bottom: 20rpx;
}

.ai-badge {
  background: #7c3aed;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  margin-right: 12rpx;
}

.prompt-input {
  flex: 1;
  height: 68rpx;
  font-size: 24rpx;
  color: #1e293b;
}

.btn-group {
  gap: 16rpx;
}

.btn-process {
  flex: 1;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  height: 84rpx;
  border-radius: 42rpx;
  border: none;
  box-shadow: 0 6rpx 18rpx rgba(124, 58, 237, 0.3);
}

.btn-save {
  background: #10b981;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
  height: 84rpx;
  padding: 0 28rpx;
  border-radius: 42rpx;
  border: none;
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

/* 说明 */
.guide-card {
  padding: 24rpx 30rpx;
  background: #faf5ff;
  border: 2rpx solid #ede9fe;
}

.guide-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #6d28d9;
  margin-bottom: 12rpx;
  justify-content: flex-start;
}

.guide-item {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  line-height: 1.6;
  margin-bottom: 6rpx;
}
</style>
