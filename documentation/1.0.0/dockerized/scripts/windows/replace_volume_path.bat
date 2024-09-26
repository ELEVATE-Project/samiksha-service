@echo off
SETLOCAL EnableDelayedExpansion

REM Define the path of your docker-compose file
SET "DOCKER_COMPOSE_FILE=docker-compose-mentoring.yml"

REM Check if the Docker Compose file exists
IF NOT EXIST "%DOCKER_COMPOSE_FILE%" (
  echo Error: Docker Compose file '%DOCKER_COMPOSE_FILE%' does not exist.
  exit /b 1
)

REM Get the current directory path
SET "CURRENT_DIR=%cd%"

REM Use PowerShell to replace the path for environment.ts
powershell -NoProfile -Command ^
  "$filePath = '%DOCKER_COMPOSE_FILE%';" ^
  "$currentDir = '%CURRENT_DIR%';" ^
  "$content = Get-Content $filePath -Raw;" ^
  "$pattern = '(\s*- ).*?(:/app/src/environments/environment.ts)';" ^
  "$replacement = \"`$1$currentDir\environment.ts`$2\";" ^
  "$updatedContent = $content -replace $pattern, $replacement;" ^
  "Set-Content $filePath $updatedContent -Force;" ^
  "Write-Host 'Updated volume path for environment.ts in ' $filePath;"

echo Script execution completed.
pause