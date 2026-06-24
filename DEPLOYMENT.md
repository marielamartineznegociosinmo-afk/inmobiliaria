# Guía de Despliegue: Asset Manager

Esta guía explica cómo desplegar la aplicación en la nube usando **Neon** (base de datos), **Render** (backend), **Vercel** (frontend) y **Cloudinary** (almacenamiento de imágenes).

## Arquitectura General

```
┌─────────────────┐
│  Vercel         │ ← Frontend (React + Vite)
│  mariela-       │   - Apunta a Render backend
│  inmobiliaria   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render         │ ← Backend (Node.js + Express)
│  api-server     │   - Conecta a Neon DB
│                 │   - Sube archivos a Cloudinary
└────────┬────────┘
         │
    ┌────┴─────┬───────────────┐
    ▼          ▼               ▼
┌────────┐ ┌────────┐    ┌──────────────┐
│ Neon   │ │Cloudinary│ │ Local uploads│
│ (DB)   │ │(Storage) │ │ (fallback)   │
└────────┘ └────────┘    └──────────────┘
```

---

## 1. Base de Datos: Neon PostgreSQL

### Crear una instancia en Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto (ej: "asset-manager")
4. Neon te dará una URL de conexión:
   ```
   postgres://user:password@host.neon.tech/dbname
   ```
5. Guarda esta URL; la necesitarás para Render

### Crear la base de datos e insertar datos de prueba

```bash
# Localmente (con tu DATABASE_URL de Neon):
DATABASE_URL="postgres://..." pnpm run --filter @workspace/db seed
```

Esto ejecutará el seed script y poblará la base de datos con datos de prueba.

---

## 2. Backend: Render

### Crear un servicio en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Crea un nuevo **Web Service**:
   - **Name**: `asset-manager-api`
   - **Repository**: conecta tu GitHub repo (o usa GitHub deploy key)
   - **Branch**: `main`
   - **Build Command**:
     ```
     pnpm install && pnpm --filter @workspace/api-server run build
     ```
   - **Start Command**:
     ```
     pnpm --filter @workspace/api-server run start
     ```
   - **Environment**: Node.js (auto-seleccionado)

### Configurar Environment Variables en Render

En la sección **Environment** del servicio, añade:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu URL de Neon (ej: `postgres://user:pass@host.neon.tech/db`) |
| `JWT_SECRET` | Genera una cadena aleatoria segura (ej: `openssl rand -hex 32`) |
| `PORT` | `8080` |
| `CLOUDINARY_URL` | Tu URL de Cloudinary (opcional, ver sección 4) |
| `NODE_ENV` | `production` |

**Nota**: Si no configuras Cloudinary, el backend guardará archivos localmente (efímero en Render; se pierden al reiniciar).

### Deploy

1. Haz push a `main` en tu repo
2. Render detectará los cambios y desplegará automáticamente
3. Tu URL de backend será algo como: `https://asset-manager-api.onrender.com`

---

## 3. Frontend: Vercel

### Crear un proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Importa tu repositorio de GitHub
3. Selecciona `artifacts/mariela-inmobiliaria` como **Root Directory**
4. En **Build & Development Settings**:
   - **Framework**: Vite (auto-detectado)
   - **Build Command**: `pnpm --filter @workspace/mariela-inmobiliaria run build`
   - **Output Directory**: `dist/public`

### Configurar Environment Variables en Vercel

En **Settings → Environment Variables**, añade:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | Tu URL de Render (ej: `https://asset-manager-api.onrender.com`) |
| `VITE_BASE_PATH` | `/` (si es root) o `/app` (si es subruta) |

**Nota**: Las variables con prefijo `VITE_` se incluyen en el build de cliente.

### Deploy

1. Haz push a `main` en tu repo
2. Vercel detecciona los cambios y despliega automáticamente
3. Tu URL de frontend será algo como: `https://asset-manager-xxx.vercel.app`

---

## 4. Almacenamiento de Archivos: Cloudinary (Opcional pero Recomendado)

### Por qué Cloudinary es importante

Render tiene **filesystem efímero**: cada reinicio pierde los archivos locales almacenados en `/uploads`. Cloudinary es la solución.

