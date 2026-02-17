# Security Model – MVP



## Authentication



- JWT-based authentication

- Password hashing (bcrypt assumed)

- Role-based middleware



---



## Authorization



- Ownership checks on item operations

- Beneficiary restricted to released items only



---



## Explicitly Not Included



- No encryption at rest

- No email verification

- No MFA

- No audit logs

- No automated monitoring

- No background jobs



Security is basic but sufficient for MVP validation.

