import React, { useState } from 'react';
import { searchService } from '../../_services/search.service';

import { Button } from 'react-bootstrap';
import { FaKey, FaShieldAlt } from 'react-icons/fa';
import { InputElement, Spinner } from '@hct/soca-toolkit';

import { SignupStageAside, SignupStageLayout } from './SignupStageLayout';


const PERSONAL_EMAIL_DOMAINS = new Set([
    'aol.com',
    'fastmail.com',
    'gmail.com',
    'googlemail.com',
    'gmx.com',
    'gmx.co.uk',
    'hotmail.com',
    'hotmail.co.uk',
    'icloud.com',
    'live.com',
    'mail.com',
    'mac.com',
    'me.com',
    'msn.com',
    'outlook.com',
    'proton.me',
    'protonmail.com',
    'yahoo.com',
    'yahoo.co.uk',
    'zoho.com'
]);

const EMPTY_SIGNUP_FORM = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    acceptTerms: false
};

const SignupForm = ({
    plan,
    initialData,
    privacyUrl = null,
    termsUrl = null,
    termsVersion,
    onBack,
    onDataChange,
    onContinue,
    onLogin = null,
    onShowTerms
}) =>
{
    const [form, setForm] = useState(() => ({
        ...EMPTY_SIGNUP_FORM,
        ...(initialData || {})
    }));

    const safePlan = {
        id: null,
        name: 'Plan unavailable',
        selectedPrice: null,
        currencySymbol: '',
        billingPeriod: null,
        currency: null,
        strapline: '',
        capabilities: [],
        ...(plan || {})
    };
    const [showBusy, setShowBusy] = useState(false);
    const [alert, setAlert] = useState(null);


    function getEmailDomain(email)
    {
        const value = email.trim().toLowerCase();
        const at = value.lastIndexOf('@');

        return at > 0 ? value.substring(at + 1) : '';
    }


    function isValidEmail(email)
    {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }


    function validate()
    {
        if (!safePlan.id)
            return 'Please select a plan to continue.';
        if (!form.name.trim())
            return 'Please enter your name.';

        if (!isValidEmail(form.email))
            return 'Please enter a valid work email address.';

        //PDS TEST
        if (!form.email.toLowerCase().includes('sturge'))
        {
            if (PERSONAL_EMAIL_DOMAINS.has(getEmailDomain(form.email)))
                return 'Please use your work email address. Personal email services are not accepted for security reasons.';
        }

        if (form.password.length < 9)
            return 'Please use a password of at least 9 characters.';

        if (form.password.length > 128)
            return 'Password must be 128 characters or fewer.';

        if (form.password !== form.confirmPassword)
            return 'Passwords do not match.';

        if (!form.acceptTerms)
            return 'Please accept the Terms and Conditions to continue.';

        return null;
    }


    function getResponseError(response)
    {
        if (!response)
            return 'Unable to send the verification code.';

        if (response?.ok === false || response?.status >= 400 || response?.error)
        {
            return response.error ||
                response.message ||
                'Unable to send the verification code.';
        }

        return null;
    }


    async function submit(evt)
    {
        evt.preventDefault();

        if (showBusy)
            return;

        const validationError = validate();

        if (validationError)
        {
            setAlert(validationError);
            return;
        }

        setShowBusy(true);
        setAlert(null);

        try
        {
            const data = {
                ...form,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase()
            };

            /* Gatekeeper validates the work domain again server-side. */
            const response = await searchService.requestThreatLabSignupCode({
                email: data.email,
                plan: safePlan.id,
                billingPeriod: safePlan.billingPeriod,
                currency: safePlan.currency,
                termsVersion
            });

            const responseError = getResponseError(response);

            if (responseError)
                throw new Error(responseError);

            onContinue(data);
        }
        catch (err)
        {
            console.error('ThreatLab verification request error', err);
            setAlert(err?.message || 'Unable to send the verification code.');
        }
        finally
        {
            setShowBusy(false);
        }
    }


    function updateField(name, value)
    {
        setForm(current =>
        {
            const updated = {
                ...current,
                [name]: value
            };

            if (onDataChange)
                onDataChange(updated);

            return updated;
        });

        setAlert(null);
    }


    function setMfaEnabled(enabled)
    {
        setForm(current =>
        {
            const updated = {
                ...current,
                mfaEnabled: enabled,
                mfaMethod: enabled ? (current.mfaMethod || 'authenticator') : null
            };

            if (onDataChange)
                onDataChange(updated);

            return updated;
        });

        setAlert(null);
    }

    function selectMfaMethod(method)
    {
        if (
            !form.mfaEnabled ||
            !['authenticator', 'passkey'].includes(method)
        )
            return;

        updateField('mfaMethod', method);
    }

    // function selectMfaMethod(method)
    // {
    //     if (!form.mfaEnabled || method !== 'authenticator')
    //         return;

    //     updateField('mfaMethod', method);
    // }


    function renderSecurityOptions()
    {
        return (
            <div className="signup-security-block">
                <div className="signup-security-heading">
                    <div>
                        <h3>Multi-factor authentication</h3>
                        <p>Recommended for ThreatLab accounts.</p>
                    </div>

                    <label className="signup-switch">
                        <input
                            type="checkbox"
                            role="switch"
                            checked={form.mfaEnabled}
                            onChange={(evt) =>
                                setMfaEnabled(evt.target.checked)
                            }
                        />
                        <span aria-hidden="true" />
                    </label>
                </div>

{/* PDS TEST Enable when Passkey et al are added */}
                {/* <div className={`signup-mfa-options ${form.mfaEnabled ? '' : 'disabled'}`}>
                    <button
                        type="button"
                        className={`signup-mfa-option ${form.mfaMethod === 'authenticator' ? 'selected' : ''}`}
                        onClick={() => selectMfaMethod('authenticator')}
                        disabled={!form.mfaEnabled}
                    >
                        <FaShieldAlt aria-hidden="true" />
                        <span>
                            <strong>Authenticator app</strong>
                            <small>Microsoft or Google Authenticator</small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`signup-mfa-option ${form.mfaMethod === 'passkey' ? 'selected' : ''}`}
                        onClick={() => selectMfaMethod('passkey')}
                        disabled={!form.mfaEnabled}
                    >
                        <FaKey aria-hidden="true" />
                        <span>
                            <strong>Passkey</strong>
                            <small>Biometrics or device security</small>
                        </span>
                    </button>
                </div> */}
            </div>
        );
    }


    const aside = (
        <SignupStageAside
            kicker="Selected plan"
            title={safePlan.name}
            price={
                safePlan.selectedPrice != null
                    ? `${safePlan.currencySymbol}${safePlan.selectedPrice}`
                    : 'Customize'
            }
            priceNote={
                safePlan.selectedPrice != null
                    ? `per user / month${safePlan.billingPeriod === 'annual' ? ', billed annually' : ''}`
                    : null
            }
            description={safePlan.strapline}
            capabilities={safePlan.capabilities}
        />
    );


    return (
        <SignupStageLayout
            onBack={onBack}
            backLabel="Plans"
            aside={aside}
        >
            <div className="signup-stage-heading">
                {/* <div className="signup-eyebrow">{plan.name}</div> */}
                <h2>Create your ThreatLab account</h2>
                <p>Use your work email. Verification takes one quick step.</p>
            </div>

            <form className="signup-form" onSubmit={submit}>
                    <InputElement
                        autoFocus
                        wrapperClass="signup-input-field"
                        label="&nbsp;Name"
                        name="name"
                        autoComplete="name"
                        id="signup-name"
                        value={form.name}
                        onChange={(evt) => updateField('name', evt.target.value)}
                    />

                    <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Email"
                        id="signup-email"
                        name="username"
                        type="email"
                        autoComplete="username"
                        value={form.email}
                        onChange={(evt) => updateField('email', evt.target.value)}
                    />

                    <InputElement
                        wrapperClass="signup-input-field signup-password-field"
                        label="&nbsp;Password"
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        revealOnHold
                        value={form.password}
                        onChange={(evt) => updateField('password', evt.target.value)}
                    />

                    {/* <div className="signup-field-help">
                        Use 15 or more characters. Password managers are supported.
                    </div> */}

                    <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Confirm Password"
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        revealOnHold
                        value={form.confirmPassword}
                        onChange={(evt) =>
                            updateField('confirmPassword', evt.target.value)
                        }
                    />

                    {renderSecurityOptions()}

                    <div className="signup-terms-check">
                        <input
                            className="checkbox"
                            type="checkbox"
                            checked={form.acceptTerms}
                            onChange={(evt) =>
                                updateField('acceptTerms', evt.target.checked)
                            }
                            id="signup-accept-terms"
                        />

                        <label
                            className="checkbox-label"
                            htmlFor="signup-accept-terms"
                        >
                            I agree to the{' '}
                            {termsUrl
                                ?
                                <a
                                    className="signup-inline-link"
                                    href={termsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Terms and Conditions
                                </a>
                                :
                                <button
                                    type="button"
                                    className="signup-inline-link"
                                    onClick={onShowTerms}
                                >
                                    Terms and Conditions
                                </button>
                            }

                            {privacyUrl &&
                                <>
                                    {' '}and{' '}
                                    <a
                                        href={privacyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Privacy Policy
                                    </a>
                                </>
                            }
                        </label>
                    </div>

                    <div className="signup-alert" aria-live="polite">
                        {alert || ''}
                    </div>

                    <Button
                        type="submit"
                        className="signup-primary-button"
                        disabled={showBusy}
                    >
                        {showBusy
                            ?
                            <span>
                                Sending verification code{' '}
                                <Spinner size={12} color="#EEE" />
                            </span>
                            :
                            alert ? 'Try again' : 'Continue'
                        }
                    </Button>

                    {onLogin &&
                        <div className="signup-login-switch">
                            Already have an account?{' '}
                            <button type="button" onClick={onLogin}>
                                Sign in
                            </button>
                        </div>
                    }
            </form>
        </SignupStageLayout>
    );
};

export { PERSONAL_EMAIL_DOMAINS, SignupForm };
