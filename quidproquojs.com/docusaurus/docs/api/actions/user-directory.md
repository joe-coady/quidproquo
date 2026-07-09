---
sidebar_position: 19
---

# User Directory Actions

Manage authentication, authorization, and user identity operations.

## Overview

User Directory actions provide comprehensive user management capabilities including authentication, authorization, user attributes, password management, and token operations. These actions work with platform-specific identity providers (AWS Cognito, Auth0, etc.) while maintaining a consistent interface.

## Available Actions

### askUserDirectoryAuthenticateUser

Authenticate a user with email and password.

#### Signature

```typescript
function* askUserDirectoryAuthenticateUser(
  userDirectoryName: string,
  isCustom: boolean,
  email: string,
  password?: string
): UserDirectoryAuthenticateUserActionRequester
```

#### Parameters

- **userDirectoryName** (`string`): Name of the user directory
- **isCustom** (`boolean`): Whether using custom authentication
- **email** (`string`): User's email address
- **password** (`string`, optional): User's password (required for non-custom auth)

#### Returns

Returns `AuthenticateUserResponse` with tokens and user information.

#### Example

```typescript
import { askUserDirectoryAuthenticateUser } from 'quidproquo-core';

function* loginUser(email: string, password: string) {
  try {
    const response = yield* askUserDirectoryAuthenticateUser(
      'main-user-pool',
      false,
      email,
      password
    );
    
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      idToken: response.idToken,
      expiresIn: response.expiresIn
    };
  } catch (error) {
    if (error.errorType === 'UserNotFound') {
      yield* askThrowError(ErrorTypeEnum.NotFound, 'User not found');
    } else if (error.errorType === 'InvalidPassword') {
      yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Invalid password');
    }
    throw error;
  }
}
```

### askUserDirectoryDecodeAccessToken

Decode and validate an access token.

#### Signature

```typescript
function* askUserDirectoryDecodeAccessToken(
  userDirectoryName: string,
  accessToken: string
): UserDirectoryDecodeAccessTokenActionRequester
```

#### Example

```typescript
function* validateToken(token: string) {
  const decoded = yield* askUserDirectoryDecodeAccessToken(
    'main-user-pool',
    token
  );
  
  return {
    userId: decoded.sub,
    email: decoded.email,
    groups: decoded.groups || [],
    expiresAt: decoded.exp
  };
}
```

### askUserDirectoryRefreshToken

Refresh authentication tokens.

#### Signature

```typescript
function* askUserDirectoryRefreshToken(
  userDirectoryName: string,
  refreshToken: string
): UserDirectoryRefreshTokenActionRequester
```

#### Example

```typescript
function* refreshUserSession(refreshToken: string) {
  const response = yield* askUserDirectoryRefreshToken(
    'main-user-pool',
    refreshToken
  );
  
  // Store new tokens
  yield* askContextProvide(authTokenContext, response.accessToken);
  
  return {
    accessToken: response.accessToken,
    idToken: response.idToken,
    expiresIn: response.expiresIn
  };
}
```

### askUserDirectoryGetUserAttributes

Get attributes for the authenticated user.

#### Signature

```typescript
function* askUserDirectoryGetUserAttributes(
  userDirectoryName: string,
  accessToken: string
): UserDirectoryGetUserAttributesActionRequester
```

#### Example

```typescript
function* getUserProfile(accessToken: string) {
  const attributes = yield* askUserDirectoryGetUserAttributes(
    'main-user-pool',
    accessToken
  );
  
  return {
    email: attributes.email,
    name: attributes.name,
    phoneNumber: attributes.phone_number,
    emailVerified: attributes.email_verified === 'true',
    customAttributes: attributes
  };
}
```

### askUserDirectoryGetUsers

Get a list of users from the directory.

#### Signature

```typescript
function* askUserDirectoryGetUsers(
  userDirectoryName: string,
  limit?: number,
  paginationToken?: string
): UserDirectoryGetUsersActionRequester
```

#### Example

```typescript
function* listAllUsers(userDirectoryName: string) {
  const users = [];
  let paginationToken: string | undefined;
  
  do {
    const response = yield* askUserDirectoryGetUsers(
      userDirectoryName,
      50,
      paginationToken
    );
    
    users.push(...response.users);
    paginationToken = response.paginationToken;
    
  } while (paginationToken);
  
  return users;
}
```

### askUserDirectoryForgotPassword

Initiate password reset flow.

#### Signature

```typescript
function* askUserDirectoryForgotPassword(
  userDirectoryName: string,
  email: string
): UserDirectoryForgotPasswordActionRequester
```

#### Example

