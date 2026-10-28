export function maskEmail(email)
{
    if (!email || typeof email !== 'string')
        return '';

    const atIndex = email.indexOf('@');

    if (atIndex <= 0)
        return email;

    const localPart = email.substring(0, atIndex);
    const domain = email.substring(atIndex + 1);

    if (localPart.length === 1)
        return `${localPart}****@${domain}`;

    return `${localPart.charAt(0)}****${localPart.charAt(localPart.length - 1)}@${domain}`;
}

// export function maskEmail(email)
// {
//     const value = String(email || '').trim().toLowerCase();
//     const at = value.lastIndexOf('@');

//     if (at <= 0 || at === value.length - 1)
//         return '****';

//     const local = value.substring(0, at);
//     const domain = value.substring(at + 1);
//     const domainParts = domain.split('.').filter(Boolean);

//     const maskedLocal = `${local.charAt(0) || '*'}****`;
//     const maskedDomain = domainParts.map((part, index) =>
//     {
//         if (index === domainParts.length - 1 && domainParts.length > 1)
//             return part;

//         return `${part.charAt(0) || '*'}***`;
//     }).join('.');

//     return `${maskedLocal}@${maskedDomain || '****'}`;
// }
