import fs from 'fs'
import path from 'path'

// 1x1 transparent PNG base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA='
const buffer = Buffer.from(pngBase64, 'base64')

const dirs = [
  path.resolve('./src/static/icons'),
  path.resolve('./static/icons')
]

const files = [
  'tab-game.png',
  'tab-game-active.png',
  'tab-tool.png',
  'tab-tool-active.png',
  'tab-user.png',
  'tab-user-active.png'
]

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  files.forEach(file => {
    fs.writeFileSync(path.join(dir, file), buffer)
  })
})

console.log('Icons generated successfully!')