```typescript
function* resetPassword(email: string) {
  yield* askUserDirectoryForgotPassword('main-user-pool', email);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Password reset initiated', {
    email,
    timestamp: yield* askDateNow()
  });
  
  return { message: 'Password reset code sent to email' };
}
```

### askUserDirectoryConfirmForgotPassword

Confirm password reset with code.

#### Signature

```typescript
function* askUserDirectoryConfirmForgotPassword(
  userDirectoryName: string,
  email: string,
  code: string,
  newPassword: string
): UserDirectoryConfirmForgotPasswordActionRequester
```

#### Example

```typescript
function* confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
) {
  yield* askUserDirectoryConfirmForgotPassword(
    'main-user-pool',
    email,
    code,
    newPassword
  );
  
  // Log password change
  yield* askEventBusSendMessage('security-events', {
    type: 'PASSWORD_RESET',
    data: {
      email,
      timestamp: yield* askDateNow()
    }
  });
  
  return { message: 'Password successfully reset' };
}
```

## Authentication Patterns

### Login Flow

```typescript
function* completeLoginFlow(email: string, password: string) {
  // Authenticate user
  const authResponse = yield* askUserDirectoryAuthenticateUser(
    'main-user-pool',
    false,
    email,
    password
  );
  
  // Handle MFA if required
  if (authResponse.challengeName === 'SMS_MFA') {
    return {
      requiresMFA: true,
      session: authResponse.session
    };
  }
  
  // Get user profile
  const profile = yield* askUserDirectoryGetUserAttributes(
    'main-user-pool',
    authResponse.accessToken
  );
  
  // Create session
  const session = {
    userId: authResponse.userSub,
    email: profile.email,
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    idToken: authResponse.idToken,
    expiresAt: Date.now() + (authResponse.expiresIn * 1000)
  };
  
  // Store session
  yield* askKeyValueStoreUpsert('sessions', session);
  
  // Log successful login
  yield* askLogCreate(LogLevelEnum.INFO, 'User logged in', {
    userId: session.userId,
    email: session.email
  });
  
  return session;
}
```

### Token Management

```typescript
function* maintainSession(refreshToken: string) {
  try {
    // Refresh tokens before expiry
    const newTokens = yield* askUserDirectoryRefreshToken(
      'main-user-pool',
      refreshToken
    );
    
    // Update session
    yield* askKeyValueStoreUpdate('sessions', {
      accessToken: newTokens.accessToken,
      idToken: newTokens.idToken,
      expiresAt: Date.now() + (newTokens.expiresIn * 1000)
    });
    
    return newTokens;
  } catch (error) {
    // Refresh failed, user must login again
    yield* askThrowError(
      ErrorTypeEnum.Unauthorized,
      'Session expired, please login again'
    );
  }
}

function* autoRefreshTokens() {
  while (true) {
    const session = yield* askStateRead<Session>();
    
    if (!session) break;
    
    const timeUntilExpiry = session.expiresAt - Date.now();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 5 min before expiry
    
    if (refreshTime > 0) {
      yield* askDelay(refreshTime);
      yield* maintainSession(session.refreshToken);
    } else {
      break; // Token already expired
    }
  }
}
```

### Authorization Middleware

```typescript
function* requireAuth(request: Request) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'No token provided');
  }
  
  try {
    const decoded = yield* askUserDirectoryDecodeAccessToken(
      'main-user-pool',
      token
    );
    
    // Add user to context
    yield* askContextProvide(userContext, {
      id: decoded.sub,
      email: decoded.email,
      groups: decoded.groups || []
    });
    
    return decoded;
  } catch (error) {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Invalid token');
  }
}

function* requireRole(role: string) {
  const user = yield* askContextRead(userContext);
  
  if (!user) {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Not authenticated');
  }
  
  if (!user.groups?.includes(role)) {
    yield* askThrowError(ErrorTypeEnum.Forbidden, `Role ${role} required`);
  }
  
  return user;
}
```

### User Registration

```typescript
function* registerUser(userData: UserRegistration) {
  // Validate input
  if (!userData.email || !userData.password) {
    yield* askThrowError(ErrorTypeEnum.BadRequest, 'Email and password required');
  }
  
  // Check if user exists
  const existing = yield* askUserDirectoryGetUsersByAttribute(
    'main-user-pool',
    'email',
    userData.email
  );
  
  if (existing.length > 0) {
    yield* askThrowError(ErrorTypeEnum.Conflict, 'User already exists');
  }
  
  // Create user
  const user = yield* askUserDirectoryCreateUser(
    'main-user-pool',
    {
      email: userData.email,
      password: userData.password,
      attributes: {
        name: userData.name,
        phone_number: userData.phoneNumber
      }
    }
  );
  
  // Send verification email
  yield* askUserDirectoryRequestEmailVerification(
    'main-user-pool',
    userData.email
  );
  
  // Create user profile
  yield* askKeyValueStoreUpsert('user-profiles', {
    id: user.userSub,
    email: userData.email,
    name: userData.name,
    createdAt: yield* askDateNow(),
    emailVerified: false
  });
  
  return {
    userId: user.userSub,
    message: 'User registered. Please check email for verification.'
  };
}
```

