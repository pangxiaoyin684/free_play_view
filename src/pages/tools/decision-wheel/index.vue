<template>
  <view class="wheel-page-container">
    <!-- 顶部预设模板切换 (单行防挤压胶囊) -->
    <view class="preset-selector flex-between">
      <view 
        v-for="(tpl, idx) in templates" 
        :key="idx"
        class="preset-item flex-center"
        :class="{ active: currentTemplateIndex === idx }"
        @click="selectTemplate(idx)"
      >
        <text class="preset-txt">{{ tpl.name }}</text>
      </view>
    </view>

    <!-- 转盘主体区域 -->
    <view class="wheel-wrapper flex-center">
      <!-- 顶部指示指针 (12 点钟方向) -->
      <view class="pointer-wrapper">
        <view class="pointer-arrow"></view>
      </view>

      <!-- 外圈立体金色装饰环 -->
      <view class="outer-gold-ring flex-center">
        <!-- 旋转主体圆盘 -->
        <view 
          class="wheel-disc"
          :style="{ 
            background: conicGradientStyle,
            transform: `rotate(${currentRotation}deg)`,
            transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.15, 0.95, 0.35, 1)` : 'none'
          }"
        >
          <!-- 扇形白色分割线 -->
          <view 
            v-for="(lineDeg, lIdx) in splitLines" 
            :key="'line-' + lIdx"
            class="wheel-split-line"
            :style="{ transform: `rotate(${lineDeg}deg)` }"
          ></view>

          <!-- 100% 极坐标居中文字列表 -->
          <view 
            v-for="(item, tIdx) in textItems" 
            :key="'text-' + tIdx"
            class="wheel-text-slot flex-center"
            :style="{ transform: `rotate(${item.rotateDeg}deg) translateY(-170rpx)` }"
          >
            <text 
              class="wheel-label" 
              :style="{ fontSize: item.fontSize }"
            >
              {{ item.text }}
            </text>
          </view>
        </view>

        <!-- 中心点击抽奖按钮 -->
        <view class="center-btn flex-center" hover-class="btn-hover" @click="startSpin">
          <text class="center-btn-text">{{ isSpinning ? '🎲' : '抽！' }}</text>
        </view>
      </view>
    </view>

    <!-- 抽中结果展示卡片 -->
    <view v-if="resultText" class="result-banner card-box flex-center">
      <text class="result-label">最终决定结果：</text>
      <text class="result-content">{{ resultText }}</text>
    </view>

    <!-- 选项自定义管理面板 -->
    <view class="options-manager card-box">
      <view class="manager-header flex-between">
        <text class="manager-title">📝 选项列表 ({{ options.length }})</text>
        <button class="btn-add flex-center" @click="addNewOption">+ 添加选项</button>
      </view>

      <view class="tags-container">
        <view 
          v-for="(opt, idx) in options" 
          :key="idx"
          class="option-tag flex-center"
        >
          <text class="tag-text">{{ opt }}</text>
          <text v-if="options.length > 2" class="tag-del" @click="removeOption(idx)">✕</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { soundManager } from '../../../utils/audio'

const segmentColors = [
  '#f87171', '#fb923c', '#fbbf24', '#34d399', 
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6'
]

const templates = [
  { name: '🍲 今天吃什么', items: ['火锅', '烧烤', '轻食沙拉', '汉堡炸鸡', '麻辣烫', '日料寿司'] },
  { name: '🙋 谁去跑腿', items: ['我去', '你去', '猜拳定', '抛硬币', '最后说话的人', '大家一起去'] },
  { name: '🎲 幸运大冒险', items: ['真心话', '喝一杯', '唱首歌', '做5个俯卧撑', '免受惩罚', '模仿秀'] }
]

const currentTemplateIndex = ref(0)
const options = ref([...templates[0].items])

const isSpinning = ref(false)
const currentRotation = ref(0)
const spinDuration = ref(4)
const resultText = ref('')

const conicGradientStyle = computed(() => {
  const N = options.value.length
  if (N === 0) return '#f59e0b'
  const step = 360 / N
  const half = step / 2
  const parts = []
  for (let i = 0; i < N; i++) {
    const color = segmentColors[i % segmentColors.length]
    const fromDeg = (i * step).toFixed(2)
    const toDeg = ((i + 1) * step).toFixed(2)
    parts.push(`${color} ${fromDeg}deg ${toDeg}deg`)
  }
  return `conic-gradient(from -${half}deg, ${parts.join(', ')})`
})

const splitLines = computed(() => {
  const N = options.value.length
  if (N === 0) return []
  const step = 360 / N
  const half = step / 2
  const lines = []
  for (let i = 0; i < N; i++) {
    lines.push(i * step - half)
  }
  return lines
})

const textItems = computed(() => {
  const N = options.value.length
  if (N === 0) return []
  const step = 360 / N

  return options.value.map((opt, i) => {
    return {
      text: opt,
      rotateDeg: i * step,
      fontSize: opt.length > 5 ? '20rpx' : opt.length > 4 ? '22rpx' : '25rpx'
    }
  })
})

function selectTemplate(idx) {
  if (isSpinning.value) return
  currentTemplateIndex.value = idx
  options.value = [...templates[idx].items]
  resultText.value = ''
  currentRotation.value = 0
  soundManager.playPop()
}

function startSpin() {
  if (isSpinning.value || options.value.length === 0) return

  isSpinning.value = true
  resultText.value = ''
  soundManager.playLaser()

  const len = options.value.length
  const step = 360 / len
  const targetIndex = Math.floor(Math.random() * len)

  const fullRounds = 5 + Math.floor(Math.random() * 3)
  const targetAngle = 360 - (targetIndex * step)
  const nextRotation = currentRotation.value + (fullRounds * 360) + targetAngle - (currentRotation.value % 360)

  currentRotation.value = nextRotation

  const soundInterval = setInterval(() => {
    soundManager.playTone(600, 'sine', 0.03, 0.05)
  }, 180)

  setTimeout(() => {
    clearInterval(soundInterval)
    isSpinning.value = false
    resultText.value = options.value[targetIndex]
    soundManager.playCoin()
    uni.showToast({
      title: `决定了: ${resultText.value}!`,
      icon: 'none'
    })
  }, spinDuration.value * 1000)
}

function addNewOption() {
  uni.showModal({
    title: '添加新选项',
    editable: true,
    placeholderText: '请输入选项名称',
    success: (res) => {
      if (res.confirm && res.content && res.content.trim()) {
        options.value.push(res.content.trim())
        soundManager.playPop()
      }
    }
  })
}

function removeOption(idx) {
  if (options.value.length <= 2) {
    uni.showToast({ title: '至少保留2个选项', icon: 'none' })
    return
  }
  options.value.splice(idx, 1)
  soundManager.playPop()
}
</script>

<style scoped>
.wheel-page-container {
  padding: 24rpx;
  min-height: 100vh;
  background: #f7f8fa;
}

.preset-selector {
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.preset-item {
  flex: 1;
  background: #ffffff;
  height: 64rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e5e6eb;
  cursor: pointer;
}

.preset-txt {
  font-size: 22rpx;
  color: #4e5969;
  font-weight: 500;
  white-space: nowrap;
}

.preset-item.active {
  background: #4f46e5;
  border-color: #4f46e5;
}

.preset-item.active .preset-txt {
  color: #ffffff;
  font-weight: 600;
}

/* 转盘区域 */
.wheel-wrapper {
  position: relative;
  width: 580rpx;
  height: 580rpx;
  margin: 20rpx auto 30rpx;
}

.pointer-wrapper {
  position: absolute;
  top: -18rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
}

.pointer-arrow {
  width: 0;
  height: 0;
  border-left: 18rpx solid transparent;
  border-right: 18rpx solid transparent;
  border-top: 40rpx solid #ef4444;
  filter: drop-shadow(0 4rpx 6rpx rgba(0, 0, 0, 0.2));
}

.outer-gold-ring {
  width: 560rpx;
  height: 560rpx;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 10rpx 30rpx rgba(245, 158, 11, 0.25);
  border: 10rpx solid #fbbf24;
  position: relative;
}

.wheel-disc {
  width: 520rpx;
  height: 520rpx;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.wheel-split-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2rpx;
  height: 50%;
  background: #ffffff;
  transform-origin: bottom center;
}

.wheel-text-slot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 180rpx;
  height: 44rpx;
  margin-left: -90rpx;
  margin-top: -22rpx;
  transform-origin: center center;
  pointer-events: none;
}

.wheel-label {
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.4);
}

.center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  background: #ffffff;
  border: 6rpx solid #f59e0b;
  border-radius: 50%;
  z-index: 25;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.center-btn-text {
  font-size: 34rpx;
  font-weight: 800;
  color: #b45309;
}

.result-banner {
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.result-label {
  font-size: 24rpx;
  color: #4e5969;
}

.result-content {
  font-size: 30rpx;
  font-weight: 700;
  color: #ea580c;
  margin-left: 8rpx;
}

.options-manager {
  padding: 24rpx;
}

.manager-header {
  margin-bottom: 20rpx;
}

.manager-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1d2129;
}

.btn-add {
  background: #f2f3f5;
  color: #4f46e5;
  font-size: 22rpx;
  font-weight: 600;
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  border: none;
  margin: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.option-tag {
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #1d2129;
}

.tag-del {
  margin-left: 10rpx;
  color: #86909c;
  font-size: 20rpx;
  cursor: pointer;
}
</style>
