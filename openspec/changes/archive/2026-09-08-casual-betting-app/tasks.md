## 1. Setup y Arquitectura Base

- [x] 1.1 Configurar dependencias en `package.json` para backend (`express`, `better-sqlite3`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`) y frontend (`vue`, `vue-router`, `@vitejs/plugin-vue`, `tailwindcss`, `postcss`, `autoprefixer`) y verificar instalación exitosa
- [x] 1.2 Implementar inicializador de base de datos SQLite `server/src/shared/infrastructure/db/connection.js` con `PRAGMA foreign_keys = ON;` y script DDL `server/src/shared/infrastructure/db/initDb.js` y verificar la ejecución con `npm run init-db`
- [x] 1.3 Configurar middleware de errores `errorHandler.js` y excepciones de dominio en `server/src/shared/domain/` para respuestas HTTP estándar (400, 401, 403, 404, 409)

## 2. Módulo Users & Autenticación

- [x] 2.1 Crear entidades y value objects de dominio en `server/src/modules/users/domain/` (User, UserRepository interface)
- [x] 2.2 Implementar `SQLiteUserRepository`, `BcryptHashService` y `JwtTokenService` en `server/src/modules/users/infrastructure/`
- [x] 2.3 Implementar casos de uso `RegisterUser`, `LoginUser` y `VerifyToken` en `server/src/modules/users/application/`
- [x] 2.4 Implementar `AuthController`, rutas `authRoutes.js` y `authMiddleware.js` compartido y verificar registro y login con pruebas de endpoint

## 3. Módulo Rooms & Membresías

- [x] 3.1 Crear entidades de dominio `Room` y `RoomMember` y repositorio en `server/src/modules/rooms/domain/`
- [x] 3.2 Implementar `SQLiteRoomRepository` con queries para creación, búsqueda por código, conteo de miembros y listado de salas por usuario
- [x] 3.3 Implementar casos de uso `CreateRoom`, `JoinRoomByCode`, `GetUserRooms` y `GetRoomById` con validaciones de aforo y estado
- [x] 3.4 Implementar `RoomController` y `roomRoutes.js` y verificar flujo de creación y unión por código

## 4. Módulo Matches & Desacoplamiento Deportivo

- [x] 4.1 Definir la abstracción de dominio `SportEngine` y la entidad `Match` en `server/src/modules/matches/domain/`
- [x] 4.2 Implementar `LigaMXSoccerEngine` y `RoundRobinService` con el pool de 9 equipos, selección aleatoria de 8 y generación matemática de 7 jornadas (28 partidos)
- [x] 4.3 Implementar `SQLiteMatchRepository` en `server/src/modules/matches/infrastructure/` para persistencia en bloque de partidos
- [x] 4.4 Integrar la generación automática de los 28 partidos al crear una sala en `CreateRoom` y exponer endpoint `GET /api/rooms/:roomId/matches`

## 5. Módulo Bets, Simulación Transaccional y Leaderboard

- [x] 5.1 Crear entidad `Bet` y reglas de validación en `server/src/modules/bets/domain/`
- [x] 5.2 Implementar `SQLiteBetRepository` con soporte para upsert de apuestas y consultas por sala/usuario
- [x] 5.3 Implementar casos de uso `PlaceOrUpdateBet`, `GetUserRoomBets` y `GetLeaderboard`
- [x] 5.4 Implementar caso de uso `SimulateAndSettleRoom` que ejecute en una sola transacción SQLite la asignación de ganadores a los 28 partidos, cambio de sala a completed, puntuación de apuestas (1 punto por acierto) y actualización de `room_members.score`
- [x] 5.5 Implementar `BetController` y `betRoutes.js` y verificar el cálculo atómico de resultados

## 6. Servidor Express y Orquestación Backend

- [x] 6.1 Crear `server/src/shared/infrastructure/http/apiRouter.js` integrando todos los submódulos bajo `/api`
- [x] 6.2 Configurar `server/src/app.js` con CORS, JSON parser, rutas de la API, manejo de errores y script de inicio y verificar arranque limpio del servidor

## 7. Frontend Vue 3 (Vite + Tailwind CSS)

- [x] 7.1 Configurar Vite con Vue 3 plugin, Tailwind CSS y router en `index.html` y `src/`
- [x] 7.2 Implementar servicio API cliente y composable de autenticación (`useAuth`) con almacenamiento reactivo de token JWT
- [x] 7.3 Implementar vista `AuthView.vue` para Login y Registro con cambio de modo y mensajes de error
- [x] 7.4 Implementar vista `DashboardView.vue` con modal/form de Crear Sala, input de Unirse por Código y tarjetas de Mis Salas
- [x] 7.5 Implementar vista `RoomDetailView.vue` con header informativo (código copiable, aforo, estado), botón de simulación exclusiva para el creador, acordeón/tabs de jornadas (1 a 7) con tarjetas interactivas de pronósticos, y tabla de Leaderboard lateral reactiva
- [x] 7.6 Probar flujo end-to-end completo (registro de usuarios, creación de sala, unión de segundo usuario, emisión de pronósticos, simulación por el creador y actualización de tabla de líderes)
