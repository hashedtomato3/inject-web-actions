
rmdir /s /q ..\ChromeStore\vue\dist
REM rm -rf ../ChromeStore/vue/dist

xcopy /e /y dist ..\ChromeStore\vue\dist\
REM cp -rf dist ../ChromeStore/vue/dist

REM powershell compress-archive ..\ChromeStore\host ..\ChromeStore\host.zip -Force
REM REM (cd ..; zip -r ChromeStore.zip ChromeStore)

powershell compress-archive ..\ChromeStore ..\ChromeStore.zip -Force

