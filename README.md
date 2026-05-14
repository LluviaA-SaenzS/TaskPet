# Instalacion

## Instalar Dependencias
(cmd)Instalar node.js de la pagina oficial, para checar la version en cmd usa:
    node -v

(ps)Instalar pnpm desde el powershell:
    Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
(cmd)Checar la version de pnpm en cmd:    
    pnpm -v

(cmd)Dentro de la carpeta del proyecto(C:\...\TaskPet>) usar:
    pnpm install

(cmd)Si sale error code 1 usar:
    pnpm approve-builds
(cmd)Aqui tendras que elegir la que te dio error(en rojo ignored..) en el anterior comando
(cmd)Correr la aplicacion(cmd):
    pnpm run dev



