<template>
  <view class="plane-game-container">
    <!-- 顶部状态栏 (显示无尽波次、得分、生命❤️、火力等级与排行榜入口) -->
    <game-header 
      title="全民飞机大战" 
      :score="score" 
      :wave="currentWave"
      :lives="lives" 
      @pause="togglePause"
      @openRank="showRankModal = true"
    />

    <!-- 战机机库与火力状态栏 -->
    <view class="fighter-bar flex-between">
      <view class="current-fighter flex-center" @click="showFighterSelect = true">
        <text class="fighter-icon-preview">{{ currentPlane.icon }}</text>
        <view class="fighter-text-info">
          <view class="flex-center" style="justify-content: flex-start; gap: 8rpx;">
            <text class="fighter-name">{{ currentPlane.name }}</text>
            <text class="power-level-tag">火力 Lv.{{ powerLevel }}</text>
          </view>
          <text class="fighter-feature">{{ currentPlane.desc }}</text>
        </view>
        <text class="btn-change-tag">换机 ➔</text>
      </view>

      <view class="bar-right-actions flex-center">
        <!-- 生命与火力小指示器 -->
        <view class="hp-gauge flex-center">
          <text v-for="n in maxLives" :key="n" class="hp-heart">
            {{ n <= lives ? '❤️' : '🖤' }}
          </text>
        </view>

        <view class="special-skill-badge flex-center" @click="usePlaneSkill">
          <text class="skill-icon">⚡</text>
          <text class="skill-name">{{ currentPlane.skillName }}</text>
        </view>
      </view>
    </view>

    <!-- Canvas 游戏画布区 -->
    <view class="canvas-wrap">
      <canvas 
        canvas-id="planeCanvas" 
        id="planeCanvas" 
        class="game-canvas"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>

      <!-- 游戏内快捷核弹技能按钮 -->
      <view v-if="bombCount > 0 && !isGameOver && !isPaused" class="bomb-btn flex-center" @click="useBomb">
        <text class="bomb-icon">💣</text>
        <text class="bomb-badge">{{ bombCount }}</text>
      </view>

      <!-- 护盾与超频火力状态指示 -->
      <view class="buff-indicators flex-center">
        <view v-if="hasShield" class="buff-tag shield-tag">
          🛡️ 护盾防御中
        </view>
        <view v-if="powerLevel >= 4" class="buff-tag power-tag">
          🔥 超频暴走弹幕
        </view>
      </view>

      <!-- 无尽难度波次递增浮层提示 -->
      <view v-if="waveUpTip" class="wave-up-banner flex-center">
        <text class="wave-up-text">⚠️ 敌军增援！进入第 {{ currentWave }} 波！血量与弹幕狂暴升级！</text>
      </view>
    </view>

    <!-- 飞行器切换弹窗 (机库) -->
    <view v-if="showFighterSelect" class="modal-overlay flex-center">
      <view class="fighter-modal-content card-box">
        <text class="modal-title">🚀 战机机库 · 飞行器选择</text>
        <text class="modal-sub">选择出战飞行器，每款拥有独特的弹道与绝招</text>

        <view class="planes-grid">
          <view 
            v-for="plane in PLANES" 
            :key="plane.id"
            class="plane-card flex-between"
            :class="{ active: currentPlane.id === plane.id }"
            :style="{ borderLeft: `8rpx solid ${plane.themeColor}` }"
            @click="selectPlane(plane)"
          >
            <view class="plane-left flex-center">
              <view class="plane-avatar-bubble flex-center" :style="{ background: plane.bgGradient }">
                <text class="plane-big-icon">{{ plane.icon }}</text>
              </view>
              <view class="plane-meta">
                <view class="flex-center" style="justify-content: flex-start; gap: 10rpx;">
                  <text class="plane-card-title">{{ plane.name }}</text>
                  <text class="plane-tag" :style="{ color: plane.themeColor }">{{ plane.type }}</text>
                </view>
                <text class="plane-card-desc">{{ plane.desc }}</text>
                <text class="plane-card-bullet">弹道: {{ plane.bulletType }}</text>
              </view>
            </view>

            <view class="plane-select-indicator flex-center">
              <text v-if="currentPlane.id === plane.id" class="check-icon">✓ 出战中</text>
              <text v-else class="btn-select-text">选择</text>
            </view>
          </view>
        </view>

        <button class="btn-close-modal flex-center" @click="showFighterSelect = false">
          确认出战
        </button>
      </view>
    </view>

    <!-- 暂停弹窗 -->
    <game-pause-modal 
      :visible="isPaused" 
      @resume="resumeGame" 
      @restart="restartGame" 
      @quit="quitToHall" 
    />

    <!-- 结算弹窗 -->
    <game-over-modal 
      :visible="isGameOver"
      :is-win="currentWave >= 6"
      :score="score"
      :wave="currentWave"
      :high-score="userStore.userInfo?.highScores?.planeWar || 0"
      :is-new-record="isNewRecord"
      :reward-coins="rewardCoins"
      @restart="restartGame"
      @quit="quitToHall"
      @openRank="showRankModal = true"
    />

    <!-- 排行榜弹窗 -->
    <rank-modal 
      :visible="showRankModal" 
      default-game-key="planeWar"
      @close="showRankModal = false"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameHeader from '../../../components/game-header.vue'
