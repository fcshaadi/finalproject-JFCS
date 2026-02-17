# Definition of Done – Digital Legacy Vault MVP



This document defines the criteria that must be met for a feature, user story, or the entire MVP to be considered "done" and ready for production deployment.



All items in this checklist must be completed and verified before considering work complete.



---



## General Requirements



### Code Quality



- [ ] Code follows project conventions and style guidelines

- [ ] No hardcoded credentials or sensitive data in code

- [ ] Environment variables used for all configuration

- [ ] Code is properly commented where necessary

- [ ] No console.log statements in production code

- [ ] No TODO or FIXME comments left in critical paths

- [ ] Code is reviewed and approved by at least one other developer (if applicable)



### Documentation



- [ ] README.md is updated with relevant changes (if applicable)

- [ ] API endpoints are documented (OpenAPI/Swagger if applicable)

- [ ] Code comments explain complex logic

- [ ] Installation instructions are accurate and tested

- [ ] Environment variable documentation is complete



### Version Control



- [ ] All changes are committed to version control

- [ ] Commit messages are clear and descriptive

- [ ] No sensitive data (passwords, secrets, API keys) in commits

- [ ] .env files are in .gitignore

- [ ] node_modules and build artifacts are in .gitignore



---



## Functional Requirements



### User Story 1: Registration & Account Activation



- [ ] User can access registration page

- [ ] Registration form collects:

  - [ ] User full name

  - [ ] User email (validated format)

  - [ ] User password (minimum 8 characters)

  - [ ] Beneficiary full name

  - [ ] Beneficiary email (validated format)

  - [ ] Beneficiary password (minimum 8 characters)

- [ ] User email is unique in `users` table

- [ ] Beneficiary email can be duplicate (NOT unique constraint)

- [ ] Beneficiary email can match user email (same email can be both)

- [ ] Payment is simulated (no real payment gateway)

- [ ] Account activates automatically after simulated payment

- [ ] User is redirected to dashboard after successful registration

- [ ] User can login immediately with registered credentials

- [ ] Login correctly resolves role: "user", "beneficiary", or "both"



### User Story 2: Add New Vault Item



- [ ] User must be authenticated (JWT token required)

- [ ] User role must include "user"

- [ ] User can create text-only item (title + content)

- [ ] User can create file-based item (title + file upload)

- [ ] Title is required for all items

- [ ] At least one of content or file_path must be present

- [ ] Item is stored in database with correct user_id

- [ ] File (if uploaded) is stored locally on server

- [ ] File path is stored in database

- [ ] Item defaults to `is_released = false`

- [ ] Item defaults to `released_at = null`

- [ ] Item appears immediately in user's dashboard

- [ ] Item is NOT visible to beneficiary until released

- [ ] No file size limit enforced (MVP constraint)



### User Story 3: Manage and Release Vault Items



**User Permissions:**

- [ ] User can view all items where `user_id = authenticated_user_id`

- [ ] User can edit title of owned items

- [ ] User can edit content of owned text items

- [ ] User cannot modify items they do not own (403 error)

- [ ] User can delete owned items (hard delete, permanent removal)

- [ ] User can manually release owned items

- [ ] When item is released:

  - [ ] `is_released = true`

  - [ ] `released_at = current timestamp`

- [ ] Visual indicators show release status clearly

- [ ] User can see all items (released and unreleased) in dashboard



**Beneficiary Permissions:**

- [ ] Beneficiary can only see items where:

  - [ ] Linked via `user_beneficiaries` table

  - [ ] `is_released = true`

- [ ] Beneficiary cannot see unreleased items

- [ ] Beneficiary cannot see items not linked to their user(s)

- [ ] Beneficiary has read-only access (no edit/delete/release)

- [ ] Beneficiary can view text content of released items

- [ ] Beneficiary can download files of released items

- [ ] Beneficiary sees user name who created each item



### User Story 4: Beneficiary Read-Only Access



- [ ] Beneficiary must authenticate via JWT

- [ ] Beneficiary role must include "beneficiary"

- [ ] Beneficiary can only access:

  - [ ] Items where they are linked via `user_beneficiaries`

  - [ ] Items where `is_released = true`

- [ ] Beneficiary can view item metadata

- [ ] Beneficiary can view text content

- [ ] Beneficiary can download files (if exists)

- [ ] Beneficiary cannot edit items

- [ ] Beneficiary cannot delete items

- [ ] Beneficiary cannot release items

- [ ] Beneficiary cannot access unreleased items



### Dashboard Behavior (Role-Based UI)



**Role = "user":**

- [ ] Shows editable vault

- [ ] Allows create action

- [ ] Allows edit action

- [ ] Allows delete action

