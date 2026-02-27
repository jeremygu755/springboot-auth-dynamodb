# Spring Boot Auth + React Native Frontend

A full-stack JWT authentication system with a **Spring Boot backend** and a **React Native (Expo) frontend**.

## Project Structure

| Branch | What's in it | Tech |
|--------|-------------|------|
| [`main`](https://github.com/jeremygu755/springboot-auth-dynamodb/tree/main) | Backend API | Spring Boot, Spring Security, DynamoDB |
| [`expo-frontend`](https://github.com/jeremygu755/springboot-auth-dynamodb/tree/expo-frontend) | Mobile app | React Native, Expo Go |

## Base URL

```
http://auth-service-env.eba-kuabnady.us-east-1.elasticbeanstalk.com
```

---

## Mobile App (expo-frontend branch)

A React Native app built with Expo that connects to the backend API. Run it on your phone with Expo Go.

### Features

- **Register** — create an account with name, email, password, and role selection (User/Admin)
- **Login** — authenticate and receive a JWT token
- **Profile** — fetch user profile using the stored token
- **Admin Dashboard** — access admin-only endpoint (requires ROLE_ADMIN)
- **Token Inspector** — live JWT countdown timer, decoded payload viewer, and tamper controls:
  - Corrupt the signature to test server-side validation
  - Swap the role in the payload to test role-based access
  - Clear the token to test unauthenticated access
  - Edit the raw token manually
  - Restore the original token after tampering

### Running the Frontend

```bash
git checkout expo-frontend
cd AuthApp
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## API Endpoints

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

## How Authentication Works

1. **Register** or **Login** to get a JWT token
2. Token is stored on the client (AsyncStorage on mobile, localStorage on web)
3. Include the token in the `Authorization: Bearer <token>` header for protected requests
4. Token expires after **24 hours** — user must log in again
5. Server validates the token signature on every request — tampered tokens are rejected

---

## Testing With Postman

1. Download [Postman](https://postman.com)
2. Create a `POST` request to `.../api/auth/login` with the JSON body
3. Copy the `token` from the response
4. For protected routes, go to the **Authorization** tab → select **Bearer Token** → paste the token

---

## Tech Stack

### Backend (main branch)
- **Framework:** Spring Boot 3.2 (Java 21)
- **Security:** Spring Security 6 + JWT (jjwt 0.12)
- **Database:** AWS DynamoDB
- **Hosting:** AWS Elastic Beanstalk (us-east-1)

### Frontend (expo-frontend branch)
- **Framework:** React Native (Expo SDK 54)
- **Navigation:** React Navigation (Native Stack)
- **Storage:** AsyncStorage for JWT persistence