import GamePauseModal from '../../../components/game-pause-modal.vue'
import GameOverModal from '../../../components/game-over-modal.vue'
import RankModal from '../../../components/rank-modal.vue'
import { useUserStore } from '../../../stores/user'
import { soundManager } from '../../../utils/audio'
import { apiSubmitScore } from '../../../api/rank'

const userStore = useUserStore()

// 4 款飞行器配置
const PLANES = [
  {
    id: 'pioneer',
    name: '星际先锋号',
    icon: '🚀',
    type: '均衡敏捷',
    bulletType: '高能等离子弹幕',
    themeColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    desc: '全天候巡航战机，机动性能强，弹道扩散稳定',
    bulletColor: '#38bdf8',
    bulletSpeed: 10,
    baseInterval: 170,
    skillName: '超频脉冲'
  },
  {
    id: 'phoenix',
    name: '烈焰凤凰号',
    icon: '🦅',
    type: '超级暴击',
    bulletType: '烈焰火羽爆裂弹',
    themeColor: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
    desc: '装备高能热辐射弹，范围广且附带灼烧群伤',
    bulletColor: '#f97316',
    bulletSpeed: 9.2,
    baseInterval: 190,
    skillName: '天火流星'
  },
  {
    id: 'phantom',
    name: '极光幻影战机',
    icon: '🛸',
    type: '疾速穿透',
    bulletType: '极光高频穿透弹',
    themeColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #9333ea, #6b21a8)',
    desc: '极速刺客型战机，全场最高射速与激光贯穿',
    bulletColor: '#c084fc',
    bulletSpeed: 12,
    baseInterval: 120,
    skillName: '时空残影'
  },
  {
    id: 'dreadnought',
    name: '虚空重装泰坦',
    icon: '✈️',
    type: '重装重炮',
    bulletType: '加农重型爆破弹',
    themeColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, #059669, #047857)',
    desc: '坚实装甲与重型弹药，单发威力摧枯拉朽',
    bulletColor: '#34d399',
    bulletSpeed: 8.5,
    baseInterval: 210,
    skillName: '湮灭轰炸'
  }
]

const currentPlane = ref(PLANES[0])
const showFighterSelect = ref(false)
const showRankModal = ref(false)

const score = ref(0)
const lives = ref(4)
const maxLives = ref(5)
const powerLevel = ref(1) // 火力等级 1 ~ 5
const bombCount = ref(1)
const hasShield = ref(false)
const isPaused = ref(false)
const isGameOver = ref(false)
const isNewRecord = ref(false)
const rewardCoins = ref(0)
const waveUpTip = ref(false)

