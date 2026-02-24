## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Jose Fernando Cardeno Shaadi

### **0.2. Nombre del proyecto:**

Digital Legacy Vault

### **0.3. Descripción breve del proyecto:**

MVP de una aplicación web que proporciona un lugar seguro para que las personas almacenen información importante para sus seres queridos, permitiéndoles tomar decisiones informadas en momentos difíciles. Los usuarios pueden crear y gestionar elementos (texto o archivos) en una bóveda digital, y liberarlos manualmente para que los beneficiarios puedan acceder a ellos.

### **0.4. URL del proyecto:**

http://91.98.20.172

### 0.5. URL o archivo comprimido del repositorio

https://github.com/fcshaadi/finalproject-JFCS
---

## 1. Descripción general del producto

### **1.1. Objetivo:**

El propósito de este producto es crear un lugar seguro para que las personas aseguren que están proporcionando información importante a sus seres queridos después de su muerte, y ayudarles a tomar las decisiones correctas en un momento de desesperación.

**Valor aportado:**
- Permite a los usuarios organizar y almacenar información crítica de forma segura
- Facilita la transmisión de información importante a beneficiarios designados
- Proporciona control manual sobre cuándo se libera la información

**Problema que soluciona:**
- Dificultad para organizar y transmitir información importante a seres queridos
- Preocupación sobre el acceso a información crítica en momentos difíciles
- Necesidad de un sistema seguro y controlado para compartir información sensible

**Usuarios objetivo:**
Adultos entre 25 y 80 años que necesitan ayuda para organizar sus asuntos personales y legales.

### **1.2. Características y funcionalidades principales:**

El MVP incluye únicamente las siguientes funcionalidades:

1. **Dashboard y bóveda de archivos segura:**
   - Los usuarios pueden almacenar cualquier tipo de medio digital (texto o archivos)
   - Los elementos pueden ser visualizados o descargados
   - Interfaz diferenciada según el rol del usuario

2. **Creación de nuevos elementos:**
   - Los usuarios pueden crear elementos de texto escribiendo directamente
   - Los usuarios pueden subir archivos de cualquier tipo
   - No hay límite de tamaño de archivo en el MVP
   - Los elementos se almacenan localmente en el servidor

3. **Registro y pago:**
   - Sistema de registro que permite crear cuenta de usuario y beneficiario simultáneamente
   - Pago único simulado (no hay integración real de pasarela de pago)
   - Activación automática de cuenta tras el pago simulado

4. **Gestión de elementos:**
   - Visualización de elementos propios (usuarios)
   - Visualización de elementos liberados (beneficiarios)
   - Edición de elementos (solo usuarios, solo elementos propios)
   - Eliminación permanente de elementos (hard delete)
   - Liberación manual de elementos para beneficiarios

5. **Sistema de roles:**
   - Autenticación JWT básica
   - Dos roles: Usuario y Beneficiario
   - Un mismo email puede tener ambos roles
   - Dashboard adaptativo según el rol detectado

### **1.3. Diseño y experiencia de usuario:**

**Flujo de usuario:**

1. **Registro:**
   - El usuario accede a la página de registro
   - Completa sus datos personales (nombre completo, email, contraseña)
   - Crea un beneficiario (nombre completo, email, contraseña)
   - Se simula el proceso de pago
   - La cuenta se activa automáticamente
   - Redirección al dashboard

2. **Dashboard - Rol Usuario:**
   - Vista de todos los elementos del usuario (liberados y no liberados)
   - Botón para crear nuevo elemento
   - Acciones disponibles: Editar, Eliminar, Liberar
   - Indicadores visuales del estado de liberación

3. **Dashboard - Rol Beneficiario:**
   - Vista de solo elementos liberados
   - Acceso de solo lectura
   - Capacidad de visualizar y descargar elementos

4. **Dashboard - Rol Ambos:**
   - Dos secciones claramente diferenciadas:
     - "Mi Bóveda" (elementos editables del usuario)
     - "Elementos Accesibles" (elementos liberados de solo lectura)
   - Navegación clara entre ambas secciones

[Pendiente: Añadir capturas de pantalla o videotutorial]

### **1.4. Instrucciones de instalación:**

#### Requisitos previos:
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

