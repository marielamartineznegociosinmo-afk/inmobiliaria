# Asset Manager - Ready for Cloud Deployment ✓

Este repositorio ha sido preparado para despliegue en la nube con la arquitectura **Neon + Render + Vercel + Cloudinary**.

## Quick Start

### 1. **Builds Verificados**
```bash
# Backend ✓
pnpm --filter @workspace/api-server run build
# → dist/index.mjs (4.8 MB)

# Frontend ✓
pnpm --filter @workspace/mariela-inmobiliaria run build
# → dist/public/ (HTML + JS + CSS)
```

### 2. **Cambios Implementados**
- ✅ Backend: Upload route soporta Cloudinary opcional
- ✅ Frontend: FormData usa campo `file` (compatible con backend)
- ✅ Env vars: Ejemplos con Cloudinary en `.env.example`
- ✅ Dependencias: `cloudinary` + `streamifier` agregadas

### 3. **Despliegue**

**Paso 1**: Base de datos (Neon)
```
https://console.neon.tech
→ Crear proyecto
→ Copiar CONNECTION_URL
```

**Paso 2**: Backend (Render)
```
https://render.com
→ New Web Service
→ Build: pnpm install && pnpm --filter @workspace/api-server run build
→ Start: pnpm --filter @workspace/api-server run start
→ Env vars: DATABASE_URL, JWT_SECRET, (opcional) CLOUDINARY_*
```

**Paso 3**: Frontend (Vercel)
```
https://vercel.com
→ Import Repository
→ Root Dir: artifacts/mariela-inmobiliaria
→ Build: pnpm --filter @workspace/mariela-inmobiliaria run build
→ Env vars: VITE_API_URL=<url-de-render>
```

**Paso 4**: Storage (Cloudinary - opcional)
```
https://cloudinary.com
→ Dashboard → Get credentials
→ Render env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### 4. **Documentación Completa**
Ver [`DEPLOYMENT.md`](./DEPLOYMENT.md) para:
- Instrucciones detalladas
- Variables de entorno necesarias
- Troubleshooting
- Testing post-despliegue

### 5. **Archivos de Configuración**
- `render.yaml` - Configuración para Render
- `vercel.json` - Configuración para Vercel
- `artifacts/api-server/.env.example` - Variables del backend

---

## Architecture Diagram

```
Vercel                  Render                    Neon + Cloudinary
┌──────────────┐       ┌──────────────┐          ┌────────────────┐
│  Frontend    │────→  │  Backend     │────→     │  Database &    │
│  React/Vite │       │  Node/Expr   │          │  Image Storage │
└──────────────┘       └──────────────┘          └────────────────┘
                       ↓
                   Cloudinary
                   (Images)
```

---

## Key Features Ready
- ✅ PostgreSQL con Drizzle ORM
- ✅ JWT Authentication
- ✅ Image Upload (local o Cloudinary)
- ✅ Admin Panel (React)
- ✅ Property Management CRUD
- ✅ Responsive UI con Tailwind CSS

---

**Próximo paso**: Sigue [`DEPLOYMENT.md`](./DEPLOYMENT.md) para comenzar el despliegue en la nube.
