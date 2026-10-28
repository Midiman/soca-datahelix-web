import React from 'react';


const MFACodeVerification = ({
    code,
    onCodeChange,
    onSubmit,
    busy = false,
    alert = null,
    label = 'Authenticator code',
    inputId = 'mfa-verification-code',
    buttonLabel = 'Verify',
    busyLabel = 'Verifying...',
    buttonIcon = null,
    disabled = false
}) =>
{
    return (
        <form className="mfa-code-form" onSubmit={onSubmit}>
            <label htmlFor={inputId}>{label}</label>

            <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={event => onCodeChange?.(event.target.value)}
                maxLength={6}
                autoFocus
            />

            {alert && <div className="mfa-alert">{alert}</div>}

            <button
                type="submit"
                className="mfa-primary"
                disabled={busy || disabled || code.length !== 6}
            >
                {buttonIcon}
                {busy ? busyLabel : buttonLabel}
            </button>
        </form>
    );
};


export { MFACodeVerification };