#### Instalación del Backend (NestJS):

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de base de datos y JWT secret

# Ejecutar migraciones
npm run migration:run

# Iniciar el servidor en modo desarrollo
npm run start:dev
```

#### Instalación del Frontend (React):

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Iniciar el servidor de desarrollo
npm start
```

#### Configuración de la Base de Datos:

```bash
# Crear base de datos
createdb digital_legacy_vault

# Las migraciones se ejecutarán automáticamente al iniciar el backend
# o manualmente con: npm run migration:run
```

#### Estructura de Variables de Entorno:

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/digital_legacy_vault
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=3000
UPLOAD_PATH=./uploads
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:3000
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```
┌─────────────────┐
│   React Client  │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         │ JWT Auth
         ▼
┌─────────────────┐
│   NestJS API    │
│   (Backend)     │
│                 │
│  - Auth Module  │
│  - Items Module │
│  - Users Module │
│  - Files Module │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │ Local File   │
│  Database    │  │ Storage      │
└──────────────┘  └──────────────┘
```

**Patrón arquitectónico:**
La aplicación sigue una arquitectura de **tres capas (3-tier)** con separación clara entre:
- **Capa de presentación:** React (frontend)
- **Capa de lógica de negocio:** NestJS (backend)
- **Capa de datos:** PostgreSQL + sistema de archivos local

**Justificación:**
- **Simplicidad:** Adecuada para un MVP, permite desarrollo rápido y mantenimiento sencillo
- **Escalabilidad básica:** La arquitectura puede evolucionar sin grandes refactorizaciones
- **Separación de responsabilidades:** Facilita el desarrollo en equipo y el testing
- **Tecnologías maduras:** NestJS y React son frameworks estables y bien documentados

**Beneficios:**
- Desarrollo rápido y eficiente
- Fácil de entender y mantener
- Testing simplificado por la separación de capas
- Despliegue sencillo en servidor único (Hetzner)

**Sacrificios/Déficits:**
- No hay escalabilidad horizontal automática
- Almacenamiento local de archivos limita la distribución
- Sin sistema de colas para operaciones asíncronas
- Sin redundancia automática

### **2.2. Descripción de componentes principales:**

#### **Frontend (React):**
- **Tecnología:** React con hooks y context API
- **Propósito:** Interfaz de usuario, gestión de estado de autenticación, comunicación con API
- **Componentes principales:**
  - AuthContext: Gestión de autenticación y roles
  - Dashboard: Vista principal adaptativa según rol
  - ItemForm: Formulario para crear/editar elementos
  - ItemList: Lista de elementos con acciones

#### **Backend (NestJS):**
- **Tecnología:** NestJS (Node.js framework)
- **Propósito:** API REST, lógica de negocio, autenticación, gestión de archivos
- **Módulos principales:**
  - **AuthModule:** Registro, login, generación de JWT, detección de roles
  - **UsersModule:** Gestión de usuarios
  - **ItemsModule:** CRUD de elementos, lógica de liberación
  - **FilesModule:** Almacenamiento y recuperación de archivos locales

#### **Base de Datos (PostgreSQL):**
- **Tecnología:** PostgreSQL
- **Propósito:** Almacenamiento persistente de usuarios, beneficiarios, relaciones y metadatos de elementos
- **Características:** Transacciones ACID, integridad referencial, índices optimizados

#### **Sistema de Archivos:**
- **Tecnología:** Sistema de archivos local del servidor
- **Propósito:** Almacenamiento físico de archivos subidos
- **Estructura:** Directorio `uploads/` con organización por usuario o fecha

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
finalproject-JFCS/
│
├── backend/                    # Aplicación NestJS
│   ├── src/
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/    # JWT strategy
│   │   │   └── guards/        # Role guards
│   │   ├── users/             # Módulo de usuarios
│   │   ├── items/             # Módulo de elementos
│   │   │   ├── items.controller.ts
│   │   │   ├── items.service.ts
│   │   │   └── items.module.ts
│   │   ├── beneficiaries/     # Módulo de beneficiarios
│   │   ├── common/            # Utilidades compartidas
│   │   ├── database/          # Configuración de BD y migraciones
│   │   └── main.ts           # Punto de entrada
│   ├── uploads/              # Archivos subidos (gitignored)
│   ├── package.json
│   └── .env
│
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── context/          # Context API
│   │   │   └── AuthContext.jsx
│   │   ├── services/         # Servicios API
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
├── readme.md                  # Este archivo
└── prompts.md                 # Documentación de prompts
```

**Patrón arquitectónico:**
- **Backend:** Arquitectura modular de NestJS (similar a Angular)
- **Frontend:** Arquitectura basada en componentes con Context API para estado global
- **Separación:** Monorepo con carpetas separadas para frontend y backend

### **2.4. Infraestructura y despliegue**

#### **Diagrama de Infraestructura:**

```
Internet
   │
   ▼
