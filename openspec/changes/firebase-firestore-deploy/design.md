## Context

La aplicación Fantasy Bets utiliza arquitectura hexagonal en Node.js/Express y una base de datos local SQLite (`fantasy_bets.db`). El frontend es una SPA construida con Vue 3 y Vite. El objetivo es desplegar todo el sistema en Google Firebase de forma serverless y con costo cero de infraestructura para la fase MVP.

## Goals / Non-Goals

**Goals:**
- Desplegar la API Express en una Cloud Function v2 (`api`) a través de Firebase Functions.
- Desplegar la SPA Vue 3 en Firebase Hosting con enrutamiento de mismo origen hacia `/api/**`.
- Reemplazar SQLite por Cloud Firestore utilizando adaptadores de repositorio compatibles con las interfaces de dominio existentes.
- Utilizar identificadores nativos alfanuméricos de Firestore (`string`), eliminando `parseInt` de controladores y modelos.
- Asegurar la integridad transaccional de la simulación de torneos mediante `db.runTransaction` de Firestore.
- Soportar desarrollo local sin costo ni conexión a través de Firebase Local Emulator Suite.

**Non-Goals:**
- Migrar el flujo de autenticación a Firebase Authentication nativo (se preserva JWT + bcrypt para no alterar el frontend).
- Modificar el diseño o componentes de la interfaz de usuario en Vue.
- Diseñar modelos complejos con subcolecciones anidadas profundas.

## Decisions

### 1. Cloud Firestore sobre Cloud SQL
- **Decisión**: Utilizar Cloud Firestore en modo nativo con colecciones raíz planas (`users`, `rooms`, `room_members`, `matches`, `bets`).
- **Razón**: Cloud Firestore ofrece un Free Tier permanente (50k lecturas, 20k escrituras/día) ideal para MVP ($0 USD/mes), mientras que Cloud SQL carece de Free Tier y requiere ~$10-$15 USD mensuales más configuración de Serverless VPC Access Connectors.
- **Alternativas consideradas**: Cloud SQL (PostgreSQL), Supabase/Neon externo. Descartados para mantener toda la infraestructura dentro del ecosistema Firebase sin costos fijos.

### 2. Preservación de la Arquitectura Hexagonal
- **Decisión**: Crear adaptadores `FirestoreUserRepository`, `FirestoreRoomRepository`, `FirestoreMatchRepository` y `FirestoreBetRepository` implementando las interfaces de dominio actuales.
- **Razón**: El desacoplamiento de la arquitectura hexagonal permite reemplazar la infraestructura de persistencia sin alterar los casos de uso ni las entidades del dominio.
- **Alternativas consideradas**: Reescribir la capa de backend a funciones sueltas sin arquitectura hexagonal. Descartado por perder modularidad y calidad estructural.

### 3. Identificadores Alfanuméricos Nativos de Documentos
- **Decisión**: Tratar `id`, `roomId`, `userId` y `matchId` como cadenas de texto (`string`) en todos los controladores y consultas, eliminando `parseInt(..., 10)`.
- **Razón**: Firestore genera IDs criptográficos aleatorios de 20 caracteres (ej. `AlK8...`). La interfaz Vue ya almacena y compara estos identificadores como cadenas de texto.
- **Alternativas consideradas**: Generar un contador autoincremental en un documento de Firestore. Descartado por generar cuellos de botella y contención en escrituras concurrentes.

### 4. Empaquetado de Backend en `server/` para Firebase Functions
- **Decisión**: Configurar `firebase.json` con `"functions": { "source": "server" }` y dotar a `server/` de su propio `package.json` con `firebase-functions` y `firebase-admin`.
- **Razón**: Evita duplicar el código del backend en una carpeta adicional `functions/` y mantiene la estructura existente del proyecto limpia.
- **Alternativas consideradas**: Crear carpeta `functions/` separada y duplicar código.

### 5. Simulación de Torneo Transaccional en Firestore
- **Decisión**: Reemplazar la transacción sincrónica de SQLite en `SimulateAndSettleRoom` por `db.runTransaction` de Firestore, ejecutando todas las lecturas de partidos, apuestas y miembros antes de aplicar las escrituras en lote.
- **Razón**: Firestore exige contractualmente que todas las lecturas se realicen antes de cualquier escritura dentro de una transacción.

### 6. Hosting con Rewrite de Mismo Origen
- **Decisión**: Configurar en `firebase.json`:
  ```json
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "/api/**", "function": "api" },
      { "source": "**", "destination": "/index.html" }
    ]
  }
  ```
- **Razón**: El frontend y backend comparten el mismo dominio en producción, eliminando configuraciones CORS complejas y permitiendo que `src/services/api.js` mantenga su ruta relativa `/api` sin modificaciones.

## Risks / Trade-offs

- **[Límite de 500 escrituras por transacción en Firestore]** → Las salas de MVP tienen un máximo de 10 participantes y 28 partidos, requiriendo menos de 60 escrituras por simulación, muy por debajo del límite de 500.
- **[Lecturas múltiples en listado de salas]** → Para evitar lecturas excesivas al obtener conteos de miembros, el documento `rooms` mantendrá un campo desnormalizado `member_ids` y `member_count` actualizado atómicamente con `FieldValue.arrayUnion` / `FieldValue.increment`.
