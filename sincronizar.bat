@echo off
echo =========================================
echo  Sincronizando site com o GitHub...
echo =========================================
echo.
echo Por favor, aguarde. Se pedir para fazer login, clique em "Sign in with browser"!
echo.

"C:\Program Files\Git\cmd\git.exe" push -u origin main -f

echo.
echo =========================================
echo  Processo finalizado! Se nao deu erro acima,
echo  seu site ja esta atualizado!
echo =========================================
pause
