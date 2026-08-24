<template>
  <view class="mid-autumn-container">
    <!-- 顶部月夜星空与玉兔互动舞台 -->
    <view class="moon-stage flex-column flex-center">
      <!-- 皎洁圆月与光晕 -->
      <view class="full-moon-halo flex-center">
        <view class="full-moon flex-center">
          <text class="moon-crater">🌕</text>
        </view>
      </view>

      <!-- 动态飘浮孔明灯 -->
      <view v-for="l in lanterns" :key="l.id" class="lantern-item" :style="{ left: l.x + '%', top: l.y + '%' }">
        <text class="lantern-icon">🏮</text>
        <text v-if="l.text" class="lantern-msg">{{ l.text }}</text>
      </view>

      <!-- 萌兔互动区 -->
      <view class="rabbit-card flex-center" @click="interactWithRabbit">
        <view class="rabbit-avatar flex-center" :class="{ 'bounce-anim': isRabbitBouncing }">
          <text class="rabbit-emoji">{{ rabbitEmoji }}</text>
        </view>
        <view class="rabbit-bubble">
          <text class="rabbit-quote">{{ currentRabbitQuote }}</text>
        </view>
      </view>
    </view>

    <!-- 定制表白与祝福卡片 -->
    <view class="love-letter-card card-box">
      <view class="card-header flex-between">
        <text class="section-title">💌 定制中秋深情告白</text>
        <text class="tag-romantic">浪漫唯美</text>
      </view>

      <!-- 称谓与落款输入 -->
      <view class="names-row flex-between">
        <view class="input-wrap">
          <text class="input-label">写给（TA的称呼）：</text>
          <input v-model="targetName" placeholder="如：小仙女 / 宝贝" class="text-input" />
        </view>
        <view class="input-wrap">
          <text class="input-label">落款（你的名字）：</text>
          <input v-model="senderName" placeholder="如：爱你的男孩" class="text-input" />
        </view>
      </view>

      <!-- 表白风格选择 Tabs (单行均匀分布) -->
      <view class="style-tabs flex-between">
        <view 
          v-for="st in STYLES" 
          :key="st.id" 
          class="style-tab-item"
          :class="{ active: selectedStyleId === st.id }"
          @click="selectStyle(st)"
        >
          <text class="style-name">{{ st.name }}</text>
        </view>
      </view>

      <!-- 表白信内容编辑区 -->
      <view class="letter-content-box">
        <textarea 
          v-model="letterContent" 
          class="letter-textarea" 
          maxlength="300"
          placeholder="写下你想对她说的真心话..."
        />
        <text class="word-count">{{ letterContent.length }}/300 字</text>
      </view>

      <!-- 快捷按钮 -->
      <view class="action-btn-row flex-between">
        <button class="btn btn-lantern flex-center" @click="releaseLantern">
          🏮 放飞心愿孔明灯
        </button>
        <button class="btn btn-copy flex-center" @click="copyLetterText">
          📋 复制表白文案
        </button>
      </view>
    </view>

    <!-- 精美中秋表白贺卡预览区 -->
    <view class="postcard-preview card-box flex-column flex-center">
      <view class="postcard-inner flex-column">
        <view class="postcard-head flex-between">
          <text class="postcard-to">Dear {{ targetName || '心动的你' }}：</text>
          <text class="postcard-stamp">🥮 中秋特辑</text>
        </view>

        <text class="postcard-body">{{ letterContent }}</text>

        <view class="postcard-footer flex-between">
          <text class="postcard-seal">🐰 玉兔呈祥 · 阖家圆满</text>
          <text class="postcard-from">—— {{ senderName || '愿与你共度良辰之人' }}</text>
        </view>
      </view>

      <button class="btn-share-card flex-center" @click="savePostcard">
        🎁 保存 / 发送中秋浪漫心意
      </button>
    </view>

    <!-- 中秋浪漫诗词赏析 -->
    <view class="poetry-card card-box">
      <text class="poetry-title">🎑 经典中秋传情诗句</text>
      <text class="poetry-item">“今夜月色真美，风也温柔，而我恰好在想你。”</text>
      <text class="poetry-item">“愿我如星君如月，夜夜流光相皎洁。”</text>
      <text class="poetry-item">“千江有水千江月，万里无云万里天，我心唯你一人。”</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { soundManager } from '../../../utils/audio'

const targetName = ref('小仙女')
const senderName = ref('你的大男孩')
const selectedStyleId = ref('romantic')
const isRabbitBouncing = ref(false)
const rabbitEmoji = ref('🐇')