- [ ] Allows release action

- [ ] Shows all items (released and unreleased)



**Role = "beneficiary":**

- [ ] Shows released items only

- [ ] Read-only interface (no edit/delete/release buttons)

- [ ] Can view and download items



**Role = "both":**

- [ ] Two clearly separated sections:

  - [ ] "My Vault" (Editable section)

  - [ ] "Accessible Items" (Read-only section)

- [ ] Sections are visually distinct

- [ ] Navigation between sections is clear

- [ ] User can manage items in "My Vault"

- [ ] User can only view items in "Accessible Items"



---



## Technical Requirements



### Backend (NestJS)



- [ ] All API endpoints implemented and functional:

  - [ ] POST /auth/register

  - [ ] POST /auth/login

  - [ ] POST /items

  - [ ] GET /items

  - [ ] PATCH /items/:id

  - [ ] DELETE /items/:id

  - [ ] PATCH /items/:id/release

  - [ ] GET /beneficiary/items

- [ ] JWT authentication implemented

- [ ] JWT strategy configured

- [ ] Role-based guards implemented

- [ ] Password hashing using bcrypt

- [ ] Input validation using DTOs (class-validator)

- [ ] Error handling implemented

- [ ] Ownership validation on item operations

- [ ] Beneficiary filtering (only released items)

- [ ] File upload handling

- [ ] Local file storage working

- [ ] Database migrations created and tested

- [ ] Environment variables configured

- [ ] Server starts without errors

- [ ] API responds to all endpoints correctly



### Frontend (React)



- [ ] All pages implemented:

  - [ ] Login page

  - [ ] Registration page

  - [ ] Dashboard page

- [ ] AuthContext implemented for state management

- [ ] API service implemented for backend communication

- [ ] JWT token stored securely (localStorage or httpOnly cookie)

- [ ] Role detection from JWT

- [ ] Dashboard adapts based on role

- [ ] Item creation form functional

- [ ] Item editing functional

- [ ] Item deletion functional

- [ ] Item release functional

- [ ] File upload functional

- [ ] File download functional

- [ ] Loading states handled

- [ ] Error states handled

- [ ] Form validation implemented

- [ ] Responsive design (basic)

- [ ] No console errors in browser

- [ ] Environment variables configured



### Database (PostgreSQL)



- [ ] All tables created:

  - [ ] users (id, full_name, email UNIQUE, password_hash, created_at)

  - [ ] beneficiaries (id, full_name, email NOT UNIQUE, password_hash, created_at)

  - [ ] user_beneficiaries (user_id FK, beneficiary_id FK)

  - [ ] items (id, user_id FK, title, content, file_path, is_released, released_at, created_at)

- [ ] Foreign keys configured correctly

- [ ] ON DELETE CASCADE on user_beneficiaries

- [ ] ON DELETE CASCADE on items (when user deleted)

- [ ] Indexes created:

  - [ ] users.email (unique index)

  - [ ] beneficiaries.email (non-unique index)

  - [ ] items.user_id

  - [ ] items.is_released

  - [ ] items(user_id, is_released) composite index

- [ ] Migrations are reversible (down migration exists)

- [ ] Database constraints enforced

- [ ] Data integrity verified



---



## Security Requirements



- [ ] JWT authentication implemented

- [ ] JWT secret stored in environment variable

- [ ] Passwords hashed with bcrypt (never stored in plain text)

- [ ] Role-based middleware protects endpoints

- [ ] Ownership checks prevent unauthorized access

- [ ] Beneficiaries can only access released items

- [ ] SQL injection prevented (using ORM/parameterized queries)

- [ ] Input validation on all user inputs

- [ ] CORS configured appropriately

- [ ] No sensitive data in error messages

- [ ] File uploads validated (if applicable)

- [ ] File paths sanitized to prevent directory traversal



**Explicitly NOT Required (MVP):**

- [ ] Email verification (not in MVP)

- [ ] Encryption at rest (not in MVP)

- [ ] MFA (not in MVP)

- [ ] Rate limiting (not in MVP)

- [ ] Audit logs (not in MVP)



---



## Testing Requirements



### Unit Tests (Backend)



- [ ] Auth service tests:

  - [ ] Registration creates user and beneficiary

  - [ ] Login detects role correctly ("user", "beneficiary", "both")

  - [ ] JWT generation works

  - [ ] Password hashing works

- [ ] Items service tests:

  - [ ] Item creation works

  - [ ] Item update works

  - [ ] Item deletion works (hard delete)

  - [ ] Item release works

  - [ ] Ownership validation works

  - [ ] Beneficiary filtering works



### Integration Tests (Backend)