// 无尽模式动态波次
const currentWave = computed(() => {
  return 1 + Math.floor(score.value / 2500)
})

let lastWaveRecorded = 1
let canvasWidth = 375
let canvasHeight = 600
let ctx = null
let animationFrameId = null

const player = {
  x: 180,
  y: 480,
  w: 48,
  h: 48,
  speed: 5,
  shieldTimer: 0,
  invulnerableTimer: 0 // 受击无敌闪烁时间
}

// 实体池
let playerBullets = []
let enemyBullets = []
let enemies = []
let particles = []
let powerups = []

let lastPlayerShootTime = 0
let lastEnemySpawnTime = 0

let touchStartX = 0
let touchStartY = 0
let playerStartX = 0
let playerStartY = 0

function selectPlane(plane) {
  currentPlane.value = plane
  soundManager.playCoin()
  uni.showToast({ title: `已换装: ${plane.name}`, icon: 'none' })
}

function usePlaneSkill() {
  if (bombCount.value <= 0) {
    uni.showToast({ title: '能量不足，击落敌机可拾取补给', icon: 'none' })
    return
  }
  useBomb()
}

function onTouchStart(e) {
  if (isPaused.value || isGameOver.value) return
  const touch = e.touches[0]
  touchStartX = touch.x || touch.clientX
  touchStartY = touch.y || touch.clientY
  playerStartX = player.x
  playerStartY = player.y
}

function onTouchMove(e) {
  if (isPaused.value || isGameOver.value) return
  const touch = e.touches[0]
  const currentX = touch.x || touch.clientX
  const currentY = touch.y || touch.clientY
  const dx = currentX - touchStartX
  const dy = currentY - touchStartY

  player.x = Math.max(player.w / 2, Math.min(canvasWidth - player.w / 2, playerStartX + dx))
  player.y = Math.max(player.h / 2, Math.min(canvasHeight - player.h / 2, playerStartY + dy))
}

function onTouchEnd() {}

// 全屏核弹
function useBomb() {
  if (bombCount.value <= 0) return
  bombCount.value--
  soundManager.playExplosion()

  enemies.forEach(e => {
    score.value += e.score
    createExplosion(e.x, e.y, 20, '#f59e0b')
  })
  enemies = []
  enemyBullets = [] // 清空所有敌方子弹
  uni.showToast({ title: `${currentPlane.value.skillName} 全屏清场！⚡`, icon: 'none' })
}

function createExplosion(x, y, count = 12, color = '#ef4444') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 4 + 1
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 2,
      color,
      alpha: 1,
      life: 25
    })
  }
}

// 掉落道具（包含火力升级、医疗包、护盾、核弹）
function maybeSpawnPowerup(x, y) {
  const rand = Math.random()
  if (rand < 0.38) {
    let type = 'power'
    if (rand < 0.12) {
      type = 'heal' // ❤️ 医疗包回血
    } else if (rand < 0.22) {
      type = 'shield' // 🛡️ 护盾
    } else if (rand < 0.30) {
      type = 'bomb' // 💣 核弹
    } else {
      type = 'power' // ⚡ 火力升级
    }
    powerups.push({
      x,
      y,
      type,
      w: 26,
      h: 26,
      vy: 2.2
    })
  }
}

function gameLoop(timestamp) {
  if (isPaused.value || isGameOver.value) return

  updateGame(timestamp)
  renderGame()

  animationFrameId = requestAnimationFrame(gameLoop)
}