const RABBIT_QUOTES = [
  '月宫的小兔子说：这世上所有的甜，都不及你笑起来的甜！🐰',
  '月亮很远，但你很近。愿以后的每一个中秋，都有你相伴！🌕',
  '玉兔给你捧来了流心爱心月饼，祝我的女孩天天开心！🥮',
  '海上生明月，天涯共此时。愿我如星君如月，夜夜流光相皎洁！✨',
  '愿你岁岁常欢愉，万事皆胜意，月圆人团圆！💕'
]
const currentRabbitQuote = ref(RABBIT_QUOTES[0])

const STYLES = [
  {
    id: 'romantic',
    name: '💕 深情告白',
    template: (to, from) => `亲爱的${to}：\n月亮很远，但你很近。今夜月色真美，不知可否邀你共赏往后余生的每一轮明月？这世间美景万千，都不及你眼底的星河璀璨。中秋快乐，我的女孩！\n—— ${from}`
  },
  {
    id: 'sweet',
    name: '🍬 可爱甜宠',
    template: (to, from) => `${to}宝贝：\n月宫的小玉兔偷偷下凡告诉我：世间所有的五仁月饼、流心奶黄，都不及你笑起来的一半甜！中秋节要吃甜甜的月饼，更要天天开心，有我一直在你身边守护你！\n—— ${from}`
  },
  {
    id: 'poetic',
    name: '🌸 诗意古风',
    template: (to, from) => `致${to}：\n海上生明月，天涯共此时。千江有水千江月，万里无云万里天。愿我如星君如月，夜夜流光相皎洁。但愿人长久，千里共婵娟。\n—— ${from}`
  },
  {
    id: 'wish',
    name: '🥂 温馨祝愿',
    template: (to, from) => `${to}：\n中秋佳节至，月圆人团圆。愿你心中所念皆如所愿，岁岁常欢愉，万事皆胜意。天凉记得添衣，愿幸福如月光般常伴你身旁！\n—— ${from}`
  }
]

const letterContent = ref(STYLES[0].template(targetName.value, senderName.value))

const lanterns = ref([
  { id: 1, x: 15, y: 35, text: '心想事成' },
  { id: 2, x: 75, y: 25, text: '唯你一人' },
  { id: 3, x: 45, y: 55, text: '中秋团圆' }
])

function selectStyle(st) {
  selectedStyleId.value = st.id
  letterContent.value = st.template(targetName.value || '你', senderName.value || '我')
  soundManager.playPop()
}

function interactWithRabbit() {
  isRabbitBouncing.value = true
  soundManager.playCoin()
  const emojis = ['🐇', '🐰', '💖', '🥮', '🌸']
  rabbitEmoji.value = emojis[Math.floor(Math.random() * emojis.length)]
  const qIdx = Math.floor(Math.random() * RABBIT_QUOTES.length)
  currentRabbitQuote.value = RABBIT_QUOTES[qIdx]
  setTimeout(() => {
    isRabbitBouncing.value = false
  }, 600)
}

function releaseLantern() {
  soundManager.playTone(520, 'sine', 0.25)
  const newLantern = {
    id: Date.now(),
    x: Math.floor(Math.random() * 70) + 15,
    y: 80,
    text: `爱${targetName.value || '她'}`
  }
  lanterns.value.push(newLantern)
  uni.showToast({ title: '🏮 孔明灯已携心愿升空！', icon: 'success' })
}

function copyLetterText() {
  soundManager.playPop()
  uni.setClipboardData({
    data: letterContent.value,
    success: () => {
      uni.showToast({ title: '表白文案已复制！', icon: 'success' })
    }
  })
}

function savePostcard() {
  soundManager.playCoin()
  uni.showModal({
    title: '💌 中秋心意已生成',
    content: `已准备好写给【${targetName.value}】的中秋告白贺卡！点击确定直接复制全文，方便一键微信发送给TA！`,
    confirmText: '立即复制',
    success: (res) => {
      if (res.confirm) {
        copyLetterText()
      }
    }
  })
}
</script>

<style scoped>
.mid-autumn-container {
  padding: 24rpx;
  min-height: 100vh;
  background: #0f172a;
}

/* 月夜舞台 */
.moon-stage {
  position: relative;
  height: 360rpx;
  background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 100%);
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.full-moon-halo {
  position: absolute;
  top: 24rpx;
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, transparent 70%);
}

.full-moon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #fef08a;
  box-shadow: 0 0 30rpx #fef08a;
}

.moon-crater {
  font-size: 72rpx;
}

