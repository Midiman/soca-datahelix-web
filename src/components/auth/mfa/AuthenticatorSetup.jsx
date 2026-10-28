import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCopy, FaShieldAlt } from 'react-icons/fa';

import { mfaService } from '@/_services/mfa.service';


const AuthenticatorSetup = ({
    email,
    password = null,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    tenantId = null,
    deferredCommit = false,
    resetExisting = false,
    onComplete = null
}) =>
{
    const [artifacts, setArtifacts] = useState(null);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const startedRef = useRef(false);


    useEffect(() =>
    {
        if (startedRef.current)
            return;

        startedRef.current = true;
        loadArtifacts();
    }, []);


    async function loadArtifacts()
    {
        setBusy(true);
        setAlert(null);
        setCode('');

        try
        {
            const response = await mfaService.beginAuthenticatorSetup({
                email,
                password,
                setupToken,
                verificationToken,
                purpose,
                tenantId
            });

            if (
                response?.ok === false ||
                response?.status >= 400 ||
                !response?.qrCode ||
                !response?.secret
            )
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'Unable to start Authenticator setup.'
                );

            setArtifacts(response);
        }
        catch (err)
        {
            setArtifacts(null);
            setAlert(err?.message || 'Unable to start Authenticator setup.');
        }
        finally
        {
            setBusy(false);
        }
    }


    function updateCode(value)
    {
        setCode(value.replace(/\D/g, '').slice(0, 6));
        setAlert(null);
    }


    async function verify(event)
    {
        event.preventDefault();

        if (code.length !== 6 || busy)
            return;

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await mfaService.verifyAuthenticatorSetup({
                email,
                password,
                setupToken:
                    artifacts?.mfaSetupToken ||
                    artifacts?.setupToken ||
                    setupToken,
                verificationToken,
                purpose,
                deferredCommit,
                code,
                tenantId
            });

            if (response?.ok === false || response?.status >= 400)
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'That code was not accepted.'
                );

            onComplete?.({
                method: 'authenticator',
                response,
                code,
                artifacts
            });
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


    async function copySecret()
    {
        if (!artifacts?.secret)
            return;

        await navigator.clipboard?.writeText(artifacts.secret);
    }


    if (busy && !artifacts)
        return <div className="mfa-status">Preparing Authenticator setup...</div>;


    if (!artifacts)
    {
        return (
            <div className="mfa-status mfa-error">
                <div>{alert || 'Unable to load Authenticator setup.'}</div>

                <button
                    type="button"
                    className="mfa-link-button"
                    onClick={loadArtifacts}
                >
                    Try again
                </button>
            </div>
        );
    }


    return (
        <div className="mfa-method-panel">
            <div className="mfa-method-heading">
                <FaShieldAlt aria-hidden="true" />

                <div>
                    <h3>{resetExisting ? 'Reset Authenticator' : 'Authenticator app'}</h3>
                    <p>
                        {resetExisting
                            ? 'Scan this QR code on the replacement device, then verify the new code.'
                            : 'Use Microsoft Authenticator, Google Authenticator or another TOTP app.'
                        }
                    </p>
                </div>
            </div>

            <div className="mfa-authenticator-grid">
                <div className="mfa-qr-wrap">
                    <img
                        src={artifacts.qrCode}
                        className="mfa-qr"
                        alt="Authenticator setup QR code"
                    />
                </div>

                <div className="mfa-authenticator-copy">
                    <ol>
                        <li>Open your Authenticator app.</li>
                        <li>Add an account and scan the QR code.</li>
                        <li>Enter the 6-digit code below.</li>
                    </ol>

                    <div className="mfa-secret-row">
                        <code>{artifacts.secret}</code>

                        <button
                            type="button"
                            onClick={copySecret}
                            title="Copy setup key"
                        >
                            <FaCopy aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <form className="mfa-code-form" onSubmit={verify}>
                <label htmlFor="mfa-code">Verification code</label>

                <input
                    id="mfa-code"
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
                    <FaCheck aria-hidden="true" />
                    {busy
                        ? 'Verifying...'
                        : (deferredCommit ? 'Verify and save changes' : 'Verify and enable')
                    }
                </button>
            </form>
        </div>
    );
};


export { AuthenticatorSetup };
