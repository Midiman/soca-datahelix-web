import React, { useMemo, useState } from 'react';
import { FaFingerprint, FaKey } from 'react-icons/fa';

import { mfaService } from '@/_services';
import {
    credentialToJSON,
    isPasskeySupported,
    parseCreationOptions
} from './webauthn';


const PasskeySetup = ({
    email,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    deferredCommit = false,
    onComplete = null
}) =>
{
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const supported = useMemo(() => isPasskeySupported(), []);


    async function createPasskey()
    {
        if (!supported || busy)
            return;

        setBusy(true);
        setAlert(null);

        try
        {
            const start = await mfaService.beginPasskeyRegistration({
                email,
                setupToken,
                verificationToken,
                purpose,
                deferredCommit
            });

            if (
                start?.ok === false ||
                start?.status >= 400 ||
                !start?.transactionId ||
                !start?.publicKey
            )
                throw new Error(start?.error || start?.message || 'Unable to start Passkey setup.');

            const credential = await navigator.credentials.create({
                publicKey: parseCreationOptions(start.publicKey)
            });

            if (!credential)
                throw new Error('Passkey setup was cancelled.');

            const response = await mfaService.finishPasskeyRegistration({
                transactionId: start.transactionId,
                credential: credentialToJSON(credential),
                verificationToken,
                purpose,
                deferredCommit
            });

            if (response?.ok === false || response?.status >= 400)
                throw new Error(response?.error || response?.message || 'Unable to save the Passkey.');

            await onComplete?.({
                method: 'passkey',
                response
            });
        }
        catch (err)
        {
            const cancelled = err?.name === 'NotAllowedError';

            setAlert(
                cancelled
                    ? 'Passkey setup was cancelled or timed out.'
                    : (err?.message || 'Unable to create the Passkey.')
            );
        }
        finally
        {
            setBusy(false);
        }
    }


    if (!supported)
    {
        return (
            <div className="mfa-status mfa-error">
                Passkeys are not available on this device or browser.
            </div>
        );
    }


    return (
        <div className="mfa-method-panel">
            <div className="mfa-method-heading">
                <FaFingerprint aria-hidden="true" />

                <div>
                    <h3>Passkey</h3>
                    <p>
                        Use your fingerprint, face, device PIN or other
                        device security to verify your identity.
                    </p>
                </div>
            </div>

            {alert && <div className="mfa-alert">{alert}</div>}

            <button
                type="button"
                className="mfa-primary"
                onClick={createPasskey}
                disabled={busy}
            >
                <FaKey aria-hidden="true" />
                {busy ? 'Creating Passkey...' : 'Create Passkey'}
            </button>
        </div>
    );
};


export { PasskeySetup };