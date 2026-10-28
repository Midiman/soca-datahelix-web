import React, { useEffect, useMemo, useState } from 'react';
import {
    FaArrowLeft,
    FaCheck,
    FaEnvelope,
    FaFingerprint,
    FaShieldAlt
} from 'react-icons/fa';

import { searchService } from '@/_services/search.service';
import { maskEmail } from '../../../util/email';
import { AuthenticatorSetup } from './AuthenticatorSetup';
import { mfaService } from '@/_services/mfa.service';
import { Debug } from '@/util/Utilities';
import { credentialToJSON, isPasskeySupported, parseRequestOptions} from './webauthn';


const ACCOUNT_MODIFY_PURPOSE = 'account_modify';


const MFAChallenge = ({
    email,
    password = null,
    tenantId = null,
    mfaToken = null,
    methods = ['authenticator'],
    onAuthenticated = null,
    onCancel = null
}) =>
{
    const availableMethods = methods.filter(method =>
        method === 'authenticator' || method === 'passkey'
    );

    const [method, setMethod] = useState(availableMethods[0] || 'authenticator');
    const [view, setView] = useState('challenge');
    const [activeMfaToken, setActiveMfaToken] = useState(mfaToken);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);

    const [recoveryCode, setRecoveryCode] = useState('');
    const [recoveryVerificationSent, setRecoveryVerificationSent] = useState(false);
    const [recoveryVerificationToken, setRecoveryVerificationToken] = useState(null);

    const passkeySupported = useMemo(() => isPasskeySupported(), []);


    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            if (event.key !== 'Escape')
                return;

            event.preventDefault();

            if (view !== 'challenge')
            {
                cancelRecovery();
                return;
            }

            onCancel?.();
        }

        window.addEventListener('keydown', handleKeyDown);

        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel, view]);


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response.error || response.message || fallback;

        return null;
    }


    function updateCode(value)
    {
        setCode(value.replace(/\D/g, '').slice(0, 6));
        setAlert(null);
    }


    function updateRecoveryCode(value)
    {
        setRecoveryCode(value.replace(/\D/g, '').slice(0, 6));
        setAlert(null);
    }


    async function verifyAuthenticator(event)
    {
        event.preventDefault();

        if (code.length !== 6 || busy)
            return;

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await mfaService.verifyAuthenticatorChallenge({
                email,
                password,
                mfaToken: activeMfaToken,
                code
            });

            if (response?.ok === false || response?.status >= 400)
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'That code was not accepted.'
                );

            onAuthenticated?.(response);
        }
        catch (err)
        {
            setAlert(err?.message || 'That code was not accepted.');
            setCode('');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function verifyPasskey()
    {
        if (!passkeySupported || busy)
            return;

        setBusy(true);
        setAlert(null);

        try
        {
            const start = await mfaService.beginPasskeyAuthentication({
                email,
                mfaToken: activeMfaToken
            });

            if (
                start?.ok === false ||
                start?.status >= 400 ||
                !start?.transactionId ||
                !start?.publicKey
            )
                throw new Error(
                    start?.error ||
                    start?.message ||
                    'Unable to start Passkey verification.'
                );

            const credential = await navigator.credentials.get({
                publicKey: parseRequestOptions(start.publicKey)
            });

            if (!credential)
                throw new Error('Passkey verification was cancelled.');

            const response = await mfaService.finishPasskeyAuthentication({
                transactionId: start.transactionId,
                credential: credentialToJSON(credential)
            });

            if (response?.ok === false || response?.status >= 400)
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'Passkey verification failed.'
                );

            onAuthenticated?.(response);
        }
        catch (err)
        {
            const cancelled = err?.name === 'NotAllowedError';

            setAlert(
                cancelled
                    ? 'Passkey verification was cancelled or timed out.'
                    : (err?.message || 'Passkey verification failed.')
            );
        }
        finally
        {
            setBusy(false);
        }
    }


    function useMethod(nextMethod)
    {
        setAlert(null);
        setCode('');
        setMethod(nextMethod);
        setView('challenge');
    }


    function cancelRecovery()
    {
        setRecoveryCode('');
        setRecoveryVerificationSent(false);
        setRecoveryVerificationToken(null);
        setAlert(null);
        setView('challenge');
    }


    async function startAuthenticatorRecovery()
    {
        if (busy)
            return;

        setBusy(true);
        setAlert(null);
        setRecoveryCode('');
        setRecoveryVerificationToken(null);
        setRecoveryVerificationSent(false);
        setView('recover-email');

        try
        {
            if (Debug)
                console.log('startAuthenticatorRecovery API call start');
            const response = await searchService.requestThreatLabVerificationCode({
                email,
                password,
                purpose: ACCOUNT_MODIFY_PURPOSE,
                tenantId
            });
            if (Debug)
                console.log('startAuthenticatorRecovery response: ', response);

            const responseError = getResponseError(
                response,
                'Unable to send the verification code.'
            );

            if (responseError)
                throw new Error(responseError);

            setRecoveryVerificationSent(true);
        }
        catch (err)
        {
            setAlert(err?.message || 'Unable to send the verification code.');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function verifyRecoveryEmail(event)
    {
        event.preventDefault();

        if (recoveryCode.length !== 6 || busy)
            return;

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.verifyThreatLabVerificationCode({
                email,
                password,
                code: recoveryCode,
                purpose: ACCOUNT_MODIFY_PURPOSE,
                tenantId
            });

            const responseError = getResponseError(
                response,
                'That verification code is invalid or has expired.'
            );

            if (responseError)
                throw new Error(responseError);

            if (!response?.verificationToken)
                throw new Error('Verification succeeded but no verification token was returned.');

            setRecoveryVerificationToken(response.verificationToken);
            setRecoveryCode('');
            setView('recover-authenticator');
        }
        catch (err)
        {
            setAlert(
                err?.message ||
                'That verification code is invalid or has expired.'
            );
            setRecoveryCode('');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function completeAuthenticatorRecovery(result)
    {
        if (busy)
            return;

        const artifacts = result?.artifacts || null;

        if (!artifacts?.secret || !artifacts?.qrCode)
        {
            setAlert('Authenticator setup completed but the MFA setup data is missing.');
            return;
        }

        setBusy(true);
        setAlert(null);

        try
        {
            /*
             * The Authenticator code has already been verified by the existing
             * MFA setup flow. Persist the replacement MFA data by modifying the
             * existing ThreatLab account - never try to create it again.
             */
            const response = await searchService.createThreatLabAccount({
                modify: true,
                tenantId,
                email,
                password,
                mfaEnabled: true,
                mfaMethod: 'authenticator',
                verificationToken: recoveryVerificationToken,
                purpose: ACCOUNT_MODIFY_PURPOSE,
                secret: artifacts.secret,
                qrCode: artifacts.qrCode
            });

            const responseError = getResponseError(
                response,
                'Unable to complete Authenticator setup.'
            );

            if (responseError)
                throw new Error(responseError);

            setRecoveryCode('');
            setRecoveryVerificationSent(false);
            setRecoveryVerificationToken(null);
            setView('recover-complete');
        }
        catch (err)
        {
            setAlert(
                err?.message ||
                'Unable to complete Authenticator setup.'
            );
        }
        finally
        {
            setBusy(false);
        }
    }


    function returnToSignIn()
    {
        setAlert(null);
        setCode('');
        setRecoveryCode('');
        setRecoveryVerificationSent(false);
        setRecoveryVerificationToken(null);

        onCancel?.();
    }


    function renderChallenge()
    {
        return (
            <>
                {method === 'passkey'
                    ?
                    <div className="mfa-method-panel">
                        <p>Use your saved Passkey to verify this sign-in.</p>

                        {alert && <div className="mfa-alert">{alert}</div>}

                        <button
                            type="button"
                            className="mfa-primary"
                            onClick={verifyPasskey}
                            disabled={busy || !passkeySupported}
                        >
                            <FaFingerprint aria-hidden="true" />
                            {busy ? 'Waiting for Passkey...' : 'Use Passkey'}
                        </button>
                    </div>
                    :
                    <form className="mfa-code-form" onSubmit={verifyAuthenticator}>
                        <label htmlFor="mfa-challenge-code">Authenticator code</label>

                        <input
                            id="mfa-challenge-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={code}
                            onChange={event => updateCode(event.target.value)}
                            maxLength={6}
                            autoFocus
                        />

                        {alert && <div className="mfa-alert">{alert}</div>}

                        <button
                            type="submit"
                            className="mfa-primary"
                            disabled={busy || code.length !== 6}
                        >
                            <FaShieldAlt aria-hidden="true" />
                            {busy ? 'Verifying...' : 'Verify'}
                        </button>

                        <button
                            type="button"
                            className="mfa-back-link"
                            onClick={startAuthenticatorRecovery}
                            disabled={busy}
                            style={{marginInline:'auto'}}
                        >
                            Don't have a code?
                        </button>
                    </form>
                }

                {availableMethods.length > 1 && (
                    <button
                        type="button"
                        className="mfa-back-link"
                        onClick={() =>
                        {
                            setAlert(null);
                            setView('alternate');
                        }}
                        disabled={busy}
                    >
                        Try another way to sign in
                    </button>
                )}
            </>
        );
    }


    function renderAlternateMethods()
    {
        return (
            <div className="mfa-alternate-panel">
                <h3>Choose another way to sign in</h3>

                {availableMethods.includes('authenticator') && method !== 'authenticator' && (
                    <button
                        type="button"
                        className="mfa-alternate-option"
                        onClick={() => useMethod('authenticator')}
                    >
                        <FaShieldAlt aria-hidden="true" />
                        Use Authenticator
                    </button>
                )}

                {availableMethods.includes('passkey') && method !== 'passkey' && (
                    <button
                        type="button"
                        className="mfa-alternate-option"
                        onClick={() => useMethod('passkey')}
                    >
                        <FaFingerprint aria-hidden="true" />
                        Use Passkey
                    </button>
                )}

                <button
                    type="button"
                    className="mfa-back-link"
                    onClick={() => setView('challenge')}
                    disabled={busy}
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>
            </div>
        );
    }


    function renderRecoveryEmail()
    {
        return (
            <div className="mfa-method-panel">
                <div className="mfa-method-heading">
                    <FaEnvelope aria-hidden="true" />
                    <div>
                        <h3>Reset Authenticator</h3>
                        <p>
                            {recoveryVerificationSent
                                ? <>
                                    We sent a 6-digit verification code to{' '}
                                    <strong>{maskEmail(email)}</strong>.
                                </>
                                : `Sending a verification code to ${maskEmail(email)}...`
                            }
                        </p>
                    </div>
                </div>

                {alert && <div className="mfa-alert">{alert}</div>}

                {recoveryVerificationSent && (
                    <form className="mfa-code-form" onSubmit={verifyRecoveryEmail}>
                        <label htmlFor="mfa-recovery-email-code">Verification code</label>

                        <input
                            id="mfa-recovery-email-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={recoveryCode}
                            onChange={event => updateRecoveryCode(event.target.value)}
                            maxLength={6}
                            autoFocus
                        />

                        <button
                            type="submit"
                            className="mfa-primary"
                            disabled={busy || recoveryCode.length !== 6}
                        >
                            {busy ? 'Verifying...' : 'Verify email'}
                        </button>

                        <button
                            type="button"
                            className="mfa-back-link"
                            onClick={startAuthenticatorRecovery}
                            disabled={busy}
                            style={{marginInline:'auto'}}
                        >
                            Resend code
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    className="mfa-back-link"
                    onClick={cancelRecovery}
                    disabled={busy}
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>
            </div>
        );
    }


    function renderRecoveryComplete()
    {
        return (
            <div className="mfa-method-panel">
                <div className="mfa-method-heading">
                    <FaCheck aria-hidden="true" />

                    <div>
                        <h3>Authenticator setup complete</h3>
                        <p>Your new Authenticator has been verified and saved.</p>
                    </div>
                </div>

                {alert && <div className="mfa-alert">{alert}</div>}

                <center>
                    <button
                        type="button"
                        className="mfa-primary"
                        onClick={returnToSignIn}
                        style={{marginInline:'auto'}}
                    >
                        Sign in
                    </button>
                </center>
            </div>
        );
    }


    function renderRecoveryAuthenticator()
    {
        return (
            <div>
                <button
                    type="button"
                    className="mfa-back-link"
                    onClick={() =>
                    {
                        setAlert(null);
                        setView('recover-email');
                    }}
                    disabled={busy}
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>

                {alert && <div className="mfa-alert">{alert}</div>}

                <AuthenticatorSetup
                    email={email}
                    password={password}
                    resetExisting
                    onComplete={completeAuthenticatorRecovery}
                />
            </div>
        );
    }


    return (
        <section className="mfa-challenge">
            <div className="mfa-title">
                <h2>
                    {view === 'challenge' || view === 'alternate'
                        ? 'Verify your sign-in'
                        : (view === 'recover-complete'
                            ? 'Authenticator setup complete'
                            : 'Recover Authenticator')
                    }
                </h2>
                <p>
                    {view === 'challenge' || view === 'alternate'
                        ? 'Complete your multi-factor authentication.'
                        : (view === 'recover-complete'
                            ? 'Your Authenticator has been reset successfully.'
                            : 'Verify your email, then set up Authenticator again.')
                    }
                </p>
            </div>

            {view === 'challenge' && renderChallenge()}
            {view === 'alternate' && renderAlternateMethods()}
            {view === 'recover-email' && renderRecoveryEmail()}
            {view === 'recover-authenticator' && renderRecoveryAuthenticator()}
            {view === 'recover-complete' && renderRecoveryComplete()}

            {onCancel && view === 'challenge' && (
                <div>
                    <button
                        type="button"
                        className="mfa-back-link"
                        onClick={() => onCancel()}
                        disabled={busy}
                    >
                        <FaArrowLeft aria-hidden="true" />
                        Back to sign in
                    </button>
                </div>
            )}
        </section>
    );
};


export { MFAChallenge };
