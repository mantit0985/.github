# API Guidelines

These guidelines ensure consistency, predictability, and reliability across all APIs developed within this account.

## 1. RESTful Design

### Resource Naming
- **Nouns, not Verbs**: Use nouns for endpoints (e.g., `/users`, not `/getUsers`).
- **Pluralization**: Use plural nouns for collections (e.g., `/orders` instead of `/order`).
- **Kebab-case**: Use kebab-case for URIs (e.g., `/user-profiles`).

### HTTP Methods
- `GET`: Retrieve a resource or collection.
- `POST`: Create a new resource.
- `PUT`: Replace an existing resource.
- `PATCH`: Partially update a resource.
- `DELETE`: Remove a resource.

### Request/Response
- **JSON**: All requests and responses must use `application/json`.
- **Status Codes**:
  - `200 OK`: Success.
  - `201 Created`: Resource successfully created.
  - `204 No Content`: Success, no body returned.
  - `400 Bad Request`: Client-side input error.
  - `401 Unauthorized`: Authentication required.
  - `403 Forbidden`: Authenticated but insufficient permissions.
  - `404 Not Found`: Resource not located.
  - `500 Internal Server Error`: Unexpected server failure.
- **Consistent Error Format**:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable explanation.",
      "details": []
    }
  }
  ```

## 2. GraphQL Design

### Schema Architecture
- **Naming**: Use PascalCase for types and camelCase for fields.
- **Inputs**: Use specific `Input` types for mutations rather than flat argument lists.
- **Pagination**: Implement cursor-based pagination (Relay specification) for all collections.

### Best Practices
- **Avoid Deep Nesting**: Implement depth limiting to prevent Denial-of-Service attacks.
- **Explicit Nullability**: Be explicit about which fields can be null.
- **Interfaces**: Use interfaces for shared fields across different types.

## 3. General Standards
- **Versioning**: Version APIs in the URI (e.g., `/v1/users`).
- **Authentication**: Use Bearer tokens (JWT) via the `Authorization` header.
- **Idempotency**: Ensure `PUT` and `DELETE` operations are idempotent.
- **Documentation**: Every API must have an OpenAPI (Swagger) specification or a GraphQL schema.
