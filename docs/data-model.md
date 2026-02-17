# Data Model – MVP



## users



- id (UUID, PK)

- full_name

- email (UNIQUE)

- password_hash

- created_at



---



## beneficiaries



- id (UUID, PK)

- full_name

- email (NOT UNIQUE)

- password_hash

- created_at



Important:

- Beneficiary email can overlap with user email.

- Beneficiary email can belong to multiple users.



---



## user_beneficiaries (junction)



- user_id (FK → users)

- beneficiary_id (FK → beneficiaries)



Relationship:

- One user → one beneficiary

- One beneficiary → many users



---



## items



- id (UUID, PK)

- user_id (FK → users)

- title

- content (nullable)

- file_path (nullable)

- is_released (boolean, default false)

- released_at (nullable)

- created_at



---



## Indexes Required



- users.email

- beneficiaries.email

- items.user_id

- items.is_released



---



## Deletion Rules



- Hard delete only

- Deleting user cascades delete to items

