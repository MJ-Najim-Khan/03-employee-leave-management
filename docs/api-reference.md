# Employee Leave Management System — API Reference

## 1. Base URLs

Production API:

```text
https://api.mjnazim.online
```

Swagger UI:

```text
https://api.mjnazim.online/docs
```

Local development:

```text
http://127.0.0.1:8000
```

## 2. Authentication

Protected requests use:

```http
Authorization: Bearer <access_token>
```

## 3. Health

### `GET /health`

Returns application health.

Example:

```json
{"status":"healthy"}
```

### `GET /health/database`

Checks database connectivity from the application.

## 4. Authentication

### `POST /api/auth/login`

Authenticates a user and returns an access token.

Example request:

```json
{"username":"employee1","password":"YOUR_PASSWORD"}
```

### `POST /api/auth/register`

Registers a user according to backend validation and authorization rules.

## 5. Employees

### `GET /api/employees`

Returns employee records available to the authenticated caller.

### `GET /api/employees/{employee_id}`

Returns an employee record.

## 6. Leave

### `POST /api/leaves`

Creates a leave request.

Example:

```json
{
  "employee_id": 5,
  "leave_type_id": 1,
  "from_date": "YYYY-MM-DD",
  "to_date": "YYYY-MM-DD",
  "reason": "Personal work"
}
```

### `GET /api/leaves`

Returns leave requests available to the authenticated caller.

### `GET /api/leaves/employees/{employee_id}`

Returns leave history for an employee.

### `PUT /api/leaves/{leave_id}/approve`

Approves a leave request.

Example body:

```json
{"comment":"Approved"}
```

### `PUT /api/leaves/{leave_id}/reject`

Rejects a leave request.

Example body:

```json
{"comment":"Not approved"}
```

### `PUT /api/leaves/{leave_id}/cancel`

Cancels an eligible leave request.

## 7. Leave Balances

### `GET /api/employees/{employee_id}/balances`

Returns leave balances for an employee.

## 8. Documents

### `POST /api/documents/upload?employee_id={employee_id}`

Uploads an employee document using `multipart/form-data`. The form field is `file`.

### `GET /api/documents/employee/{employee_id}`

Returns document metadata for an employee.

### `GET /api/documents/{document_id}/download`

Generates application-controlled download access for a document.

## 9. Dashboard

### `GET /api/dashboard`

Returns dashboard information for the authenticated user's role.

## 10. Admin Endpoints Used by the Frontend

The frontend calls:

```text
/api/admin/departments
/api/admin/leave-types
/api/admin/users
```

These routes support the configured administration screens for departments, leave types, and user status.

## 11. Roles

```text
EMPLOYEE
MANAGER
ADMIN
```

The backend should enforce authorization for protected operations.

## 12. Common Status Codes

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
405 Method Not Allowed
500 Internal Server Error
```

A `405` can occur when the HTTP method does not match the endpoint definition.

## 13. Swagger Workflow

```text
1. Open https://api.mjnazim.online/docs
2. Execute login with Try it out.
3. Copy the returned access token.
4. Click Authorize.
5. Enter the Bearer token.
6. Execute protected endpoints.
```

Never publish real production tokens.
