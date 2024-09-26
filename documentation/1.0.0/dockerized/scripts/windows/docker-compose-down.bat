@echo off

rem Set environment variables
set "users_env=%cd%\user_env"
set "interface_env=%cd%\interface_env"
set "scheduler_env=%cd%\scheduler_env"
set "notification_env=%cd%\notification_env"
set "project_env=%cd%\project_env"
set "entity_management_env=%cd%\entity_management_env"

rem Run docker-compose
docker-compose -f docker-compose-project.yml down

rem Optionally, clear environment variables after use
set "users_env="
set "interface_env="
set "scheduler_env="
set "notification_env="
set "project_env="
set "entity_management_env="

pause