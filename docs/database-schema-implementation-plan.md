# Database Schema Implementation Plan

## Overview

This document details the complete database schema implementation for the Digital Legacy Vault MVP using TypeORM and PostgreSQL.

---

## Database: `digital_legacy_vault`

---

## Table 1: `users`

### Purpose
Stores user account information. Each user can create and manage vault items.

### Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### TypeORM Entity

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Item, (item) => item.user)
  items: Item[];

  @ManyToMany(() => Beneficiary, (beneficiary) => beneficiary.users)
  @JoinTable({
    name: 'user_beneficiaries',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'beneficiary_id', referencedColumnName: 'id' }
  })
  beneficiaries: Beneficiary[];
}
```

### Indexes

- `CREATE UNIQUE INDEX idx_users_email ON users(email);`

### Constraints

- `email` must be UNIQUE
- `full_name`, `email`, `password_hash` are NOT NULL

---

## Table 2: `beneficiaries`

### Purpose
Stores beneficiary account information. Beneficiaries can access released items from linked users.

### Schema

```sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### TypeORM Entity

```typescript
@Entity('beneficiaries')
export class Beneficiary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  // NOTE: email is NOT unique - can be duplicate
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToMany(() => User, (user) => user.beneficiaries)
  users: User[];
}
```

### Indexes

- `CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);` (non-unique)

### Constraints

- `email` is NOT UNIQUE (allows duplicates)
- `full_name`, `email`, `password_hash` are NOT NULL

### Important Notes

- Beneficiary email can overlap with user email
- Beneficiary email can belong to multiple users
- System does NOT cross-check beneficiary email against user uniqueness

---

## Table 3: `user_beneficiaries` (Junction Table)

### Purpose
Links users to their beneficiaries. Establishes many-to-many relationship.

### Schema

```sql
CREATE TABLE user_beneficiaries (
  user_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL,
  PRIMARY KEY (user_id, beneficiary_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
);
```

### TypeORM Entity

```typescript
@Entity('user_beneficiaries')
export class UserBeneficiary {
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @PrimaryColumn({ type: 'uuid' })
  beneficiary_id: string;

  @ManyToOne(() => User, (user) => user.beneficiaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Beneficiary, (beneficiary) => beneficiary.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'beneficiary_id' })
  beneficiary: Beneficiary;
}
```

### Constraints

- Composite primary key: (user_id, beneficiary_id)
- Foreign key to `users` with ON DELETE CASCADE
- Foreign key to `beneficiaries` with ON DELETE CASCADE

### Relationship Rules

- One user → one beneficiary (in MVP, one beneficiary per user)
- One beneficiary → many users (same beneficiary can be linked to multiple users)

---

## Table 4: `items`

### Purpose
Stores vault items (text or files) created by users. Tracks release status for beneficiary access.

### Schema

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(500),
  is_released BOOLEAN NOT NULL DEFAULT false,
  released_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TypeORM Entity

```typescript
@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_path: string | null;

  @Column({ type: 'boolean', default: false })
  is_released: boolean;

  @Column({ type: 'timestamp', nullable: true })
  released_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Indexes

- `CREATE INDEX idx_items_user_id ON items(user_id);`
- `CREATE INDEX idx_items_is_released ON items(is_released);`
- `CREATE INDEX idx_items_user_released ON items(user_id, is_released);` (composite)

### Constraints

- `user_id` foreign key to `users` with ON DELETE CASCADE
- `title`, `user_id`, `is_released` are NOT NULL
- `content` and `file_path` are nullable (but at least one must exist - application level validation)
- `released_at` is nullable (only set when `is_released = true`)

### Business Rules

- At least one of `content` or `file_path` must be present (validated in application layer)
- `released_at` is only set when `is_released = true`
- Default state: `is_released = false`, `released_at = null`
- When released: `is_released = true`, `released_at = current timestamp`

---

## Migration Files

### Migration 1: Create Users Table

```typescript
// XXXXXX-create-users-table.ts
export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE UNIQUE INDEX idx_users_email ON users(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
```

### Migration 2: Create Beneficiaries Table

```typescript
// XXXXXX-create-beneficiaries-table.ts
export class CreateBeneficiariesTable1234567891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE beneficiaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_beneficiaries_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS beneficiaries;`);
  }
}
```

### Migration 3: Create User-Beneficiaries Junction Table

```typescript
// XXXXXX-create-user-beneficiaries-table.ts
export class CreateUserBeneficiariesTable1234567892 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_beneficiaries (
        user_id UUID NOT NULL,
        beneficiary_id UUID NOT NULL,
        PRIMARY KEY (user_id, beneficiary_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_beneficiaries;`);
  }
}
```

### Migration 4: Create Items Table

```typescript
// XXXXXX-create-items-table.ts
export class CreateItemsTable1234567893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        file_path VARCHAR(500),
        is_released BOOLEAN NOT NULL DEFAULT false,
        released_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_items_user_id ON items(user_id);
      CREATE INDEX idx_items_is_released ON items(is_released);
      CREATE INDEX idx_items_user_released ON items(user_id, is_released);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_items_user_released;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_items_is_released;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_items_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS items;`);
  }
}
```

---

## Data Integrity Rules

### Referential Integrity

1. **Users → Items**
   - Deleting a user cascades delete to all their items
   - Items cannot exist without a user

2. **Users ↔ Beneficiaries**
   - Junction table maintains many-to-many relationship
   - Deleting user or beneficiary removes relationship (CASCADE)
   - Beneficiary can exist independently of users

### Application-Level Validations

1. **Item Validation**
   - At least one of `content` or `file_path` must be present
   - Validated in DTO using custom validator

2. **Release Validation**
   - `released_at` can only be set when `is_released = true`
   - Validated in service layer

3. **Email Validation**
   - User email must be unique (enforced by database)
   - Beneficiary email can be duplicate (no unique constraint)
   - System does NOT cross-check beneficiary email against user uniqueness

---

## Query Optimization

### Indexes Strategy

1. **users.email** (UNIQUE)
   - Fast lookup for login
   - Prevents duplicate user emails

2. **beneficiaries.email** (non-unique)
   - Fast lookup for login
   - Allows duplicate emails

3. **items.user_id**
   - Fast retrieval of user's items
   - Used in GET /items endpoint

4. **items.is_released**
   - Fast filtering of released items
   - Used in GET /beneficiary/items endpoint

5. **items(user_id, is_released)** (composite)
   - Optimizes queries filtering by both user and release status
   - Used in dashboard queries

---

## Testing Data

### Seed Data (Optional)

```typescript
// seeds/seed-data.ts
export async function seedDatabase() {
  // Create test users
  // Create test beneficiaries
  // Create test relationships
  // Create test items (released and unreleased)
}
```

---

## Migration Execution Order

1. Create users table
2. Create beneficiaries table
3. Create user_beneficiaries junction table
4. Create items table

**Important:** This order must be maintained due to foreign key dependencies.

---

## Rollback Strategy

All migrations include `down()` methods for rollback:

1. Drop indexes
2. Drop foreign key constraints
3. Drop tables in reverse order

---

## Next Steps

1. Review and approve this schema
2. Generate TypeORM entities
3. Create migration files
4. Test migrations (up and down)
5. Verify indexes and constraints
6. Test data integrity rules

