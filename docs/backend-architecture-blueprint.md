# Backend Architecture Blueprint – Digital Legacy Vault MVP

## Overview

This document outlines the complete backend architecture implementation plan for the Digital Legacy Vault MVP using NestJS, TypeORM, and PostgreSQL.

---

## Technology Stack

- **Framework:** NestJS (v10+)
- **ORM:** TypeORM
- **Database:** PostgreSQL (v14+)
- **Authentication:** JWT (@nestjs/jwt, @nestjs/passport)
- **Validation:** class-validator, class-transformer
- **File Upload:** multer (@nestjs/platform-express)
- **Password Hashing:** bcrypt (10 rounds)

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── auth/                            # Authentication Module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── ownership.guard.ts
│   │   └── decorators/
│   │       ├── roles.decorator.ts
│   │       └── current-user.decorator.ts
│   │
│   ├── users/                           # Users Module
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── beneficiaries/                   # Beneficiaries Module
│   │   ├── beneficiaries.module.ts
│   │   ├── beneficiaries.service.ts
│   │   └── entities/
│   │       └── beneficiary.entity.ts
│   │
│   ├── items/                           # Items Module
│   │   ├── items.module.ts
│   │   ├── items.controller.ts
│   │   ├── items.service.ts
│   │   ├── dto/
│   │   │   ├── create-item.dto.ts
│   │   │   └── update-item.dto.ts
│   │   └── entities/
│   │       └── item.entity.ts
│   │
│   ├── beneficiary-items/               # Beneficiary Items Module
│   │   ├── beneficiary-items.module.ts
│   │   ├── beneficiary-items.controller.ts
│   │   └── beneficiary-items.service.ts
│   │
│   ├── database/                        # Database Configuration
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   ├── entities/
│   │   │   └── user-beneficiary.entity.ts
│   │   └── migrations/
│   │       ├── XXXXXX-create-users-table.ts
│   │       ├── XXXXXX-create-beneficiaries-table.ts
│   │       ├── XXXXXX-create-user-beneficiaries-table.ts
│   │       └── XXXXXX-create-items-table.ts
│   │
│   ├── common/                          # Shared Utilities
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   │
│   └── config/                          # Configuration
│       ├── config.module.ts
│       └── config.service.ts
│
├── uploads/                             # File Storage (gitignored)
│
├── test/                                # Test Files
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   └── auth.e2e-spec.ts
│   └── items/
│       ├── items.service.spec.ts
│       └── items.e2e-spec.ts
│
├── .env.example                         # Environment variables template
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Module Dependencies

```
app.module
├── DatabaseModule (TypeORM configuration)
├── ConfigModule (Environment configuration)
├── AuthModule
│   ├── UsersModule
│   └── BeneficiariesModule
├── ItemsModule
│   └── UsersModule (for ownership validation)
└── BeneficiaryItemsModule
    ├── ItemsModule
    └── BeneficiariesModule
```

---

## Database Schema Implementation

### Entities

1. **User Entity**
   - UUID primary key
   - Unique email constraint
   - Password hash (bcrypt)
   - One-to-many relationship with Items
   - Many-to-many relationship with Beneficiaries

2. **Beneficiary Entity**
   - UUID primary key
   - Non-unique email (can be duplicate)
   - Password hash (bcrypt)
   - Many-to-many relationship with Users

3. **UserBeneficiary Entity (Junction Table)**
   - Composite primary key (user_id, beneficiary_id)
   - Foreign keys with CASCADE delete

4. **Item Entity**
   - UUID primary key
   - Foreign key to User (CASCADE delete)
   - Release status fields
   - Indexes on user_id and is_released

---

## Authentication Flow

### Registration Flow

1. Validate input DTO (RegisterDto)
2. Check if user email already exists (must be unique)
3. Hash user password (bcrypt, 10 rounds)
4. Create user record
5. Create beneficiary record (email can be duplicate)
6. Create user_beneficiaries relationship
7. Simulate payment (no real integration)
8. Return success response with user and beneficiary IDs

### Login Flow

1. Validate input DTO (LoginDto)
2. Search email in `users` table
3. Search email in `beneficiaries` table
4. Determine role:
   - Found in users only → role = "user"
   - Found in beneficiaries only → role = "beneficiary"
   - Found in both → role = "both"
5. Verify password (bcrypt compare)
6. Generate JWT with payload:
   ```typescript
   {
     sub: userId or beneficiaryId,
     email: email,
     role: "user" | "beneficiary" | "both",
     userId?: uuid,      // if role includes "user"
     beneficiaryId?: uuid // if role includes "beneficiary"
   }
   ```
7. Return JWT token

---

## Role Resolution Logic

### Implementation

```typescript
async resolveRole(email: string): Promise<RoleResult> {
  const user = await this.usersService.findByEmail(email);
  const beneficiary = await this.beneficiariesService.findByEmail(email);
  
  if (user && beneficiary) {
    return {
      role: 'both',
      userId: user.id,
      beneficiaryId: beneficiary.id
    };
  }
  
  if (user) {
    return { role: 'user', userId: user.id };
  }
  
  if (beneficiary) {
    return { role: 'beneficiary', beneficiaryId: beneficiary.id };
  }
  
  throw new UnauthorizedException('Invalid credentials');
}
```

---

## Authorization Strategy

### Guards

