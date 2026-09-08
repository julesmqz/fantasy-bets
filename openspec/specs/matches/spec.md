# matches Specification

## Purpose
Maneja el catálogo deportivo desacoplado, la selección aleatoria de equipos para la sala y la generación del fixture Round-Robin de 28 partidos en 7 jornadas.

## Requirements

### Requirement: Desacoplamiento de catálogo deportivo
El sistema DEBE proveer una interfaz de dominio (`SportEngine`) que desacople la configuración de ligas deportivas y permita agregar deportes a futuro sin alterar los casos de uso.

#### Scenario: Uso del motor de Liga MX
- **WHEN** se genera un torneo para una sala de fútbol Liga MX
- **THEN** el sistema utiliza la implementación `LigaMXSoccerEngine` que provee el catálogo de 9 equipos base

### Requirement: Generación de fixture Round-Robin
Al inicializar los partidos de una sala, el sistema DEBE seleccionar aleatoriamente 8 equipos del pool de 9 y generar un calendario Round-Robin de exactamente 7 jornadas con 4 partidos por jornada (28 partidos en total).

#### Scenario: Creación de partidos para la sala
- **WHEN** se crean los partidos de una nueva sala
- **THEN** el sistema registra 28 partidos en la base de datos asociados a la sala, todos con estado `pending`, `winner = NULL` y repartidos en jornadas del 1 al 7 donde cada equipo enfrenta a cada rival exactamente una vez

### Requirement: Consulta de partidos de una sala
El sistema DEBE exponer un endpoint para consultar todos los partidos de una sala agrupados o filtrables por jornada.

#### Scenario: Obtener partidos de la sala
- **WHEN** un usuario autenticado miembro de la sala consulta GET `/api/rooms/:roomId/matches`
- **THEN** el sistema retorna los 28 partidos con sus identificadores, jornada, equipos local y visitante, ganador y estado
