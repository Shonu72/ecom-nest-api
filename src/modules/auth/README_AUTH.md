# Authentication Module Documentation

Welcome to your NestJS Authentication Module! Since you're new to NestJS, this document explains how everything works and how you can test it.

## Key Concepts Used

1.  **Dependency Injection (DI)**: In `AuthService`, we "inject" `PrismaService`, `JwtService`, and `ConfigService`. NestJS manages these objects for us, so we don't need to manually create them.
2.  **Controllers**: `AuthController` handles incoming HTTP requests. It uses "Decorators" like `@Post` and `@Body` to define routes and extract data.
3.  **Services**: `AuthService` contains the "business logic" (hashing passwords, verifying tokens). Keeping logic out of controllers makes the code cleaner.
4.  **Middleware/Guards**: We implemented a **Global JwtAuthGuard**. This means **every route in your app is protected by default**. To make a route public (like login), we use the custom `@Public()` decorator.
5.  **Passport Strategy**: `JwtStrategy` defines *how* we validate the JWT. It checks the signature and expiration.

## How the Flow Works

1.  **Register/Login**: User sends credentials -> Service hashes/checks -> Returns Access Token (1h) and Refresh Token (7d).
2.  **Refresh**: When the Access Token expires, the client sends the Refresh Token to `/auth/refresh` to get a new pair.
3.  **Logout**: Clears the refresh token from the database so it can't be used again.

## Testing with Postman/Insomnia

### 1. Register
- **URL**: `POST /auth/register`
- **Body (JSON)**:
  ```json
  {
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
  ```

### 2. Login
- **URL**: `POST /auth/login`
- **Body (JSON)**:
  ```json
  {
    "email": "test@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: Copy the `accessToken`.

### 3. Accessing Protected Routes
- Add a Header: `Authorization: Bearer <your_access_token>`

### 4. Refresh Tokens
- **URL**: `POST /auth/refresh`
- **Body (JSON)**:
  ```json
  {
    "refreshToken": "<your_refresh_token>"
  }
  ```
- **Note**: You must also include the `Authorization: Bearer <your_access_token>` (even if expired) because of the global guard, or I can mark this route as `@Public()` if you'd like to simplify it. *Currently, it requires the expired access token to identify the user.*

---
> [!TIP]
> Always check your `.env` file to ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are kept safe!