function updateGame(now) {
  const wave = currentWave.value
  const plane = currentPlane.value

  // 检测波次升级：提示 + 奖励回血与道具
  if (wave > lastWaveRecorded) {
    lastWaveRecorded = wave
    waveUpTip.value = true
    soundManager.playCombo(wave)
    // 突破波次奖励回复生命
    if (lives.value < maxLives.value) {
      lives.value++
    }
    setTimeout(() => { waveUpTip.value = false }, 2200)
  }

  // 1. 玩家战机射击（根据火力等级发射海量弹幕）
  const shootInterval = Math.max(90, plane.baseInterval - (powerLevel.value - 1) * 15)
  if (now - lastPlayerShootTime > shootInterval) {
    lastPlayerShootTime = now
    soundManager.playLaser()
    spawnPlayerBullets(plane, powerLevel.value)
  }

  // 道具与状态计时
  if (hasShield.value) {
    player.shieldTimer--
    if (player.shieldTimer <= 0) hasShield.value = false
  }
  if (player.invulnerableTimer > 0) {
    player.invulnerableTimer--
  }

  // 2. 敌机生成系统 (敌机血量、移速、生成频率随波次非线性递增)
  const spawnInterval = Math.max(280, 800 - wave * 40)
  const speedBonus = wave * 0.22

  if (now - lastEnemySpawnTime > spawnInterval) {
    lastEnemySpawnTime = now
    const rand = Math.random()
    if (rand < Math.max(0.35, 0.65 - wave * 0.03)) {
      // 小型突击机
      const hp = 1 + Math.floor(wave / 4)
      enemies.push({
        x: Math.random() * (canvasWidth - 40) + 20,
        y: -20,
        w: 32,
        h: 32,
        hp,
        maxHp: hp,
        vy: Math.random() * 2 + 2.5 + speedBonus,
        score: 100,
        color: '#f87171',
        icon: '🛸',
        type: 'scout',
        lastShoot: now + Math.random() * 500,
        shootInterval: Math.max(1000, 2200 - wave * 80)
      })
    } else if (rand < 0.85) {
      // 中型巡航轰炸机
      const hp = 3 + wave
      enemies.push({
        x: Math.random() * (canvasWidth - 60) + 30,
        y: -30,
        w: 46,
        h: 46,
        hp,
        maxHp: hp,
        vy: Math.random() * 1.5 + 1.5 + speedBonus * 0.8,
        score: 300 + wave * 50,
        color: '#fb923c',
        icon: '🛩️',
        type: 'cruiser',
        lastShoot: now + Math.random() * 400,
        shootInterval: Math.max(800, 1800 - wave * 60)
      })
    } else {
      // 巨型首领 BOSS
      const hp = 12 + wave * 4
      enemies.push({
        x: Math.random() * (canvasWidth - 80) + 40,
        y: -50,
        w: 64,
        h: 64,
        hp,
        maxHp: hp,
        vy: 1.1 + speedBonus * 0.4,
        score: 1000 + wave * 200,
        color: '#a855f7',
        icon: '👾',
        type: 'boss',
        lastShoot: now,
        shootInterval: Math.max(600, 1200 - wave * 40)
      })
    }
  }

  // 3. 敌机向玩家发射子弹系统（对面扔子弹！）
  enemies.forEach(e => {
    if (now - e.lastShoot > e.shootInterval && e.y > 0 && e.y < canvasHeight - 80) {
      e.lastShoot = now
      spawnEnemyBullets(e, wave)
    }
  })

  // 4. 更新玩家子弹
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i]
    b.x += (b.vx || 0)
    b.y += b.vy
    if (b.y < -20 || b.x < -20 || b.x > canvasWidth + 20) {
      playerBullets.splice(i, 1)
    }
  }

  // 5. 更新敌方子弹并与玩家进行碰撞检测
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i]
    eb.x += eb.vx
    eb.y += eb.vy

    // 敌弹击中玩家
    if (
      player.invulnerableTimer <= 0 &&
      Math.abs(eb.x - player.x) < (eb.w / 2 + player.w / 2 - 6) &&
      Math.abs(eb.y - player.y) < (eb.h / 2 + player.h / 2 - 6)
    ) {
      enemyBullets.splice(i, 1)
      createExplosion(player.x, player.y, 14, '#ef4444')
      handlePlayerHit()
      continue
    }

    if (eb.y > canvasHeight + 30 || eb.x < -30 || eb.x > canvasWidth + 30) {
      enemyBullets.splice(i, 1)
    }
  }

  // 6. 更新敌机与玩家子弹碰撞检测
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    e.y += e.vy

    for (let j = playerBullets.length - 1; j >= 0; j--) {
      const b = playerBullets[j]
      if (Math.abs(b.x - e.x) < (e.w / 2 + b.w / 2) && Math.abs(b.y - e.y) < (e.h / 2 + b.h / 2)) {
        playerBullets.splice(j, 1)
        e.hp--
        createExplosion(b.x, b.y, 4, plane.bulletColor)

        if (e.hp <= 0) {
          soundManager.playExplosion()
          score.value += e.score
          createExplosion(e.x, e.y, 18, e.color)
          maybeSpawnPowerup(e.x, e.y)
          enemies.splice(i, 1)
          break
        }
      }
    }

    if (enemies[i]) {
      // 敌机直接撞击玩家
      if (
        player.invulnerableTimer <= 0 &&
        Math.abs(e.x - player.x) < (e.w / 2 + player.w / 2 - 8) &&
        Math.abs(e.y - player.y) < (e.h / 2 + player.h / 2 - 8)
      ) {
        createExplosion(e.x, e.y, 18, '#ef4444')
        enemies.splice(i, 1)
        handlePlayerHit()
      } else if (e.y > canvasHeight + 40) {
        enemies.splice(i, 1)
      }
    }
  }

  // 7. 更新道具掉落与拾取（包含火力升级、医疗包、护盾、核弹）
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i]
    p.y += p.vy

    if (Math.abs(p.x - player.x) < (p.w / 2 + player.w / 2) && Math.abs(p.y - player.y) < (p.h / 2 + player.h / 2)) {
      soundManager.playCoin()
      if (p.type === 'power') {
        powerLevel.value = Math.min(5, powerLevel.value + 1)
        uni.showToast({ title: `⚡ 火力升级至 Lv.${powerLevel.value}！`, icon: 'none' })
      } else if (p.type === 'heal') {
        lives.value = Math.min(maxLives.value, lives.value + 1)
        uni.showToast({ title: '❤️ 拾取医疗包，生命回复！', icon: 'none' })
      } else if (p.type === 'shield') {
        hasShield.value = true
        player.shieldTimer = 450
        uni.showToast({ title: '🛡️ 能量护盾激活！', icon: 'none' })
      } else if (p.type === 'bomb') {
        bombCount.value = Math.min(3, bombCount.value + 1)
        uni.showToast({ title: '💣 获得核弹充能！', icon: 'none' })
      }
      powerups.splice(i, 1)
    } else if (p.y > canvasHeight + 30) {
      powerups.splice(i, 1)
    }
  }

  // 8. 爆炸粒子更新
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i]
    pt.x += pt.vx
    pt.y += pt.vy
    pt.alpha -= 0.04
    pt.life--
    if (pt.life <= 0 || pt.alpha <= 0) {
      particles.splice(i, 1)
    }
  }
}

