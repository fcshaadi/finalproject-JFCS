# Digital Legacy Vault - Backend API

NestJS backend API for the Digital Legacy Vault MVP.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb digital_legacy_vault
```

2. Run migrations:
```bash
npm run migration:run
```

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

- POST /auth/register - Register user and beneficiary
- POST /auth/login - Login and get JWT token
- POST /items - Create new item
- GET /items - Get user's items
- PATCH /items/:id - Update item
- DELETE /items/:id - Delete item
- PATCH /items/:id/release - Release item
- GET /beneficiary/items - Get released items for beneficiary

