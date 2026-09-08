# bets Specification

## Purpose
Gestiona el registro de pronósticos por partido, la simulación masiva y liquidación de apuestas en una transacción única, y la tabla de posiciones (leaderboard).

## Requirements

### Requirement: Registro y modificación de pronósticos
Cada miembro activo de una sala DEBE poder registrar y modificar su predicción de ganador (`home_team` o `away_team`) para cada partido mientras la sala permanezca en estado `open`.

#### Scenario: Registro o actualización exitosa de pronóstico
- **WHEN** un miembro de una sala envía PUT o POST `/api/rooms/:roomId/bets` con `match_id` y `predicted_winner` coincidente con el equipo local o visitante mientras `room.status === 'open'`
- **THEN** el sistema guarda o actualiza la apuesta para dicho usuario y partido, retornando HTTP 200/201

#### Scenario: Intento de apostar en sala completada
- **WHEN** un usuario intenta enviar un pronóstico en una sala cuyo estado es `completed`
- **THEN** el sistema rechaza la solicitud retornando HTTP 403 Forbidden o 409 Conflict

#### Scenario: Pronóstico por usuario no miembro
- **WHEN** un usuario autenticado intenta apostar en una sala a la que no pertenece
- **THEN** el sistema rechaza la solicitud retornando HTTP 403 Forbidden

### Requirement: Simulación y liquidación transaccional (exclusivo del creador)
El creador de la sala DEBE disponer de una acción para simular y cerrar la sala, ejecutando en una sola transacción atómica de SQLite la asignación de ganadores, marcado a finalizado, resolución de apuestas y cálculo de puntuaciones.

#### Scenario: Simulación exitosa por el creador
- **WHEN** el creador de la sala envía POST `/api/rooms/:roomId/simulate` en una sala abierta
- **THEN** el sistema ejecuta una transacción SQLite que: (1) asigna pseudoaleatoriamente un ganador a cada uno de los 28 partidos y los marca `finished`; (2) cambia `room.status` a `completed`; (3) asigna 1 punto a cada apuesta acertada; (4) actualiza `room_members.score` con la suma total de aciertos de cada participante; y retorna HTTP 200

#### Scenario: Intento de simulación por un usuario no creador
- **WHEN** un usuario que no es el creador de la sala envía POST `/api/rooms/:roomId/simulate`
- **THEN** el sistema rechaza la operación retornando HTTP 403 Forbidden

#### Scenario: Intento de simulación sobre sala ya completada
- **WHEN** se intenta simular una sala que ya está en estado `completed`
- **THEN** el sistema rechaza la operación retornando HTTP 409 Conflict

### Requirement: Consulta de Leaderboard
El sistema DEBE proveer la tabla de posiciones de la sala con los miembros ordenados descendentemente por puntuación acumulada y, en caso de empate, ordenados alfabéticamente por username.

#### Scenario: Consulta de posiciones
- **WHEN** un cliente consulta GET `/api/rooms/:roomId/leaderboard`
- **THEN** el sistema retorna la lista de miembros con su username, score y posición calculada según los criterios de ordenamiento
