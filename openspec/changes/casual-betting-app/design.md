## Context

El proyecto requiere un MVP de quinielas deportivas para fútbol (Liga MX) que resuelva la rigidez de plataformas existentes mediante un diseño modular y desacoplado. El sistema debe operar en una arquitectura de monolito modular con backend en Node.js/Express organizado por Vertical Slices (Feature-First + Hexagonal) y frontend reactivo en Vue 3 con Tailwind CSS.

## Goals / Non-Goals

**Goals:**
- Implementar módulos verticales independientes (`users`, `rooms`, `matches`, `bets`, `shared`).
- Garantizar que cada módulo contenga sus tres capas hexagonales: Dominio, Aplicación e Infraestructura.
- Desacoplar el dominio deportivo mediante el patrón Strategy/Factory (`SportEngine`), permitiendo añadir otros deportes sin tocar la lógica central de matches o rooms.
- Garantizar atomicidad estricta en la liquidación de resultados mediante transacciones de `better-sqlite3`.
- Diseñar una interfaz limpia, responsiva e interactiva en Vue 3 con navegación fluida y feedback en vivo de pronósticos y leaderboard.

**Non-Goals:**
- Pasarelas de pago o dinero real (es una quiniela casual de puntos entre amigos).
- Marcadores en tiempo real vía WebSocket o APIs externas de terceros en este MVP (la simulación es pseudoaleatoria dentro de la app).
- Roles complejos de administración global (el creador de la sala es el administrador local de su sala).

## Decisions

### 1. Feature-First + Hexagonal Architecture
- **Decisión**: Estructurar `server/src/modules/` en carpetas por feature (`users`, `rooms`, `matches`, `bets`), donde cada feature contiene `domain/`, `application/`, e `infrastructure/`.
- **Alternativa descartada**: Layer-First tradicional (`controllers/`, `services/`, `models/`), rechazada porque diluye los límites de contexto y complica el mantenimiento independiente y la extensibilidad deportiva.

### 2. Desacoplamiento Deportivo con SportEngine
- **Decisión**: Crear la interfaz de dominio `SportEngine` con métodos `getTeamsPool()`, `selectTeams(count)`, `generateSchedule(teams)` y `simulateWinner(match)`. La implementación `LigaMXSoccerEngine` encapsula el pool de 9 equipos de Liga MX y la generación Round-Robin de 8 equipos (7 jornadas de 4 partidos = 28 encuentros).
- **Razón**: Agregar en el futuro "ChampionsLeague", "NFL" o "NBA" solo requiere una nueva clase que implemente `SportEngine` sin modificar los casos de uso ni la persistencia.

### 3. Persistencia con better-sqlite3 y Foreign Keys
- **Decisión**: Usar `better-sqlite3` en modo síncrono/transaccional con `PRAGMA foreign_keys = ON;`.
- **Razón**: `better-sqlite3` ofrece un rendimiento excepcional, sin la sobrecarga de promises para operaciones transaccionales locales, permitiendo envolver la simulación de 28 partidos, actualización de sala, cálculo de apuestas y actualización de scores en una sola transacción atómica garantizada (`db.transaction(...)`).

### 4. Algoritmo Round-Robin Polygon / Circle Method
- **Decisión**: Implementar el algoritmo de rotación de polígono para 8 equipos ($N=8$, número par). En cada jornada $j \in [1, 7]$, se fija un equipo y rotan los 7 restantes, generando 4 partidos por jornada, asegurando que cada equipo juegue exactamente una vez contra cada uno de los otros 7 sin repeticiones.

### 5. Frontend Vue 3 + Vite + Tailwind CSS
- **Decisión**: Utilizar Vue 3 con Composition API y `<script setup>`, `vue-router` para el enrutamiento (`/auth`, `/dashboard`, `/rooms/:id`), y Tailwind CSS para diseño moderno tipo dashboard deportivo.
- **Razón**: Proporciona reactividad fluida, componentes limpios y alta velocidad de desarrollo y renderizado.

## Risks / Trade-offs

- [Concurrencia en SQLite en escrituras intensivas] → SQLite bloquea la base de datos en transacciones de escritura; para el alcance de este MVP entre grupos casuales de amigos, la latencia es de milisegundos y el rendimiento de `better-sqlite3` es más que suficiente.
- [Almacenamiento de JWT en localStorage] → Vulnerabilidad potencial a XSS si se inyecta script malicioso; mitigado manteniendo dependencias auditadas, sin uso de `v-html` no sanitizado y expiración razonable del token.
- [Simulación irreversible] → Una vez simulada la sala, el estado pasa a `completed` y no puede reabrirse; esto previene alteraciones de apuestas posteriores y asegura la integridad del leaderboard final.
