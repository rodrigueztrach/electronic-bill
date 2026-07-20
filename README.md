# Facturación Electrónica Costa Rica — Base de proyecto

Base funcional para un sistema de facturación electrónica costarricense
(versión de esquema **4.3** del Ministerio de Hacienda), con:

- **Backend**: Node.js + Express + PostgreSQL (Sequelize)
- **Frontend**: React (Vite)
- Generación de **clave numérica** (50 dígitos) y **consecutivo** (20 dígitos)
- Construcción del **XML** del comprobante
- **Firma digital** (punto de partida XML-DSig, ver advertencia abajo)
- Cliente HTTP para la **API de Recepción de Hacienda** (sandbox/producción)

## Antes de usar en producción

Este código es una **base de arranque**, no un producto certificado. Debes completar/revisar:

1. **Firma XAdES-BES real.** `xml-crypto` firma XML-DSig estándar, pero Hacienda exige
   XAdES-BES (con `SignedProperties`, política de firma, certificado embebido según su
   perfil). Para cumplir 100%, evalúa:
   - Usar el ejemplo/librería que referencia el Ministerio de Hacienda, o
   - Un microservicio en Java con una librería XAdES probada (p.ej. Apache Santuario + XAdES4j),
     y llamarlo desde este backend.
2. **Certificado .p12.** Debes tramitar la "llave criptográfica" ante el ATV
   (Administración Tributaria Virtual) y colocarla en `backend/certs/` (no se incluye
   ninguna en este repo).
3. **Catálogo CAByS.** Cada línea de producto requiere un código CAByS de 13 dígitos
   válido (catálogo público de Hacienda).
4. **Tabla de códigos de tarifa de IVA**, exoneraciones, otros cargos, referencias a
   otros comprobantes, notas de crédito/débito, exportación, etc. — no cubiertos en
   detalle aquí; revisa el Anexo v4.3 oficial.
5. **Envío de PDF/XML al cliente por correo** (obligatorio en muchos flujos) y manejo
   de mensajes de aceptación/rechazo (XML de respuesta de Hacienda).
6. **Ambiente sandbox de Hacienda** para pruebas antes de producción
   (`api-sandbox.comprobanteselectronicos.go.cr`).

## Estructura

```
cr-facturacion-electronica/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, datos del emisor
│   │   ├── models/       # Sequelize: Cliente, Producto, Factura, DetalleFactura, Usuario
│   │   ├── controllers/  # Lógica de negocio por recurso
│   │   ├── routes/       # Definición de endpoints REST
│   │   ├── services/     # xmlService, firmaService, haciendaService
│   │   ├── middleware/   # auth (JWT), manejo de errores
│   │   └── utils/clave.js # Generación de clave y consecutivo
│   ├── migrations/001_init.sql
│   └── .env.example
└── frontend/
    └── src/
        ├── api/api.js
        ├── components/Navbar.jsx
        └── pages/ (Login, Dashboard, Clientes, Productos, FacturaForm, FacturaList)
```

## Instalación — Backend

```bash
cd backend
cp .env.example .env      # edita con tus credenciales reales
npm install

# Crea la base de datos en PostgreSQL, luego:
psql -U postgres -d facturacion_cr -f migrations/001_init.sql
# (o deja que sequelize.sync() la genere en modo desarrollo)

npm run dev                # http://localhost:4000
```

Crea tu primer usuario para poder iniciar sesión:

```bash
curl -X POST http://localhost:4000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Admin","email":"admin@miempresa.cr","password":"claveSegura123"}'
```

## Instalación — Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

El frontend usa un proxy (`vite.config.js`) hacia `http://localhost:4000`, así que
en desarrollo no necesitas configurar CORS manualmente para las llamadas `/api/*`.

## Flujo de una factura

1. El usuario crea la factura en el frontend (cliente + líneas de producto).
2. El backend calcula totales, genera el **consecutivo** y la **clave** de 50 dígitos.
3. Se construye el **XML** v4.3 (`xmlService.js`).
4. Se **firma** el XML (`firmaService.js` — requiere tu certificado `.p12`).
5. Se **envía** a la API de Recepción de Hacienda (`haciendaService.js`).
6. El estado (`recibido` / `aceptado` / `rechazado`) se guarda y puede
   refrescarse desde el listado de facturas ("Actualizar estado").

## Endpoints principales

| Método | Ruta                       | Descripción                              |
|--------|----------------------------|-------------------------------------------|
| POST   | /api/auth/registro         | Crear usuario                             |
| POST   | /api/auth/login            | Login, devuelve JWT                       |
| GET    | /api/clientes               | Listar clientes                          |
| POST   | /api/clientes               | Crear cliente                            |
| GET    | /api/productos               | Listar productos                       |
| POST   | /api/productos               | Crear producto                         |
| POST   | /api/facturas               | Crear y emitir factura                  |
| GET    | /api/facturas               | Listar facturas                          |
| GET    | /api/facturas/:id/estado    | Consultar estado en Hacienda             |

Todas las rutas (excepto `/api/auth/*`) requieren el header
`Authorization: Bearer <token>`.
