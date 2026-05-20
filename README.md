# Instalación

## 1. Instalar Node.js

Descarga e instala la versión más reciente de Node.js desde la página oficial:

https://nodejs.org/

Verifica la instalación desde **CMD**:

```bash
node -v
```

---

## 2. Instalar pnpm

Ejecuta el siguiente comando en **PowerShell**:

```powershell
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

Verifica la instalación desde **CMD**:

```bash
pnpm -v
```

---

## 3. Instalar dependencias del proyecto

Abre una terminal dentro de la carpeta del proyecto:

```bash
C:\...\TaskPet>
```

Ejecuta:

```bash
pnpm install
```

---

## 4. Solución para `error code 1`

Si durante la instalación aparece un error relacionado con paquetes ignorados (`ignored build scripts`), ejecuta:

```bash
pnpm approve-builds
```

Después selecciona el paquete que apareció en rojo en el error anterior.

---

## 5. Ejecutar la aplicación

Inicia el servidor de desarrollo con:

```bash
pnpm run dev
```