// 玩家受击处理
function handlePlayerHit() {
  if (hasShield.value) {
    hasShield.value = false
    soundManager.playExplosion()
    player.invulnerableTimer = 60 // 护盾抵消后短暂无敌
    uni.showToast({ title: '🛡️ 护盾破碎！', icon: 'none' })
  } else {
    lives.value--
    player.invulnerableTimer = 80 // 受击无敌闪烁
    // 火力降级惩罚（但不低于1）
    powerLevel.value = Math.max(1, powerLevel.value - 1)
    soundManager.playGameOver()

    if (lives.value <= 0) {
      handleGameOver()
    } else {
      uni.showToast({ title: `受到伤害！剩余生命: ${lives.value}`, icon: 'none' })
    }
  }
}

// 玩家发射弹幕（随火力等级越来越密集）
function spawnPlayerBullets(plane, level) {
  const spd = plane.bulletSpeed
  const clr = plane.bulletColor

  if (level === 1) {
    // 双发基础弹
    playerBullets.push({ x: player.x - 10, y: player.y - 20, vx: 0, vy: -spd, w: 5, h: 16, color: clr })
    playerBullets.push({ x: player.x + 10, y: player.y - 20, vx: 0, vy: -spd, w: 5, h: 16, color: clr })
  } else if (level === 2) {
    // 3路扩散弹幕
    playerBullets.push({ x: player.x, y: player.y - 22, vx: 0, vy: -spd, w: 6, h: 18, color: clr })
    playerBullets.push({ x: player.x - 14, y: player.y - 18, vx: -1.2, vy: -spd * 0.95, w: 5, h: 15, color: clr })
    playerBullets.push({ x: player.x + 14, y: player.y - 18, vx: 1.2, vy: -spd * 0.95, w: 5, h: 15, color: clr })
  } else if (level === 3) {
    // 5路强力弹幕
    playerBullets.push({ x: player.x, y: player.y - 24, vx: 0, vy: -spd, w: 7, h: 20, color: '#f59e0b' })
    playerBullets.push({ x: player.x - 12, y: player.y - 20, vx: -1, vy: -spd * 0.96, w: 5, h: 16, color: clr })
    playerBullets.push({ x: player.x + 12, y: player.y - 20, vx: 1, vy: -spd * 0.96, w: 5, h: 16, color: clr })
    playerBullets.push({ x: player.x - 22, y: player.y - 14, vx: -2.2, vy: -spd * 0.9, w: 5, h: 14, color: clr })
    playerBullets.push({ x: player.x + 22, y: player.y - 14, vx: 2.2, vy: -spd * 0.9, w: 5, h: 14, color: clr })
  } else if (level === 4) {
    // 7路暴风弹幕 + 左右僚机火力
    for (let k = -3; k <= 3; k++) {
      playerBullets.push({
        x: player.x + k * 8,
        y: player.y - 20,
        vx: k * 0.9,
        vy: -spd,
        w: 6,
        h: 18,
        color: k === 0 ? '#ef4444' : clr
      })
    }
  } else {
    // MAX 超频狂暴火力：全屏狂轰滥炸！
    for (let k = -4; k <= 4; k++) {
      playerBullets.push({
        x: player.x + k * 7,
        y: player.y - 22,
        vx: k * 1.1,
        vy: -spd * 1.1,
        w: 7,
        h: 22,
        color: Math.abs(k) % 2 === 0 ? '#fbbf24' : '#ec4899'
      })
    }
  }
}