### Multi-Factor Authentication

```typescript
function* setupMFA(userId: string) {
  // Enable MFA for user
  yield* askUserDirectoryEnableMFA('main-user-pool', userId);
  
  // Generate QR code for authenticator app
  const secret = yield* askUserDirectoryGenerateTOTPSecret(
    'main-user-pool',
    userId
  );
  
  return {
    secret: secret.secretCode,
    qrCode: secret.qrCodeUrl
  };
}

function* verifyMFACode(session: string, code: string) {
  const response = yield* askUserDirectoryRespondToAuthChallenge(
    'main-user-pool',
    {
      challengeName: 'SOFTWARE_TOKEN_MFA',
      session,
      challengeResponse: code
    }
  );
  
  if (response.authenticated) {
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      idToken: response.idToken
    };
  } else {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Invalid MFA code');
  }
}
```

### User Management

```typescript
function* updateUserProfile(userId: string, updates: UserProfileUpdate) {
  // Update user directory attributes
  yield* askUserDirectoryUpdateUserAttributes(
    'main-user-pool',
    userId,
    {
      name: updates.name,
      phone_number: updates.phoneNumber,
      custom_preferences: JSON.stringify(updates.preferences)
    }
  );
  
  // Update profile store
  yield* askKeyValueStoreUpdate('user-profiles', userId, {
    ...updates,
    updatedAt: yield* askDateNow()
  });
  
  // Audit log
  yield* askEventBusSendMessage('audit-events', {
    type: 'USER_PROFILE_UPDATED',
    data: {
      userId,
      changes: Object.keys(updates),
      timestamp: yield* askDateNow()
    }
  });
  
  return { message: 'Profile updated successfully' };
}

function* deactivateUser(userId: string, reason: string) {
  // Disable user in directory
  yield* askUserDirectoryDisableUser('main-user-pool', userId);
  
  // Revoke all sessions
  yield* askKeyValueStoreDelete('sessions', userId);
  
  // Update profile
  yield* askKeyValueStoreUpdate('user-profiles', userId, {
    active: false,
    deactivatedAt: yield* askDateNow(),
    deactivationReason: reason
  });
  
  // Log deactivation
  yield* askLogCreate(LogLevelEnum.WARN, 'User deactivated', {
    userId,
    reason
  });
}
```

## Testing

```typescript
describe('User Directory Actions', () => {
  test('authenticates user', () => {
    function* login() {
      return yield* askUserDirectoryAuthenticateUser(
        'test-pool',
        false,
        'user@example.com',
        'password123'
      );
    }
    
    const story = login();
    const { value: action } = story.next();
    
    expect(action.type).toBe('UserDirectory::AuthenticateUser');
    expect(action.payload.authenticateUserRequest.email).toBe('user@example.com');
    
    const mockResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      idToken: 'mock-id-token',
      expiresIn: 3600
    };
    
    const { value: result } = story.next(mockResponse);
    expect(result.accessToken).toBe('mock-access-token');
  });
});
```

## Best Practices

### 1. Secure Token Storage

```typescript
// Good - tokens in secure context
yield* askContextProvide(authTokenContext, {
  accessToken,
  refreshToken
});

// Bad - tokens in plain storage
localStorage.setItem('token', accessToken);
```

### 2. Token Refresh Strategy

```typescript
// Good - proactive refresh
function* maintainAuth() {
  const refreshBefore = 5 * 60 * 1000; // 5 minutes
  // Refresh tokens before they expire
}

// Bad - reactive refresh
// Wait until token fails then refresh
```

### 3. Proper Error Handling

```typescript
// Good - specific error handling
try {
  yield* askUserDirectoryAuthenticateUser(...);
} catch (error) {
  if (error.errorType === 'UserNotFound') {
    // Handle user not found
  } else if (error.errorType === 'InvalidPassword') {
    // Handle wrong password
  }
}
```

## Related Actions

- **Context Actions** - For auth context
- **KeyValueStore Actions** - For session storage
- **EventBus Actions** - For auth events
- **Log Actions** - For audit logging