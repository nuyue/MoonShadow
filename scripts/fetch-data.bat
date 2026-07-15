@echo off
REM 从私有仓库拉取数据的脚本 (Windows)

setlocal enabledelayedexpansion

echo === MoonShadow Data Fetch Script ===

if "%DATA_REPO_TOKEN%"=="" (
  echo No DATA_REPO_TOKEN configured, using local example data.
  exit /b 0
)

echo Fetching data from private repository...

set "DATA_REPO_URL=https://%DATA_REPO_TOKEN%@github.com/nuyue/MoonShadow-Data.git"

REM 创建临时目录
set "TEMP_DIR=%TEMP%\moonshadow-data-%RANDOM%"
mkdir "%TEMP_DIR%"

REM 克隆私有仓库
git clone --depth 1 %DATA_REPO_URL% "%TEMP_DIR%" 2>&1 | findstr /V "%DATA_REPO_TOKEN%"

echo Copying data files...

REM 复制文章数据
if exist "%TEMP_DIR%\articles" (
  echo   - Copying articles...
  if exist "articles" rmdir /s /q "articles"
  mkdir "articles"
  xcopy "%TEMP_DIR%\articles" "articles" /e /i /y >nul
)

REM 复制音乐数据
if exist "%TEMP_DIR%\music" (
  echo   - Copying music...
  if exist "music" rmdir /s /q "music"
  mkdir "music"
  xcopy "%TEMP_DIR%\music" "music" /e /i /y >nul
)

REM 复制友链数据
if exist "%TEMP_DIR%\links.json" (
  echo   - Copying links...
  if not exist "src\data" mkdir "src\data"
  copy "%TEMP_DIR%\links.json" "src\data\links.json" >nul
)

REM 复制工具数据
if exist "%TEMP_DIR%\tools.json" (
  echo   - Copying tools...
  if not exist "src\data" mkdir "src\data"
  copy "%TEMP_DIR%\tools.json" "src\data\tools.json" >nul
)

REM 清理临时目录
rmdir /s /q "%TEMP_DIR%"

echo Data fetch completed!
