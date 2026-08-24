# 🎮 休闲游戏与多功能百宝箱平台 (Free Play View)

[![Build & Release](https://github.com/pangxiaoyin684/free_play_view/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/pangxiaoyin684/free_play_view/actions/workflows/build-and-release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-Vue3-blue.svg)](https://uniapp.dcloud.net.cn/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)

一款集 **无尽模式休闲竞技小游戏** 与 **AI 多功能实用百宝箱** 于一体的现代化跨端全栈前端平台，配套独立的 **PC 桌面端 Web 运营管理后台（Admin Console）**。

---

## 🌟 核心功能特性

### 1. 🕹️ 无尽休闲游戏竞技场 (Endless Casual Games)
- **🚀 全民飞机大战 (无尽弹幕)**：4 大超级战机机库、敌机向玩家开火、Lv.1 ~ Lv.5 MAX 暴风火力升级、敌机血量递增血条、❤️ 医疗包与 🛡️ 护盾道具掉落。
- **💎 宝石消消乐 (无尽步数)**：4 连与 Combo 奖励加步续命、波次目标分数递增、随机洗牌。
- **🍇 欢乐连连看 (无尽清屏)**：清屏自动晋级下一关、配对消除秒数续命、障碍自动重排。
- **🏆 全服无尽荣耀排行榜**：支持总榜/周榜/日榜切换、实时本地排名计算与 API 预留。

### 2. 🧰 实用生活百宝箱 (Utilities & AI Tools)
- **🥮 中秋玉兔告白与祝福**：月夜星空、萌兔互动、4 种告白风格（深情/甜宠/古风/祝愿）、放飞孔明灯与贺卡一键生成复制。
- **🪄 AI 消除与去水印**：涂抹即消！基于 Agnes 图像大模型智能补全与背景重构。
- **📸 AI 智能证件照制作**：一寸/二寸/考研规格，智能人像抠图，一键换红/蓝/白底色。
- **🎲 欢乐聚会摇骰子**：聚会必备！1~6 颗骰子可选、3D 翻滚特效与骰子音效。
- **🎯 命运大转盘**：今天吃什么、谁去跑腿？转盘一转告别选择困难，支持自定义选项。
- **⏳ 倒数纪念日**：记录重要日程、恋爱纪念日与发薪倒数。
- **📝 便签备忘随手记**：灵感清单、待办随手记、随时打勾完成。

### 3. 💻 PC 桌面端 Web 运营管理后台 (Admin Console)
- **📊 运营监控大盘**：总玩家数、今日游戏局数、AI 图像调用量、金币流动大盘、实时流水日志。
- **👥 玩家与资产管理**：玩家列表查询、金币余额充值/扣减、全员一键空投金币、账号封禁与解封。
- **🎮 游戏难度在线调控**：在线调整飞机大战生命/敌机刷新/BOSS血量、消消乐步数、连连看时间。
- **🏆 全服排行榜数据治理**：监控各游戏榜单、作弊高分异常识别、一键剔除违规上榜记录。
- **🤖 Agnes AI 模型接口配置**：兼容 `pangxiaoyin_view` 的网关地址与 Key 配置、生图与对话模型切换。
- **🧰 百宝箱工具上下架管理**：各小工具一键上架与下架隐藏。

---

## 🖥️ 本地开发与分别启动

本项目采用 **单仓库多应用（Monorepo / Sub-project）** 架构，前台与 PC 管理后台在同一工程下**分别独立启动**：

```bash
# 1. 安装项目依赖
npm install

# 2. 启动 📱 移动端/H5 前台 (运行于 http://localhost:5173)
npm run dev:h5

# 3. 启动 💻 PC 桌面端 Web 管理后台 (运行于 http://localhost:5174)
npm run dev:admin

# 4. 启动 💬 微信小程序端开发
npm run dev:mp-weixin
```

---

## 📦 生产构建与产物校验

```bash
# 构建 PC 管理后台
npm run build:admin

# 构建 H5 移动前台
npm run build:h5

# 构建 微信小程序端
npm run build:mp-weixin

# 运行自动化产物完整性与安全校验
npm run verify:build
```

---

## 🐳 Docker 容器化一键部署

```bash
# Windows 用户直接双击 run.bat 或运行：
docker compose -f docker/docker-compose.yml up -d --build

# 访问地址：
# 📱 H5 移动前台: http://localhost:8080/
# 💻 PC 管理后台: http://localhost:8080/admin/
```

---

## 🚀 GitHub Actions 自动化 CI/CD

本项目已配置完整的 [`.github/workflows/build-and-release.yml`](.github/workflows/build-and-release.yml) 工作流：
- 每次 `git push` 到 `main` 分支将自动触发多端编译与产物校验；
- 自动生成 4 个标准 Release 归档包（H5、Admin、微信小程序、All-in-One）；
- 自动部署上线至 **GitHub Pages**。

---

## 📄 开源许可证

[MIT License](LICENSE)
