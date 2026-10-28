import React, { useEffect, useMemo, useState } from 'react';
import { searchService } from '../../_services/search.service';
import { Debug } from '@/util/Utilities';

import { SignupComplete } from './SignupComplete';
import { SignupForm } from './SignupForm';
import { SignupPricing } from './SignupPricing';
import { SignupPricingStreaming } from './SignupPricingStreaming';
import { SignupTerms } from './SignupTerms';
import { SignupVerifyEmail } from './SignupVerifyEmail';
import { StreamingOnboarding } from './StreamingOnboarding';
import { CommercialContactModal } from './CommercialContactModal';

import { MFASetup } from '../auth/mfa';


const INITIAL_SIGNUP_DATA = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    acceptTerms: false
};


const Signup = ({
    onLogin = null,
    onCancel = null,
    onContact = null,
    navigationStep = 'pricing',
    onNavigateStep = null,
    onReplaceStep = null,
    onNavigateBack = null,
    pricingMode = 'saas',
    upgradeMode = false,
    currentUser = null
}) =>
{
    const [step, setStep] = useState(navigationStep || 'pricing');
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [signupData, setSignupData] = useState(INITIAL_SIGNUP_DATA);
    const [showBusy, setShowBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const [verificationToken, setVerificationToken] = useState(null);
    const [mfaSetupToken, setMfaSetupToken] = useState(null);
    const [commercialInterest, setCommercialInterest] = useState(null);


    /*
     * Browser Back/Forward changes navigationStep externally.
     * Local navigation is also changed immediately by this component so
     * transient signup state can never race the parent navigation state.
     */
    useEffect(() =>
    {
        setStep(navigationStep || 'pricing');
    }, [navigationStep]);


    /*
     * Browser history survives a refresh, but selectedPlan/signupData do not.
     * Repair any restored step whose transient prerequisites no longer exist.
     *
     * renderStep() performs the same checks synchronously so an invalid child
     * component is never rendered while this effect is waiting to run.
     */
    useEffect(() =>
    {
        const invalidForm =
            step === 'form' &&
            !selectedPlan;

        const invalidVerify =
            step === 'verify' &&
            (
                !selectedPlan ||
                !signupData?.email ||
                !signupData?.password
            );

        const invalidMfa =
            step === 'mfa' &&
            (
                !signupData?.email ||
                !signupData?.password
            );

        if (
            !invalidForm &&
            !invalidVerify &&
            !invalidMfa
        )
        {
            return;
        }

        setAlert(null);
        setStep('pricing');

        if (onReplaceStep)
            onReplaceStep('pricing');

    }, [
        step,
        selectedPlan,
        signupData?.email,
        signupData?.password,
        onReplaceStep
    ]);


    const branding = useMemo(() =>
    {
        const b = window.BRANDING || {};

        return {
            termsVersion:
                window.BRANDING_TERMS_VERSION ||
                b.TERMS_VERSION ||
                '2026-09',

            privacyUrl:
                window.BRANDING_PRIVACY_URL ||
                b.PRIVACY_URL ||
                null,

            termsUrl:
                window.BRANDING_TERMS_URL ||
                b.TERMS_URL ||
                null
        };
    }, []);


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (
            response?.ok === false ||
            response?.status >= 400 ||
            response?.error
        )
        {
            return response.error || response.message || fallback;
        }

        return null;
    }


    function replaceStep(nextStep)
    {
        /*
         * Update locally first.
         *
         * This is important when clearing transient signup state: the component
         * must already be on the destination step before password/plan state is
         * changed, otherwise a stale Verify render can trigger the refresh guard.
         */
        setStep(nextStep);

        if (onReplaceStep)
            onReplaceStep(nextStep);
    }


    function navigateStep(nextStep)
    {
        setStep(nextStep);

        if (onNavigateStep)
            onNavigateStep(nextStep);
    }


    function unwrapAccountResponse(response)
    {
        if (
            !response ||
            typeof response !== 'object' ||
            typeof response.message !== 'string'
        )
        {
            return response;
        }

        try
        {
            const parsed = JSON.parse(response.message);

            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
                return response;

            return {
                ...response,
                ...parsed,
                status: parsed.status ?? response.status
            };
        }
        catch (err)
        {
            return response;
        }
    }


    function finishFreeSignup()
    {
        // Leave the MFA step before clearing its transient prerequisites so
        // the synchronous/effect guards cannot bounce the flow back to pricing
        // while the parent switches to the login screen.
        setStep('complete');

        setSignupData(current => ({
            ...current,
            password: '',
            confirmPassword: ''
        }));

        setVerificationToken(null);
        setMfaSetupToken(null);
        setAlert(null);
        setShowBusy(false);

        onLogin?.();
    }


    /*
     * IMPORTANT: Keep the Free account path aligned with the known-working
     * Streaming signup path.
     *
     * The account is created immediately after email verification. MFASetup is
     * then initiated exactly as it is by StreamingOnboarding: if Gatekeeper
     * returned a setup token it is used; otherwise the existing email/password
     * MFA artifact/verify path is used.
     *
     * The Free path deliberately stops after MFA; unlike Streaming onboarding
     * it never calls startThreatLabStreamingOnboarding() or creates a Webhook.
     */
    async function createFreeAccount(emailVerificationToken)
    {
        if (
            !selectedPlan?.id ||
            !signupData?.email ||
            !signupData?.password ||
            !emailVerificationToken
        )
        {
            setAlert(null);
            replaceStep('pricing');
            return;
        }

        setShowBusy(true);
        setAlert(null);

        try
        {
            // Intentionally mirrors StreamingOnboarding.createStreamingAccount().
            const rawResponse = await searchService.createThreatLabAccount({
                plan: 'free',
                name: signupData.name?.trim?.() || '',
                email: signupData.email.trim().toLowerCase(),
                password: signupData.password,
                mfaEnabled: signupData.mfaEnabled === true,
                mfaMethod: signupData.mfaEnabled
                    ? (signupData.mfaMethod || 'authenticator')
                    : null,
                verificationToken: emailVerificationToken,
                termsAccepted: true,
                termsVersion: branding.termsVersion
            });

            const response = unwrapAccountResponse(rawResponse);

            const responseError = getResponseError(
                response,
                'Unable to create your ThreatLab account.'
            );

            if (responseError)
                throw new Error(responseError);

            setVerificationToken(emailVerificationToken);

            if (!signupData.mfaEnabled)
            {
                finishFreeSignup();
                return;
            }

            setMfaSetupToken(
                response?.mfaSetupToken ||
                response?.setupToken ||
                null
            );

            // Match StreamingOnboarding exactly: MFA setup starts even when
            // Gatekeeper does not return a setup token. MFASetup then uses the
            // existing email/password compatibility path to obtain the TOTP
            // QR code and secret via getMFArtifacts().
            replaceStep('mfa');
        }
        catch (err)
        {
            console.error('ThreatLab Free account creation error', err);
            setAlert(err?.message || 'Unable to create your ThreatLab account.');
            throw err;
        }
        finally
        {
            setShowBusy(false);
        }
    }


    async function handleEmailVerified(emailVerificationToken)
    {
        if (!emailVerificationToken)
            throw new Error('Email verification succeeded but no verification token was returned.');

        setVerificationToken(emailVerificationToken);
        setAlert(null);

        // Same sequence as Streaming signup: create account first, then MFA.
        await createFreeAccount(emailVerificationToken);
    }


    function handleMfaComplete()
    {
        // The account already exists. MFASetup has verified and stored TOTP
        // through the same setupToken path used by Streaming signup.
        finishFreeSignup();
    }


    function selectPlan(plan)
    {
        if (!plan)
            return;

        if (Debug)
            console.log('selectPlan ', plan);

        setAlert(null);

        if (
            plan.action === 'contact' ||
            plan.requiresBilling === true
        )
        {
            /*
             * Paid-plan checkout is intentionally outside the Free launch path.
             * Switch this branch to the billing step when eCommerce is connected.
             */

//PDS TEST - open a local emailer or a setup page or an eCommerce

            setCommercialInterest(
                `${plan.name || 'ThreatLab commercial services'} - enquiry`
            );

            return;
        }

        setSelectedPlan(plan);
        navigateStep('form');
    }


    function openStreamingOnboarding()
    {
        setAlert(null);
        navigateStep('streaming');
    }


    function continueToVerify(data)
    {
        if (!data)
            return;

        setSignupData(data);
        setAlert(null);
        navigateStep('verify');
    }


    function showTerms()
    {
        if (branding.termsUrl)
        {
            window.open(
                branding.termsUrl,
                '_blank',
                'noopener,noreferrer'
            );

            return;
        }

        setShowTermsModal(true);
    }


    function hideTerms()
    {
        setShowTermsModal(false);
    }


    function backToPricing()
    {
        setAlert(null);

        /*
         * Set the known local destination immediately. The browser-history
         * callback can then update the parent navigation state.
         */
        setStep('pricing');

        if (onNavigateBack)
            onNavigateBack();
    }


    function backToForm()
    {
        setAlert(null);

        /*
         * selectedPlan/signupData are still present during an ordinary Back
         * operation, so returning to the form is valid.
         */
        setStep('form');

        if (onNavigateBack)
            onNavigateBack();
    }


    function backFromMfa()
    {
        // At this point the account has already been created, matching the
        // Streaming signup sequence. Returning to the form would cause a
        // duplicate-account collision on retry, so return to sign-in instead.
        setAlert(null);
        setVerificationToken(null);
        setMfaSetupToken(null);
        onLogin?.();
    }


    function renderPricing()
    {
        return (
            <SignupPricingStreaming
                onCancel={onCancel}
                onLogin={onLogin}
                onSelectPlan={selectPlan}
                onStreamingSetup={openStreamingOnboarding}
                onShowTerms={showTerms}
                upgradeMode={upgradeMode}
            />
        );



        // /*
        //  * Keep upgrades on the existing SaaS pricing page. The streaming/MDR
        //  * page is the primary acquisition journey for new ThreatLab users.
        //  */
        // if (!upgradeMode && pricingMode === 'streaming')
        // {
        //     return (
        //         <SignupPricingStreaming
        //             onCancel={onCancel}
        //             onLogin={onLogin}
        //             onSelectPlan={selectPlan}
        //             onStreamingSetup={openStreamingOnboarding}
        //             onShowTerms={showTerms}
        //         />
        //     );
        // }

        // return (
        //     <SignupPricing
        //         upgradeMode={upgradeMode}
        //         currentPlan={
        //             currentUser?.plan ||
        //             currentUser?.subscription ||
        //             'free'
        //         }
        //         onCancel={onCancel}
        //         onLogin={upgradeMode ? null : onLogin}
        //         onSelectPlan={selectPlan}
        //         onShowTerms={showTerms}
        //     />
        // );
    }


    function renderStep()
    {
        /*
         * These guards MUST remain synchronous.
         *
         * Effects run after rendering. If browser history restores "form",
         * "verify" or "mfa" after a refresh, their transient React state has
         * already disappeared. Rendering the child first would allow it to
         * dereference null before the repair effect can run.
         */

        if (
            step === 'form' &&
            !selectedPlan
        )
        {
            return renderPricing();
        }

        if (
            step === 'verify' &&
            (
                !selectedPlan ||
                !signupData?.email ||
                !signupData?.password
            )
        )
        {
            return renderPricing();
        }

        if (
            step === 'mfa' &&
            (
                !signupData?.email ||
                !signupData?.password
            )
        )
        {
            return renderPricing();
        }


        if (step === 'streaming')
        {
            if (upgradeMode || pricingMode !== 'streaming')
                return renderPricing();

            return (
                <StreamingOnboarding
                    onBack={backToPricing}
                    onLogin={onLogin}
                    onShowTerms={showTerms}
                    termsVersion={branding.termsVersion}
                />
            );
        }


        if (step === 'form')
        {
            return (
                <SignupForm
                    plan={selectedPlan}
                    initialData={signupData}
                    privacyUrl={branding.privacyUrl}
                    termsUrl={branding.termsUrl}
                    termsVersion={branding.termsVersion}
                    onBack={backToPricing}
                    onDataChange={setSignupData}
                    onContinue={continueToVerify}
                    onLogin={onLogin}
                    onShowTerms={showTerms}
                />
            );
        }


        if (step === 'verify')
        {
            return (
                <SignupVerifyEmail
                    email={signupData.email}
                    plan={selectedPlan}
                    termsVersion={branding.termsVersion}
                    showBusy={showBusy}
                    alert={alert}
                    onBack={backToForm}
                    onClearAlert={() => setAlert(null)}
                    onVerified={handleEmailVerified}
                />
            );
        }


        if (step === 'mfa')
        {
            return (
                <MFASetup
                    email={signupData.email}
                    password={signupData.password}
                    setupToken={mfaSetupToken}
                    initialMethod={
                        signupData.mfaMethod ||
                        'authenticator'
                    }
                    onCancel={backFromMfa}
                    onComplete={handleMfaComplete}
                />
            );
        }


        if (step === 'complete')
        {
            return (
                <SignupComplete
                    email={signupData?.email || ''}
                    mfaEnabled={signupData?.mfaEnabled === true}
                    onLogin={onLogin}
                />
            );
        }


        return renderPricing();
    }


    /**
     * RENDER
     */
    return (
        <div className="signup-shell">
            {renderStep()}

            {!branding.termsUrl &&
                <SignupTerms
                    show={showTermsModal}
                    termsVersion={branding.termsVersion}
                    onHide={hideTerms}
                />
            }

            <CommercialContactModal
                open={Boolean(commercialInterest)}
                interest={commercialInterest || 'ThreatLab commercial services'}
                onClose={() => setCommercialInterest(null)}
            />
        </div>
    );
};


export { Signup };