┌─────────────────────┐
│   Hetzner Server    │
│                     │
│  ┌───────────────┐  │
│  │   Nginx       │  │  (Reverse Proxy)
│  │   Port 80/443 │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  NestJS API   │  │  (Port 3000)
│  │  PM2 Process  │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  React Build  │  │  (Static Files)
│  │  (Nginx)      │  │
│  └───────────────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  PostgreSQL   │  │  (Port 5432)
│  └───────────────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  File System  │  │  (/uploads)
│  └───────────────┘  │
└─────────────────────┘
```

#### **Proceso de Despliegue:**

1. **Preparación del servidor:**
   ```bash
   # Instalar Node.js, PostgreSQL, Nginx
   # Configurar firewall
   # Crear usuario de aplicación
   ```

2. **Configuración de Base de Datos:**
   ```bash
   # Crear base de datos
   # Configurar usuario de BD
   # Ejecutar migraciones
   ```

3. **Despliegue del Backend:**
   ```bash
   # Clonar repositorio
   # Instalar dependencias (npm install --production)
   # Configurar variables de entorno
   # Compilar aplicación (npm run build)
   # Iniciar con PM2 (pm2 start dist/main.js)
   ```

4. **Despliegue del Frontend:**
   ```bash
   # Compilar aplicación React (npm run build)
   # Copiar build/ a directorio servido por Nginx
   # Configurar Nginx para servir archivos estáticos
   ```

5. **Configuración de Nginx:**
   - Reverse proxy para API (proxy_pass a localhost:3000)
   - Servir archivos estáticos de React
   - Configurar SSL/TLS (Let's Encrypt)

6. **Configuración de PM2:**
   - Gestión de procesos Node.js
   - Auto-restart en caso de fallo
   - Logs centralizados

### **2.5. Seguridad**

Las prácticas de seguridad implementadas en el MVP son:

1. **Autenticación JWT:**
   - Tokens JWT para autenticación stateless
   - Expiración de tokens configurable
   - Almacenamiento seguro del secret en variables de entorno
   - Ejemplo: `JWT_SECRET` nunca se expone en el código

2. **Middleware de Roles:**
   - Guards en NestJS que verifican el rol del usuario
   - Validación de permisos antes de ejecutar endpoints
   - Ejemplo: Solo el propietario puede editar/eliminar sus elementos

3. **Hash de Contraseñas:**
   - Uso de bcrypt para hashear contraseñas
   - Las contraseñas nunca se almacenan en texto plano
   - Ejemplo: `password_hash` en lugar de `password` en la BD

4. **Validación de Propiedad:**
   - Verificación de que el usuario es propietario antes de modificar elementos
   - Prevención de acceso no autorizado a elementos de otros usuarios
   - Ejemplo: Middleware que verifica `user_id` antes de PATCH/DELETE

5. **Filtrado de Elementos para Beneficiarios:**
   - Los beneficiarios solo ven elementos con `is_released = true`
   - Query filters automáticos en el servicio de items
   - Ejemplo: `WHERE is_released = true AND beneficiary_id IN (...)`

6. **Sanitización de Inputs:**
   - Validación de datos de entrada usando class-validator
   - Prevención de inyección SQL mediante ORM (TypeORM/Prisma)
   - Ejemplo: DTOs con validaciones de formato de email, longitud de contraseña

**Limitaciones del MVP:**
- No hay encriptación de archivos en reposo
- No hay verificación de email
- No hay rate limiting
- No hay protección CSRF (no aplicable en API REST con JWT)
- Almacenamiento local de archivos (no hay redundancia)

### **2.6. Tests**

**Estrategia de Testing:**

1. **Tests Unitarios (Backend):**
   - Tests de servicios de autenticación
   - Tests de lógica de roles
   - Tests de validación de liberación de elementos
   - Ejemplo: `auth.service.spec.ts` - Verificar generación correcta de JWT

2. **Tests de Integración (Backend):**
   - Tests de endpoints de API
   - Tests de flujos completos (registro → login → creación de elemento)
   - Ejemplo: `items.e2e-spec.ts` - Verificar creación y liberación de elemento

3. **Tests de Componentes (Frontend):**
   - Tests de componentes React con React Testing Library
   - Tests de flujos de usuario críticos
   - Ejemplo: Verificar que el dashboard muestra elementos correctos según el rol

**Ejemplos de Tests Implementados:**

- **Test de Autenticación:** Verificar que un usuario puede registrarse y recibir un JWT válido
- **Test de Roles:** Verificar que un beneficiario no puede crear elementos
- **Test de Liberación:** Verificar que solo elementos liberados son visibles para beneficiarios
- **Test de Propiedad:** Verificar que un usuario no puede modificar elementos de otro usuario

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    users {
        uuid id PK
        string full_name
        string email UK "unique"
        string password_hash
        timestamp created_at
    }
    
    beneficiaries {
        uuid id PK
        string full_name
        string email "NOT unique"
        string password_hash
        timestamp created_at
    }
    
    user_beneficiaries {
        uuid user_id FK
        uuid beneficiary_id FK
    }
    
    items {
        uuid id PK
        uuid user_id FK
        string title
        text content "nullable"
        string file_path "nullable"
        boolean is_released "default false"
        timestamp released_at "nullable"
        timestamp created_at
    }
    
    users ||--o{ user_beneficiaries : "has"
    beneficiaries ||--o{ user_beneficiaries : "belongs to"
    users ||--o{ items : "creates"
```

