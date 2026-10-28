import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaCheck,
    FaEnvelope,
    FaKey
} from 'react-icons/fa';
import { Spinner } from '@hct/soca-toolkit';

import { searchService } from '../../_services/search.service';
import { maskEmail } from '../../util/email';
import { DefaultBranding } from '../DefaultBranding';
import { EmailVerification } from './EmailVerification';
import { AuthenticatorSetup } from './mfa/AuthenticatorSetup';


const PROFILE_PURPOSE = 'account_modify';
const RESET_PURPOSE = 'password_reset';


const AccountSecurity = ({
    user = null,
    mode = 'profile',
    resetToken = null,
    onCancel = null,
    onComplete = null
}) =>
{
    const resetMode = mode === 'reset';
    const initialEmail = user?.email || '';

    const [phase, setPhase] = useState(resetMode ? 'validating' : 'verify-email');
    const [account, setAccount] = useState(user || null);
    const [email, setEmail] = useState(initialEmail);
    const [verificationToken, setVerificationToken] = useState(null);
    const [verificationSent, setVerificationSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changeAuthenticator, setChangeAuthenticator] = useState(false);
    const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const [success, setSuccess] = useState(null);

    const startedRef = useRef(false);
    const mfaSelectionInitialisedRef = useRef(false);

    const purpose = resetMode ? RESET_PURPOSE : PROFILE_PURPOSE;
    const mfaState = useMemo(() =>
    {
        const mechanism = String(account?.mfaMechanism || '')
            .trim()
            .toLowerCase();

        const enabled =
            account?.mfaEnabled === true ||
            (
                mechanism &&
                mechanism !== 'none'
            );

        let method = null;

        if (enabled)
        {
            method = mechanism === 'passkey'
                ? 'passkey'
                : 'authenticator';
        }

        return {
            enabled,
            method,
            hasAuthenticator: method === 'authenticator',
            hasOtherMfa: method === 'passkey'
        };
    }, [account]);

    const passwordRequested = resetMode || Boolean(newPassword || confirmPassword);
    const passwordValid =
        newPassword.length >= 9 &&
        newPassword.length <= 128 &&
        newPassword === confirmPassword;

    const authenticatorChanged =
        !mfaState.hasOtherMfa &&
        authenticatorEnabled !== mfaState.hasAuthenticator;


    useEffect(() =>
    {
        if (startedRef.current)
            return;

        startedRef.current = true;

        if (resetMode)
            validateResetLink();
        else
            sendVerificationCode();
    }, []);


    useEffect(() =>
    {
        if (phase !== 'edit' || mfaSelectionInitialisedRef.current)
            return;

        setAuthenticatorEnabled(mfaState.hasAuthenticator);
        mfaSelectionInitialisedRef.current = true;
    }, [phase, mfaState.hasAuthenticator]);


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response.error || response.message || fallback;

        return null;
    }


    function getPlanValue(value)
    {
        if (!value)
            return null;

        if (typeof value === 'string')
            return value;

        return value.id || value.plan || value.name || null;
    }


    function updatePassword(value)
    {
        setNewPassword(value);
        setAlert(null);
        setSuccess(null);
    }


    function updateConfirmPassword(value)
    {
        setConfirmPassword(value);
        setAlert(null);
        setSuccess(null);
    }


    async function requestVerificationCode()
    {
        const targetEmail = String(email || user?.email || '').trim().toLowerCase();

        if (!targetEmail)
            throw new Error('Unable to determine the account email address.');

        const response = await searchService.requestThreatLabVerificationCode({
            email: targetEmail,
            password: null,
            purpose: PROFILE_PURPOSE,
            tenantId: user?.tenantId || null
        });

        const responseError = getResponseError(
            response,
            'Unable to send the verification code.'
        );

        if (responseError)
            throw new Error(responseError);

        setEmail(targetEmail);
        return response;
    }


    async function sendVerificationCode()
    {
        if (busy)
            return;

        setBusy(true);
        setVerificationSent(false);
        setAlert(null);
        setSuccess(null);

        try
        {
            await requestVerificationCode();
            setVerificationSent(true);
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


    async function verifyEmailCode(code)
    {
        const response = await searchService.verifyThreatLabVerificationCode({
            email,
            code,
            purpose: PROFILE_PURPOSE,
            tenantId: user?.tenantId || null
        });

        const responseError = getResponseError(
            response,
            'That verification code is invalid or has expired.'
        );

        if (responseError)
            throw new Error(responseError);

        if (!response?.verificationToken)
            throw new Error('Verification succeeded but no verification token was returned.');

        return response;
    }


    function handleEmailVerified(response)
    {
        setVerificationToken(response.verificationToken);
        setPhase('edit');
        setAlert(null);
        setSuccess(null);
    }


    async function validateResetLink()
    {
        if (!resetToken)
        {
            setAlert('This password reset link is invalid.');
            setPhase('invalid');
            return;
        }

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.validateThreatLabPasswordReset({
                token: resetToken
            });

            const responseError = getResponseError(
                response,
                'This password reset link is invalid or has expired.'
            );

            if (responseError)
                throw new Error(responseError);

            const resetAccount = response?.user || response?.account || response;
            const resetEmail = String(resetAccount?.email || '').trim().toLowerCase();

            if (!resetEmail)
                throw new Error('The password reset link does not contain a valid account.');

            setAccount(resetAccount);
            setEmail(resetEmail);
            setVerificationToken(
                response?.verificationToken ||
                response?.resetVerificationToken ||
                resetToken
            );
            setPhase('edit');
        }
        catch (err)
        {
            setAlert(
                err?.message ||
                'This password reset link is invalid or has expired.'
            );
            setPhase('invalid');
        }
        finally
        {
            setBusy(false);
        }
    }


    function validateChanges()
    {
        if (!passwordRequested && !changeAuthenticator && !authenticatorChanged)
            return 'Change the password, Authenticator, or both.';

        if (passwordRequested)
        {
            if (newPassword.length < 9)
                return 'Please use a password of at least 9 characters.';

            if (newPassword.length > 128)
                return 'Password must be 128 characters or fewer.';

            if (newPassword !== confirmPassword)
                return 'Passwords do not match.';
        }

        return null;
    }


    async function saveChanges(mfaVerificationToken = null)
    {
        const validationError = validateChanges();

        if (validationError)
        {
            setAlert(validationError);
            return;
        }

        if (changeAuthenticator && !mfaVerificationToken)
        {
            setAlert('Verify the new Authenticator before saving the changes.');
            return;
        }

        const finalMfaEnabled = mfaState.hasOtherMfa
            ? mfaState.enabled
            : authenticatorEnabled;

        const finalMfaMethod = mfaState.hasOtherMfa
            ? mfaState.method
            : (finalMfaEnabled ? 'authenticator' : 'none');

        setBusy(true);
        setAlert(null);
        setSuccess(null);

        try
        {
            const response = await searchService.createThreatLabAccount({
                modify: true,
                tenantId: account?.tenantId || user?.tenantId || null,
                plan: getPlanValue(account?.plan || account?.subscription),
                billingPeriod: account?.billingPeriod || null,
                currency: account?.currency || null,
                name: account?.name || account?.displayName || user?.name || null,
                email,
                password: passwordRequested ? newPassword : null,
                mfaEnabled: finalMfaEnabled,
                mfaMethod: finalMfaMethod,
                verificationToken: resetMode ? null : verificationToken,
                resetToken: resetMode ? resetToken : null,
                mfaVerificationToken,
                purpose,
                termsAccepted: null,
                termsVersion: null
            });

            const responseError = getResponseError(
                response,
                'Unable to update the account.'
            );

            if (responseError)
                throw new Error(responseError);

            setAccount(current => ({
                ...(current || {}),
                mfaEnabled: finalMfaEnabled,
                mfaMechanism: finalMfaMethod
            }));

            setNewPassword('');
            setConfirmPassword('');
            setChangeAuthenticator(false);
            setAuthenticatorEnabled(finalMfaEnabled);
            setSuccess('Account security updated.');

            onComplete?.({
                response,
                email,
                mfaEnabled: finalMfaEnabled,
                mfaMethod: finalMfaMethod,
                resetMode
            });
        }
        catch (err)
        {
            setAlert(err?.message || 'Unable to update the account.');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function handleAuthenticatorVerified(result)
    {
        const response = result?.response || result;
        const mfaVerificationToken =
            response?.mfaVerificationToken ||
            response?.verificationToken ||
            null;

        if (!mfaVerificationToken)
        {
            setAlert('Authenticator verification succeeded but no verification token was returned.');
            return;
        }

        await saveChanges(mfaVerificationToken);
    }


    function renderBackButton()
    {
        if (!onCancel)
            return null;

        return (
            <button
                type="button"
                className="account-security-back"
                onClick={onCancel}
                disabled={busy}
            >
                <FaArrowLeft aria-hidden="true" />
                Back
            </button>
        );
    }


    function renderEmailVerification()
    {
        if (!verificationSent)
        {
            return (
                <>
                    <div className="account-security-heading">
                        <FaEnvelope aria-hidden="true" />
                        <div>
                            <h2>Confirm your email</h2>
                            <p>
                                {busy
                                    ? <>
                                        Sending a verification code to{' '}
                                        <strong>{maskEmail(email || user?.email)}</strong>...
                                    </>
                                    : <>
                                        Verify your identity before changing account security.
                                        We will send a code to{' '}
                                        <strong>{maskEmail(email || user?.email)}</strong>.
                                    </>
                                }
                            </p>
                        </div>
                    </div>

                    {busy
                        ?
                        <div className="mfa-status">Sending verification code...</div>
                        :
                        <Button
                            type="button"
                            className="account-security-primary"
                            onClick={sendVerificationCode}
                        >
                            Send verification code
                        </Button>
                    }
                </>
            );
        }

        return (
            <EmailVerification
                email={email || user?.email}
                alert={alert}
                onClearAlert={() =>
                {
                    setAlert(null);
                    setSuccess(null);
                }}
                onVerify={verifyEmailCode}
                onVerified={handleEmailVerified}
                onResend={requestVerificationCode}
                standalone={false}
                showBranding={false}
                verifyLabel="Verify"
                verifyBusyLabel="Verifying"
                verificationText="Enter it below to confirm your identity."
                inputId="account-security-code"
            />
        );
    }


    function renderEditor()
    {
        const canShowAuthenticator = !passwordRequested || passwordValid;

        function changeAuthenticatorEnabled(enabled)
        {
            if (mfaState.hasOtherMfa || busy)
                return;

            setAuthenticatorEnabled(enabled);

            if (enabled && !mfaState.hasAuthenticator)
                setChangeAuthenticator(true);
            else
                setChangeAuthenticator(false);

            setAlert(null);
            setSuccess(null);
        }

        function startAuthenticatorReset()
        {
            if (!authenticatorEnabled || busy)
                return;

            setChangeAuthenticator(true);
            setAlert(null);
            setSuccess(null);
        }

        function cancelAuthenticatorReset()
        {
            setChangeAuthenticator(false);
            setAlert(null);
            setSuccess(null);
        }

        return (
            <>
                <div className="account-security-heading">
                    <FaKey aria-hidden="true" />
                    <div>
                        <h2>{resetMode ? 'Reset account security' : 'Password & MFA'}</h2>
                        <p>
                            {resetMode
                                ? `Reset access for ${maskEmail(email)}.`
                                : 'Change your password, Authenticator, or both.'
                            }
                        </p>
                    </div>
                </div>

                <div className="account-security-section">
                    <h3>{resetMode ? 'New password' : 'Change password'}</h3>

                    <div className="account-security-form">
                        <label htmlFor="account-new-password">
                            {resetMode ? 'New password' : 'New password (leave blank to keep current)'}
                        </label>

                        <input
                            id="account-new-password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={event => updatePassword(event.target.value)}
                        />

                        <label htmlFor="account-confirm-password">Confirm password</label>

                        <input
                            id="account-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={event => updateConfirmPassword(event.target.value)}
                            disabled={!resetMode && !newPassword}
                        />
                    </div>
                </div>

{/* //PDS TEST AI SLOP */}
                {/* <div className="account-security-section">
                    <div className="account-security-mfa-heading">
                        <div>
                            <h3>Authenticator</h3>
                            <p>
                                {mfaState.hasOtherMfa
                                    ? 'Another MFA method is currently enabled. Authenticator management is unavailable in this pass.'
                                    : (mfaState.hasAuthenticator
                                        ? (authenticatorEnabled
                                            ? 'Authenticator is enabled for this account.'
                                            : 'Authenticator will be removed when you save changes.'
                                        )
                                        : (authenticatorEnabled
                                            ? 'Authenticator will be added to this account.'
                                            : 'Add Microsoft Authenticator, Google Authenticator or another TOTP app.'
                                        )
                                    )
                                }
                            </p>
                        </div>

                        <label className="account-security-switch">
                            <input
                                type="checkbox"
                                role="switch"
                                checked={authenticatorEnabled}
                                disabled={busy || mfaState.hasOtherMfa}
                                onChange={event => changeAuthenticatorEnabled(event.target.checked)}
                                aria-label="Enable Authenticator MFA"
                            />
                            <span aria-hidden="true" />
                        </label>
                    </div>

                    {mfaState.hasAuthenticator && authenticatorEnabled && (
                        <div className="account-security-mfa-actions">
                            <button
                                type="button"
                                className="account-security-mfa-button"
                                onClick={changeAuthenticator
                                    ? cancelAuthenticatorReset
                                    : startAuthenticatorReset
                                }
                                disabled={busy}
                            >
                                {changeAuthenticator
                                    ? 'Cancel reset'
                                    : 'Reset Authenticator'
                                }
                            </button>
                        </div>
                    )}

                    {changeAuthenticator && authenticatorEnabled && canShowAuthenticator && (
                        <AuthenticatorSetup
                            email={email}
                            verificationToken={verificationToken}
                            purpose={purpose}
                            deferredCommit
                            resetExisting={mfaState.hasAuthenticator}
                            onComplete={handleAuthenticatorVerified}
                        />
                    )}

                    {changeAuthenticator && authenticatorEnabled && !canShowAuthenticator && (
                        <div className="mfa-status">
                            Enter and confirm a valid password before setting up Authenticator.
                        </div>
                    )}
                </div> */}

                {alert && <div className="account-security-alert">{alert}</div>}
                {success && <div className="account-security-success">{success}</div>}

                {!changeAuthenticator && (
                    <Button
                        type="button"
                        className="account-security-primary"
                        onClick={() => saveChanges()}
                        disabled={busy}
                    >
                        {busy
                            ? <span>Saving... <Spinner size={12} color="#EEE" /></span>
                            : <span><FaCheck aria-hidden="true" /> Save changes</span>
                        }
                    </Button>
                )}
            </>
        );
    }


    function renderInvalidReset()
    {
        return (
            <div className="account-security-heading">
                <FaKey aria-hidden="true" />
                <div>
                    <h2>Password reset</h2>
                    <p>{alert || 'This password reset link is invalid or has expired.'}</p>
                </div>
            </div>
        );
    }


    return (
        <main className="account-security-page">
            <section className="account-security-card">
                <div className="account-security-brand">
                    <DefaultBranding orientation="horizontal" />
                </div>

                {renderBackButton()}

                {phase === 'validating' && (
                    <div className="mfa-status">Checking password reset link...</div>
                )}

                {phase === 'verify-email' && renderEmailVerification()}
                {phase === 'edit' && renderEditor()}
                {phase === 'invalid' && renderInvalidReset()}

                {phase !== 'edit' && alert && phase !== 'invalid' &&
                    !(phase === 'verify-email' && verificationSent) && (
                    <div className="account-security-alert">{alert}</div>
                )}
            </section>
        </main>
    );
};


export { AccountSecurity };
