<template>
  <div class="leaderboards-container">
    <div class="admin-card">
      <div class="card-title">
        <span>🏆 全服无尽排行榜实时监控与数据治理</span>
        <div style="display: flex; gap: 10px;">
          <button 
            v-for="g in games" 
            :key="g.key"
            class="btn-sm"
            :class="activeGameKey === g.key ? 'btn-primary' : 'btn-client-link'"
            @click="activeGameKey = g.key"
          >
            {{ g.name }}
          </button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>名次</th>
            <th>玩家资料</th>
            <th>最高战绩得分</th>
            <th>无尽波次</th>
            <th>段位头衔</th>
            <th>作弊风险评估</th>
            <th>治理操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in currentRankList" :key="item.id">
            <td>
              <span v-if="item.rank === 1">🥇 冠军</span>
              <span v-else-if="item.rank === 2">🥈 亚军</span>
              <span v-else-if="item.rank === 3">🥉 季军</span>
              <span v-else>No.{{ item.rank }}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img :src="item.avatar" style="width: 34px; height: 34px; border-radius: 50%;" />
                <b>{{ item.nickname }}</b>
              </div>
            </td>
            <td><b style="color: #d97706; font-size: 15px;">{{ item.score.toLocaleString() }}</b> 分</td>
            <td><span class="badge badge-indigo">第 {{ item.wave }} 波</span></td>
            <td>{{ item.title }}</td>
            <td>
              <span class="badge" :class="item.score > 200000 ? 'badge-danger' : 'badge-success'">
                {{ item.score > 200000 ? '⚠️ 分数异常(疑似作弊)' : '✅ 正常战绩' }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button class="btn-sm btn-primary" @click="editRankScore(item)">调整成绩</button>
                <button class="btn-sm btn-danger" @click="removeRankItem(item)">一键剔除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeGameKey = ref('planeWar')

const games = [
  { key: 'planeWar', name: '🚀 飞机大战榜' },
  { key: 'match3', name: '💎 消消乐榜' },
  { key: 'linkGame', name: '🍇 连连看榜' }
]

const ranks = ref({
  planeWar: [
    { id: 'r1', rank: 1, nickname: '银河王牌飞行员', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', score: 98600, wave: 25, title: '宇宙传奇' },
    { id: 'r2', rank: 2, nickname: '极光瞬杀·零式', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', score: 76300, wave: 19, title: '空天霸主' },
    { id: 'r3', rank: 3, nickname: '烈焰轰炸机', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', score: 58900, wave: 15, title: '重装王牌' },
    { id: 'r4', rank: 4, nickname: '外挂刷分测试号', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80', score: 999999, wave: 99, title: '作弊嫌疑' }
  ],
  match3: [
    { id: 'm1', rank: 1, nickname: '消除之神·凯尔', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', score: 38650, wave: 18, title: '消消乐宗师' },
    { id: 'm2', rank: 2, nickname: '连击达人小萌', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', score: 29420, wave: 14, title: '狂暴连击手' }
  ],
  linkGame: [
    { id: 'l1', rank: 1, nickname: '鹰眼速消王', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', score: 24500, wave: 15, title: '连连看神手' },
    { id: 'l2', rank: 2, nickname: '快乐水果捞', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', score: 18900, wave: 12, title: '连线大师' }
  ]
})

const currentRankList = computed(() => {
  return ranks.value[activeGameKey.value] || []
})

function removeRankItem(item) {
  if (confirm(`确定要将【${item.nickname}】从当前排行榜中剔除吗？`)) {
    const list = ranks.value[activeGameKey.value]
    ranks.value[activeGameKey.value] = list.filter(i => i.id !== item.id)
    alert('已成功剔除违规上榜记录！')
  }
}

function editRankScore(item) {
  const input = prompt(`请输入玩家【${item.nickname}】的修正分数：`, item.score)
  if (input !== null) {
    const val = parseInt(input)
    if (!isNaN(val)) {
      item.score = val
      alert('已修正玩家分数！')
    }
  }
}
</script>
