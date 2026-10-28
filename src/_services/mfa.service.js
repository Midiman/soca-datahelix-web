import { fetchWrapper } from '@/_helpers';
import { accountService } from '@/_services/account.service';
import { searchService } from '@/_services/search.service';

import { Debug } from '@/util/Utilities';


function api(path, payload)
{
    if (Debug)
        console.log('mfa_api ENTRY',path,payload)

    return fetchWrapper.post(
        `${searchService.getBaseUrl()}${path}`,
        payload
    );
}


function normaliseStatus(status)
{
    return {
        ok: status >= 200 && status < 300,
        status
    };
}


function unwrapResponse(response)
{
    if (
        !response ||
        typeof response !== 'object' ||
        typeof response.message !== 'string' ||
        response.status == null
    )
        return response;

    try
    {
        const parsed = JSON.parse(response.message);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            return response;

        return {
            ...parsed,
            status: parsed.status ?? response.status
        };
    }
    catch (err)
    {
        return response;
    }
}


async function beginAuthenticatorSetup({
    email,
    password,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    tenantId = null
})
{
    if (verificationToken)
    {
        const response = await searchService.beginThreatLabAuthenticatorSetup({
            email,
            password,
            verificationToken,
            purpose,
            tenantId
        });

        if (Debug)
            console.log('beginAuthenticatorSetup [ThreatLab] response', response);

        return unwrapResponse(response);
    }

    if (setupToken)
    {
        const response = await api('/api/app/mfa/authenticator/setup', {
            email,
            setupToken
        });
        if (Debug)
            console.log('beginAuthenticatorSetup [setupToken] response',response)
        return unwrapResponse(response);
    }

    // Existing product API compatibility.
    const response = await accountService.getMFArtifacts(email, password);
    if (Debug)
        console.log('beginAuthenticatorSetup [compat] response',response)
    return unwrapResponse(response);
}


async function verifyAuthenticatorSetup({
    email,
    password,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    deferredCommit = false,
    code,
    tenantId = null
})
{
    if (verificationToken)
    {
        const response = await searchService.verifyThreatLabAuthenticatorSetup({
            email,
            password,
            setupToken,
            verificationToken,
            purpose,
            deferredCommit,
            code,
            tenantId
        });

        return unwrapResponse(response);
    }

    if (setupToken)
    {
        const response = await api('/api/app/mfa/authenticator/setup/verify', {
            email,
            setupToken,
            code
        });

        return unwrapResponse(response);
    }

    // Existing product API compatibility.
    const status = await accountService.verifyMFA(email, code, password);
    return normaliseStatus(status || 500);
}


async function verifyAuthenticatorChallenge({
    email,
    password,
    mfaToken = null,
    code
})
{
    if (mfaToken)
    {
        return api('/api/app/mfa/authenticator/auth/verify', {
            email,
            mfaToken,
            code
        });
    }

    const status = await accountService.verifyMFA(email, code, password);
    return normaliseStatus(status || 500);
}


function beginPasskeyRegistration({
    email,
    setupToken = null,
    verificationToken = null,
    purpose = null,
    deferredCommit = false,
    label = null
})
{
    return api('/api/app/passkey/?action=passkey-register', {
        email,
        // During signup the verified-email token is the setup authorisation.
        setupToken: setupToken || verificationToken,
        verificationToken,
        purpose,
        deferredCommit,
        label
    });
}


function finishPasskeyRegistration({
    transactionId,
    credential,
    verificationToken = null,
    purpose = null,
    deferredCommit = false
})
{
    return api('/api/app/passkey/?action=passkey-register-verify', {
        transactionId,
        credential,
        verificationToken,
        purpose,
        deferredCommit
    });
}


function beginPasskeyAuthentication({ email, mfaToken })
{
    return api('/api/app/passkey/?action=passkey-auth', {
        email,
        mfaToken
    });
}


function finishPasskeyAuthentication({ transactionId, credential })
{
    return api('/api/app/passkey/?action=passkey-auth-verify', {
        transactionId,
        credential
    });
}


export const mfaService = {
    beginAuthenticatorSetup,
    verifyAuthenticatorSetup,
    verifyAuthenticatorChallenge,
    beginPasskeyRegistration,
    finishPasskeyRegistration,
    beginPasskeyAuthentication,
    finishPasskeyAuthentication
};
