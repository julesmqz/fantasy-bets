## Why

Amigos y aficionados del fútbol soccer (específicamente Liga MX) carecen de una plataforma ágil, moderna y ligera para organizar quinielas casuales en salas privadas. Las opciones existentes suelen estar sobrecargadas con pasarelas de pago complejas o atadas a una liga fija sin posibilidad de expansión a otros deportes. 

Se requiere un MVP desacoplado, modular y altamente extensible basado en Feature-First Hexagonal Architecture en el backend y Vue 3 reactivo en el frontend, que permita crear salas por código, generar torneos Round-Robin automáticos de 8 equipos (7 jornadas, 28 partidos), emitir pronósticos y resolver la quiniela en una única transacción atómica con leaderboard en tiempo real.

## What Changes

- **Backend Modular Hexagonal**: Arquitectura vertical por features (`users`, `rooms`, `matches`, `bets`, `shared`) separando Dominio, Aplicación e Infraestructura.
- **Persistencia SQLite**: Implementación con `better-sqlite3`, claves foráneas estrictas (`PRAGMA foreign_keys = ON;`) y transacciones atómicas para resolución de quinielas.
- **Desacoplamiento de Dominio Deportivo**: Abstracción de motor deportivo (`SportEngine`) con implementación inicial `LigaMXSoccerEngine` (catálogo base de 9 equipos, selección aleatoria de 8 y generador Round-Robin oficial de 7 jornadas y 28 partidos).
- **Salas y Membresía**: Creación con código único de 6 caracteres alfanuméricos, cupos mínimos de 2 personas, auto-adhesión del creador y control de aforo/estado (409/403 si llena o completada).
- **Pronósticos y Apuestas**: Registro y modificación de ganadores pronosticados mientras la sala esté `open`, bloqueo en estado `completed`.
- **Simulación y Liquidación Atómica**: Endpoint exclusivo del creador que resuelve los 28 partidos, actualiza el estado de la sala a `completed`, evalúa aciertos (1 punto por acierto) y actualiza el score de cada miembro en una sola transacción.
- **Leaderboard**: Consulta ordenada por puntaje descendente y nombre de usuario ascendente.
- **Frontend Vue 3 SPA**: Vistas de Autenticación (Login/Registro con JWT), Dashboard (Crear sala, unirse por código, listado de mis salas) y Detalle de Sala (header con aforo y código, grid de jornadas/partidos interactivo y leaderboard lateral reactivo).
- **Scripts de Base de Datos**: Script DDL `npm run init-db` para generar el esquema de base de datos relacional.

## Capabilities

### New Capabilities
- `user-auth`: Registro de usuarios, autenticación JWT, hashing seguro de contraseñas y middleware de verificación de sesión.
- `rooms`: Creación de salas con aforo mínimo y código alfanumérico, unión mediante código, control de capacidad y listado de salas por usuario.
- `matches`: Abstracción de catálogo deportivo, selección aleatoria de 8 equipos de Liga MX y generación de fixture Round-Robin de 28 encuentros (7 jornadas de 4 partidos).
- `bets`: Registro y actualización de pronósticos de victoria, simulación transaccional de resultados por parte del creador y cálculo de leaderboard.

### Modified Capabilities
<!-- No existing capabilities being modified in this initial greenfield change -->

## Impact

- **Nuevos Módulos Backend**: `server/src/modules/users`, `server/src/modules/rooms`, `server/src/modules/matches`, `server/src/modules/bets`, `server/src/shared`.
- **Persistencia**: Base de datos SQLite local (`fantasy_bets.db`) con foreign keys habilitadas.
- **Nuevas Dependencias**: `express`, `better-sqlite3`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv` en backend; `vue`, `vue-router`, `tailwindcss`, `postcss`, `autoprefixer` en frontend.
- **APIs**: Rutas bajo `/api/auth`, `/api/rooms`, `/api/matches`, `/api/bets`.
- **Frontend**: Aplicación SPA en Vue 3 que reemplaza el template Vite por defecto.
