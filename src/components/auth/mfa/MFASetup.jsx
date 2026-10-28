import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaFingerprint, FaShieldAlt } from 'react-icons/fa';

import { AuthenticatorSetup } from './AuthenticatorSetup';
import { PasskeySetup } from './PasskeySetup';


const MFASetup = ({
    email,
    password = null,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    deferredCommit = false,
    initialMethod = 'authenticator',
    allowSkip = false,
    onComplete = null,
    onSkip = null,
    onCancel = null
}) =>
{
    const [method, setMethod] = useState(
        initialMethod === 'passkey' ? 'passkey' : 'authenticator'
    );


    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            if (event.key !== 'Escape')
                return;

            event.preventDefault();
            onCancel?.();
        }

        window.addEventListener('keydown', handleKeyDown);

        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);


    return (
        <section className="mfa-setup">
            {onCancel && (
                <button
                    type="button"
                    className="mfa-back-link mfa-setup-back"
                    onClick={() => onCancel()}
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>
            )}

            <div className="mfa-title">
{/*                 
                <h2>Secure your account</h2>
                <p>Choose how you want to verify sign-ins.</p>
*/}                
            </div>
            

{/*
            <div className="mfa-method-selector">
                <button
                    type="button"
                    className={method === 'authenticator' ? 'selected' : ''}
                    onClick={() => setMethod('authenticator')}
                >
                    <FaShieldAlt aria-hidden="true" />
                    <span>
                        <strong>Authenticator</strong>
                        <small>Microsoft or Google Authenticator</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={method === 'passkey' ? 'selected' : ''}
                    onClick={() => setMethod('passkey')}
                >
                    <FaFingerprint aria-hidden="true" />
                    <span>
                        <strong>Passkey</strong>
                        <small>Biometrics or device security</small>
                    </span>
                </button>
            </div> */}

            {method === 'authenticator'
                ?
                <AuthenticatorSetup
                    email={email}
                    password={password}
                    setupToken={setupToken}
                    verificationToken={verificationToken}
                    purpose={purpose}
                    deferredCommit={deferredCommit}
                    onComplete={onComplete}
                />
                :
                <PasskeySetup
                    email={email}
                    setupToken={setupToken}
                    verificationToken={verificationToken}
                    purpose={purpose}
                    deferredCommit={deferredCommit}
                    onComplete={onComplete}
                />
            }

            {allowSkip && (
                <button
                    type="button"
                    className="mfa-skip"
                    onClick={onSkip}
                >
                    Set up later
                </button>
            )}
        </section>
    );
};


export { MFASetup };