### **3.2. Descripción de entidades principales:**

#### **users**
Almacena la información de los usuarios principales de la aplicación.

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| `id` | UUID | Identificador único del usuario | PRIMARY KEY, NOT NULL |
| `full_name` | VARCHAR | Nombre completo del usuario | NOT NULL |
| `email` | VARCHAR | Email del usuario | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR | Hash de la contraseña (bcrypt) | NOT NULL |
| `created_at` | TIMESTAMP | Fecha de creación del registro | NOT NULL, DEFAULT NOW() |

**Relaciones:**
- Uno a muchos con `items` (un usuario puede crear múltiples elementos)
- Muchos a muchos con `beneficiaries` a través de `user_beneficiaries`

**Índices:**
- Índice único en `email` para búsquedas rápidas de login

#### **beneficiaries**
Almacena la información de los beneficiarios que pueden acceder a elementos liberados.

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| `id` | UUID | Identificador único del beneficiario | PRIMARY KEY, NOT NULL |
| `full_name` | VARCHAR | Nombre completo del beneficiario | NOT NULL |
| `email` | VARCHAR | Email del beneficiario | NOT NULL (pero NO unique) |
| `password_hash` | VARCHAR | Hash de la contraseña (bcrypt) | NOT NULL |
| `created_at` | TIMESTAMP | Fecha de creación del registro | NOT NULL, DEFAULT NOW() |

**Relaciones:**
- Muchos a muchos con `users` a través de `user_beneficiaries`
- Un email puede pertenecer a múltiples beneficiarios (diferentes usuarios pueden tener el mismo beneficiario)

**Nota importante:** El email NO es único porque:
- Un mismo email puede ser beneficiario de múltiples usuarios
- Un email puede ser tanto usuario como beneficiario

#### **user_beneficiaries**
Tabla de unión que relaciona usuarios con sus beneficiarios.

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| `user_id` | UUID | ID del usuario | FOREIGN KEY → users.id, NOT NULL |
| `beneficiary_id` | UUID | ID del beneficiario | FOREIGN KEY → beneficiaries.id, NOT NULL |

**Relaciones:**
- Muchos a uno con `users`
- Muchos a uno con `beneficiaries`