// 敌机发射子弹系统（对面扔子弹）
function spawnEnemyBullets(e, wave) {
  const speed = 3.5 + wave * 0.15
  if (e.type === 'scout') {
    // 小型机：正下方直射子弹
    enemyBullets.push({ x: e.x, y: e.y + e.h / 2, vx: 0, vy: speed, w: 6, h: 12, color: '#f87171' })
  } else if (e.type === 'cruiser') {
    // 中型机：瞄准玩家坐标发射 2 发自机狙导向弹
    const angle = Math.atan2(player.y - e.y, player.x - e.x)
    enemyBullets.push({ x: e.x - 8, y: e.y + 10, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, w: 7, h: 14, color: '#fb923c' })
    enemyBullets.push({ x: e.x + 8, y: e.y + 10, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, w: 7, h: 14, color: '#fb923c' })
  } else if (e.type === 'boss') {
    // BOSS机：向全屏发射 5 路扇形散射弹幕！
    for (let a = -2; a <= 2; a++) {
      const angle = Math.PI / 2 + (a * Math.PI) / 8
      enemyBullets.push({
        x: e.x,
        y: e.y + 20,
        vx: Math.cos(angle) * (speed * 0.9),
        vy: Math.sin(angle) * (speed * 0.9),
        w: 9,
        h: 18,
        color: '#c084fc'
      })
    }
  }
}

