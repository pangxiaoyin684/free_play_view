<template>
  <view class="tools-container">
    <!-- 顶部极简 Banner -->
    <view class="tool-banner flex-between">
      <view class="banner-text">
        <view class="banner-badge flex-center">
          <text class="badge-dot"></text>
          <text class="badge-title-txt">效率 · AI · 节日</text>
        </view>
        <text class="banner-title">多功能生活百宝箱</text>
        <text class="banner-sub">AI 图像创作、中秋深情告白与日常决策工具</text>
      </view>
      <view class="banner-icon-wrap flex-center">
        <text class="banner-icon-txt">✨</text>
      </view>
    </view>

    <!-- 横向滚动分类胶囊栏 (单行不换行、防压缩、自适应宽) -->
    <scroll-view class="category-scroll-view" scroll-x="true" :show-scrollbar="false">
      <view class="category-tabs-inner">
        <view 
          v-for="cat in categories" 
          :key="cat.id" 
          class="cat-item" 
          :class="{ active: currentCategory === cat.id }"
          @click="currentCategory = cat.id"
        >
          <text class="cat-name">{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 工具卡片标准 2 列网格 -->
    <view class="tools-grid">
      <view 
        v-for="tool in filteredTools" 
        :key="tool.id" 
        class="tool-card card-box"
        @click="openTool(tool)"
      >
        <view class="tool-top-row flex-between">
          <view class="tool-icon-box flex-center" :style="{ background: tool.bgSoft }">
            <text class="tool-icon">{{ tool.icon }}</text>
          </view>
          <text class="badge-tag" :class="tool.tagClass">{{ tool.tag }}</text>
        </view>

        <view class="tool-body">
          <text class="tool-name">{{ tool.name }}</text>
          <text class="tool-desc">{{ tool.desc }}</text>
        </view>

        <view class="tool-footer flex-between">
          <text class="enter-text">立即使用</text>
          <text class="arrow-icon">→</text>
        </view>
      </view>
    </view>

    <!-- 底部建议卡片 -->
    <view class="feedback-card card-box flex-between" @click="suggestTool">
      <view class="feedback-left flex-center">
        <view class="bulb-circle flex-center">
          <text class="bulb-icon">💡</text>
        </view>
        <view>
          <text class="feedback-title">需要更多定制工具或 AI 玩法？</text>
          <text class="feedback-sub">持续拓展中，点击告诉我们你的想法</text>
        </view>
      </view>
      <text class="feedback-arrow">→</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { checkAuthGuard } from '../../../utils/auth-guard'
import { soundManager } from '../../../utils/audio'

const currentCategory = ref('all')

const categories = [
  { id: 'all', name: '全部工具' },
  { id: 'festival', name: '浪漫节日' },
  { id: 'ai', name: 'AI 图像' },
  { id: 'daily', name: '趣味决策' },
  { id: 'time', name: '时间效率' },
  { id: 'memo', name: '便签备忘' }
]

const toolsList = [
  {
    id: 'mid-autumn-love',
    category: 'festival',
    name: '中秋玉兔告白',
    icon: '🥮',
    desc: '萌兔祝贺、情书生成、孔明灯向她浪漫表白',
    bgSoft: '#fdf2f8',
    path: '/pages/tools/mid-autumn-love/index',
    tag: '浪漫',
    tagClass: 'badge-danger'
  },
  {
    id: 'ai-remover',
    category: 'ai',
    name: 'AI 消除与去水印',
    icon: '🪄',
    desc: '涂抹即消！基于 Agnes 图像模型智能补全背景',
    bgSoft: '#f5f3ff',
    path: '/pages/tools/ai-remover/index',
    tag: 'AI 模型',
    tagClass: 'badge-primary'
  },
  {
    id: 'id-photo',
    category: 'ai',
    name: 'AI 智能证件照',
    icon: '📸',
    desc: '一寸/二寸/考研规格，智能抠图一键换红蓝白底',
    bgSoft: '#eff6ff',
    path: '/pages/tools/id-photo/index',
    tag: '热门',
    tagClass: 'badge-primary'
  },
  {
    id: 'dice',
    category: 'daily',
    name: '欢乐摇骰子',
    icon: '🎲',
    desc: '聚会酒桌必备！1~6颗骰子、3D翻滚与音效',
    bgSoft: '#fef2f2',
    path: '/pages/tools/dice/index',
    tag: '聚会',
    tagClass: 'badge-warning'
  },
  {
    id: 'decision-wheel',
    category: 'daily',
    name: '命运大转盘',
    icon: '🎯',
    desc: '今天吃什么、谁去跑腿？转盘一转告别纠结！',
    bgSoft: '#fffbeb',
    path: '/pages/tools/decision-wheel/index',
    tag: '趣味',
    tagClass: 'badge-warning'
  },
  {
    id: 'countdown',
    category: 'time',
    name: '倒数纪念日',
    icon: '⏳',
    desc: '记录重要日程、恋爱纪念日与发薪倒数',
    bgSoft: '#eef2ff',
    path: '/pages/tools/countdown/index',
    tag: '效率',
    tagClass: 'badge-neutral'
  },
  {
    id: 'memo',
    category: 'memo',
    name: '便签备忘录',
    icon: '📝',
    desc: '灵感清单、待办随手记、随时打勾完成',
    bgSoft: '#f0fdf4',
    path: '/pages/tools/memo/index',
    tag: '轻量',
    tagClass: 'badge-success'
  }
]

const filteredTools = computed(() => {
  if (currentCategory.value === 'all') return toolsList
  return toolsList.filter(t => t.category === currentCategory.value)
})

function openTool(tool) {
  soundManager.playPop()
  if (!checkAuthGuard(tool.path)) return
  uni.navigateTo({
    url: tool.path
  })
}

function suggestTool() {
  uni.showModal({
    title: '百宝箱持续扩展中',
    content: '已支持中秋玉兔告白、AI 消除与去水印、智能证件照换底、摇骰子、命运大转盘、倒数纪念日与便签！',
    showCancel: false,
    confirmText: '收到'
  })
}
</script>

<style scoped>
.tools-container {
  padding: 24rpx;
  min-height: 100vh;
}

/* 顶部 Banner */
.tool-banner {
  background: #0f172a;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  color: #ffffff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.15);
}

.banner-badge {
  background: rgba(255, 255, 255, 0.12);
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  display: inline-flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.badge-dot {
  width: 8rpx;
  height: 8rpx;
  background: #38bdf8;
  border-radius: 50%;
}

.badge-title-txt {
  font-size: 18rpx;
  color: #e2e8f0;
  font-weight: 500;
}

.banner-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #f8fafc;
  display: block;
  margin-bottom: 4rpx;
}

.banner-sub {
  font-size: 22rpx;
  color: #94a3b8;
  display: block;
}

.banner-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.banner-icon-txt {
  font-size: 48rpx;
}

/* 横向单行平滑滚动分类栏 */
.category-scroll-view {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.category-tabs-inner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 4rpx 2rpx;
}

.cat-item {
  flex-shrink: 0;
  height: 64rpx;
  padding: 0 28rpx;
  background: #ffffff;
  border-radius: 32rpx;
  border: 1rpx solid #e5e6eb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.cat-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #4e5969;
  white-space: nowrap;
  line-height: 1;
  display: block;
}

.cat-item.active {
  background: #4f46e5;
  border-color: #4f46e5;
  box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.25);
}