**Restricciones:**
- Clave primaria compuesta: (user_id, beneficiary_id)
- ON DELETE CASCADE en ambas foreign keys

#### **items**
Almacena los elementos (texto o archivos) creados por los usuarios.

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| `id` | UUID | Identificador único del elemento | PRIMARY KEY, NOT NULL |
| `user_id` | UUID | ID del usuario propietario | FOREIGN KEY → users.id, NOT NULL |
| `title` | VARCHAR | Título del elemento | NOT NULL |
| `content` | TEXT | Contenido de texto (si es elemento de texto) | NULLABLE |
| `file_path` | VARCHAR | Ruta del archivo en el servidor (si es archivo) | NULLABLE |
| `is_released` | BOOLEAN | Indica si el elemento ha sido liberado | NOT NULL, DEFAULT false |
| `released_at` | TIMESTAMP | Fecha y hora de liberación | NULLABLE |
| `created_at` | TIMESTAMP | Fecha de creación del elemento | NOT NULL, DEFAULT NOW() |

**Relaciones:**
- Muchos a uno con `users` (cada elemento pertenece a un usuario)

**Restricciones:**
- Al menos uno de `content` o `file_path` debe estar presente (validación a nivel de aplicación)
- `released_at` solo se establece cuando `is_released = true`
- ON DELETE CASCADE: Si se elimina un usuario, se eliminan todos sus elementos (hard delete)

**Índices:**
- Índice en `user_id` para búsquedas rápidas de elementos por usuario
- Índice en `is_released` para filtrado eficiente de elementos liberados
- Índice compuesto en `(user_id, is_released)` para optimizar consultas del dashboard

**Lógica de negocio:**
- Un elemento puede ser de texto (`content` presente) o archivo (`file_path` presente), pero no ambos simultáneamente en el MVP
- Solo elementos con `is_released = true` son visibles para beneficiarios
- Los usuarios siempre ven todos sus elementos, independientemente del estado de liberación

---

## 4. Especificación de la API

### **Endpoint 1: POST /auth/register**

Registra un nuevo usuario y crea un beneficiario asociado.

**OpenAPI Specification:**

```yaml
post:
  summary: Registrar nuevo usuario y beneficiario
  tags:
    - Authentication
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          required:
            - userFullName
            - userEmail
            - userPassword
            - beneficiaryFullName
            - beneficiaryEmail
            - beneficiaryPassword
          properties:
            userFullName:
              type: string
              example: "Juan Pérez"
            userEmail:
              type: string
              format: email
              example: "juan@example.com"
            userPassword:
              type: string
              format: password
              minLength: 8
              example: "password123"
            beneficiaryFullName:
              type: string
              example: "María García"
            beneficiaryEmail:
              type: string
              format: email
              example: "maria@example.com"
            beneficiaryPassword:
              type: string
              format: password
              minLength: 8
              example: "password456"
  responses:
    '201':
      description: Usuario y beneficiario creados exitosamente, pago simulado
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: "Registration successful. Payment simulated. Account activated."
              user:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  email:
                    type: string
              beneficiary:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  email:
                    type: string
    '400':
      description: Error de validación o email de usuario ya existe
    '500':
      description: Error del servidor
```

**Ejemplo de petición:**
```json
POST /auth/register
Content-Type: application/json

{
  "userFullName": "Juan Pérez",
  "userEmail": "juan@example.com",
  "userPassword": "password123",
  "beneficiaryFullName": "María García",
  "beneficiaryEmail": "maria@example.com",
  "beneficiaryPassword": "password456"
}
```

**Ejemplo de respuesta:**
```json
{
  "message": "Registration successful. Payment simulated. Account activated.",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "juan@example.com"
  },
  "beneficiary": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "email": "maria@example.com"
  }
}
```

---

### **Endpoint 2: PATCH /items/:id/release**

Libera manualmente un elemento para que sea visible para los beneficiarios.

**OpenAPI Specification:**

