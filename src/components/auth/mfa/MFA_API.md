# ThreatLab Auth / MFA API contract

This describes the front-end contract used by signup, signed-in account security and password reset. Authenticator is the active implementation in this pass. Existing Passkey endpoints remain unchanged.

## Verification purposes

Verification codes generated through the existing ThreatLab verification API are purpose-bound. Supported purposes used by the front-end are:

- `account_create` - new-account email verification.
- `account_modify` - signed-in password / MFA changes.
- `password_reset` - password reset links and the resulting account-security transaction.

A verification token must only be accepted for the purpose for which it was issued.

## Signed-in account security

Before the password / MFA editor is shown, the front-end sends an email verification code using the existing verification API.

### Generate verification code

`POST /api/app/threatlab/signup/verification/?action=generate&tenantId=<tenantId>`

```json
{
  "email": "user@company.com",
  "purpose": "account_modify"
}
```

### Verify code

`POST /api/app/threatlab/signup/verification/?action=verify&tenantId=<tenantId>`

```json
{
  "email": "user@company.com",
  "code": "123456",
  "purpose": "account_modify"
}
```

Response:

```json
{
  "ok": true,
  "verificationToken": "short-lived-one-use-token"
}
```

The token must be bound to the authenticated account, tenant, email and `account_modify` purpose.

## Forgot password

### Request reset link

`POST /api/app/threatlab/password/?action=forgot`

```json
{
  "email": "user@company.com",
  "purpose": "password_reset"
}
```

The response should be generic whether or not the account exists, to avoid account enumeration.

For a valid account, create a short-lived, one-use reset token and send a link such as:

```text
https://threatlab.socautomation.com/?resetToken=<token>
```

Use the supplied `threatlab-password-reset.vm` Velocity template. The email body must not display the full account email address.

### Validate reset link

`POST /api/app/threatlab/password/?action=validate`

```json
{
  "token": "short-lived-reset-token",
  "purpose": "password_reset"
}
```

Validation confirms the token but does not consume it. The token is consumed only when the final account modification succeeds.

Response should provide enough non-secret account state for the reset editor:

```json
{
  "ok": true,
  "user": {
    "email": "user@company.com",
    "tenantId": "tenant-id",
    "name": "User Name",
    "mfaEnabled": true,
    "mfaMechanism": "authenticator"
  },
  "verificationToken": "short-lived-account-change-token"
}
```

`verificationToken` may be omitted if the backend accepts the reset token itself as the authorization proof for the following setup/modify calls. The full email is returned to the application because it is needed as the account identifier; the UI masks it whenever it is displayed.

## Authenticator setup / reset

### Begin setup

`POST /api/app/mfa/authenticator/setup`

Signup request:

```json
{
  "email": "user@company.com",
  "setupToken": "short-lived-signup-token"
}
```

Account-security request:

```json
{
  "email": "user@company.com",
  "verificationToken": "short-lived-account-change-token",
  "purpose": "account_modify"
}
```

For a password-reset flow, `purpose` is `password_reset` and the verification token is derived from / bound to the reset transaction.

Response:

```json
{
  "ok": true,
  "qrCode": "data:image/png;base64,...",
  "secret": "BASE32SECRET",
  "mfaSetupToken": "short-lived-provisional-setup-token"
}
```

For an existing Authenticator account, this creates a provisional replacement secret. The currently active secret remains valid until the final account modification succeeds.

### Verify provisional Authenticator

`POST /api/app/mfa/authenticator/setup/verify`

```json
{
  "email": "user@company.com",
  "setupToken": "short-lived-provisional-setup-token",
  "verificationToken": "short-lived-account-change-token",
  "purpose": "account_modify",
  "commit": false,
  "code": "123456"
}
```

For account changes, `commit:false` means validate the TOTP against the provisional secret without replacing the current Authenticator yet.

Response:

```json
{
  "ok": true,
  "mfaVerificationToken": "short-lived-verified-mfa-token"
}
```

For the normal signup flow, `commit` is true and successful verification can activate the Authenticator immediately as before.

## Final account modification

The final password / Authenticator change uses the same endpoint as account creation with `modify=true`:

`POST /api/app/threatlab/signup/?action=create&tenantId=<tenantId>&modify=true`

Password-only example:

```json
{
  "email": "user@company.com",
  "password": "new-password",
  "mfaEnabled": false,
  "verificationToken": "short-lived-account-change-token",
  "purpose": "account_modify"
}
```

Password + Authenticator example:

```json
{
  "email": "user@company.com",
  "password": "new-password",
  "mfaEnabled": true,
  "mfaMethod": "authenticator",
  "verificationToken": "short-lived-account-change-token",
  "mfaVerificationToken": "short-lived-verified-mfa-token",
  "purpose": "account_modify"
}
```

Forgot-password final modification uses the same endpoint, but supplies `resetToken` and `purpose: "password_reset"` rather than the signed-in `account_modify` proof.

The backend should apply the requested password and MFA changes atomically. If an Authenticator reset is included, only at this point should the provisional secret replace the currently active secret. Consume all verification/setup/reset tokens after successful use. If the password or MFA changes, revoke other active sessions. The endpoint may return a refreshed session for the signed-in profile flow.

Fields that are not being changed may be omitted in modify mode. A missing field must not be interpreted as clearing that account property.

## Authenticator sign-in challenge

`POST /api/app/mfa/authenticator/auth/verify`

```json
{
  "email": "user@company.com",
  "mfaToken": "short-lived-first-factor-token",
  "code": "123456"
}
```

The MFA token should only be issued after successful password authentication and should be short-lived and one-use. A normal authenticated session is issued only after successful MFA verification.

## Passkey registration

Passkey support remains available in the existing code but is not part of the account-security work in this pass.

### POST /api/app/mfa/passkey/register/options

```json
{
  "email": "user@company.com",
  "setupToken": "short-lived-one-use-token"
}
```

The server returns the normal WebAuthn `publicKey` creation options and a server-side `transactionId`.

### POST /api/app/mfa/passkey/register/verify

The browser sends the server-side `transactionId` plus the serialized WebAuthn credential. The server validates origin, RP ID, challenge, user binding and user verification before storing the credential.

## Passkey sign-in challenge

### POST /api/app/mfa/passkey/auth/options

```json
{
  "email": "user@company.com",
  "mfaToken": "short-lived-first-factor-token"
}
```

### POST /api/app/mfa/passkey/auth/verify

The browser sends the transaction ID and serialized assertion. Successful verification returns the normal authenticated session response.

## Security notes

- Password-reset and account-modification tokens must be short-lived, single-use and purpose-bound.
- Rate-limit verification-code and password-reset generation/resend operations.
- Store reset/verification tokens server-side as hashes where practical.
- Never email an Authenticator QR code or TOTP secret.
- Do not replace an existing Authenticator secret until the replacement TOTP has been verified and the final modification commits successfully.
- Password-reset request responses must not reveal whether an account exists.
- Passkeys require HTTPS in production.
