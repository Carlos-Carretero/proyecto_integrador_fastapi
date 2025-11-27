# Frontend Cultivos - Gestor de Fincas

Frontend moderno y responsivo para gestionar cultivos. Construido con **vanilla JavaScript puro** (sin frameworks).

## Características

- 🌾 Interfaz agrícola moderna con tema verde/marrón
- 👤 Registro e inicio de sesión separados
- 📋 Listado de cultivos del usuario
- ➕ Crear nuevos cultivos
- 📱 Totalmente responsivo (desktop, tablet, móvil)
- 🔒 Autenticación con JWT

## Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Acceso a la API en Render: `https://proyecto-integrador-fastapi-ui7e.onrender.com/api/v1`

## Instalación Local

### Opción 1: Con Python (Simple HTTP Server)

```bash
cd front_proyecto_integrador_simple
python -m http.server 8001
```

Abre en el navegador: `http://localhost:8001`

### Opción 2: Con Node.js (http-server)

Si tienes Node.js instalado:

```bash
cd front_proyecto_integrador_simple
npx http-server -p 8001 -c-1
```

### Opción 3: Con VS Code Live Server

1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"

## Configuración

### URL de la API

El frontend detecta automáticamente la API a usar:

1. **En desarrollo local** (`localhost`): Usa `http://localhost:8000/api/v1`
2. **En producción** (otro dominio): Usa `https://proyecto-integrador-fastapi-ui7e.onrender.com/api/v1`

Para personalizar, edita `app.js` línea 8-23 en la función `determineAPIUrl()`.

O define una variable global en `index.html`:

```html
<script>
  window.__API_URL = 'https://tu-api.com/api/v1'
</script>
```

## Despliegue en Render

### Como Static Site

1. Crea un nuevo "Static Site" en Render
2. Conecta este repositorio GitHub
3. Configure:
   - **Build Command**: `echo "No build needed"`
   - **Publish directory**: `front_proyecto_integrador_simple`
4. Deploy automático al hacer push a `main`

El frontend accederá automáticamente a la API de Render.

## Flujo de Uso

1. **Registro**: Crea una nueva cuenta con email y contraseña
2. **Login**: Inicia sesión con tus credenciales
3. **Ver Cultivos**: Lista tus cultivos registrados
4. **Crear Cultivo**: Añade un nuevo cultivo indicando nombre, tipo y descripción

## Archivos

- `index.html` - Estructura HTML con 3 pantallas (login, registro, app)
- `app.js` - Lógica JavaScript, manejo de API, autenticación JWT
- `styles.css` - Estilos modernos y responsivos
- `README.md` - Este archivo

## Tecnología

- **Lenguaje**: JavaScript (ES6+) puro
- **Almacenamiento**: localStorage para JWT y datos de usuario
- **Autenticación**: JWT (Bearer token)
- **API**: RESTful (FastAPI backend)
- **Estilos**: CSS3 con variables CSS y media queries

## Troubleshooting

### ¿Registro fallido?

1. Abre la consola del navegador (`F12` → `Console`)
2. Revisa los logs para ver el error exacto
3. Verifica que la URL de la API sea correcta
4. Asegúrate de que el backend tenga CORS habilitado

### ¿No conecta con la API?

- Si está en `localhost`: asegúrate que el backend esté corriendo en `http://localhost:8000`
- Si está desplegado: verifica la URL en `app.js`
- Abre Network tab (`F12` → Network) para ver el estado de las peticiones HTTP

### JWT expirado

La sesión expira después de 60 minutos. Cierra sesión y vuelve a iniciar.

## Desarrollo Local

Para servir localmente mientras desarrollas:

```bash
python -m http.server 8001
# Abre http://localhost:8001 en el navegador
# Los cambios se verán al hacer refresh (F5)
```

Edita:
- `index.html` para cambiar estructura
- `styles.css` para cambiar apariencia
- `app.js` para cambiar lógica de API
