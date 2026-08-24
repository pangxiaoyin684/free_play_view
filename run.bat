@echo off
chcp 65001 > nul
echo ========================================================
echo   休闲游戏与百宝箱平台 - 容器化一键启动 (Docker)
echo ========================================================
echo.

echo 正在检查 Docker 运行环境...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Docker 环境，请先安装并启动 Docker Desktop。
    pause
    exit /b 1
)

echo [1/2] 正在构建并启动多端聚合容器 (H5 前台 + PC 管理后台)...
docker compose -f docker/docker-compose.yml up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   [成功] 休闲游戏与百宝箱平台已在容器内成功运行！
    echo.
    echo   - 📱 移动端/H5 前台访问地址:  http://localhost:8080/
    echo   - 💻 PC 桌面端管理后台地址:   http://localhost:8080/admin/
    echo   - 默认管理员账号:            admin
    echo   - 默认管理员密码:            admin123
    echo.
    echo   - 查看容器实时日志指令: docker compose -f docker/docker-compose.yml logs -f
    echo   - 停止服务指令:        docker compose -f docker/docker-compose.yml down
    echo ========================================================
) else (
    echo.
    echo [错误] 容器构建或启动失败，请检查 Docker 日志。
)

pause
