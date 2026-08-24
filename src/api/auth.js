import { request } from './request'

/**
 * 微信小程序登录
 */
export async function apiWeixinLogin({ code, userInfo = {} }) {
  // 模拟返回或调用实际接口
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        token: 'wx_token_' + Date.now(),
        data: {
          id: 'wx_' + (code ? code.slice(0, 8) : Math.random().toString(36).substr(2, 6)),
          nickname: userInfo.nickName || '微信玩家',
          avatar: userInfo.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          phone: '',
          email: '',
          coins: 500,
          loginType: 'weixin',
          highScores: { match3: 0, planeWar: 0, linkGame: 0 }
        }
      })
    }, 400)
  })
}

/**
 * H5 手机号快捷/验证码登录
 */
export async function apiPhoneLogin({ phone, code, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!phone || phone.length < 11) {
        return reject(new Error('请输入正确的11位手机号码'))
      }
      resolve({
        code: 200,
        token: 'phone_token_' + Date.now(),
        data: {
          id: 'u_phone_' + phone.slice(-4),
          nickname: `玩家_${phone.slice(-4)}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          phone: phone,
          email: '',
          coins: 300,
          loginType: 'phone',
          highScores: { match3: 0, planeWar: 0, linkGame: 0 }
        }
      })
    }, 400)
  })
}

/**
 * H5 邮箱登录
 */
export async function apiEmailLogin({ email, code, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !email.includes('@')) {
        return reject(new Error('请输入有效的电子邮箱地址'))
      }
      const prefix = email.split('@')[0]
      resolve({
        code: 200,
        token: 'email_token_' + Date.now(),
        data: {
          id: 'u_email_' + Math.floor(Math.random() * 9000 + 1000),
          nickname: `极客_${prefix}`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          phone: '',
          email: email,
          coins: 300,
          loginType: 'email',
          highScores: { match3: 0, planeWar: 0, linkGame: 0 }
        }
      })
    }, 400)
  })
}

/**
 * 发送手机短信验证码
 */
export async function apiSendPhoneCode(phone) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, message: '验证码已发送至 ' + phone + ' (模拟验证码为: 666888)' })
    }, 300)
  })
}

/**
 * 发送邮箱验证码
 */
export async function apiSendEmailCode(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, message: '验证码已发送至 ' + email + ' (模拟验证码为: 888999)' })
    }, 300)
  })
}