/* 孔明灯 */
.lantern-item {
  position: absolute;
  animation: floatUp 6s infinite ease-in-out alternate;
}

@keyframes floatUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-24rpx); }
}

.lantern-icon {
  font-size: 32rpx;
}

.lantern-msg {
  font-size: 16rpx;
  color: #fef08a;
  background: rgba(0, 0, 0, 0.5);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  margin-left: 4rpx;
}

/* 萌兔交互 */
.rabbit-card {
  position: absolute;
  bottom: 16rpx;
  left: 20rpx;
  right: 20rpx;
  gap: 14rpx;
  cursor: pointer;
}

.rabbit-avatar {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  border: 2rpx solid #fde047;
}

.bounce-anim {
  animation: bounce 0.4s ease infinite alternate;
}

@keyframes bounce {
  from { transform: scale(1) translateY(0); }
  to { transform: scale(1.15) translateY(-8rpx); }
}

.rabbit-emoji {
  font-size: 46rpx;
}

.rabbit-bubble {
  flex: 1;
  background: #ffffff;
  padding: 12rpx 18rpx;
  border-radius: 16rpx;
}

.rabbit-quote {
  font-size: 22rpx;
  color: #1e1b4b;
  font-weight: 500;
  display: block;
}

/* 表白信卡片 */
.love-letter-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.card-header {
  margin-bottom: 18rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1d2129;
}

.tag-romantic {
  font-size: 18rpx;
  color: #ec4899;
  background: #fdf2f8;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 600;
}

.names-row {
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.input-wrap {
  flex: 1;
}

.input-label {
  font-size: 22rpx;
  color: #86909c;
  display: block;
  margin-bottom: 6rpx;
}

.text-input {
  height: 72rpx;
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  color: #1d2129;
}

/* 风格 Tabs */
.style-tabs {
  gap: 10rpx;
  margin-bottom: 18rpx;
}

.style-tab-item {
  flex: 1;
  height: 60rpx;
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.style-name {
  font-size: 22rpx;
  font-weight: 500;
  color: #4e5969;
  white-space: nowrap;
}

.style-tab-item.active {
  background: #4f46e5;
  border-color: #4f46e5;
}

.style-tab-item.active .style-name {
  color: #ffffff;
  font-weight: 600;
}

/* 编辑文本区 */
.letter-content-box {
  position: relative;
  background: #fdf2f8;
  border: 1rpx solid #fbcfe8;
  border-radius: 16rpx;
  padding: 18rpx;
  margin-bottom: 18rpx;
}

.letter-textarea {
  width: 100%;
  height: 180rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #831843;
}

.word-count {
  font-size: 18rpx;
  color: #f472b6;
  text-align: right;
  display: block;
}

.action-btn-row {
  gap: 14rpx;
}

.btn {
  flex: 1;
  height: 76rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  border: none;
}

.btn-lantern {
  background: #f59e0b;
  color: #ffffff;
}

.btn-copy {
  background: #4f46e5;
  color: #ffffff;
}

/* 贺卡预览 */
.postcard-preview {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.postcard-inner {
  width: 100%;
  background: #fffdf0;
  border: 2rpx dashed #fde68a;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
}

.postcard-head {
  border-bottom: 1rpx solid #fef3c7;
  padding-bottom: 10rpx;
  margin-bottom: 14rpx;
}

.postcard-to {
  font-size: 26rpx;
  font-weight: 700;
  color: #92400e;
}

.postcard-stamp {
  font-size: 18rpx;
  background: #fef3c7;
  color: #b45309;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 600;
}

.postcard-body {
  font-size: 24rpx;
  line-height: 1.7;
  color: #78350f;
  white-space: pre-wrap;
  min-height: 100rpx;
}

.postcard-footer {
  border-top: 1rpx solid #fef3c7;
  padding-top: 12rpx;
  margin-top: 16rpx;
}

.postcard-seal {
  font-size: 18rpx;
  color: #d97706;
}

.postcard-from {
  font-size: 22rpx;
  font-weight: 700;
  color: #92400e;
}

.btn-share-card {
  width: 100%;
  height: 80rpx;
  border-radius: 16rpx;
  background: #10b981;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
}

/* 诗词 */
.poetry-card {
  padding: 20rpx 24rpx;
  background: #18181b;
  border: 1rpx solid #27272a;
}

.poetry-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #fbbf24;
  display: block;
  margin-bottom: 8rpx;
}

.poetry-item {
  font-size: 20rpx;
  color: #a1a1aa;
  display: block;
  line-height: 1.6;
  margin-bottom: 6rpx;
}
</style>
