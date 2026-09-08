# rooms Specification

## Purpose
Administra el ciclo de vida de las salas de quiniela, membresías de participantes, generación de códigos alfanuméricos de acceso y control estricto de cupos máximos.

## Requirements

### Requirement: Creación de salas
El sistema DEBE permitir a un usuario autenticado crear una nueva sala con un nombre, capacidad máxima (mínimo 2 usuarios), generando un código único de 6 caracteres alfanuméricos e ingresando al creador automáticamente como miembro.

#### Scenario: Creación exitosa de sala
- **WHEN** un usuario autenticado envía POST `/api/rooms` con `name` y `max_users >= 2`
- **THEN** el sistema crea la sala en estado `open`, genera un código de 6 caracteres único, añade al creador como miembro activo y retorna HTTP 201

#### Scenario: Capacidad inválida en creación
- **WHEN** un usuario intenta crear una sala con `max_users < 2`
- **THEN** el sistema rechaza la creación retornando HTTP 400 Bad Request

### Requirement: Ingreso a sala por código
El sistema DEBE permitir a un usuario autenticado unirse a una sala abierta ingresando su código alfanumérico de 6 caracteres.

#### Scenario: Unión exitosa a sala disponible
- **WHEN** un usuario autenticado envía POST `/api/rooms/join` con un código válido de una sala con cupo disponible y estado `open`
- **THEN** el sistema añade al usuario como miembro en `room_members` y retorna HTTP 200 con los datos de la sala

#### Scenario: Intento de unión a sala llena
- **WHEN** un usuario intenta unirse a una sala donde el conteo de miembros alcanzó `max_users`
- **THEN** el sistema rechaza la solicitud retornando HTTP 409 Conflict

#### Scenario: Intento de unión a sala completada
- **WHEN** un usuario intenta unirse a una sala con estado `completed`
- **THEN** el sistema rechaza la solicitud retornando HTTP 403 Forbidden o 409 Conflict

#### Scenario: Usuario ya miembro de la sala
- **WHEN** un usuario que ya pertenece a la sala intenta unirse de nuevo
- **THEN** el sistema detecta la membresía existente y retorna los datos de la sala sin duplicar registros

### Requirement: Consulta de salas del usuario
El sistema DEBE permitir listar todas las salas a las que pertenece el usuario autenticado con su rol (creador o participante), aforo actual y estado.

#### Scenario: Listado de salas propias
- **WHEN** un usuario autenticado realiza GET `/api/rooms/my-rooms`
- **THEN** el sistema retorna HTTP 200 con la colección de salas donde el usuario es miembro, incluyendo conteo de miembros y estado
