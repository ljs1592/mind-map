@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 重新构建并启动思维导图应用
echo ========================================
echo.

echo [1/5] 检查 Node.js 环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
echo.

echo [2/5] 安装 web 目录依赖...
cd web
if not exist node_modules (
    echo 正在安装依赖，这可能需要几分钟...
    call npm install
    if errorlevel 1 (
        echo ❌ 错误: 依赖安装失败
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已存在，跳过安装
)
echo.

echo [3/5] 构建 simple-mind-map 库...
echo 这可能需要一些时间...
call npm run buildLibrary
if errorlevel 1 (
    echo ❌ 错误: 库构建失败
    cd ..
    pause
    exit /b 1
)
echo ✅ 库构建成功
echo.

echo [4/5] 构建 web 应用...
call npm run build
if errorlevel 1 (
    echo ❌ 错误: 应用构建失败
    cd ..
    pause
    exit /b 1
)
echo ✅ 应用构建成功
echo.

cd ..

echo [5/5] 启动开发服务器...
echo.
echo ========================================
echo 🎉 构建完成！正在启动服务器...
echo ========================================
echo.
echo 请在浏览器中访问:
echo 🌟 推荐: http://localhost:8888/standalone-demo.html
echo 📱 主页: http://localhost:8888/
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node start-server.js

