# Release Model – MVP



## Strategy Selected



- Option A: Manual release

- Option 1: Item-level release



---



## Rules



By default:

- is_released = false

- released_at = null



When released:

- is_released = true

- released_at = timestamp



---



## Visibility Rule



Beneficiary can see item ONLY if:

- Linked to user

- is_released = true



No automatic triggers exist in MVP.