// 绘制渲染
function renderGame() {
  if (!ctx) return

  // 深空背景
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 星空流光
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 24; i++) {
    const sx = (i * 37 + (Date.now() / 15)) % canvasWidth
    const sy = (i * 47 + (Date.now() / 20)) % canvasHeight
    ctx.fillRect(sx, sy, 2, 2)
  }

  // 1. 绘制玩家子弹
  playerBullets.forEach(b => {
    ctx.fillStyle = b.color
    ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)
  })

  // 2. 绘制敌方子弹（发光红/橙/紫）
  enemyBullets.forEach(eb => {
    ctx.fillStyle = eb.color
    ctx.fillRect(eb.x - eb.w / 2, eb.y - eb.h / 2, eb.w, eb.h)
  })

  // 3. 绘制掉落道具（❤️医疗包、⚡火力、🛡️护盾、💣核弹）
  powerups.forEach(p => {
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const icon = p.type === 'heal' ? '❤️' : p.type === 'power' ? '⚡' : p.type === 'shield' ? '🛡️' : '💣'
    ctx.fillText(icon, p.x, p.y)
  })

  // 4. 绘制敌机及其上方实时血条
  enemies.forEach(e => {
    ctx.font = `${e.w}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(e.icon, e.x, e.y)

    // 血条（只要最大血量大于1就显示）
    if (e.maxHp > 1) {
      ctx.fillStyle = '#334155'
      ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2 - 10, e.w, 5)
      ctx.fillStyle = e.type === 'boss' ? '#a855f7' : '#22c55e'
      ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2 - 10, (e.w * Math.max(0, e.hp)) / e.maxHp, 5)
    }
  })

  // 5. 绘制爆炸粒子
  particles.forEach(pt => {
    ctx.save()
    ctx.globalAlpha = Math.max(0, pt.alpha)
    ctx.fillStyle = pt.color
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })

  // 6. 绘制玩家飞机（受击时无敌闪烁）
  if (player.invulnerableTimer % 6 < 3) {
    ctx.font = '44px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentPlane.value.icon, player.x, player.y)

    // 护盾光圈
    if (hasShield.value) {
      ctx.strokeStyle = currentPlane.value.themeColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(player.x, player.y, 34, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // #ifndef H5
  ctx.draw()
  // #endif
}

function handleGameOver() {
  isGameOver.value = true
  rewardCoins.value = Math.floor(score.value / 30) + currentWave.value * 15
  userStore.addCoins(rewardCoins.value)
  isNewRecord.value = userStore.recordScore('planeWar', score.value)

  apiSubmitScore({
    gameKey: 'planeWar',
    score: score.value,
    wave: currentWave.value,
    user: userStore.userInfo
  })
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function resumeGame() {
  isPaused.value = false
  animationFrameId = requestAnimationFrame(gameLoop)
}

function restartGame() {
  isPaused.value = false
  isGameOver.value = false
  isNewRecord.value = false
  score.value = 0
  lives.value = 4
  powerLevel.value = 1
  bombCount.value = 1
  hasShield.value = false
  lastWaveRecorded = 1
  playerBullets = []
  enemyBullets = []
  enemies = []
  particles = []
  powerups = []
  player.x = canvasWidth / 2
  player.y = canvasHeight - 100
  player.invulnerableTimer = 0
  animationFrameId = requestAnimationFrame(gameLoop)
}

function quitToHall() {
  uni.switchTab({ url: '/pages/tabbar/games/index' })
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  canvasWidth = sys.windowWidth || 375
  canvasHeight = (sys.windowHeight || 600) - 120

  // #ifdef H5
  const canvasEl = document.getElementById('planeCanvas')
  if (canvasEl) {
    const canvas = canvasEl.querySelector('canvas') || canvasEl
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx = canvas.getContext('2d')
  }
  // #endif
  // #ifndef H5
  ctx = uni.createCanvasContext('planeCanvas', this)
  // #endif

  player.x = canvasWidth / 2
  player.y = canvasHeight - 100

  animationFrameId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.plane-game-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #090d16;
  overflow: hidden;
}

.fighter-bar {
  padding: 14rpx 24rpx;
  background: #0f172a;
  border-bottom: 2rpx solid #1e293b;
}

.current-fighter {
  gap: 16rpx;
  cursor: pointer;
}

.fighter-icon-preview {
  font-size: 40rpx;
}

.fighter-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #38bdf8;
}

.power-level-tag {
  font-size: 18rpx;
  font-weight: bold;
  background: #f59e0b;
  color: #78350f;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.fighter-feature {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
}

.btn-change-tag {
  font-size: 22rpx;
  background: #1e293b;
  color: #38bdf8;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  margin-left: 12rpx;
}

.bar-right-actions {
  gap: 14rpx;
}

.hp-gauge {
  background: #1e293b;
  padding: 4rpx 10rpx;
  border-radius: 16rpx;
  gap: 4rpx;
}

.hp-heart {
  font-size: 22rpx;
}

.special-skill-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  gap: 6rpx;
  cursor: pointer;
}

.skill-icon {
  font-size: 22rpx;
}

.skill-name {
  font-size: 22rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 画布 */
.canvas-wrap {
  flex: 1;
  position: relative;
  width: 100%;
}

.game-canvas {
  width: 100%;
  height: 100%;
}

.bomb-btn {
  position: absolute;
  bottom: 40rpx;
  right: 40rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.4);
  cursor: pointer;
  z-index: 10;
}

.bomb-icon {
  font-size: 52rpx;
}

.bomb-badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  background: #fbbf24;
  color: #78350f;
  font-size: 22rpx;
  font-weight: bold;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  text-align: center;
  line-height: 38rpx;
  border: 2rpx solid #ffffff;
}

.buff-indicators {
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  gap: 12rpx;
}

.buff-tag {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.shield-tag {
  background: rgba(56, 189, 248, 0.25);
  border: 2rpx solid #38bdf8;
  color: #38bdf8;
}

.power-tag {
  background: rgba(245, 158, 11, 0.25);
  border: 2rpx solid #f59e0b;
  color: #f59e0b;
}

.wave-up-banner {
  position: absolute;
  top: 90rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(220, 38, 38, 0.9);
  backdrop-filter: blur(4px);
  padding: 12rpx 30rpx;
  border-radius: 24rpx;
  border: 2rpx solid #fecdd3;
  animation: pulse 0.5s infinite alternate;
  width: 90%;
  text-align: center;
}

.wave-up-text {
  font-size: 22rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 机库弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 999;
  padding: 30rpx;
}

.fighter-modal-content {
  width: 100%;
  max-width: 650rpx;
  padding: 40rpx 32rpx;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
  text-align: center;
}

.modal-sub {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  text-align: center;
  margin: 8rpx 0 24rpx;
}

.planes-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.plane-card {
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 20rpx;
  border: 2rpx solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plane-card.active {
  background: #f0fdf4;
  border-color: #86efac;
  box-shadow: 0 4rpx 14rpx rgba(16, 185, 129, 0.15);
}

.plane-avatar-bubble {
  width: 84rpx;
  height: 84rpx;
  border-radius: 20rpx;
  margin-right: 18rpx;
}

.plane-big-icon {
  font-size: 44rpx;
}

.plane-card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1e293b;
}

.plane-tag {
  font-size: 18rpx;
  font-weight: bold;
  background: #ffffff;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.plane-card-desc {
  font-size: 20rpx;
  color: #64748b;
  display: block;
  margin-top: 2rpx;
}

.plane-card-bullet {
  font-size: 20rpx;
  color: #0284c7;
  font-weight: 500;
  display: block;
}

.check-icon {
  font-size: 22rpx;
  font-weight: bold;
  color: #16a34a;
}

.btn-select-text {
  font-size: 22rpx;
  color: #64748b;
  background: #e2e8f0;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
}

.btn-close-modal {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
