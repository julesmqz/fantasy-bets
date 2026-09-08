## Purpose

Proporciona la gestión de identidad de usuarios mediante registro seguro, autenticación basada en contraseñas cifradas y emisión de tokens JWT para proteger endpoints privados.

## ADDED Requirements

### Requirement: Registro de usuarios
El sistema DEBE permitir registrar nuevos usuarios con nombre de usuario único, correo electrónico válido único y contraseña.

#### Scenario: Registro exitoso
- **WHEN** un cliente envía una solicitud POST a `/api/auth/register` con username, email y password válidos
- **THEN** el sistema registra al usuario con la contraseña hasheada, retorna HTTP 201 y entrega un token JWT con los datos del usuario

#### Scenario: Registro con email o username duplicado
- **WHEN** un cliente envía una solicitud POST a `/api/auth/register` con un username o email ya existente
- **THEN** el sistema rechaza la solicitud retornando HTTP 409 Conflict y un mensaje de error explicativo

### Requirement: Autenticación e inicio de sesión
El sistema DEBE verificar credenciales de usuario y emitir un JSON Web Token (JWT) válido para solicitudes posteriores.

#### Scenario: Inicio de sesión exitoso
- **WHEN** un usuario envía credenciales correctas (email y password) a `/api/auth/login`
- **THEN** el sistema verifica el hash de la contraseña y retorna HTTP 200 con el token JWT y el perfil básico

#### Scenario: Credenciales inválidas
- **WHEN** un usuario envía un email inexistente o una contraseña incorrecta a `/api/auth/login`
- **THEN** el sistema retorna HTTP 401 Unauthorized

### Requirement: Protección de endpoints mediante JWT
El sistema DEBE contar con un middleware que valide el token Bearer en las cabeceras de autorización de solicitudes a rutas protegidas.

#### Scenario: Acceso con token válido
- **WHEN** un cliente incluye un header `Authorization: Bearer <token>` válido en una ruta protegida
- **THEN** el middleware inyecta la información del usuario autenticado en la solicitud y permite continuar

#### Scenario: Acceso sin token o con token expirado
- **WHEN** un cliente no incluye el token o proporciona un token inválido o expirado
- **THEN** el middleware intercepta la petición y responde con HTTP 401 Unauthorized
