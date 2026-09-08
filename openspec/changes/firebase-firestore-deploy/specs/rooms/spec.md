## ADDED Requirements

### Requirement: Consulta de sala por identificador
El sistema DEBE (SHALL) permitir a un usuario autenticado consultar el detalle de una sala utilizando su identificador único alfanumérico.

#### Scenario: Consulta exitosa de sala por identificador
- **WHEN** un usuario autenticado realiza GET `/api/rooms/:roomId` con un identificador de documento válido
- **THEN** el sistema retorna HTTP 200 con los detalles de la sala y el conteo de miembros asociados

#### Scenario: Consulta de sala inexistente
- **WHEN** un usuario autenticado realiza GET `/api/rooms/:roomId` con un identificador que no existe
- **THEN** el sistema retorna HTTP 404 Not Found
