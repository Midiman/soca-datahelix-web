import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { Spinner } from '@hct/soca-toolkit';

import { maskEmail } from '../../util/email';
import { DefaultBranding } from '../DefaultBranding';


const EmailVerification = ({
    email,
    alert = null,
    onBack = null,
    onClearAlert = null,
    onVerify,
    onVerified = null,
    onResend,
    standalone = true,
    showBranding = true,
    verifyLabel = 'Verify',
    verifyBusyLabel = 'Verifying',
    completeBusyLabel = null,
    verificationText = 'Enter it below to verify your account.',
    resendSuccessText = 'A new code has been sent.',
    disabled = false,
    inputId = 'email-verification-code'
}) =>
{
    const [code, setCode] = useState('');
    const [busyState, setBusyState] = useState(null);
    const [localAlert, setLocalAlert] = useState(null);
    const [resent, setResent] = useState(false);
    const codeInputRef = useRef(null);


    useEffect(() =>
    {
        codeInputRef.current?.focus();
    }, []);


    function updateCode(value)
    {
        setCode(value.replace(/\D/g, '').slice(0, 6));
        setLocalAlert(null);
        setResent(false);
        onClearAlert?.();
    }


    async function verifyCode(event)
    {
        event.preventDefault();

        if (busyState || disabled)
            return;

        if (code.length !== 6)
        {
            setLocalAlert('Enter the 6-digit verification code.');
            return;
        }

        setBusyState('verify');
        setLocalAlert(null);
        setResent(false);
        onClearAlert?.();

        try
        {
            const response = await onVerify?.(code);

            if (onVerified)
            {
                setBusyState('complete');
                await onVerified(response);
            }
        }
        catch (err)
        {
            setLocalAlert(
                err?.message ||
                'That verification code is invalid or has expired.'
            );
            setCode('');
            codeInputRef.current?.focus();
        }
        finally
        {
            setBusyState(null);
        }
    }


    async function resendCode()
    {
        if (busyState || disabled)
            return;

        setBusyState('resend');
        setCode('');
        setLocalAlert(null);
        setResent(false);
        onClearAlert?.();

        try
        {
            await onResend?.();
            setResent(true);
            codeInputRef.current?.focus();
        }
        catch (err)
        {
            setLocalAlert(
                err?.message ||
                'Unable to resend the verification code.'
            );
        }
        finally
        {
            setBusyState(null);
        }
    }


    function renderContent()
    {
        const buttonBusy = busyState === 'verify' || busyState === 'complete';
        const busyLabel = busyState === 'complete' && completeBusyLabel
            ? completeBusyLabel
            : verifyBusyLabel;

        return (
            <>
                {showBranding && (
                    <div className="signup-stage-brand">
                        <DefaultBranding orientation="horizontal" />
                    </div>
                )}

                {onBack && (
                    <button
                        type="button"
                        className="signup-back-button"
                        onClick={onBack}
                        disabled={Boolean(busyState) || disabled}
                    >
                        <FaArrowLeft aria-hidden="true" />
                        Back
                    </button>
                )}

                <div className="signup-stage-heading centered">
                    <p>
                        We sent a 6-digit verification code to{' '}
                        <strong>{maskEmail(email)}</strong>. {verificationText}
                    </p>
                </div>

                <form onSubmit={verifyCode}>
                    <label className="signup-code-label" htmlFor={inputId}>
                        Verification code
                    </label>

                    <input
                        id={inputId}
                        className="signup-code-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        ref={codeInputRef}
                        value={code}
                        onChange={event => updateCode(event.target.value)}
                        maxLength={6}
                        aria-describedby={`${inputId}-status`}
                    />

                    <div
                        id={`${inputId}-status`}
                        className={`signup-alert ${resent ? 'success' : ''}`}
                        aria-live="polite"
                    >
                        {alert || localAlert || (resent ? resendSuccessText : '')}
                    </div>

                    <Button
                        type="submit"
                        className="signup-primary-button"
                        disabled={buttonBusy || disabled || code.length !== 6}
                    >
                        {buttonBusy
                            ?
                            <span>
                                {busyLabel}{' '}
                                <Spinner size={12} color="#EEE" />
                            </span>
                            :
                            verifyLabel
                        }
                    </Button>

                    {onResend && (
                        <div className="signup-resend-row">
                            Didn't get the code?{' '}
                            <button
                                type="button"
                                onClick={resendCode}
                                disabled={Boolean(busyState) || disabled}
                            >
                                {busyState === 'resend' ? 'Sending...' : 'Resend'}
                            </button>
                        </div>
                    )}
                </form>
            </>
        );
    }


    if (!standalone)
    {
        return (
            <div className="email-verification-embedded">
                {renderContent()}
            </div>
        );
    }


    return (
        <main className="signup-stage-page signup-centered-stage">
            <section className="signup-verify-card">
                {renderContent()}
            </section>
        </main>
    );
};


export { EmailVerification };
