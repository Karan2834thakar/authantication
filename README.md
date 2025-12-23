# Express Authentication Backend

Features implemented:
- User registration with validation and bcrypt password hashing
- User login with JWT
- Forgot password with email OTP, OTP verification, and password reset
- Change password for authenticated users
- JWT auth middleware and validation helpers

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Run in dev mode:

```bash
npm run dev
```

API Endpoints (summary):
- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login and receive JWT
- `POST /api/auth/forgot` - request OTP to email
- `POST /api/auth/verify-otp` - verify OTP and receive reset token
- `POST /api/auth/reset-password` - reset password using reset token
- `PATCH /api/auth/change-password` - change password when authenticated

See source files in `src/` for implementation details.