```yaml
patch:
  summary: Liberar un elemento manualmente
  tags:
    - Items
  security:
    - bearerAuth: []
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: ID del elemento a liberar
  responses:
    '200':
      description: Elemento liberado exitosamente
      content:
        application/json:
          schema:
            type: object
            properties:
              id:
                type: string
                format: uuid
              title:
                type: string
              is_released:
                type: boolean
                example: true
              released_at:
                type: string
                format: date-time
    '401':
      description: No autenticado
    '403':
      description: No autorizado (no es el propietario del elemento)
    '404':
      description: Elemento no encontrado
    '500':
      description: Error del servidor
```

**Ejemplo de petición:**
```json
PATCH /items/123e4567-e89b-12d3-a456-426614174000/release
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo de respuesta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Documento importante",
  "is_released": true,
  "released_at": "2024-01-15T10:30:00Z"
}
```

---

### **Endpoint 3: GET /beneficiary/items**

Obtiene todos los elementos liberados visibles para el beneficiario autenticado.

**OpenAPI Specification:**

```yaml
get:
  summary: Obtener elementos liberados para beneficiario
  tags:
    - Beneficiary
  security:
    - bearerAuth: []
  responses:
    '200':
      description: Lista de elementos liberados
      content:
        application/json:
          schema:
            type: object
            properties:
              items:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                      format: uuid
                    title:
                      type: string
                    content:
                      type: string
                      nullable: true
                    file_path:
                      type: string
                      nullable: true
                    released_at:
                      type: string
                      format: date-time
                    user_full_name:
                      type: string
                      description: Nombre del usuario que creó el elemento
    '401':
      description: No autenticado
    '403':
      description: No autorizado (no es beneficiario)
    '500':
      description: Error del servidor
```

