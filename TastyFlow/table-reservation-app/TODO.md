# OAuth Integration with Google using Passport.js

## Backend Implementation
- [x] Install required npm packages: passport, passport-google-oauth20, express-session
- [x] Update User model to include googleId field
- [x] Create passportConfig.js for Passport Google OAuth strategy
- [x] Update server.js to initialize Passport and session middleware
- [x] Update userController.js to handle Google OAuth user creation/login
- [x] Update userRoute.js to add Google OAuth routes (/auth/google, /auth/google/callback)

## Frontend Implementation
- [x] Update Login component to include Google login button
- [x] Create OAuthCallback component to handle OAuth callback
- [x] Add OAuth callback route to App.js
- [x] Implement OAuth flow in frontend to redirect to backend Google auth route
- [x] Handle OAuth callback and store JWT token

## Testing
- [x] Test Google OAuth login flow end-to-end
- [x] Verify user creation and login via Google
- [x] Ensure existing email/password login still works
- [x] Fix OAuth user login conflict (users created via Google cannot login with email/password)
