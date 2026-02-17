# User Stories & Acceptance Criteria – MVP



This document defines the official user stories for the MVP of the Digital Legacy Vault project.



These stories must remain aligned with:

- product.md

- roles-and-permissions.md

- release-model.md

- constraints.md



No additional scope should be inferred from this document.



---



# User Story 1 – Registration & Account Activation



## Title

User Registration with Beneficiary Setup



## Story



As a new user,  

I want to create an account and register a beneficiary at the same time,  

So that I can securely store important information and ensure someone I trust can access it when needed.



---



## Acceptance Criteria



### Registration Form



The user must provide:

- Full name

- Email

- Password



The user must also provide beneficiary information:

- Beneficiary full name

- Beneficiary email

- Beneficiary password



---



### Email Rules



- User email must be unique in the `users` table.

- Beneficiary email:

  - Can also exist in the `users` table.

  - Can belong to multiple users.

  - Is NOT unique in the `beneficiaries` table.

- The system must NOT cross-check beneficiary email against user uniqueness.



---



### Payment



- Payment is simulated.

- Upon successful simulation:

  - Account becomes active.

  - User is redirected to dashboard.



---



### Login Role Resolution



When logging in, the system must return one of:



- `"user"`

- `"beneficiary"`

- `"both"`



If the email exists in both `users` and `beneficiaries`, role must be `"both"`.



---



# User Story 2 – Add New Vault Item



## Title

Create Vault Item (Text or File)



## Story



As a registered user,  

I want to create and store new items in my vault (either written content or uploaded files),  

So that my important information is safely preserved in one secure place.



---



## Acceptance Criteria



### Authentication



- User must be authenticated via JWT.

- Role must include `"user"`.



---



### Item Creation



User must be able to:



- Create a text-only item

- Upload a file-based item

- Provide a title (required)



At least one of the following must exist:

- Content

- File



---



### Storage Rules



- Item is stored in the database.

- File (if uploaded) is stored locally on server.

- File path is stored in database.



---



### Default State



Upon creation:



- `is_released = false`

- `released_at = null`



---



### Dashboard Visibility



- Item must appear immediately in user's dashboard.

- Item must NOT be visible to beneficiary until released.



---



# User Story 3 – Manage and Release Vault Items



## Title

Manage and Release Vault Items



## Story



As a registered user,  

I want to view, update, delete, or release my stored items,  

So that I maintain full control over what information becomes accessible to my beneficiary.



---



## Acceptance Criteria



### View Items



- User can retrieve all items where `user_id = authenticated_user_id`.



---



### Update Items



- User can edit:

  - Title

  - Content

- User cannot modify items they do not own.



---



### Delete Items



- User can delete items they own.

- Deletion is HARD DELETE.

- Item is permanently removed from database.

- No soft delete behavior exists.



---



### Release Items



User can manually release an item.



When release occurs:



- `is_released = true`

- `released_at = current timestamp`



Release is:

- Manual only

- Item-level only

- Irreversible in MVP (no unrelease requirement defined)



---



### Beneficiary Visibility



Beneficiary can only see items where:



- They are linked via `user_beneficiaries`

- `is_released = true`



Beneficiary must NOT see:



- Unreleased items

- Items not linked to their associated user(s)



---



# User Story 4 – Beneficiary Read-Only Access



## Title

Access Released Items as Beneficiary



## Story



As a beneficiary,  

I want to access released items from the associated user,  

So that I can view important information when it becomes available.



---



## Acceptance Criteria



### Authentication



- Beneficiary must authenticate via JWT.

- Role must include `"beneficiary"`.



---



### Access Rules



- Beneficiary can only access:

  - Items where they are linked

  - Items where `is_released = true`



---



### Permissions



Beneficiary can:



- View item metadata

- View text content

- Download file (if exists)



Beneficiary cannot:



- Edit items

- Delete items

- Release items

- Access unreleased items



---



# Dashboard Behavior (Role-Based UI)



## If role = "user"



- Show editable vault

- Allow:

  - Create

  - Edit

  - Delete

  - Release



---



## If role = "beneficiary"



- Show released items only

- Read-only interface



---



## If role = "both"



Dashboard must clearly separate:



1. My Vault (Editable)

2. Accessible Items (Read-only)



The two sections must be visually distinct.



---



# MVP Completion Definition



The MVP is complete when:



- Registration works with beneficiary creation.

- Payment simulation activates account.

- Login correctly resolves role.

- User can create, edit, delete, and release items.

- Beneficiary sees only released items.

- Role `"both"` properly separates UI behavior.

- Hard delete functions correctly.

- No unauthorized access is possible.

