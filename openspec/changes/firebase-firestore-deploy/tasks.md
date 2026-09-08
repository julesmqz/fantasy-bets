## 1. Configuración de Dependencias e Infraestructura Firebase

- [x] 1.1 Crear `firebase.json` y `.firebaserc` configurando Firebase Hosting (directorio público `dist`, rewrites de `/api/**` a la Cloud Function `api` y fallback SPA a `index.html`) y Cloud Functions (`source: server`).
- [x] 1.2 Crear `server/package.json` con `"type": "module"`, dependencias (`firebase-admin`, `firebase-functions`, `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`) y remover `better-sqlite3` de las dependencias de producción.
- [x] 1.3 Implementar `server/src/shared/infrastructure/db/firestore.js` para inicializar el SDK de `firebase-admin` con detección de `FIRESTORE_EMULATOR_HOST` y exportar la instancia de Firestore.

## 2. Repositorios Hexagonales en Cloud Firestore

- [x] 2.1 Implementar `FirestoreUserRepository` cumpliendo con `UserRepository` (registro, búsqueda por email, username e ID).
- [x] 2.2 Implementar `FirestoreRoomRepository` cumpliendo con `RoomRepository` (crear sala, buscar por ID/código, agregar miembros, contar integrantes y listar salas del usuario).
- [x] 2.3 Implementar `FirestoreMatchRepository` cumpliendo con `MatchRepository` (guardar partidos en lote y consultar partidos por ID de sala).
- [x] 2.4 Implementar `FirestoreBetRepository` cumpliendo con `BetRepository` (upsert de apuestas, consultas por sala y usuario, y actualización de puntos).

## 3. Transacción Atómica y Adaptación de API

- [x] 3.1 Actualizar `SimulateAndSettleRoom` para ejecutar la liquidación de partidos, apuestas y puntajes dentro de `db.runTransaction` en Firestore cumpliendo el orden de lecturas antes de escrituras.
- [x] 3.2 Refactorizar `RoomController` y `BetController` para tratar `roomId`, `matchId` y `userId` como cadenas de texto (`string`), removiendo llamadas a `parseInt`.
- [x] 3.3 Conectar los nuevos repositorios en `apiRouter.js` y exportar la aplicación Express como Cloud Function HTTPS con `onRequest` en el punto de entrada de Functions.

## 4. Verificación y Pruebas

- [x] 4.1 Crear y ejecutar prueba E2E automatizada validando el flujo completo (registro, crear sala, unirse, apostar, simular con transacción y consultar leaderboard) contra Firestore.
- [x] 4.2 Compilar el frontend con `npm run build` y verificar que los artefactos generados en `dist/` sean compatibles con la configuración de Firebase Hosting.
