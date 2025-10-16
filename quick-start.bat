@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 快速启动思维导图应用
echo ========================================
echo.
echo 如果是第一次运行或修改了代码，请使用 rebuild-and-start.bat
echo.
echo 正在启动服务器...
echo.
echo 请在浏览器中访问:
echo 🌟 推荐: http://localhost:8888/standalone-demo.html
echo 📱 主页: http://localhost:8888/
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node start-server.js

