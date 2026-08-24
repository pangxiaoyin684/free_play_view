<template>
  <div class="games-config-container">
    <div class="admin-card">
      <div class="card-title">
        <span>🎮 无尽模式小游戏 · 核心数值与难度在线调控</span>
        <button class="btn-primary" @click="saveGameSettings">💾 保存全局数值配置</button>
      </div>

      <div class="config-grid">
        <!-- 飞机大战配置 -->
        <div class="config-box">
          <h3 class="box-title">🚀 全民飞机大战数值</h3>
          <div class="form-row">
            <label>初始生命值 (❤️):</label>
            <input v-model.number="planeConfig.initLives" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>初始敌机刷新间隔 (ms):</label>
            <input v-model.number="planeConfig.spawnInterval" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>BOSS 基础血量:</label>
            <input v-model.number="planeConfig.bossHp" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>医疗包 ❤️ 掉落概率 (%):</label>
            <input v-model.number="planeConfig.healDropRate" type="number" class="num-input" />
          </div>
        </div>

        <!-- 消消乐配置 -->
        <div class="config-box">
          <h3 class="box-title">💎 宝石消消乐数值</h3>
          <div class="form-row">
            <label>初始挑战步数:</label>
            <input v-model.number="match3Config.initMoves" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>4连消除额外奖励步数:</label>
            <input v-model.number="match3Config.match4Reward" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>突破波次大礼包 (步):</label>
            <input v-model.number="match3Config.waveReward" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>洗牌消耗金币 (🪙):</label>
            <input v-model.number="match3Config.shuffleCost" type="number" class="num-input" />
          </div>
        </div>

        <!-- 连连看配置 -->
        <div class="config-box">
          <h3 class="box-title">🍇 欢乐连连看数值</h3>
          <div class="form-row">
            <label>初始倒计时 (秒):</label>
            <input v-model.number="linkConfig.initTime" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>配对消除续命 (秒):</label>
            <input v-model.number="linkConfig.matchAddTime" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>清屏晋级奖励时间 (秒):</label>
            <input v-model.number="linkConfig.clearRewardTime" type="number" class="num-input" />
          </div>
        </div>

        <!-- 全局经济配置 -->
        <div class="config-box">
          <h3 class="box-title">🪙 运营与经济系统</h3>
          <div class="form-row">
            <label>每日签到金币奖励:</label>
            <input v-model.number="ecoConfig.dailySignCoins" type="number" class="num-input" />
          </div>
          <div class="form-row">
            <label>游戏得分与金币折算比:</label>
            <input v-model.number="ecoConfig.scoreToCoinRate" type="number" class="num-input" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const planeConfig = ref({
  initLives: 4,
  spawnInterval: 800,
  bossHp: 12,
  healDropRate: 15
})

const match3Config = ref({
  initMoves: 20,
  match4Reward: 1,
  waveReward: 6,
  shuffleCost: 10
})

const linkConfig = ref({
  initTime: 90,
  matchAddTime: 2,
  clearRewardTime: 45
})

const ecoConfig = ref({
  dailySignCoins: 50,
  scoreToCoinRate: 30
})

function saveGameSettings() {
  localStorage.setItem('admin_game_settings', JSON.stringify({
    plane: planeConfig.value,
    match3: match3Config.value,
    link: linkConfig.value,
    eco: ecoConfig.value
  }))
  alert('🎉 游戏与难度数值配置已成功保存并实时生效！')
}
</script>

<style scoped>
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.config-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
}

.box-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.form-row label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.num-input {
  width: 100px;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  text-align: right;
  font-weight: bold;
  font-size: 14px;
}
</style>