.cat-item.active .cat-name {
  color: #ffffff;
  font-weight: 600;
}

/* 工具网格卡片 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.tool-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  margin-bottom: 0;
  cursor: pointer;
}

.tool-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e5e6eb;
}

.tool-icon {
  font-size: 42rpx;
}

.tool-body {
  margin: 16rpx 0 14rpx;
}

.tool-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
}

.tool-desc {
  font-size: 20rpx;
  color: #86909c;
  margin-top: 4rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tool-footer {
  border-top: 1rpx solid #f2f3f5;
  padding-top: 10rpx;
}

.enter-text {
  font-size: 20rpx;
  color: #86909c;
}

.arrow-icon {
  font-size: 24rpx;
  color: #4f46e5;
  font-weight: bold;
}

/* 底部反馈卡片 */
.feedback-card {
  background: #f8fafc;
  border: 1rpx dashed #cbd5e1;
  padding: 20rpx 24rpx;
  cursor: pointer;
}

.bulb-circle {
  width: 60rpx;
  height: 60rpx;
  background: #eef2ff;
  border-radius: 50%;
  margin-right: 16rpx;
}

.bulb-icon {
  font-size: 30rpx;
}

.feedback-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
}

.feedback-sub {
  font-size: 20rpx;
  color: #86909c;
}

.feedback-arrow {
  font-size: 28rpx;
  color: #86909c;
}
</style>
