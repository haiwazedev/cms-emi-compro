# API Reference

This document describes the API currently provided by the server for frontend
integration.

## Base URL and Requests

The default local base URL is `http://localhost:8000`. Replace it with the
server's deployed URL when integrating with another environment. The port can
be changed with the server's `PORT` environment variable.

Send JSON request bodies with the `Content-Type: application/json` header.
Errors use this shape:

```json
{
  "message": "A human-readable error message."
}
```

Registration and login return a JWT that expires three hours after it is
issued. Send it to protected endpoints in the `Authorization` header as
`Bearer <token>`. There is no token refresh endpoint; log in again after the
token expires.

For the Fetch examples below, define the base URL once:

```js
const API_BASE_URL = 'http://localhost:8000';
```

## Register

`POST /auth/register`

Create an account and receive an access token.

### Request body

| Field      | Type   | Rules                                                              |
| ---------- | ------ | ------------------------------------------------------------------ |
| `name`     | string | Required; whitespace around the value is trimmed.                  |
| `email`    | string | Required; must be a valid email. It is trimmed and lowercased.     |
| `password` | string | Required and non-empty. It is sent as provided and is not trimmed. |

```json
{
  "name": "Ari Putra",
  "email": "ari@example.com",
  "password": "correct-horse-battery-staple"
}
```

### Success response — `201 Created`

```json
{
  "token": "eyJ...",
  "user": {
    "name": "Ari Putra",
    "email": "ari@example.com"
  }
}
```

### Errors

| Status            | Message                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `400 Bad Request` | `Name, email, and password are required.` for missing or empty fields; `Email must be valid.` for an invalid email. |
| `409 Conflict`    | `Email is already registered.`                                                                                      |

### Fetch example

```js
const response = await fetch(`${API_BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Ari Putra',
    email: 'ari@example.com',
    password: 'correct-horse-battery-staple',
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.message);

const { token, user } = data;
```

### cURL example

```sh
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ari Putra","email":"ari@example.com","password":"correct-horse-battery-staple"}'
```

## Login

`POST /auth/login`

Authenticate an existing account and receive an access token.

### Request body

| Field      | Type   | Rules                                                              |
| ---------- | ------ | ------------------------------------------------------------------ |
| `email`    | string | Required; must be a valid email. It is trimmed and lowercased.     |
| `password` | string | Required and non-empty. It is sent as provided and is not trimmed. |

```json
{
  "email": "ari@example.com",
  "password": "correct-horse-battery-staple"
}
```

### Success response — `200 OK`

```json
{
  "token": "eyJ...",
  "user": {
    "name": "Ari Putra",
    "email": "ari@example.com"
  }
}
```

### Errors

| Status             | Message                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `400 Bad Request`  | `Email and password are required.` for missing or empty fields; `Email must be valid.` for an invalid email. |
| `401 Unauthorized` | `Invalid email or password.`                                                                                 |

### Fetch example

```js
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ari@example.com',
    password: 'correct-horse-battery-staple',
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.message);

const { token, user } = data;
```

### cURL example

```sh
curl -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ari@example.com","password":"correct-horse-battery-staple"}'
```

## Get the Current User

`GET /auth/me`

Validate an access token and return the current user's name and email.

### Headers

| Header          | Value            |
| --------------- | ---------------- |
| `Authorization` | `Bearer <token>` |

### Success response — `200 OK`

```json
{
  "user": {
    "name": "Ari Putra",
    "email": "ari@example.com"
  }
}
```

### Errors

| Status             | Message                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| `401 Unauthorized` | `Authentication is required.` when the header is missing or malformed.            |
| `401 Unauthorized` | `Invalid or expired token.` when verification fails or the user no longer exists. |

### Fetch example

```js
const response = await fetch(`${API_BASE_URL}/auth/me`, {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();
if (!response.ok) throw new Error(data.message);

const { user } = data;
```

### cURL example

```sh
curl http://localhost:8000/auth/me \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Health Check

`GET /health` does not require authentication and returns `200 OK`:

```json
{
  "message": "OK"
}
```

## Browser Cross-Origin Requests

The server currently does not configure CORS. A browser frontend served from a
different origin needs the server to allow that frontend's origin or needs to
route API requests through a same-origin proxy.

## Common Errors

Malformed JSON returns `400 Bad Request` with:

```json
{
  "message": "Request body must contain valid JSON."
}
```

Unexpected server errors return `500 Internal Server Error` with:

```json
{
  "message": "Internal server error."
}
```
