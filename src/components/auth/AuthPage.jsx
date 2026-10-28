import React, { useMemo, useState } from 'react';
import { searchService } from '../../_services/search.service';

import { Button } from 'react-bootstrap';
import { MDBContainer } from 'mdb-react-ui-kit';

import {  Spinner,  InputElement} from '@hct/soca-toolkit';

import { maskEmail } from '../../util/email';
import { DefaultBranding } from '../DefaultBranding';
import { MFAChallenge } from './mfa';



const AuthPage = ({
    initialMode = 'login',
    onAuthenticated = null,
    onCancel = null,
    onSignup = null
}) =>
{
    const [mode, setMode] = useState(initialMode);
    const [showBusy, setShowBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const [imgFailed, setImgFailed] = useState(false);
    const [mfaLogin, setMfaLogin] = useState(null);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);

    const [form, setForm] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        acceptTerms: false
    });


    const branding = useMemo(() =>
    {
        const b = window.BRANDING || {};

        return {
            logo:
                window.BRANDING_INLINE_IMAGE ||
                b.INLINE_IMAGE ||
                '/branding.png',

            logoWidth:
                window.BRANDING_INLINE_IMAGE_WIDTH ||
                b.INLINE_IMAGE_WIDTH ||
                'auto',

            logoHeight:
                window.BRANDING_INLINE_IMAGE_HEIGHT ||
                b.INLINE_IMAGE_HEIGHT ||
                '30px',

            heroImage:
                window.BRANDING_AUTH_IMAGE ||
                b.AUTH_IMAGE ||
                '/images/auth-background.jpg',

            heroTitle:
                window.BRANDING_AUTH_TITLE ||
                b.AUTH_TITLE ||
                'Autonomous Cyber Security at Scale',

            heroText:
                window.BRANDING_AUTH_TEXT ||
                b.AUTH_TEXT ||
                'From events stream to automated response: Real-time AI powered threat analysis and automated response.',

            termsUrl:
                window.BRANDING_TERMS_URL ||
                b.TERMS_URL ||
                null,

            privacyUrl:
                window.BRANDING_PRIVACY_URL ||
                b.PRIVACY_URL ||
                null,

            XheroImagePosition:
                window.BRANDING_AUTH_IMAGE_POSITION ||
                b.AUTH_IMAGE_POSITION ||
                'center 34%',

            XheroImageSize:
                window.BRANDING_AUTH_IMAGE_SIZE ||
                b.AUTH_IMAGE_SIZE ||
                '82% auto',

            heroContentBottom:
                window.BRANDING_AUTH_CONTENT_BOTTOM ||
                b.AUTH_CONTENT_BOTTOM ||
                '110px',
        };
    }, []);


    const isLogin = mode === 'login';


    function updateField(name, value)
    {
        setForm(current => ({
            ...current,
            [name]: value
        }));

        setAlert(null);
    }


    function switchMode(newMode)
    {
        setMode(newMode);
        setAlert(null);
    }


    function validate()
    {
        if (isLogin)
        {
            if (!form.username.trim())
                return 'Please enter your work email address.';

            if (!form.password)
                return 'Please enter your password.';
        }
        else
        {
            if (!form.name.trim())
                return 'Please enter your name.';

            if (!form.email.trim())
                return 'Please enter your email address.';

            if (!form.password)
                return 'Please enter a password.';

            if (form.password !== form.confirmPassword)
                return 'Passwords do not match.';

            if (!form.acceptTerms)
                return 'Please accept the Terms to continue.';
        }

        return null;
    }


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response.error || response.message || fallback;

        return null;
    }


    function getMFAMethods(response)
    {
        if (Array.isArray(response?.mfaMethods))
        {
            const methods = response.mfaMethods.filter(method =>
                method === 'authenticator' || method === 'passkey'
            );

            if (methods.length)
                return methods;
        }

        if (response?.mfaMechanism === 'passkey')
            return ['passkey'];

        return ['authenticator'];
    }


    function cancelMFA()
    {
        setMfaLogin(null);
        setAlert(null);

        setForm(current => ({
            ...current,
            password: ''
        }));
    }


    function openForgotPassword()
    {
        setForgotEmail(form.username.trim().toLowerCase());
        setForgotSent(false);
        setForgotMode(true);
        setAlert(null);
    }


    function closeForgotPassword()
    {
        setForgotMode(false);
        setForgotSent(false);
        setAlert(null);
    }


    async function submitForgotPassword(event)
    {
        event.preventDefault();

        const email = forgotEmail.trim().toLowerCase();

        if (!email)
        {
            setAlert('Please enter your email address.');
            return;
        }

        if (showBusy)
            return;

        setShowBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.requestThreatLabPasswordReset({
                email
            });

            const responseError = getResponseError(
                response,
                'Unable to request a password reset.'
            );

            if (responseError)
                throw new Error(responseError);

            setForgotSent(true);
        }
        catch (err)
        {
            setAlert(err?.message || 'Unable to request a password reset.');
        }
        finally
        {
            setShowBusy(false);
        }
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
            let response;

            if (isLogin)
            {
                response = await searchService.loginUser({
                    username: form.username.trim().toLowerCase(),
                    password: form.password
                });

                if (form.rememberMe)
                {
                    localStorage.setItem(
                        'socaUser',
                        form.username.trim().toLowerCase()
                    );

                    localStorage.setItem(
                        'socaRemember',
                        'true'
                    );
                }
                else
                {
                    localStorage.removeItem('socaUser');
                    localStorage.removeItem('socaRemember');
                }
            }
            else
            {
                response = await searchService.createUser({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password
                });
            }

            const responseError = getResponseError(
                response,
                isLogin
                    ? 'Unable to sign in. Please check the details.'
                    : 'Unable to create your account.'
            );

            if (responseError)
                throw new Error(responseError);

            if (
                isLogin &&
                (
                    response?.mfaRequired === true ||
                    response?.sessionMFA === 'false' ||
                    (
                        response?.mfaMechanism &&
                        response.mfaMechanism !== 'none'
                    )
                )
            )
            {
                setMfaLogin({
                    response,
                    email: form.username.trim().toLowerCase(),
                    password: form.password
                });

                return;
            }

            onAuthenticated?.(response);
        }
        catch (err)
        {
            console.error('AuthPage authentication error', err);

            setAlert(
                err?.message ||
                (
                    isLogin
                        ? 'Unable to sign in. Please check your details.'
                        : 'Unable to create your account.'
                )
            );
        }
        finally
        {
            setShowBusy(false);
        }
    }


    function renderMFAChallenge()
    {
        return (
            <div className="standalone-auth-page">
                <section className="standalone-auth-left">
                    <div className="standalone-auth-left-inner">
                        <MDBContainer
                            id="logincontainer"
                            className="login-container"
                        >
                            {renderBranding()}

                            <MFAChallenge
                                email={mfaLogin.email}
                                password={mfaLogin.password}
                                tenantId={mfaLogin.response?.tenantId || null}
                                mfaToken={mfaLogin.response?.mfaToken}
                                methods={getMFAMethods(mfaLogin.response)}
                                onCancel={cancelMFA}
                                onAuthenticated={(mfaResponse) =>
                                {
                                    const completedResponse =
                                        mfaResponse?.session ||
                                        (
                                            mfaResponse?.token
                                                ? mfaResponse
                                                : {
                                                    ...mfaLogin.response,
                                                    sessionMFA: 'true'
                                                }
                                        );

                                    setMfaLogin(null);
                                    onAuthenticated?.(completedResponse);
                                }}
                            />
                        </MDBContainer>
                    </div>
                </section>
            </div>
        );
    }


    function renderBranding()
    {
        return (
            <div
                className="w-100 text-center"
                style={{ margin: '0 auto 40px auto' }}
            >
                {
                    imgFailed
                    ?
                    (
                        <DefaultBranding
                            orientation="horizontal"
                            className="large"
                        />
                    )
                    :
                    (
                        <center
                            className="branding-login"
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <img
                                src={branding.logo}
                                style={{
                                    width: branding.logoWidth,
                                    height: branding.logoHeight
                                }}
                                alt=""
                                onError={() => setImgFailed(true)}
                            />
                        </center>
                    )
                }
            </div>
        );
    }


    function renderLogin()
    {
        return (
            <>
                <InputElement
                    autoComplete="email"
                    autoFocus
                    wrapperClass="mb-4"
                    label="&nbsp;Email"
                    id="username"
                    value={form.username}
                    onChange={(evt) =>
                        updateField('username', evt.target.value)
                    }
                />

                <InputElement
                    wrapperClass="mb-4"
                    label="&nbsp;Password"
                    id="password"
                    type="password"
                    revealOnHold
                    value={form.password}
                    onChange={(evt) =>
                        updateField('password', evt.target.value)
                    }
                />

                {renderAlert()}

                <div className="d-flex justify-content-between mx-0 mb-4 pt-3">

                    <span>
                        <input
                            className="checkbox"
                            type="checkbox"
                            name="rememberMe"
                            checked={form.rememberMe}
                            onChange={(evt) =>
                                updateField(
                                    'rememberMe',
                                    evt.target.checked
                                )
                            }
                            id="rememberme"
                        />

                        <label
                            className="checkbox-label"
                            htmlFor="rememberme"
                        >
                            Remember me
                        </label>
                    </span>


                    <Button
                        type="button"
                        className="link"
                        style={{ textDecoration: 'underline' }}
                        onClick={openForgotPassword}
                    >
                        Forgot password?
                    </Button>

                </div>


                {renderSubmitButton()}


                <div className="auth-mode-switch text-center">
                    <span>Don't have an account? </span>

                    <Button
                        type="button"
                        className="link"
                        onClick={() => onSignup ? onSignup() : switchMode('signup')}
                    >
                        Sign Up
                    </Button>
                </div>
            </>
        );
    }


    function renderForgotPassword()
    {
        return (
            <div className="standalone-auth-page">
                <section className="standalone-auth-left">
                    <div className="standalone-auth-left-inner">
                        <MDBContainer
                            id="logincontainer"
                            className="login-container"
                        >
                            {renderBranding()}

                            <div className="standalone-auth-heading">
                                <h1>Reset your password</h1>
                                <p>
                                    {forgotSent
                                        ? `Check ${maskEmail(forgotEmail)} for the password reset link.`
                                        : 'Enter your account email and we will send you a password reset link.'
                                    }
                                </p>
                            </div>

                            {!forgotSent
                                ?
                                <form
                                    className="standalone-login-form"
                                    onSubmit={submitForgotPassword}
                                >
                                    <InputElement
                                        autoComplete="email"
                                        autoFocus
                                        wrapperClass="mb-4"
                                        label="&nbsp;Email"
                                        id="forgot-email"
                                        value={forgotEmail}
                                        onChange={(evt) =>
                                        {
                                            setForgotEmail(evt.target.value);
                                            setAlert(null);
                                        }}
                                    />

                                    {renderAlert()}

                                    <Button
                                        variant="primary"
                                        className="mb-4 btn btn-primary"
                                        style={{
                                            height: '2em',
                                            maxHeight: '2em',
                                            lineHeight: 'normal',
                                            width: '100%'
                                        }}
                                        type="submit"
                                        disabled={showBusy}
                                    >
                                        {showBusy
                                            ?
                                            <span>
                                                Sending...{' '}
                                                <Spinner
                                                    size={12}
                                                    color="#EEE"
                                                    style={{ margin: 'none' }}
                                                />
                                            </span>
                                            :
                                            'Send reset link'
                                        }
                                    </Button>
                                </form>
                                :
                                <div className="auth-reset-sent">
                                    <p>
                                        If an account exists for <strong>{maskEmail(forgotEmail)}</strong>,
                                        a password reset link has been sent.
                                    </p>
                                </div>
                            }

                            <div className="text-center auth-guest-link">
                                <Button
                                    type="button"
                                    className="link"
                                    onClick={closeForgotPassword}
                                >
                                    Back to sign in
                                </Button>
                            </div>
                        </MDBContainer>
                    </div>
                </section>
            </div>
        );
    }


    function renderSignup()
    {
        return (
            <>
                <InputElement
                    autoFocus
                    wrapperClass="mb-4"
                    label="&nbsp;Name"
                    id="name"
                    value={form.name}
                    onChange={(evt) =>
                        updateField('name', evt.target.value)
                    }
                />

                <InputElement
                    wrapperClass="mb-4"
                    label="&nbsp;Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(evt) =>
                        updateField('email', evt.target.value)
                    }
                />

                <InputElement
                    wrapperClass="mb-4"
                    label="&nbsp;Password"
                    id="password"
                    type="password"
                    revealOnHold
                    value={form.password}
                    onChange={(evt) =>
                        updateField('password', evt.target.value)
                    }
                />

                <InputElement
                    wrapperClass="mb-4"
                    label="&nbsp;Confirm Password"
                    id="confirmPassword"
                    type="password"
                    revealOnHold
                    value={form.confirmPassword}
                    onChange={(evt) =>
                        updateField(
                            'confirmPassword',
                            evt.target.value
                        )
                    }
                />

                {renderAlert()}


                {(branding.termsUrl || branding.privacyUrl) &&
                    <div className="mx-3 mb-4">

                        <input
                            className="checkbox"
                            type="checkbox"
                            checked={form.acceptTerms}
                            onChange={(evt) =>
                                updateField(
                                    'acceptTerms',
                                    evt.target.checked
                                )
                            }
                            id="acceptTerms"
                        />

                        <label
                            className="checkbox-label"
                            htmlFor="acceptTerms"
                        >
                            I agree to the{' '}

                            {branding.termsUrl &&
                                <a
                                    href={branding.termsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Terms
                                </a>
                            }

                            {branding.termsUrl && branding.privacyUrl &&
                                ' and '
                            }

                            {branding.privacyUrl &&
                                <a
                                    href={branding.privacyUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Privacy Policy
                                </a>
                            }
                        </label>

                    </div>
                }


                {renderSubmitButton()}


                <div className="auth-mode-switch text-center">
                    <span>Already have an account? </span>

                    <Button
                        type="button"
                        className="link"
                        onClick={() => switchMode('login')}
                    >
                        Sign In
                    </Button>
                </div>
            </>
        );
    }


    function renderAlert()
    {
        return (
            <div className="login-alert">
                {alert || ''}
            </div>
        );
    }


    function renderSubmitButton()
    {
        return (
            <Button
                variant="primary"
                className="mb-4 btn btn-primary"
                style={{
                    height: '2em',
                    maxHeight: '2em',
                    lineHeight: 'normal',
                    width: '100%'
                }}
                type="submit"
                disabled={showBusy}
            >
                {
                    showBusy
                    ?
                    (
                        <span>
                            {isLogin ? 'Signing In... ' : 'Creating Account... '}

                            <Spinner
                                size={12}
                                color="#EEE"
                                style={{ margin: 'none' }}
                            />
                        </span>
                    )
                    :
                    (
                        isLogin
                            ? 'Sign In'
                            : 'Create Account'
                    )
                }
            </Button>
        );
    }


    if (forgotMode)
        return renderForgotPassword();

    if (mfaLogin)
        return renderMFAChallenge();

    return (
        <div className="standalone-auth-page">

            <section className="standalone-auth-left">

                <div className="standalone-auth-left-inner">

                    <MDBContainer
                        id="logincontainer"
                        className="login-container"
                    >
                        {renderBranding()}

                        <div className="standalone-auth-heading">
                            <h1>
                                {isLogin
                                    ? 'Welcome back'
                                    : 'Create your account'
                                }
                            </h1>

                            <p>
                                {isLogin
                                    ? 'Sign in to continue'
                                    : 'Get started with your account'
                                }
                            </p>
                        </div>

                        <form className="standalone-login-form" onSubmit={submit}>
                            {
                                isLogin
                                    ? renderLogin()
                                    : renderSignup()
                            }

                            {onCancel &&
                                <div className="text-center auth-guest-link">
                                    <Button
                                        type="button"
                                        className="link"
                                        onClick={onCancel}
                                    >
                                        Continue as guest
                                    </Button>
                                </div>
                            }
                        </form>

                    </MDBContainer>

                </div>

            </section>

            <section
                className="standalone-auth-right"
                style={{
                    // backgroundImage: branding.heroImage
                    //     ? `url("${branding.heroImage}")`
                    //     : undefined,

                    // backgroundPosition: branding.heroImagePosition,
                    // backgroundSize: branding.heroImageSize
                }}
            >
                <div className="standalone-auth-right-overlay" />

                <div
                    className="standalone-auth-right-content"
                    style={{
                        paddingBottom: branding.heroContentBottom
                    }}
                >
                    <div className="standalone-auth-right-copy">
                        <h2>{branding.heroTitle}</h2>

                        <p>{branding.heroText}</p>
                    </div>
                </div>
            </section>

        </div>
    );

/*    
    return (
        <div className="standalone-auth-page">

            <section className="standalone-auth-form">

                <MDBContainer
                    id="logincontainer"
                    className="login-container p-3 d-flex flex-column"
                >
                    {renderBranding()}

                    <form onSubmit={submit}>

                        {
                            isLogin
                                ? renderLogin()
                                : renderSignup()
                        }


                        {onCancel &&
                            <div className="text-center auth-guest-link">

                                <Button
                                    type="button"
                                    className="link"
                                    onClick={onCancel}
                                >
                                    Continue as guest
                                </Button>

                            </div>
                        }

                    </form>

                </MDBContainer>

            </section>


            <section
                className="standalone-auth-brand"
                style={{
                    backgroundImage:
                        branding.heroImage
                            ? `url("${branding.heroImage}")`
                            : undefined
                }}
            >
                <div className="standalone-auth-brand-overlay" />

                <div className="standalone-auth-brand-content">

                    <h1>
                        {branding.heroTitle}
                    </h1>

                    <p>
                        {branding.heroText}
                    </p>

                </div>
            </section>

        </div>
    );
*/
};
export { AuthPage };