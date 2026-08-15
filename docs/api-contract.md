# Workforce ERP API Contract

This document defines the canonical REST API contract for the Workforce ERP backend. All future modules connected to Laravel must adhere strictly to these conventions.

---

## 1. Routing & Versioning

All API endpoints must be prefix-versioned under the `/api/v1` namespace.

- **API Root Version Prefix**: `/api/v1`
  - _Example_: `/api/v1/items`, `/api/v1/employees`
- **System Health Check**: `/api/health`
  - _Note_: The health check endpoint sits outside the versioned namespace to allow standard, unversioned uptime tracking by the shared API client package.

---

## 2. Standard Success Response Shape

Success responses must return a `200 OK` (or `201 Created` for resource creation) and have the following JSON structure:

```json
{
  "success": true,
  "message": "Optional user-friendly message describing the operation result",
  "data": {
    "id": 123,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

- `success` (boolean, mandatory): Must always be `true` for `2xx` statuses.
- `message` (string, optional): A brief, descriptive summary of the success event.
- `data` (object/array/null, optional): The primary resource payload.

---

## 3. Collection & Pagination Metadata

Any endpoint returning a list/collection of resources should be paginated and follow the standard structure below:

```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Jane Doe"
    }
  ],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "path": "http://localhost:3000/api/v1/employees",
    "per_page": 15,
    "to": 1,
    "total": 35
  },
  "links": {
    "first": "http://localhost:3000/api/v1/employees?page=1",
    "last": "http://localhost:3000/api/v1/employees?page=3",
    "prev": null,
    "next": "http://localhost:3000/api/v1/employees?page=2"
  }
}
```

### Metadata Fields

- `meta.current_page` (integer): Current page number.
- `meta.from` (integer|null): Starting index of the current window.
- `meta.last_page` (integer): The final page index.
- `meta.path` (string): The base endpoint URL.
- `meta.per_page` (integer): Number of items per page.
- `meta.to` (integer|null): Ending index of the current window.
- `meta.total` (integer): Total number of items in the database matching query.

---

## 4. Error Responses & Status Codes

All errors must return `success: false` and use standard HTTP status codes.

### 4.1 Authentication Errors (401 Unauthorized)

Triggered when the request is missing or carries an invalid authentication token (e.g. `X-API-TOKEN`).

```json
{
  "success": false,
  "message": "Invalid or missing token."
}
```

### 4.2 Authorization Errors (403 Forbidden)

Triggered when the user is authenticated but lacks the permission required for the specific resource action.

```json
{
  "success": false,
  "message": "This action is unauthorized."
}
```

### 4.3 Not Found Errors (404 Not Found)

Triggered when a route does not exist or a specific database record is not found (e.g., throwing a `ModelNotFoundException`).

```json
{
  "success": false,
  "message": "Resource not found."
}
```

### 4.4 Conflict Errors (409 Conflict)

Triggered when the request violates a database state or application constraint (e.g., trying to book a resource that is already taken).

```json
{
  "success": false,
  "message": "Resource conflict."
}
```

### 4.5 Validation Errors (422 Unprocessable Entity)

Triggered when validation checks fail.

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field must be a valid email address.",
      "The email has already been taken."
    ],
    "password": ["The password field is required."]
  }
}
```

### 4.6 Server Errors (500 Internal Server Error)

Triggered when an unexpected server error or database crash occurs.

- **Production Environment (`app.debug` = `false`)**:
  ```json
  {
    "success": false,
    "message": "An unexpected error occurred."
  }
  ```
- **Local/Testing Environment (`app.debug` = `true`)**:
  ```json
  {
    "success": false,
    "message": "An unexpected error occurred.",
    "error": "Error message details",
    "exception": "Exception\\Class\\Name",
    "trace": [ ... ]
  }
  ```

---

## 5. Development Guidelines for Future Modules

### 5.1 Use `ApiResponseTrait`

All new controllers in `apps/api` should inherit or use `App\Traits\ApiResponseTrait` to return consistent API responses:

```php
class EmployeeController extends Controller
{
    public function show($id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return $this->errorResponse('Employee not found', 404);
        }

        return $this->successResponse(new EmployeeResource($employee), 'Employee details retrieved');
    }
}
```

### 5.2 Laravel API Resources

For fine-grained control of data serialization, wrap models in Laravel `JsonResource` classes:

- Standard resources automatically serialize fields.
- When wrapped inside `successResponse($resource)`, the trait handles formatting pagination links/meta and structural payload wrappers automatically.