1. **JwtAuthGuard**
   - Validates JWT token
   - Extracts user/beneficiary info from token
   - Attaches to request object

2. **RolesGuard**
   - Checks if user has required role
   - Used with @Roles() decorator
   - Example: `@Roles('user')` or `@Roles('user', 'both')`

3. **OwnershipGuard**
   - Validates item ownership
   - Ensures user can only modify their own items
   - Used on PATCH /items/:id and DELETE /items/:id

### Decorators

- `@Roles(...roles)` - Specify required roles
- `@CurrentUser()` - Get current authenticated user/beneficiary
- `@Public()` - Skip authentication (for public endpoints)

---

## Items Module Implementation

### Endpoints

1. **POST /items**
   - Create new item (text or file)
   - Requires: JWT, role = "user" or "both"
   - Validates: title required, content OR file_path required
   - Defaults: is_released = false, released_at = null

2. **GET /items**
   - Get all items for authenticated user
   - Requires: JWT, role = "user" or "both"
   - Returns: All items where user_id = authenticated user

3. **PATCH /items/:id**
   - Update item (title, content)
   - Requires: JWT, role = "user" or "both", ownership
   - Validates: Item exists and belongs to user

4. **DELETE /items/:id**
   - Hard delete item
   - Requires: JWT, role = "user" or "both", ownership
   - Permanently removes from database and file system

5. **PATCH /items/:id/release**
   - Manually release item
   - Requires: JWT, role = "user" or "both", ownership
   - Sets: is_released = true, released_at = current timestamp

### File Upload Handling

- Use `@UseInterceptors(FileInterceptor('file'))`
- Store files in `uploads/{userId}/` directory
- Save file path in database
- Validate file exists before deletion
- Delete file from filesystem on item deletion

---

## Beneficiary Items Module

### Endpoints

1. **GET /beneficiary/items**
   - Get released items for beneficiary
   - Requires: JWT, role = "beneficiary" or "both"
   - Returns: Items where:
     - is_released = true
     - Beneficiary linked via user_beneficiaries
   - Read-only access

---

## Error Handling

### Custom Exceptions

- `BadRequestException` - Validation errors
- `UnauthorizedException` - Authentication failures
- `ForbiddenException` - Authorization failures (wrong role/ownership)
- `NotFoundException` - Resource not found
- `ConflictException` - Duplicate email (user registration)

### Exception Filter

Global exception filter to format error responses consistently:

```typescript
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string
}
```

---

## Validation

### DTOs with class-validator

- `@IsEmail()` - Email validation
- `@IsString()`, `@MinLength()` - String validation
- `@IsOptional()` - Optional fields
- `@IsNotEmpty()` - Required fields
- `@IsUUID()` - UUID validation
- Custom validators for business rules

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digital_legacy_vault
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=digital_legacy_vault

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB (optional, MVP has no limit)
```

---

## Testing Strategy

### Unit Tests

- Auth service (role resolution, password hashing)
- Items service (CRUD operations, ownership validation)
- Beneficiaries service (filtering released items)

### Integration Tests (E2E)

- Registration flow
- Login flow with different roles
- Item CRUD flow
- Beneficiary access flow
- Authorization edge cases

---

## Migration Strategy

### TypeORM Migrations

1. Create initial migration for all tables
2. Include indexes in migration
3. Include foreign key constraints
4. Include CASCADE delete rules
5. Ensure migrations are reversible

### Migration Order

1. Create users table
2. Create beneficiaries table
3. Create user_beneficiaries junction table
4. Create items table

---

## Security Considerations

1. **Password Security**
   - Never store plain text passwords
   - Use bcrypt with 10 rounds minimum
   - Validate password strength (min 8 characters)

2. **JWT Security**
   - Store secret in environment variable
   - Set appropriate expiration (24h)
   - Include role in token for authorization

3. **File Upload Security**
   - Validate file types (optional in MVP)
   - Sanitize file names
   - Prevent directory traversal
   - Store files outside web root

4. **SQL Injection Prevention**
   - Use TypeORM parameterized queries
   - Never use string concatenation for queries

5. **Authorization**
   - Always verify ownership before modifications
   - Use guards for all protected endpoints
   - Validate role before allowing actions

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize NestJS project
- [ ] Configure TypeORM with PostgreSQL
- [ ] Create database entities
- [ ] Create database migrations
- [ ] Set up environment configuration

### Phase 2: Authentication
- [ ] Implement User and Beneficiary entities
- [ ] Create Auth module structure
- [ ] Implement registration endpoint
- [ ] Implement login endpoint with role resolution
- [ ] Implement JWT strategy
- [ ] Create authentication guards

### Phase 3: Items Management
- [ ] Create Item entity
- [ ] Implement Items module
- [ ] Implement file upload handling
- [ ] Implement CRUD operations
- [ ] Implement ownership validation
- [ ] Implement release functionality

### Phase 4: Beneficiary Access
- [ ] Create BeneficiaryItems module
- [ ] Implement filtering logic (released items only)
- [ ] Implement read-only access

### Phase 5: Testing & Refinement
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test all user stories
- [ ] Verify security requirements
- [ ] Performance optimization

---

## Next Steps

1. Review and approve this blueprint
2. Initialize NestJS project
3. Implement database schema
4. Implement authentication module
5. Implement items module
6. Implement beneficiary access module
7. Write tests
8. Deploy to production

