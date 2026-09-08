# Propuesta: Despliegue en Firebase con Cloud Firestore

## Why

El MVP actual depende de un archivo local SQLite (`fantasy_bets.db`) y de un servidor Express monolítico no preparado para entornos serverless efímeros. Para publicar el MVP en producción sin incurrir en costos fijos mensuales (manteniéndose dentro del Free Tier de Google Cloud / Firebase Spark) y con escalabilidad automática, se requiere migrar la capa de persistencia a Cloud Firestore, alojar el frontend en Firebase Hosting y desplegar el backend Express como una Cloud Function.

## What Changes

- **Reemplazo de Persistencia SQLite por Cloud Firestore**: Sustituir `better-sqlite3` por adaptadores de repositorios hexagonales usando `firebase-admin` (`FirestoreUserRepository`, `FirestoreRoomRepository`, `FirestoreMatchRepository`, `FirestoreBetRepository`).
- **IDs Nativos Alfanuméricos**: Migrar los identificadores de enteros autoincrementales a `string` (IDs de documentos de Firestore), eliminando conversiones `parseInt` en controladores y endpoints.
- **Transacción Atómica de Simulación en Firestore**: Adaptar `SimulateAndSettleRoom` para utilizar `db.runTransaction` de Firestore respetando el ciclo de lecturas seguidas de escrituras atómicas.
- **Empaquetado para Cloud Functions**: Configurar `server/package.json` y el punto de entrada exportando la app Express con `onRequest` de `firebase-functions/v2/https`.
- **Configuración de Firebase Hosting y Rewrites**: Definir `firebase.json` para servir el frontend desde `dist/` y enrutar las peticiones `/api/**` a la Cloud Function `api`.
- **Soporte para Emuladores Locales**: Permitir desarrollo y pruebas locales sin conexión a través de Firebase Local Emulator Suite (`FIRESTORE_EMULATOR_HOST`).

## Capabilities

### New Capabilities
- `firebase-deployment`: Configuración de despliegue serverless unificado en Firebase Hosting y Cloud Functions con soporte para Firebase Emulator Suite.

### Modified Capabilities
- `rooms`: Actualizar el soporte de identificadores alfanuméricos y almacenamiento de salas y miembros en colecciones Firestore.
- `bets`: Adaptar el ciclo de apuestas y la transacción de liquidación/simulación para ejecutarse sobre Firestore.

## Impact

- **Dependencias**: Se remueve `better-sqlite3` de producción (evitando compilación nativa node-gyp) y se agregan `firebase-admin` y `firebase-functions`.
- **Backend**: Módulo de base de datos (`server/src/shared/infrastructure/db`) migrado a Firestore; repositorios actualizados bajo la misma interfaz hexagonal de dominio.
- **Frontend**: Permanece con las mismas rutas y contratos de API; no requiere cambios en las vistas gracias al rewrite de Firebase Hosting.
- **Infraestructura**: Se agregan `firebase.json`, `.firebaserc` y configuraciones de emuladores.
