## Purpose

Provee la infraestructura de ejecución serverless y alojamiento web para la aplicación Fantasy Bets utilizando Firebase Hosting para el cliente SPA y Cloud Functions para la API REST.

## ADDED Requirements

### Requirement: Enrutamiento unificado de Hosting y API
El sistema DEBE (SHALL) servir la aplicación cliente SPA desde Firebase Hosting y redirigir transparentemente todas las peticiones con prefijo `/api/**` hacia la Cloud Function del backend sin requerir configuración CORS adicional para el mismo origen.

#### Scenario: Petición a la aplicación web (SPA)
- **WHEN** un usuario solicita cualquier ruta HTML o recurso estático que no comience por `/api/`
- **THEN** Firebase Hosting entrega los archivos construidos en `dist/` o efectúa el fallback a `/index.html` con HTTP 200

#### Scenario: Petición a endpoint de API
- **WHEN** el cliente realiza una petición HTTP a una ruta con prefijo `/api/*` (ejemplo `/api/health` o `/api/rooms`)
- **THEN** Firebase Hosting redirige la petición a la Cloud Function `api` que procesa la solicitud mediante Express y responde con el payload JSON correspondiente

### Requirement: Soporte para emulador local de Firestore y Hosting
El backend DEBE (SHALL) soportar la variable de entorno `FIRESTORE_EMULATOR_HOST` para conectarse a la suite local de emuladores de Firebase durante el desarrollo y ejecución de pruebas sin requerir credenciales de Google Cloud en la nube.

#### Scenario: Ejecución en entorno de emulador
- **WHEN** la variable `FIRESTORE_EMULATOR_HOST` está presente en el entorno
- **THEN** el backend inicializa la conexión de Firestore contra el host y puerto local del emulador
