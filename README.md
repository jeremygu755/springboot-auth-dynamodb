# Auth Service API

A JWT-based authentication REST API built with Spring Boot and AWS DynamoDB.

## Base URL

```
http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com
```

---

## How It Works

1. **Register** or **Login** to get a JWT token
2. Store that token on the client (phone, browser, etc.)
3. Include the token in the `Authorization` header of every protected request
4. Token expires after **24 hours** — user must log in again to get a new one

---

## Endpoints

### POST `/api/auth/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Jeremy",
  "email": "jeremy@example.com",
  "password": "password123",
  "role": "ROLE_USER"
}
```

**Role options:**
- `ROLE_USER` — standard user (default)
- `ROLE_ADMIN` — admin user

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "message": "Registration successful"
}
```

**Error cases:**
- `400` — missing or invalid fields (email format wrong, password under 8 chars)
- `500` — email already registered

---

### POST `/api/auth/login`
Log in with an existing account.

**Request body:**
```json
{
  "email": "jeremy@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "message": "Login successful"
}
```

**Error cases:**
- `403` — wrong email or password

---

### GET `/api/user/profile`
Get the profile of the currently logged-in user.

**Requires:** Valid JWT token in header

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Response:**
```json
{
  "email": "jeremy@example.com",
  "role": "ROLE_USER",
  "message": "Profile retrieved successfully"
}
```

**Error cases:**
- `403` — no token provided or token is expired/invalid

---

### GET `/api/admin/dashboard`
Admin-only endpoint.

**Requires:** Valid JWT token with `ROLE_ADMIN`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Response:**
```json
{
  "message": "Welcome to the admin dashboard",
  "adminEmail": "admin@example.com"
}
```

**Error cases:**
- `403` — not logged in, or logged in as `ROLE_USER` (not admin)

---

## Connecting From a Mobile App (React Native)

### 1. Register a new user

```javascript
const register = async (name, email, password) => {
  const response = await fetch(
    'http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'ROLE_USER' }),
    }
  );
  const data = await response.json();
  return data.token; // store this token
};
```

### 2. Log in

```javascript
const login = async (email, password) => {
  const response = await fetch(
    'http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await response.json();
  return data.token; // store this token
};
```

### 3. Store the token (React Native)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After login/register — save the token
await AsyncStorage.setItem('authToken', token);

// On app start — check if user is already logged in
const token = await AsyncStorage.getItem('authToken');

// On logout — remove the token
await AsyncStorage.removeItem('authToken');
```

### 4. Call a protected endpoint

```javascript
const getProfile = async () => {
  const token = await AsyncStorage.getItem('authToken');

  const response = await fetch(
    'http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com/api/user/profile',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data;
};
```

---

## Connecting From a Web App (React / JavaScript)

```javascript
// Login and store token
const login = async (email, password) => {
  const res = await fetch('.../api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await res.json();
  localStorage.setItem('token', token); // store in browser
};

// Call a protected route
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('.../api/user/profile', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};
```

---

## Testing With Postman

1. Download [Postman](https://postman.com)
2. Create a `POST` request to `.../api/auth/login` with the JSON body
3. Copy the `token` from the response
4. For protected routes, go to the **Authorization** tab → select **Bearer Token** → paste the token

---

## Tech Stack

- **Framework:** Spring Boot 3.2 (Java 21)
- **Security:** Spring Security 6 + JWT (jjwt 0.12)
- **Database:** AWS DynamoDB
- **Hosting:** AWS Elastic Beanstalk (us-east-1)
