@echo off
rem 设置控制台编码为 UTF-8 以支持中文显示
chcp 65001 > nul

echo ==========================================
echo      FluxJP Git Auto-Uploader
echo      (GitHub 自动上传脚本)
echo ==========================================
echo.

:INPUT
set /p UserInput=请输入提交描述 (Enter commit message): 

if "%UserInput%"=="" (
    echo 描述不能为空，请重新输入。
    goto INPUT
)

echo.
echo [1/3] 执行 git add . ...
git add .

echo.
echo [2/3] 执行 git commit...
git commit -m "%UserInput%"

echo.
echo [3/3] 执行 git push...
git push

echo.
echo ==========================================
echo      上传完成！按任意键退出...
echo ==========================================
pause > nul
