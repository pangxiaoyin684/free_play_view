import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('====================================================')
console.log('🚀 Casual Games - 构建产物完整性与安全合规自动检验')
console.log('====================================================')

let hasError = false
const rootDir = path.resolve(__dirname, '..')

// 1. 校验 H5 移动端前台构建产物
const h5DistPath = path.join(rootDir, 'dist', 'build', 'h5')
const h5IndexHTML = path.join(h5DistPath, 'index.html')
const h5AssetsDir = path.join(h5DistPath, 'assets')

if (!fs.existsSync(h5IndexHTML)) {
  console.log(`❌ [FAIL] 缺失 H5 前端入口页面: ${h5IndexHTML}`)
  hasError = true
} else {
  const content = fs.readFileSync(h5IndexHTML, 'utf-8')
  if (!content.includes('休闲游戏') && !content.includes('casual_games') && !content.includes('viewport')) {
    console.log('⚠️ [WARN] H5 index.html 内容可能不完整')
  } else {
    console.log('✅ [PASS] H5 移动前台入口 index.html 校验通过')
  }
}

if (!fs.existsSync(h5AssetsDir) || fs.readdirSync(h5AssetsDir).length === 0) {
  console.log(`❌ [FAIL] 缺失 H5 静态资源目录或内容为空: ${h5AssetsDir}`)
  hasError = true
} else {
  const count = fs.readdirSync(h5AssetsDir).length
  console.log(`✅ [PASS] H5 静态资源 assets 校验通过 (共 ${count} 个编译模块文件)`)
}

// 2. 校验 PC 桌面端 Web 管理后台构建产物
const adminDistPath = path.join(rootDir, 'dist-admin')
const adminIndexHTML = path.join(adminDistPath, 'index.html')
const adminAssetsDir = path.join(adminDistPath, 'assets')

if (!fs.existsSync(adminIndexHTML)) {
  console.log(`❌ [FAIL] 缺失 PC 管理后台入口页面: ${adminIndexHTML}`)
  hasError = true
} else {
  const adminContent = fs.readFileSync(adminIndexHTML, 'utf-8')
  if (!adminContent.includes('管理后台') && !adminContent.includes('admin-app')) {
    console.log('⚠️ [WARN] PC 后台 index.html 内容可能不完整')
  } else {
    console.log('✅ [PASS] PC 管理后台入口 index.html 校验通过')
  }
}

if (!fs.existsSync(adminAssetsDir) || fs.readdirSync(adminAssetsDir).length === 0) {
  console.log(`❌ [FAIL] 缺失 PC 后台静态资源目录或内容为空: ${adminAssetsDir}`)
  hasError = true
} else {
  const count = fs.readdirSync(adminAssetsDir).length
  console.log(`✅ [PASS] PC 管理后台 assets 校验通过 (共 ${count} 个 JS/CSS 模块文件)`)
}

// 3. 校验 微信小程序端构建产物
const mpWeixinPath = path.join(rootDir, 'dist', 'build', 'mp-weixin')
const mpAppJson = path.join(mpWeixinPath, 'app.json')

if (fs.existsSync(mpAppJson)) {
  console.log('✅ [PASS] 微信小程序构建产物 app.json 校验通过')
} else {
  console.log('ℹ️ [INFO] 微信小程序产物未编译 (非必须项，跳过)')
}

// 4. 敏感配置文件与私钥排查
const sensitiveFiles = [
  path.join(rootDir, '.env.local'),
  path.join(rootDir, '.env.production.local'),
  path.join(rootDir, 'id_rsa'),
  path.join(rootDir, 'server.key')
]

for (const sf of sensitiveFiles) {
  if (fs.existsSync(sf)) {
    console.log(`❌ [FAIL] 检测到敏感私密文件: ${path.basename(sf)}，禁止打包上传！`)
    hasError = true
  }
}

console.log('----------------------------------------------------')
if (hasError) {
  console.log('🚨 构建校验未通过！请修正上述错误后再执行发布流程。')
  process.exit(1)
}

console.log('🎉 所有产物校验项全部合格！符合自动化打包与发布标准。')
