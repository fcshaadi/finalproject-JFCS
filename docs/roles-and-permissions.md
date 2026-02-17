# Roles & Permissions



## Roles



Two system roles:



- User

- Beneficiary



Login may return:



- "user"

- "beneficiary"

- "both"



---



## Role Resolution Logic



If email exists in:

- users only → role = "user"

- beneficiaries only → role = "beneficiary"

- both tables → role = "both"



---



## Permissions



User:

- Create item

- Edit item

- Delete item (hard delete)

- Release item

- View own items



Beneficiary:

- View released items only

- No edit/delete/release



If role = "both":

- UI must separate:

  - Editable vault

  - Read-only accessible items

