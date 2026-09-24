@echo off
chcp 65001 >nul
title 华政港澳台学生咨询平台 · 本地预览
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ============================================
echo   华政港澳台学生咨询平台 · 本地预览
echo   启动后请在浏览器打开下方提示的地址
echo   （默认 http://localhost:7301/ ）
echo   关闭本窗口即停止预览
echo ============================================
echo.
call npm run dev
pause
