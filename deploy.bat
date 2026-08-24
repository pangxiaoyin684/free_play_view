@echo off
chcp 65001 > nul
echo ========================================================
echo   休闲游戏与百宝箱平台 - 一键打包校验与 GitHub 发布
echo ========================================================
echo.

echo [1/4] 正在编译构建 PC Web 桌面端管理后台...
call npm run build:admin
if %errorlevel% neq 0 (
    echo [错误] PC 管理后台编译失败，已中止发布！
    pause
    exit /b 1
)

echo.
echo [2/4] 正在编译构建 H5 移动前台与微信小程序...
call npm run build:h5
call npm run build:mp-weixin

echo.
echo [3/4] 正在执行多端构建物与安全合规自动检验...
node scripts/verify_build.js
if %errorlevel% neq 0 (
    echo [错误] 构建校验未通过，已中止发布！
    pause
    exit /b 1
)

echo.
echo [4/4] 正在检查 Git 仓库状态并推送到 GitHub...
git status > nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 检测到当前目录尚未初始化 Git 仓库，正在为您初始化...
    git init
    git branch -M main
)

git add .
set /p commit_msg="请输入本次 Git Commit 提交说明 (直接回车默认: 'chore: release and update build'): "
if "%commit_msg%"=="" set commit_msg=chore: release and update build

git commit -m "%commit_msg%"

echo.
echo 正在推送到 GitHub 远程仓库...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [提示] 如果尚未配置远程仓库，请先运行:
    echo   git remote add origin https://github.com/你的用户名/你的仓库名.git
    echo   git push -u origin main
) else (
    echo.
    echo ========================================================
    echo   [成功] 代码与工作流已推送到 GitHub！
    echo   GitHub Actions 将自动触发全量构建、产物归档与 GitHub Pages 部署。
    echo ========================================================
)

pause
