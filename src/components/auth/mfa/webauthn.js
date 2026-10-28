function base64UrlToBuffer(value)
{
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = window.atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1)
        bytes[i] = binary.charCodeAt(i);

    return bytes.buffer;
}


function bufferToBase64Url(value)
{
    if (!value)
        return null;

    const bytes = new Uint8Array(value);
    let binary = '';

    for (let i = 0; i < bytes.length; i += 1)
        binary += String.fromCharCode(bytes[i]);

    return window.btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}


function parseCreationOptions(options)
{
    if (window.PublicKeyCredential?.parseCreationOptionsFromJSON)
        return PublicKeyCredential.parseCreationOptionsFromJSON(options);

    return {
        ...options,
        challenge: base64UrlToBuffer(options.challenge),
        user: {
            ...options.user,
            id: base64UrlToBuffer(options.user.id)
        },
        excludeCredentials: (options.excludeCredentials || []).map(item => ({
            ...item,
            id: base64UrlToBuffer(item.id)
        }))
    };
}


function parseRequestOptions(options)
{
    if (window.PublicKeyCredential?.parseRequestOptionsFromJSON)
        return PublicKeyCredential.parseRequestOptionsFromJSON(options);

    return {
        ...options,
        challenge: base64UrlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map(item => ({
            ...item,
            id: base64UrlToBuffer(item.id)
        }))
    };
}


function credentialToJSON(credential)
{
    if (typeof credential?.toJSON === 'function')
        return credential.toJSON();

    const response = credential.response;
    const data = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment || null,
        clientExtensionResults: credential.getClientExtensionResults?.() || {},
        response: {
            clientDataJSON: bufferToBase64Url(response.clientDataJSON)
        }
    };

    if (response.attestationObject)
    {
        data.response.attestationObject = bufferToBase64Url(response.attestationObject);
        data.response.transports = response.getTransports?.() || [];
    }

    if (response.authenticatorData)
    {
        data.response.authenticatorData = bufferToBase64Url(response.authenticatorData);
        data.response.signature = bufferToBase64Url(response.signature);
        data.response.userHandle = bufferToBase64Url(response.userHandle);
    }

    return data;
}


function isPasskeySupported()
{
    return Boolean(
        window.isSecureContext &&
        window.PublicKeyCredential &&
        navigator.credentials?.create &&
        navigator.credentials?.get
    );
}


export {
    credentialToJSON,
    isPasskeySupported,
    parseCreationOptions,
    parseRequestOptions
};