- [ ] Registration flow test:

  - [ ] POST /auth/register creates user and beneficiary

  - [ ] Payment simulation activates account

  - [ ] User can login after registration

- [ ] Login flow test:

  - [ ] POST /auth/login with user credentials returns "user" role

  - [ ] POST /auth/login with beneficiary credentials returns "beneficiary" role

  - [ ] POST /auth/login with email in both tables returns "both" role

- [ ] Item CRUD flow test:

  - [ ] User can create item

  - [ ] User can view own items

  - [ ] User can edit own items

  - [ ] User can delete own items

  - [ ] User can release items

  - [ ] User cannot modify other user's items

- [ ] Beneficiary access test:

  - [ ] Beneficiary can only see released items

  - [ ] Beneficiary cannot see unreleased items

  - [ ] Beneficiary cannot edit/delete/release items



### Component Tests (Frontend)



- [ ] Dashboard component:

  - [ ] Renders correctly for "user" role

  - [ ] Renders correctly for "beneficiary" role

  - [ ] Renders correctly for "both" role

  - [ ] Shows correct items based on role

- [ ] Item creation form:

  - [ ] Validates required fields

  - [ ] Submits correctly

  - [ ] Handles errors

- [ ] Authentication flow:

  - [ ] Login works

  - [ ] Registration works

  - [ ] Logout works

  - [ ] Protected routes redirect when not authenticated



### Manual Testing



- [ ] Complete user registration flow tested

- [ ] Complete login flow tested (all three role scenarios)

- [ ] Item creation tested (text and file)

- [ ] Item management tested (edit, delete, release)

- [ ] Beneficiary access tested

- [ ] Dashboard behavior tested for all roles

- [ ] File upload and download tested

- [ ] Error scenarios tested (invalid credentials, unauthorized access, etc.)



---



## Deployment Requirements



### Pre-Deployment Checklist



- [ ] All tests pass (unit, integration, component)

- [ ] No linting errors

- [ ] Build succeeds without errors

- [ ] Environment variables documented

- [ ] Database migrations tested

- [ ] Backup strategy considered (if applicable)

- [ ] Deployment instructions documented



### Production Environment (Hetzner)



- [ ] Server provisioned and configured

- [ ] Node.js installed (v18 or superior)

- [ ] PostgreSQL installed (v14 or superior)

- [ ] Nginx installed and configured

- [ ] PM2 installed for process management

- [ ] SSL/TLS configured (Let's Encrypt)

- [ ] Firewall configured

- [ ] Database created

- [ ] Migrations run successfully

- [ ] Environment variables set

- [ ] Backend deployed and running

- [ ] Frontend built and deployed

- [ ] Nginx reverse proxy configured

- [ ] Static files served correctly

- [ ] API accessible

- [ ] Application accessible via domain

- [ ] Health check endpoint responds (if applicable)



### Post-Deployment Verification



- [ ] Registration works in production

- [ ] Login works in production

- [ ] Item creation works in production

- [ ] Item management works in production

- [ ] Beneficiary access works in production

- [ ] File upload/download works in production

- [ ] Dashboard displays correctly for all roles

- [ ] No critical errors in logs

- [ ] Performance is acceptable



---



## MVP Completion Criteria



The MVP is considered complete when ALL of the following are true:



- [ ] Registration works with beneficiary creation

- [ ] Payment simulation activates account

- [ ] Login correctly resolves role ("user", "beneficiary", "both")

- [ ] User can create items (text or file)

- [ ] User can edit items (title and content)

- [ ] User can delete items (hard delete)

- [ ] User can release items manually

- [ ] Beneficiary sees only released items

- [ ] Beneficiary has read-only access

- [ ] Role "both" properly separates UI behavior

- [ ] Hard delete functions correctly

- [ ] No unauthorized access is possible

- [ ] All user stories are implemented and tested

- [ ] All acceptance criteria are met

- [ ] Application is deployed to production (Hetzner)

- [ ] Documentation is complete

- [ ] README.md is accurate and up-to-date



---



## Out of Scope (MVP)



The following are explicitly NOT part of the MVP and should NOT be implemented:



- [ ] Automated death trigger

- [ ] Inactivity detection

- [ ] Scheduled jobs

- [ ] Background workers

- [ ] Email notifications

- [ ] Cloud storage integration

- [ ] Encryption at rest

- [ ] Soft delete

- [ ] Multi-beneficiary support (one beneficiary per user in MVP)

- [ ] Subscription billing

- [ ] Admin panel

- [ ] Microservices architecture

- [ ] File size limits

- [ ] Email verification

- [ ] Rate limiting

- [ ] Audit logs

- [ ] Automated backups



If any of these features are requested, they should be documented as future enhancements and deferred until after MVP completion.

