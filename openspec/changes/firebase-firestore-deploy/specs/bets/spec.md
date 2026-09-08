## MODIFIED Requirements

### Requirement: Simulación y liquidación transaccional (exclusivo del creador)
El creador de la sala DEBE (SHALL) disponer de una acción para simular y cerrar la sala, ejecutando en una sola transacción atómica en la base de datos (Firestore) la asignación de ganadores, marcado a finalizado, resolución de apuestas y cálculo de puntuaciones.

#### Scenario: Simulación exitosa por el creador
- **WHEN** el creador de la sala envía POST `/api/rooms/:roomId/simulate` en una sala abierta
- **THEN** el sistema ejecuta una transacción atómica que: (1) asigna pseudoaleatoriamente un ganador a cada uno de los partidos y los marca `finished`; (2) cambia `room.status` a `completed`; (3) asigna 1 punto a cada apuesta acertada; (4) actualiza la puntuación acumulada de cada participante en los miembros de la sala; y retorna HTTP 200

#### Scenario: Intento de simulación por un usuario no creador
- **WHEN** un usuario que no es el creador de la sala envía POST `/api/rooms/:roomId/simulate`
- **THEN** el sistema rechaza la operación retornando HTTP 403 Forbidden

#### Scenario: Intento de simulación sobre sala ya completada
- **WHEN** se intenta simular una sala que ya está en estado `completed`
- **THEN** el sistema rechaza la operación retornando HTTP 409 Conflict
