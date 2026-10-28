import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaCopy,
    FaEnvelope,
    FaStream
} from 'react-icons/fa';
import { InputElement, Spinner } from '@hct/soca-toolkit';

import { searchService } from '../../_services/search.service';
import { DefaultBranding } from '../DefaultBranding';
import { PERSONAL_EMAIL_DOMAINS } from './SignupForm';
import { CommercialContactModal } from './CommercialContactModal';
import { DataStreamLevels } from './DataStreamLevels';
import { SignupStageAside, SignupStageLayout } from './SignupStageLayout';
import { SignupVerifyEmail } from './SignupVerifyEmail';
import { MFASetup } from '../auth/mfa';
import { Debug } from "@/util/Utilities";


const INITIAL_FORM = {
    company: '',
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    notificationType: 'email',
    acceptTerms: false
};

const ONBOARDING_STEPS = [
    'Your details',
    'Verify email',
    'Secure & create stream',
    'Webhook ready'
];

const STREAMING_POC_CAPABILITIES = [
    'Webhook streaming onboarding',
    'Continuous DataHelix AI detection and analysis',
    'Email threat notifications',
    'PoC rate-limited throughput',
    'Upgrade to production streaming at any time'
];


const StreamingOnboarding = ({
    onBack = null,
    onLogin = null,
    onShowTerms = null,
    termsVersion = null,
    subscription = 'poc',
    expiry = '1y'
}) =>
{
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [verificationToken, setVerificationToken] = useState(null);
    const [accountCreated, setAccountCreated] = useState(false);
    const [streamOnboardingToken, setStreamOnboardingToken] = useState(null);
    const [mfaSetupToken, setMfaSetupToken] = useState(null);
    const [awaitingMfaSetup, setAwaitingMfaSetup] = useState(false);
    const [webhookDetails, setWebhookDetails] = useState(null);
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showCommercialContact, setShowCommercialContact] = useState(false);
    const [commercialInterest, setCommercialInterest] = useState(
        'Data Streaming AI Analysis - commercial deployment'
    );
    const [showDataStreamLevels, setShowDataStreamLevels] = useState(false);


    const webhook = useMemo(() =>
    {
        if (Debug)
            console.log('webhook memo: ', webhookDetails);

        if (!webhookDetails)
            return null;

        const source =
            webhookDetails.webhook ||
            webhookDetails.webhookDetails ||
            {};

        let whobj = {
            url:
                source.url ||
                webhookDetails.webhookUrl ||
                webhookDetails.url ||
                '',
            method:
                source.method ||
                webhookDetails.method ||
                'POST',
            headers:
                source.headers ||
                webhookDetails.headers ||
                {},
            sourceId:
                source.sourceId ||
                webhookDetails.sourceId ||
                webhookDetails.onboardingId ||
                null,
            expiresAt:
                source.expiresAt ||
                webhookDetails.expiresAt ||
                null,
            limits:
                webhookDetails.limits ||
                source.limits ||
                null
        };
        if (webhookDetails.token)
            whobj.headers = {
                ...whobj.headers,
                Authorization: webhookDetails.token
            }
        return whobj;
    }, [webhookDetails]);


    function getEmailDomain(email)
    {
        const value = String(email || '').trim().toLowerCase();
        const at = value.lastIndexOf('@');

        return at > 0 ? value.substring(at + 1) : '';
    }


    function isValidEmail(email)
    {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
    }


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response.error || response.message || fallback;

        return null;
    }


    function updateField(name, value)
    {
        setForm(current => ({
            ...current,
            [name]: value
        }));

        setAlert(null);
    }


    function setMfaEnabled(enabled)
    {
        setForm(current => ({
            ...current,
            mfaEnabled: enabled,
            mfaMethod: enabled
                ? (current.mfaMethod || 'authenticator')
                : null
        }));

        setAlert(null);
    }


    function openCommercialContact(interest = 'Data Streaming AI Analysis - commercial deployment')
    {
        setCommercialInterest(interest);
        setShowCommercialContact(true);
    }


    function openDataStreamLevels()
    {
        setShowDataStreamLevels(true);
    }


    function closeDataStreamLevels()
    {
        setShowDataStreamLevels(false);
    }


    function validateDetails()
    {
        if (!form.company.trim())
            return 'Please enter your company name.';

        if (!form.name.trim())
            return 'Please enter your name.';

        // if (!form.username.trim())
        //     return 'Please enter a username.';

        // if (!/^[A-Za-z0-9._-]{3,64}$/.test(form.username.trim()))
        //     return 'Username must be 3-64 characters using letters, numbers, dot, underscore or hyphen.';

        if (!isValidEmail(form.email))
            return 'Please enter a valid work email address.';

        //PDS TEST
        if (!form.email.toLowerCase().includes('sturge'))
        {
            if (PERSONAL_EMAIL_DOMAINS.has(getEmailDomain(form.email)))
                return 'Please use your work email address.';
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


    async function sendVerificationCode(event)
    {
        event.preventDefault();

        if (busy)
            return;

        const validationError = validateDetails();

        if (validationError)
        {
            setAlert(validationError);
            return;
        }

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.requestThreatLabSignupCode({
                email: form.email.trim().toLowerCase(),
                plan: 'free',
                termsVersion
            });

            const responseError = getResponseError(
                response,
                'Unable to send the verification code.'
            );

            if (responseError)
                throw new Error(responseError);

            setStep(2);
        }
        catch (err)
        {
            console.error('ThreatLab streaming verification request error', err);
            setAlert(err?.message || 'Unable to send the verification code.');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function createStreamingAccount(token)
    {
        setStep(3);
        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.createThreatLabAccount({
                plan: 'free',
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                mfaEnabled: form.mfaEnabled === true,
                mfaMethod: form.mfaEnabled
                    ? (form.mfaMethod || 'authenticator')
                    : null,
                verificationToken: token,
                termsAccepted: true,
                termsVersion
            });

            const responseError = getResponseError(
                response,
                'Unable to create your ThreatLab account.'
            );

            if (responseError)
                throw new Error(responseError);

            const onboardingToken =
                response?.streamingOnboardingToken ||
                response?.onboardingToken ||
                null;

            setAccountCreated(true);
            setStreamOnboardingToken(onboardingToken);

            if (form.mfaEnabled)
            {
                setMfaSetupToken(
                    response?.mfaSetupToken ||
                    response?.setupToken ||
                    null
                );
                setAwaitingMfaSetup(true);
                return;
            }

            await provisionStream(onboardingToken, token);
        }
        catch (err)
        {
            if (Debug)
                console.error('ThreatLab streaming account creation error', err);
            setAlert(err?.message || 'Unable to create your ThreatLab account.');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function provisionStream(onboardingToken = null, accountVerificationToken = null)
    {
        setStep(3);
        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.startThreatLabStreamingOnboarding({
                company: form.company.trim(),
                name: form.name.trim(),
                username: form.email.trim().toLowerCase(),
                email: form.email.trim().toLowerCase(),
                verificationToken: onboardingToken
                    ? null
                    : accountVerificationToken,
                onboardingToken,
                notificationType: form.notificationType,
                subscription: subscription,
                termsVersion,
                expiry
            });

            const responseError = getResponseError(
                response,
                'Unable to create the streaming PoC.'
            );

            if (responseError)
                throw new Error(responseError);

            const returnedWebhook =
                response?.webhook ||
                response?.webhookDetails ||
                response;

            const returnedUrl =
                returnedWebhook?.url ||
                response?.webhookUrl ||
                response?.url;

            if (!returnedUrl)
                throw new Error('An error occurred during Streaming setup [E-10E0].');

            setWebhookDetails(response);
            setStep(4);
        }
        catch (err)
        {
            console.error('ThreatLab streaming onboarding error', err);
            setAlert(err?.message || 'Unable to create the streaming PoC.');
        }
        finally
        {
            setBusy(false);
        }
    }


    async function completeMfaSetup()
    {
        setAwaitingMfaSetup(false);
        setMfaSetupToken(null);

        await provisionStream(
            streamOnboardingToken,
            verificationToken
        );
    }


    async function retryProvisioning()
    {
        if (Debug)
            console.log('retryProvisioning ENTRY busy?', busy);
        if (busy)
            return;

        if (Debug)
            console.log('retryProvisioning trying account create ', accountCreated);
        if (!accountCreated)
        {
            if (Debug)
                console.log('retryProvisioning verificationToken? ', verificationToken);
            if (!verificationToken)
                return;

            if (Debug)
                console.log('retryProvisioning creating account');
            await createStreamingAccount(verificationToken);
            return;
        }

        if (Debug)
            console.log('Provisioning stream...');
        await provisionStream(
            streamOnboardingToken,
            verificationToken
        );
    }


    async function copyValue(value)
    {
        if (!value)
            return;

        await navigator.clipboard?.writeText(value);
    }


    function renderStepper()
    {
        return (
            <div className="streaming-onboarding-steps" aria-label="Streaming PoC setup progress">
                {ONBOARDING_STEPS.map((label, index) =>
                {
                    const number = index + 1;
                    const complete = number < step;
                    const active = number === step;

                    return (
                        <div
                            key={label}
                            className={`streaming-onboarding-step ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}
                        >
                            <div className="streaming-onboarding-step-number">
                                {complete
                                    ? <FaCheck aria-hidden="true" />
                                    : number
                                }
                            </div>
                            <span>{label}</span>
                        </div>
                    );
                })}
            </div>
        );
    }


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
                            onChange={event =>
                                setMfaEnabled(event.target.checked)
                            }
                        />
                        <span aria-hidden="true" />
                    </label>
                </div>

                {/* PDS TEST Enable when Passkey et al are added */}
                {/* <div className={`signup-mfa-options ${form.mfaEnabled ? '' : 'disabled'}`}>
                    Authenticator / Passkey selection is intentionally hidden for now.
                </div> */}
            </div>
        );
    }


    function renderDetails()
    {
        const aside = (
            <SignupStageAside
                kicker="Free Streaming PoC"
                title="Real-time Data Streaming AI Analysis"
                price="Free"
                priceNote="limited proof-of-concept"
                description="Connect a Webhook stream and see DataHelix analyse live security events before moving to production capacity."
                capabilities={STREAMING_POC_CAPABILITIES}
            />
        );

        return (
            <SignupStageLayout
                className="streaming-signup-stage"
                onBack={onBack}
                backLabel="Plans"
                aside={aside}
            >
                <div className="signup-stage-heading">
                    <h2>Create your ThreatLab account</h2>
                    <p>
                        Create an account for your Data Streaming PoC. ThreatLab will analyse incoming security
                        events continuously and notify you by email when a threat is detected. When you
                        need more throughput, you can{' '}
                        <button
                            type="button"
                            className="streaming-onboarding-inline-link"
                            onClick={() => openCommercialContact(
                                'Data Streaming AI Analysis - upgrade from Streaming PoC'
                            )}
                        >
                            upgrade
                        </button>{' '}
                        at any time.{' '}
                        <button
                            type="button"
                            className="streaming-onboarding-inline-link"
                            onClick={openDataStreamLevels}
                        >
                            View levels
                        </button>.
                    </p>
                </div>

                <form className="signup-form" onSubmit={sendVerificationCode}>
                    <InputElement
                        autoFocus
                        wrapperClass="signup-input-field"
                        label="&nbsp;Company"
                        id="streaming-company"
                        name="company"
                        autoComplete="organization"
                        value={form.company}
                        onChange={event => updateField('company', event.target.value)}
                    />

                    <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Name"
                        id="streaming-name"
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={event => updateField('name', event.target.value)}
                    />

                    {/* //PDS TEST - we don't need this - the email is the username */}
                    {/* <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Username"
                        id="streaming-username"
                        name="username"
                        autoComplete="username"
                        value={form.username}
                        onChange={event => updateField('username', event.target.value)}
                    /> */}

                    <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Email"
                        id="streaming-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        value={form.email}
                        onChange={event => updateField('email', event.target.value)}
                    />

                    <InputElement
                        wrapperClass="signup-input-field signup-password-field"
                        label="&nbsp;Password"
                        id="streaming-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        revealOnHold
                        value={form.password}
                        onChange={event => updateField('password', event.target.value)}
                    />

                    <InputElement
                        wrapperClass="signup-input-field"
                        label="&nbsp;Confirm Password"
                        id="streaming-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        revealOnHold
                        value={form.confirmPassword}
                        onChange={event => updateField('confirmPassword', event.target.value)}
                    />

                    {renderSecurityOptions()}

                    <div className="signup-security-block streaming-signup-notification">
                        <div className="signup-security-heading">
                            <div>
                                <h3>Threat notifications</h3>
                                <p>Email notification is enabled for the PoC.</p>
                            </div>
                            <FaEnvelope aria-hidden="true" />
                        </div>
                    </div>

                    <div className="signup-terms-check">
                        <input
                            className="checkbox"
                            type="checkbox"
                            checked={form.acceptTerms}
                            onChange={event => updateField('acceptTerms', event.target.checked)}
                            id="streaming-accept-terms"
                        />

                        <label
                            className="checkbox-label"
                            htmlFor="streaming-accept-terms"
                        >
                            I agree to the{' '}
                            {onShowTerms
                                ?
                                <button
                                    type="button"
                                    className="signup-inline-link"
                                    onClick={onShowTerms}
                                >
                                    Terms and Conditions
                                </button>
                                :
                                'Terms and Conditions'
                            }.
                        </label>
                    </div>

                    <div className="signup-alert" aria-live="polite">
                        {alert || ''}
                    </div>

                    <Button
                        type="submit"
                        className="signup-primary-button"
                        disabled={busy}
                    >
                        {busy
                            ?
                            <span>
                                Sending verification code{' '}
                                <Spinner size={12} color="#EEE" />
                            </span>
                            :
                            'Continue'
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
    }


    function renderVerify()
    {
        return (
            <SignupVerifyEmail
                email={form.email}
                plan={{ id: 'free' }}
                termsVersion={termsVersion}
                showBusy={busy}
                alert={alert}
                onBack={() =>
                {
                    setStep(1);
                    setAlert(null);
                }}
                onClearAlert={() => setAlert(null)}
                onVerified={createStreamingAccount}
            />
        );
    }


    function renderProvisioning()
    {
        if (awaitingMfaSetup)
        {
            return (
                <div className="streaming-onboarding-provisioning">
                    <MFASetup
                        email={form.email.trim().toLowerCase()}
                        password={form.password}
                        setupToken={mfaSetupToken}
                        initialMethod={form.mfaMethod || 'authenticator'}
                        onCancel={onLogin || onBack}
                        onComplete={completeMfaSetup}
                    />
                </div>
            );
        }

        return (
            <div className="streaming-onboarding-provisioning">
                <div className="streaming-onboarding-provision-icon">
                    <FaStream aria-hidden="true" />
                </div>

                <div className="streaming-onboarding-heading centered">
                    <div className="streaming-onboarding-kicker">Creating your stream</div>
                    <h3>Provisioning...</h3>
                    <p>
                        Your stream is being prepared...
                    </p>
                </div>

                {busy &&
                    <div className="streaming-onboarding-busy">
                        <Spinner size={16} color="#EEE" />
                        {/* <span>Provisioning...</span> */}
                    </div>
                }

                {!busy && alert &&
                    <>
                        <div className="streaming-onboarding-alert">{alert}</div>
                        <Button
                            type="button"
                            className="streaming-onboarding-primary"
                            onClick={retryProvisioning}
                        >
                            Try again
                        </Button>
                    </>
                }
            </div>
        );
    }


    function renderWebhook()
    {
        if (Debug)
            console.log('renderWebhook ENTRY ', webhook);

        let headers = webhook?.headers || {};
        if (webhook.token)
            headers.Authorization = webhook.token;
        const headerEntries = Object.entries(headers);
        const samplePayload = JSON.stringify({
            '@timestamp': new Date().toISOString(),
            source: 'your-source',
            type: 'security_event',
            event: {
                message: 'Example event payload'
            }
        }, null, 2);

        const curlHeaders = headerEntries
            .map(([name, value]) => `-H '${name}: ${value}' \\\n`)
            .join('');

        const curlExample =
            `curl -X ${webhook?.method || 'POST'} '${webhook?.url || ''}' \\\n` +
            `${curlHeaders}` +
            // `-H 'Content-Type: application/json' \\\n` +
            `-d '${samplePayload.replace(/'/g, "'\\''")}'`;

        return (
            <div className="streaming-onboarding-webhook">
                <div className="streaming-onboarding-heading">
                    <div className="streaming-onboarding-kicker">{!subscription || subscription === 'poc' ? 'PoC ready' : 'Subscription ready'}</div>
                    <h1>Your Webhook is ready</h1>
                    <p>
                        Send your data to this webhook endpoint. The data can be in any unencrpyted format.<br/>ThreatLab will analyze your data as it is received.
                    </p>
                    <div className='important-text'>
                        <strong>IMPORTANT</strong>
                        <div>Keep the information below safe! It is confidential to your data stream. For security, we won't show some or all of this information again.</div>
                    </div>
                </div>

                <div className="streaming-onboarding-webhook-details">
                    <div className="streaming-onboarding-detail-row wide">
                        <span>Method</span>
                        <strong>{webhook?.method || 'POST'}</strong>
                    </div>

                    <div className="streaming-onboarding-detail-row wide">
                        <span>Webhook URL</span>
                        <div className="streaming-onboarding-copy-value">
                            <code>{webhook?.url}</code>
                            <button
                                type="button"
                                onClick={() => copyValue(webhook?.url)}
                                title="Copy Webhook URL"
                            >
                                <FaCopy aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {webhook?.sourceId &&
                        <div className="streaming-onboarding-detail-row">
                            <span>Source ID</span>
                            <strong>{webhook.sourceId}</strong>
                        </div>
                    }

                    {webhook?.expiresAt &&
                        <div className="streaming-onboarding-detail-row">
                            <span>PoC expires</span>
                            <strong>{webhook.expiresAt}</strong>
                        </div>
                    }
                </div>

                {headerEntries.length > 0 &&
                    <div className="streaming-onboarding-code-section">
                        <h3>Request headers</h3>
                        <p>Include the returned headers with every request.</p>

                        <div className="streaming-onboarding-header-list">
                            {headerEntries.map(([name, value]) => (
                                <div key={name}>
                                    <span>{name}</span>
                                    <code>{String(value)}</code>
                                    <button
                                        type="button"
                                        onClick={() => copyValue(String(value))}
                                        title={`Copy ${name}`}
                                    >
                                        <FaCopy aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                }

                {webhook?.limits &&
                    <div className="streaming-onboarding-limits">
                        <strong>PoC limits</strong>
                        <code>{JSON.stringify(webhook.limits)}</code>
                    </div>
                }

                <div className="streaming-onboarding-code-section">
                    <div className="streaming-onboarding-code-heading">
                        <div>
                            <h3>Example request</h3>
                            <p>Send data to your webhook</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => copyValue(curlExample)}
                        >
                            <FaCopy aria-hidden="true" />
                            Copy
                        </button>
                    </div>

                    <pre>{curlExample}</pre>
                </div>

                <div className="streaming-onboarding-instructions">
                    <h3>What happens next</h3>
                    <ol>
                        <li>Save the above details to a safe location. For security, some or all of this information will not be shows again.</li>
                        <br/>
                        <li>This is your first auto-generated webhook to ingest your data to.</li>
                        <li>You can configure this webhook and all your other log sources in the portal by clicking on the Management Portal link in your profile.</li>
                        <li>You can upgrade your subscription at any time by clicking on the Upgrade link in your profile.</li>
                        <br/>
                        <li>POST event data to the Webhook URL. This can be in any unencrypted format.</li>
                        <li>ThreatLab analyses data as it is received usng our advanced DataHelix pipeline analysis engine.</li>
                        {
                            subscription === 'poc'
                            ? 
                            <>
                                <li>When a threat is detected, a notification is sent to your account's email address.</li>
                                <li>For production enviroments and custom actions, please upgrade your subscription.</li>
                                <li>PoC event streaming bandwidth is limited.</li>
                                <li>For production-level throughput rates, please upgrade your subscription.</li>
                            </>
                            :
                            <>
                                <li>When a threat is detected, a notification is sent to your account email or other integration method for production environments.</li>
                            </>
                        }
                        <br/>
                        <li>When you're ready, log back in to your account by pressing Sign in to ThreatLab below.</li>
                        <br/>
                    </ol>
                    <Button
                        type="button"
                        className="signup-primary-button from-webhook-page"
                        onClick={onLogin}
                    >
                        Sign in to ThreatLab
                    </Button>
    
                </div>
            </div>
        );
    }


    if (!showDataStreamLevels && step === 1)
    {
        return (
            <>
                {renderDetails()}

                <CommercialContactModal
                    open={showCommercialContact}
                    interest={commercialInterest}
                    onClose={() => setShowCommercialContact(false)}
                />
            </>
        );
    }


    if (!showDataStreamLevels && step === 2)
    {
        return (
            <>
                {renderVerify()}

                <CommercialContactModal
                    open={showCommercialContact}
                    interest={commercialInterest}
                    onClose={() => setShowCommercialContact(false)}
                />
            </>
        );
    }


    return (
        <main className="streaming-onboarding-page">
            <header className="streaming-onboarding-header">
                <DefaultBranding orientation="horizontal" />

                <button
                    type="button"
                    className="streaming-onboarding-back"
                    onClick={onBack}
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back to plans
                </button>
            </header>

            <section className="streaming-onboarding-shell">
                {showDataStreamLevels
                    ?
                    <DataStreamLevels
                        backLabel="Back to data stream setup"
                        onBack={closeDataStreamLevels}
                        onStartPoc={closeDataStreamLevels}
                        onCommercialContact={level => openCommercialContact(
                            `Data Streaming AI Analysis - ${level}`
                        )}
                    />
                    :
                    <>
                        {renderStepper()}

                        <div className="streaming-onboarding-content">
                            {step === 3 && renderProvisioning()}
                            {step === 4 && renderWebhook()}
                        </div>

                        <div className="streaming-onboarding-commercial">
                            <div>
                                <strong>Need production throughput or a full commercial deployment?</strong>
                                <span>
                                    We can scope source count, throughput, retention, automation and deployment requirements.
                                </span>
                            </div>

                            <Button
                                type="button"
                                className="streaming-onboarding-secondary"
                                onClick={() => openCommercialContact()}
                            >
                                Commercial / PO setup
                                <FaArrowRight aria-hidden="true" />
                            </Button>
                        </div>
                    </>
                }
            </section>

            <CommercialContactModal
                open={showCommercialContact}
                interest={commercialInterest}
                onClose={() => setShowCommercialContact(false)}
            />
        </main>
    );
};


export { StreamingOnboarding };