**Ejemplo de petición:**
```json
GET /beneficiary/items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo de respuesta:**
```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Documento importante",
      "content": "Este es el contenido del documento...",
      "file_path": null,
      "released_at": "2024-01-15T10:30:00Z",
      "user_full_name": "Juan Pérez"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "title": "Archivo PDF",
      "content": null,
      "file_path": "/uploads/user123/document.pdf",
      "released_at": "2024-01-14T08:20:00Z",
      "user_full_name": "Juan Pérez"
    }
  ]
}
```

**Nota:** Este endpoint solo devuelve elementos donde:
- `is_released = true`
- El beneficiario autenticado está relacionado con el usuario propietario a través de `user_beneficiaries`

---

## 5. Historias de Usuario

### **Historia de Usuario 1: Registro y Activación de Cuenta**

**Como** un adulto que necesita organizar mis asuntos personales  
**Quiero** registrarme en la plataforma y crear un beneficiario  
**Para** poder comenzar a almacenar información importante de forma segura

**Criterios de Aceptación:**
- Puedo acceder a una página de registro
- Debo proporcionar mi nombre completo, email y contraseña
- Debo crear un beneficiario proporcionando su nombre completo, email y contraseña
- El sistema simula un proceso de pago (no hay integración real)
- Mi cuenta se activa automáticamente después del pago simulado
- Soy redirigido al dashboard después del registro exitoso
- Puedo iniciar sesión inmediatamente con mis credenciales

**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Estado:** Completado

---

### **Historia de Usuario 2: Añadir Nuevo Elemento a la Bóveda**

**Como** un usuario registrado  
**Quiero** crear nuevos elementos (texto o archivos) en mi bóveda  
**Para** almacenar información importante que quiero compartir con mis beneficiarios

**Criterios de Aceptación:**
- Puedo acceder a un formulario para crear nuevos elementos desde el dashboard
- Puedo crear un elemento de texto escribiendo directamente en el formulario
- Puedo crear un elemento de archivo subiendo cualquier tipo de archivo
- Debo proporcionar un título para cada elemento
- El elemento se guarda correctamente en la base de datos
- Si es un archivo, se almacena localmente en el servidor
- El elemento NO está liberado por defecto (`is_released = false`)
- Puedo ver el nuevo elemento en mi dashboard inmediatamente después de crearlo
- No hay límite de tamaño de archivo en el MVP

**Prioridad:** Alta  
**Estimación:** 8 puntos  
**Estado:** Completado

---

### **Historia de Usuario 3: Gestionar y Liberar Elementos de la Bóveda**

**Como** un usuario registrado  
**Quiero** editar, eliminar y liberar manualmente mis elementos  
**Para** mantener mi bóveda actualizada y controlar cuándo los beneficiarios pueden acceder a la información

**Como** un beneficiario  
**Quiero** ver solo los elementos que han sido liberados  
**Para** acceder a la información que el usuario ha decidido compartir conmigo

**Criterios de Aceptación (Usuario):**
- Puedo ver todos mis elementos en el dashboard (liberados y no liberados)
- Puedo editar el título y contenido de mis elementos de texto
- Puedo eliminar permanentemente mis elementos (hard delete)
- Puedo liberar manualmente un elemento, lo que lo hace visible para los beneficiarios
- Cuando libero un elemento, se establece `is_released = true` y `released_at = timestamp actual`
- Puedo ver claramente qué elementos están liberados y cuáles no

**Criterios de Aceptación (Beneficiario):**
- Solo veo elementos donde `is_released = true`
- Tengo acceso de solo lectura (no puedo editar, eliminar o liberar)
- Puedo visualizar el contenido de texto de los elementos liberados
- Puedo descargar los archivos de los elementos liberados
- Veo el nombre del usuario que creó cada elemento

**Prioridad:** Alta  
**Estimación:** 13 puntos  
**Estado:** Completado

---

## 6. Tickets de Trabajo

### **Ticket 1: Implementación de Autenticación y Detección de Roles (Backend)**

**Tipo:** Backend  
**Prioridad:** Alta  
**Estimación:** 8 horas

**Descripción:**
Implementar el sistema de autenticación JWT y la lógica de detección de roles que permita a un mismo email tener roles de usuario, beneficiario, o ambos.

**Tareas:**
1. Crear módulo de autenticación en NestJS
2. Implementar endpoint `POST /auth/register` que:
   - Crea un usuario con email, nombre y contraseña hasheada
   - Crea un beneficiario con email, nombre y contraseña hasheada
   - Establece la relación en `user_beneficiaries`
   - Simula el pago y activa la cuenta
3. Implementar endpoint `POST /auth/login` que:
   - Valida credenciales (email y contraseña)
   - Busca el email en las tablas `users` y `beneficiaries`
   - Determina el rol: "user", "beneficiary", o "both"
   - Genera JWT con información del rol
4. Crear JWT strategy para validar tokens
5. Crear guards de roles para proteger endpoints
6. Implementar middleware que inyecta información del usuario/beneficiario en el request

**Criterios de Aceptación:**
- Un usuario puede registrarse con email único
- Un beneficiario puede tener el mismo email que un usuario
- El login detecta correctamente los tres casos de rol
- El JWT contiene información suficiente para determinar permisos
- Los endpoints protegidos rechazan requests sin token válido

**Archivos a modificar/crear:**
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/strategies/jwt.strategy.ts`
- `backend/src/auth/guards/roles.guard.ts`
- `backend/src/auth/dto/register.dto.ts`
- `backend/src/auth/dto/login.dto.ts`

**Testing:**
- Test unitario de `auth.service` para detección de roles
- Test de integración de flujo completo de registro
- Test de integración de login con diferentes escenarios de rol

---

### **Ticket 2: Implementación de Dashboard Adaptativo según Rol (Frontend)**

**Tipo:** Frontend  
**Prioridad:** Alta  
**Estimación:** 10 horas

**Descripción:**
Crear un dashboard que se adapte dinámicamente según el rol del usuario autenticado, mostrando diferentes vistas y funcionalidades.

**Tareas:**
1. Crear `AuthContext` para gestionar estado de autenticación y rol
2. Implementar servicio de API para login y registro
3. Crear componente `Dashboard` que:
   - Detecta el rol del usuario desde el JWT o contexto
   - Muestra vista de "Usuario" si rol = "user":
     - Lista de todos los elementos (liberados y no liberados)
     - Botón "Crear nuevo elemento"
     - Acciones: Editar, Eliminar, Liberar en cada elemento
   - Muestra vista de "Beneficiario" si rol = "beneficiary":
     - Lista de solo elementos liberados
     - Solo lectura (sin acciones de edición)
   - Muestra vista de "Ambos" si rol = "both":
     - Sección "Mi Bóveda" (elementos editables del usuario)
     - Sección "Elementos Accesibles" (elementos liberados de solo lectura)
     - Navegación clara entre secciones
