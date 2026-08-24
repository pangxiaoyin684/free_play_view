import { useAppStore } from '../stores/app'

/**
 * 游戏音频与音效管理器
 * 支持 Web Audio API 合成音效（无需依赖外部 MP3 文件即可发声）+ 多端 vibration 震动反馈
 */
class SoundManager {
  constructor() {
    this.audioCtx = null
    this.initAudioContext()
  }

  initAudioContext() {
    try {
      // #ifdef H5
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass()
      }
      // #endif
    } catch (e) {
      console.warn('AudioContext not available:', e)
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
  }

  // 震动反馈
  vibrate(short = true) {
    const appStore = useAppStore()
    if (!appStore.vibrationEnabled) return
    try {
      if (short) {
        uni.vibrateShort({ success: () => {} })
      } else {
        uni.vibrateLong({ success: () => {} })
      }
    } catch (e) {}
  }

  // 播放合成音效
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
    const appStore = useAppStore()
    if (!appStore.soundEnabled) return

    // #ifdef H5
    try {
      this.resumeContext()
      if (!this.audioCtx) return

      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime)

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration)

      osc.connect(gain)
      gain.connect(this.audioCtx.destination)

      osc.start()
      osc.stop(this.audioCtx.currentTime + duration)
    } catch (e) {
      // ignore
    }
    // #endif
  }

  // 点击/消除小气泡音效
  playPop() {
    this.playTone(587.33, 'triangle', 0.08, 0.15)
    this.vibrate(true)
  }

  // 消除成功/得分音效
  playMatch() {
    this.playTone(880, 'sine', 0.12, 0.2)
    setTimeout(() => {
      this.playTone(1320, 'sine', 0.18, 0.25)
    }, 80)
  }

  // 射击音效 (飞机大战)
  playLaser() {
    this.playTone(800, 'sawtooth', 0.06, 0.1)
  }

  // 爆炸音效
  playExplosion() {
    this.playTone(120, 'sawtooth', 0.25, 0.3)
    this.vibrate(false)
  }

  // 金币/获得道具音效
  playCoin() {
    this.playTone(987.77, 'sine', 0.1, 0.2)
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.2, 0.2)
    }, 100)
  }

  // 游戏胜利/连击
  playCombo(level = 1) {
    const baseFreq = 440 + level * 100
    this.playTone(baseFreq, 'sine', 0.15, 0.25)
    setTimeout(() => {
      this.playTone(baseFreq * 1.25, 'sine', 0.2, 0.3)
    }, 100)
    this.vibrate(true)
  }

  // 游戏失败
  playGameOver() {
    this.playTone(300, 'sawtooth', 0.2, 0.2)
    setTimeout(() => {
      this.playTone(200, 'sawtooth', 0.3, 0.2)
    }, 200)
    this.vibrate(false)
  }
}

export const soundManager = new SoundManager()
