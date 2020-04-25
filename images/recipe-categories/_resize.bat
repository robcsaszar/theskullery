for /d /r %%aa in (*) do (
  if exist "%%~fi\%%~ni.jpg" (
cd ..\..\_scale
    call scale.bat -source "%%~fi\%%~ni.jpg" -target "%%~fi\%%~ni.jpg" -max-width 1080 -force yes
  )
)