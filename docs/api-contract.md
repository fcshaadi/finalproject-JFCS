# API Contract – MVP



## Authentication



### POST /auth/register

Register a new user and beneficiary simultaneously.

**Request Body:**
```json
{
  "userFullName": "John Doe",
  "userEmail": "john@example.com",
  "userPassword": "password123",
  "beneficiaryFullName": "Jane Doe",
  "beneficiaryEmail": "jane@example.com",
  "beneficiaryPassword": "password456"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful. Payment simulated. Account activated.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "beneficiary": {
    "id": "uuid",
    "email": "jane@example.com",
    "full_name": "Jane Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or user email already exists
- `500 Internal Server Error`: Server error

**Notes:**
- User email must be unique
- Beneficiary email can be duplicate or match user email
- Payment is simulated (no real payment gateway)
- Account is activated automatically after registration



### POST /auth/login

Authenticate user or beneficiary and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user" | "beneficiary" | "both",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Validation errors

**Notes:**
- Role is determined by checking email in both `users` and `beneficiaries` tables
- JWT token should be included in `Authorization: Bearer <token>` header for protected endpoints
- Token contains role information in payload



---



## Items (User)



### POST /items

Create a new item (text or file).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `title` (string, required): Item title
- `content` (string, optional): Text content (required if no file)
- `file` (File, optional): Uploaded file (required if no content)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "My Important Document",
  "content": "Document content here...",
  "file_path": null,
  "is_released": false,
  "released_at": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Role does not include "user"
- `400 Bad Request`: Validation errors (title required, content OR file required)

**Notes:**
- At least one of `content` or `file` must be provided
- File is stored locally on server
- Item defaults to `is_released = false`



### GET /items

Get all items for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "My Important Document",
      "content": "Document content...",
      "file_path": null,
      "is_released": false,
      "released_at": null,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Alternative Response Format (array directly):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My Important Document",
    ...
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Role does not include "user"

**Notes:**
- Returns all items where `user_id = authenticated_user_id`
- Includes both released and unreleased items



### PATCH /items/:id

Update an item (title and/or content).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Updated Title",
  "content": "Updated content...",
  "file_path": null,
  "is_released": false,
  "released_at": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner of the item
- `404 Not Found`: Item not found
- `400 Bad Request`: Validation errors

**Notes:**
- Only owner can modify items
- Cannot modify file_path (file replacement not supported in MVP)



### DELETE /items/:id

Permanently delete an item (hard delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner of the item
- `404 Not Found`: Item not found

**Notes:**
- Hard delete removes item permanently from database
- If item has a file, file is also deleted from filesystem
- Cannot be undone



### PATCH /items/:id/release

Manually release an item for beneficiaries to access.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "My Important Document",
  "content": "Document content...",
  "file_path": null,
  "is_released": true,
  "released_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner of the item
- `404 Not Found`: Item not found

**Notes:**
- Sets `is_released = true` and `released_at = current timestamp`
- Release is manual only and irreversible in MVP
- Once released, beneficiaries can see the item



---



## Beneficiary



### GET /beneficiary/items

Get all released items accessible to the authenticated beneficiary.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Released Document",
      "content": "Document content...",
      "file_path": null,
      "is_released": true,
      "released_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "user_full_name": "John Doe"
    }
  ]
}
```

**Alternative Response Format (array directly):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Released Document",
    ...
    "user_full_name": "John Doe"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Role does not include "beneficiary"

**Notes:**
- Returns only items where:
  - `is_released = true`
  - Beneficiary is linked to the user via `user_beneficiaries` table
- Read-only access (no edit/delete/release operations)
- Includes `user_full_name` to show who created each item
- File downloads should be available via the file_path (served by backend)



---



## File Download



### GET /uploads/:path

Download a file associated with an item.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- `200 OK`: File content with appropriate `Content-Type` header
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User/beneficiary does not have access to this file
- `404 Not Found`: File not found

**Notes:**
- File path is stored in `items.file_path`
- Backend should validate that the requester has access to the item
- For beneficiaries: Only accessible if item is released and beneficiary is linked
- For users: Only accessible if item belongs to the user