### Crear una cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. Dirígete al **Dashboard**
3. Obtén tus credenciales:
   - **Cloud Name**: visible en el dashboard
   - **API Key** y **API Secret**: en Settings → API Keys

### Configurar en Render

Añade a las **Environment Variables** de Render:

| Variable | Valor |
|----------|-------|
| `CLOUDINARY_CLOUD_NAME` | Tu Cloud Name |
| `CLOUDINARY_API_KEY` | Tu API Key |
| `CLOUDINARY_API_SECRET` | Tu API Secret |

O usa una sola variable (más segura):
| Variable | Valor |
|----------|-------|
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloudname` |

### Cómo funciona

- Cuando Cloudinary está configurado, el backend sube archivos a Cloudinary
- Los URLs de las imágenes se guardan en la BD (Neon)
- Si Cloudinary no está configurado, el backend cae a almacenamiento local (solo para desarrollo)

---

## 5. Resumen de URLs y Secretos

Después de desplegar, tendrás:

```
Frontend:   https://asset-manager-xxx.vercel.app
Backend:    https://asset-manager-api.onrender.com
Database:   postgres://...@host.neon.tech/...
Cloudinary: https://cloudinary.com/console/dashboard
```

**Tabla de secretos a guardar en un lugar seguro:**

| Nombre | Dónde | Valor |
|--------|-------|-------|
| `DATABASE_URL` | Render env + local .env | Neon connection string |
| `JWT_SECRET` | Render env (nunca en repo) | Clave aleatoria segura |
| `CLOUDINARY_URL` | Render env | Credenciales Cloudinary |
| `VITE_API_URL` | Vercel env | URL del backend |

---

## 6. Desarrollo Local

### Configurar `.env` localmente

Copia `artifacts/api-server/.env.example` a `artifacts/api-server/.env`:

```bash
DATABASE_URL=postgres://localhost:5432/mariela-inmobiliaria
JWT_SECRET=dev-secret-key
PORT=8080
# Opcional para Cloudinary local:
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Ejecutar localmente

```bash
# Terminal 1: Backend
cd artifacts/api-server
pnpm dev

# Terminal 2: Frontend
cd artifacts/mariela-inmobiliaria
PORT=3000 pnpm dev
# Luego abre http://localhost:3000
```

---

## 7. Primeros Pasos Post-Despliegue

1. **Verifica el backend**:
   ```bash
   curl https://asset-manager-api.onrender.com/api/properties
   ```

2. **Accede al admin panel**:
   - URL: `https://asset-manager-xxx.vercel.app/admin`
   - Usuario: `admin` (por defecto en seed)
   - Contraseña: revisa `lib/db/seed-db.mjs`

3. **Prueba una subida de imagen**:
   - Crea una propiedad con fotos
   - Confirma que aparecen en la galería

4. **Monitorea los logs**:
   - **Render**: Logs en la página del servicio
   - **Vercel**: Logs en Deployments → Logs
   - **Neon**: Query logs en el dashboard

---

## 8. Troubleshooting

### Backend no inicia en Render

- Revisa **Logs** en Render
- Verifica que `DATABASE_URL` sea válida
- Intenta `pnpm install` + `pnpm build` localmente

### Frontend no conecta al backend

- Verifica `VITE_API_URL` en Vercel (debe ser tu URL de Render)
- Abre DevTools (F12) → Network → verifica que las requests van a la URL correcta

### Las imágenes no se suben

- Si sin Cloudinary: revisa que Render tenga espacio en `/uploads` (no recomendado)
- Si con Cloudinary: revisa `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en Render

### Base de datos vacía

- Ejecuta el seed manualmente:
  ```bash
  DATABASE_URL="postgres://..." pnpm run --filter @workspace/db seed
  ```

---

## 9. Optimizaciones Futuras

- [ ] Comprimir imágenes con Cloudinary transformations
- [ ] Caché en CDN para assets estáticos
- [ ] Rate limiting en `/api/upload`
- [ ] Backups automáticos de Neon
- [ ] Monitoreo de performance con Sentry o similar

---

## Support

Si tienes dudas, revisa:
- [Documentación de Neon](https://neon.tech/docs)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Cloudinary](https://cloudinary.com/documentation)
