@echo off
SETLOCAL

:: Define variables
set EC2_IP=18.218.59.108
set REMOTE_USERNAME=ec2-user
set KEY_PATH=C:\Dev\personal\secrets\terrabyte.ppk

set REMOTE_PATH=/deployments/terrabyte/build/usedfurniture.web.admin/usedfurniture.web.admin/
set LOCAL_FILE_PATH=C:\Dev\personal\usedfurniture.web.admin\usedfurniture.web.admin
set TEMP_DIR=C:\Temp\usedfurniture_transfer\usedfurniture.web.admin

:: Prepare temporary directory
if exist "%TEMP_DIR%" (
    rd /s /q "%TEMP_DIR%"
)
mkdir "%TEMP_DIR%"

:: Copy only newer or modified files, excluding .git folders, with less verbose output
robocopy "%LOCAL_FILE_PATH%" "%TEMP_DIR%" /E /XD ".git" "node_modules" /XO /NDL /NFL /NJH /NJS

:: Check for errors in robocopy
if %ERRORLEVEL% geq 8 (
    echo Error occurred during robocopy operation.
    goto :cleanup
)

:: Transfer files using pscp
echo Transferring files to remote server...
pscp -q -r -i "%KEY_PATH%" "%TEMP_DIR%\*" %REMOTE_USERNAME%@%EC2_IP%:%REMOTE_PATH%

:: Check for errors in file transfer
if %ERRORLEVEL% neq 0 (
    echo Error occurred during file transfer.
    goto :cleanup
)

echo File transfer completed successfully.

:cleanup
:: Clean up temporary directory
rd /s /q "%TEMP_DIR%"

ENDLOCAL