4. Implementar indicadores visuales del estado de liberación
5. Manejar estados de carga y error

**Criterios de Aceptación:**
- El dashboard detecta correctamente el rol del usuario
- La interfaz se adapta según el rol sin recargar la página
- Las secciones están claramente diferenciadas cuando rol = "both"
- Los elementos liberados tienen indicadores visuales claros
- La experiencia de usuario es intuitiva en todos los escenarios

**Archivos a modificar/crear:**
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/ItemList.jsx`
- `frontend/src/components/ItemCard.jsx`
- `frontend/src/services/api.js`
- `frontend/src/utils/jwt.js` (para decodificar JWT y extraer rol)

**Testing:**
- Test de componente Dashboard con diferentes roles
- Test de flujo completo: login → dashboard según rol
- Test de visualización correcta de elementos según rol

---

### **Ticket 3: Diseño e Implementación de Esquema de Base de Datos (Database)**

**Tipo:** Database  
**Prioridad:** Alta  
**Estimación:** 6 horas

**Descripción:**
Diseñar e implementar el esquema completo de base de datos PostgreSQL con todas las tablas, relaciones, índices y restricciones necesarias.

**Tareas:**
1. Crear migración para tabla `users`:
   - Campos: id (UUID, PK), full_name, email (unique), password_hash, created_at
   - Índice único en email
2. Crear migración para tabla `beneficiaries`:
   - Campos: id (UUID, PK), full_name, email (NOT unique), password_hash, created_at
   - No índice único en email (permite duplicados)
3. Crear migración para tabla `user_beneficiaries`:
   - Campos: user_id (FK), beneficiary_id (FK)
   - Clave primaria compuesta
   - ON DELETE CASCADE en ambas foreign keys
4. Crear migración para tabla `items`:
   - Campos: id (UUID, PK), user_id (FK), title, content (nullable), file_path (nullable), is_released (boolean, default false), released_at (nullable timestamp), created_at
   - Foreign key a users con ON DELETE CASCADE
   - Índice en user_id
   - Índice en is_released
   - Índice compuesto en (user_id, is_released)
5. Validar integridad referencial
6. Crear seeds opcionales para datos de prueba

**Criterios de Aceptación:**
- Todas las tablas se crean correctamente con los tipos de datos adecuados
- Las foreign keys funcionan correctamente
- Los índices mejoran el rendimiento de las consultas principales
- El ON DELETE CASCADE elimina elementos cuando se elimina un usuario
- El email de beneficiarios permite duplicados (múltiples usuarios pueden tener el mismo beneficiario)
- Las migraciones son reversibles (down migration)

**Archivos a modificar/crear:**
- `backend/src/database/migrations/XXXXXX-create-users-table.ts`
- `backend/src/database/migrations/XXXXXX-create-beneficiaries-table.ts`
- `backend/src/database/migrations/XXXXXX-create-user-beneficiaries-table.ts`
- `backend/src/database/migrations/XXXXXX-create-items-table.ts`
- `backend/src/database/entities/user.entity.ts`
- `backend/src/database/entities/beneficiary.entity.ts`
- `backend/src/database/entities/item.entity.ts`

**Testing:**
- Verificar creación de tablas
- Verificar integridad referencial (intentar eliminar usuario y verificar cascade)
- Verificar que se pueden crear múltiples beneficiarios con el mismo email
- Verificar rendimiento de consultas con índices

---

## 7. Pull Requests

### **Pull Request 1: 

### **Pull Request 2: 

### **Pull Request 3: 

## Notas Adicionales

### **Limitaciones del MVP:**
- No hay sistema de triggers automáticos
- No hay verificación de email
- No hay encriptación de archivos en reposo
- No hay límite de tamaño de archivo
- Almacenamiento local de archivos (no hay redundancia)
- Pago simulado (no hay integración real)

### **Próximos Pasos (Fuera del MVP):**
- Implementar límites de tamaño de archivo
- Migrar almacenamiento a servicio cloud (S3, etc.)
- Implementar verificación de email
- Añadir sistema de notificaciones
- Implementar triggers automáticos (opción futura)
- Añadir encriptación de archivos
- Implementar rate limiting
- Añadir sistema de backups automáticos
