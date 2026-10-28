import React, { useState, useEffect, useContext, useMemo, lazy, Suspense } from 'react';
import { Container, Card, Row, Col, Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Collapse } from "@mui/material";
import { toast } from 'react-toastify';

import { FaExpand, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { DefaultBranding } from './DefaultBranding';
import { Signup } from './signup/Signup';
import { AuthPage } from './auth/AuthPage';
import { AccountSecurity } from './auth/AccountSecurity';
import { ThoughtLeadershipBoard } from './ThoughtLeadershipBoard';
import { ProfileDrawer } from './profile/ProfileDrawer';
import { AppBar } from './appbar/AppBar';

import { AutomationMgrPortal } from './portals/AutomationMgrPortal';
import { DashboardsPortal } from './portals/DashboardsPortal';
import { EventBoxPortal } from './portals/EventBoxPortal';
import { ManagementPortal } from './portals/ManagementPortal';
import { ReportsPortal } from './portals/ReportsPortal';

import { CommercialContactModal } from './signup/CommercialContactModal';
import { SOCAChatbotWrapper } from '@hct/soca-chatbot';
import { Debug, getSessionProps, setSessionProps } from '@/util/Utilities';
import { searchService } from '@/_services/search.service';

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addLocale(en);


const NAVIGATION_STATE_KEY = 'threatLabNavigation';
const VALID_AUTH_MODES = ['login', 'signup', 'upgrade', 'security', 'automation', 'dashboard', 'reports', 'eventbox', 'management', 'password-reset'];
const VALID_SIGNUP_STEPS = ['pricing', 'streaming', 'form', 'verify', 'mfa', 'complete'];
const DEFAULT_INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const SESSION_STORAGE_AUTH_KEYS = ['_sps', '_socaloginsession_'];


const WebFramework = (props) => 
{
    const [authMode, setAuthMode] = useState(initAuthMode());
    const [signupStep, setSignupStep] = useState(initSignupStep());
    const [showThoughtLeadership, setShowThoughtLeadership] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [appBarExpanded, setAppBarExpanded] = useState(false);
    const [dashboardIncidentLink, setDashboardIncidentLink] = useState(null);
    const [commercialContactOpen, setCommercialContactOpen] = useState(false);
    const [passwordResetToken, setPasswordResetToken] = useState(getPasswordResetToken());
    const [currentUser, setCurrentUser] = useState(props.user || getSessionProps() || null);
    const isAuthenticated = Boolean(currentUser?.email);
    const isApplicationMode = ['dashboard', 'reports', 'automation', 'eventbox', 'management'].includes(authMode);

    useEffect(() =>
    {
        setCurrentUser(props.user || getSessionProps() || null);
    }, [props.user]);

    useEffect(() =>
    {
        const resetToken = getPasswordResetToken();
        const existingNavigation = getNavigationState(window.history.state);

        if (resetToken)
        {
            setPasswordResetToken(resetToken);

            window.history.replaceState(
                buildNavigationState('password-reset', 'pricing', 0),
                ''
            );

            applyNavigation('password-reset', 'pricing');
        }
        else if (existingNavigation)
        {
            applyNavigation(
                existingNavigation.authMode,
                existingNavigation.signupStep
            );
        }
        else
        {
            window.history.replaceState(
                buildNavigationState(null, 'pricing', 0),
                ''
            );

            if (authMode)
            {
                window.history.pushState(
                    buildNavigationState(authMode, signupStep, 1),
                    ''
                );
            }
        }

        const handlePopState = (event) =>
        {
            const navigation = getNavigationState(event.state);

            if (!navigation)
            {
                applyNavigation(null, 'pricing');
                return;
            }

            applyNavigation(
                navigation.authMode,
                navigation.signupStep
            );
        };

        window.addEventListener('popstate', handlePopState);

        return () =>
            window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() =>
    {
        if (props.user)
            return;

        restoreThreatLabSession();
    }, []);


    useEffect(() =>
    {
        if (!isAuthenticated)
            return;

        const configuredTimeout = Number(getSessionProps()?.sessionTimeout);
        const inactivityTimeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
            ? configuredTimeout
            : DEFAULT_INACTIVITY_TIMEOUT;

        let timeoutId = null;
        let logoutStarted = false;

        function resetInactivityTimer()
        {
            if (logoutStarted)
                return;

            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(async () =>
            {
                if (logoutStarted)
                    return;

                logoutStarted = true;
                await handleLogout();
            }, inactivityTimeout);
        }

        const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart'];

        activityEvents.forEach(eventName =>
            window.addEventListener(eventName, resetInactivityTimer, { passive: true })
        );

        resetInactivityTimer();

        return () =>
        {
            window.clearTimeout(timeoutId);

            activityEvents.forEach(eventName =>
                window.removeEventListener(eventName, resetInactivityTimer)
            );
        };
    }, [isAuthenticated, currentUser?.email]);


//  if (Debug)
        console.log('WebFramework ENTRY ', Debug)

    function getPasswordResetToken()
    {
        const params = new URLSearchParams(window.location.search);
        return params.get('resetToken');
    }


    function clearPasswordResetToken()
    {
        const url = new URL(window.location.href);

        url.searchParams.delete('resetToken');

        window.history.replaceState(
            window.history.state,
            '',
            `${url.pathname}${url.search}${url.hash}`
        );

        setPasswordResetToken(null);
    }


    function initAuthMode()
    {
        if (getPasswordResetToken())
            return 'password-reset';

        const navigation = getNavigationState(window.history.state);
        if (navigation)
            return navigation.authMode;

        const am = localStorage.getItem('_am');
        if (Debug)
            console.log('WebFramework initAuthMode ' + am)
        if (am == null || am.trim().length == 0)
            return null;
        if (!VALID_AUTH_MODES.includes(am.toLowerCase()))
            return null;
        return am.toLowerCase();
    }

    function initSignupStep()
    {
        const navigation = getNavigationState(window.history.state);
        return navigation?.signupStep || 'pricing';
    }

    function getNavigationState(state)
    {
        const navigation = state?.[NAVIGATION_STATE_KEY];

        if (!navigation)
            return null;

        const depth = Number.isInteger(navigation.depth)
            ? navigation.depth
            : 0;

        /*
        * MFA setup depends on transient signup credentials/tokens held in
        * memory (email/password and the email-verification token). It must
        * never be restored after refresh/back-forward navigation.
        *
        * The account is not created until MFA enrolment succeeds, so there
        * is no account yet to sign in to - send the user back into signup
        * (pricing) rather than to Login. signupStep is only ever set to
        * 'mfa' while authMode is 'signup' or 'upgrade' (see
        * navigateSignupStep/replaceSignupStep below), so preserve whichever
        * of those it was; fall back to 'signup' defensively.
        */
        if (navigation.signupStep === 'mfa')
        {
            const restartMode = VALID_AUTH_MODES.includes(navigation.authMode)
                ? navigation.authMode
                : 'signup';

            return {
                authMode: restartMode,
                signupStep: 'pricing',
                depth
            };
        }

        const authMode = VALID_AUTH_MODES.includes(navigation.authMode)
            ? navigation.authMode
            : null;

        const signupStep = VALID_SIGNUP_STEPS.includes(navigation.signupStep)
            ? navigation.signupStep
            : 'pricing';

        return {
            authMode,
            signupStep,
            depth
        };
    }

    function buildNavigationState(mode, step, depth)
    {
        return {
            ...window.history.state,
            [NAVIGATION_STATE_KEY]: {
                authMode: VALID_AUTH_MODES.includes(mode) ? mode : null,
                signupStep: VALID_SIGNUP_STEPS.includes(step) ? step : 'pricing',
                depth
            }
        };
    }

    function applyNavigation(mode, step = 'pricing')
    {
        const nextMode = VALID_AUTH_MODES.includes(mode) ? mode : null;
        const nextStep = VALID_SIGNUP_STEPS.includes(step) ? step : 'pricing';

        if (nextMode)
            localStorage.setItem('_am', nextMode);
        else
            localStorage.removeItem('_am');

        setProfileOpen(false);
        setAuthMode(nextMode);
        setSignupStep(nextStep);
    }

    function navigate(mode, step = 'pricing')
    {
        const current = getNavigationState(window.history.state);
        const nextMode = VALID_AUTH_MODES.includes(mode) ? mode : null;
        const nextStep = VALID_SIGNUP_STEPS.includes(step) ? step : 'pricing';

        if (
            current?.authMode === nextMode &&
            current?.signupStep === nextStep
        )
            return;

        const depth = (current?.depth || 0) + 1;

        window.history.pushState(
            buildNavigationState(nextMode, nextStep, depth),
            ''
        );

        applyNavigation(nextMode, nextStep);
    }

    function replaceNavigation(mode, step = 'pricing')
    {
        const current = getNavigationState(window.history.state);
        const depth = current?.depth || 0;

        window.history.replaceState(
            buildNavigationState(mode, step, depth),
            ''
        );

        applyNavigation(mode, step);
    }

    function navigateBack()
    {
        window.history.back();
    }

    function navigateThreatLab()
    {
        const current = getNavigationState(window.history.state);
        const depth = current?.depth || 0;

        applyNavigation(null, 'pricing');

        if (depth > 0)
            window.history.go(-depth);
        else
            replaceNavigation(null, 'pricing');
    }

    function toggleThoughtLeadership()
    {
        setShowThoughtLeadership(current => !current);
    }

    async function restoreThreatLabSession()
    {
        try
        {
            const response = await searchService.getThreatLabSession();
            const user = response?.user || response?.session || response || null;

            if (response?.ok === false || response?.status >= 400)
                return;

            if (user?.email)
            {
                setSessionProps(response?.session || response);
                setCurrentUser(user);
            }
        }
        catch (err)
        {
            // No active session is a normal Guest state.
        }
    }

    function openLogin()
    {
        navigate('login');
    }

    function openSignup()
    {
        navigate('signup', 'pricing');
    }

    function openUpgrade()
    {
        navigate('upgrade', 'pricing');
    }

    function openSecurity()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate('security');
    }

    function openDashboard()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        // Explicit Dashboard navigation opens the normal dashboard rather than
        // retaining a previously requested incident deep-link.
        setDashboardIncidentLink(null);
        navigate('dashboard');
    }

    async function openIncidentInDashboard({ incidentId } = {})
    {
        if (Debug)
            console.log('openIncidentInDashboard ENTRY [ display ]', isAuthenticated, incidentId);
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        const id = String(incidentId || '').trim();
        if (!id)
        {
            console.error('openIncidentInDashboard() called without an incident id');
            return;
        }


        const appliance = getSessionProps().appliance;

        const incidentLink = resolveIncidentLink(`https://${appliance}/?pages/ui.php&operation=details&app=incident&id=${encodeURIComponent(id)}`);

        if (Debug)
            console.log('openIncidentInDashboard [ display ]', incidentLink);

        setDashboardIncidentLink(incidentLink);
        navigate('dashboard');
    }

    function resolveIncidentLink(href) 
    {
        if (Debug)
            console.log('Framework: resolveIncidentLink ENTRY', href);
        const url = new URL(href);
        const { pathname, searchParams } = url;
        if (Debug)
            console.log('Framework: resolveIncidentLink url parts:', pathname,searchParams);

        // Example match: /pages/ui.php?operation=details&app=incident&id=I-10000465
        const isDirectUi = pathname === "/pages.php";
        const op = searchParams.get("operation");
        const app = searchParams.get("app");
        const id = searchParams.get("id");

        if (Debug)
            console.log('Framework: resolveIncidentLink op:' + op + " app: " + app + " id: " + id);

        // Validate the ID pattern if you want to be strict
        const idOk = typeof id === "string" && /^I-\d+$/i.test(id);

        if (op === "details" && app === "incident" && idOk) 
        {
            const app = {
                app: "dashboards",
                props: { 
                    id: id,
                    operation: op
                }
            }
            if (Debug)
                console.log('Framework: resolveIncidentLink EXIT : Got direct link', href, app);
            return app;
        }
        else
        if (Debug)
            console.log('Framework: resolveIncidentLink EXIT [null] no direct url detected');
        return null; // no deep link match
    }


    function openCyberAssistant()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate(null, 'pricing');
    }

    function openReports()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate('reports');
    }

    function openAutomationMgr()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate('automation');
    }
    
    function openEventBox()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate('eventbox');
    }

    function openManagementPoints()
    {
        if (!isAuthenticated)
        {
            navigate('login');
            return;
        }

        navigate('management');
    }

    function closeAuthentication()
    {
        navigateThreatLab();
    }

    function navigateSignupStep(step)
    {
        if (authMode !== 'signup' && authMode !== 'upgrade')
            return;

        navigate(authMode, step);
    }

    function replaceSignupStep(step)
    {
        if (authMode !== 'signup' && authMode !== 'upgrade')
            return;

        replaceNavigation(authMode, step);
    }

    function handleAuthenticated(response)
    {
        if (Debug)
            console.log('handleAuthenticated ', response);

        setSessionProps(response?.session || response);
        setCurrentUser(response?.user || response?.session || response || null);
        navigateThreatLab();
    }


    function clearAuthenticatedSession()
    {
        setSessionProps(undefined);

        SESSION_STORAGE_AUTH_KEYS.forEach(key =>
            sessionStorage.removeItem(key)
        );

        setCurrentUser(null);
        setProfileOpen(false);
    }


    async function handleDeleteAccount({ isPaidPlan = false } = {})
    {
        const response = await searchService.requestThreatLabAccountDeletion();

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response;

        if (isPaidPlan)
        {
            toast.info(
                'Your account is marked for deletion and will go offline after the subscription period ends.'
            );
            return response;
        }

        try
        {
            await searchService.logoutThreatLabUser();
        }
        catch (err)
        {
            console.error('ThreatLab post-delete logout error', err);
        }

        clearAuthenticatedSession();
        navigateThreatLab();
        toast.success('Your account has been deleted.');

        return response;
    }


    function handleSecurityComplete(result)
    {
        const response = result?.response || result;

        if (result?.resetMode)
        {
            clearPasswordResetToken();
            clearAuthenticatedSession();
            navigate('login');
            toast.success('Password reset. Sign in with your new password.');
            return;
        }

        if (response?.session || response?.user || response?.email)
        {
            const session = response?.session || response;
            const user = response?.user || response?.session || response;

            setSessionProps(session);
            setCurrentUser(user);
        }
        else
        {
            setCurrentUser(current => ({
                ...(current || {}),
                mfaEnabled: result?.mfaEnabled,
                mfaMechanism:
                    result?.mfaMethod ??
                    (result?.mfaEnabled === false ? 'none' : current?.mfaMechanism)
            }));
        }

        navigateThreatLab();
        toast.success('Account security updated.');
    }


    function cancelPasswordReset()
    {
        clearPasswordResetToken();
        navigate('login');
    }


    async function handleSupportRequest(request)
    {
        return searchService.createThreatLabSupportRequest(request);
    }


    async function handleLogout()
    {
        try
        {
            await searchService.logoutThreatLabUser();
        }
        catch (err)
        {
            console.error('ThreatLab logout error', err);
        }
        finally
        {
            clearAuthenticatedSession();
            navigate('login');
        }
    }

    if (Debug)
        console.log('WebFramework ENTRY')


    const defaultLogo = <DefaultBranding orientation="horizontal"/>


    function renderChatBot()
    {
        return (
            <>
                <SOCAChatbotWrapper
                    prompterInvisible={false}
                    onDisplayIncident={openIncidentInDashboard}
                />
            </>
        )
    }

    function renderBody()
    {
//        if (Debug)
            console.log('renderBody rsb? ' + window.RIGHT_SIDEBAR);
        return (
            <Row className='body'>
                {
                    window.LEFT_SIDEBAR == 'true' &&
                    <Col sm={2} className='left-sidebar'>
                        {renderLeftSidebar()}
                    </Col>
                }

                <Col className="chatbot-col" style={{ minHeight: 0 }}>
                    {renderChatBot()}
                    {/* <div>WebFramework Body</div> */}
                </Col>

                {
                    window.RIGHT_SIDEBAR == 'true' &&
                    <div className="thought-leadership-shell">

                        <Button
                            type="button"
                            className="thought-leadership-toggle"
                            onClick={toggleThoughtLeadership}
                            title={showThoughtLeadership ? 'Hide Cyber Intelligence feed' : 'Show Cyber Intelligence feed'}
                        >
                            {showThoughtLeadership ? <FaArrowRight size={15}/> : <FaArrowLeft size={15}/>}
                        </Button>

                        <Collapse
                            orientation="horizontal"
                            in={showThoughtLeadership}
                            timeout={{ appear: 0, enter: 800, exit: 1000}}
                        >
                            <div className="thought-leadership-sidebar">
                                <ThoughtLeadershipBoard />
                            </div>
                        </Collapse>

                    </div>
                }


                {/* {
                    window.RIGHT_SIDEBAR == 'true' &&
                    <Col sm={2} className='right-sidebar'>
                        {renderRightSidebar()}
                    </Col>
    } */}
            </Row>
        )
    }

    function renderLeftSidebar()
    {
        return (
            <div className="d-flex flex-column flex-grow-1 h-100">
                <Row className='svc-ad'>
                    <Col className="h-100 d-flex flex-column">WebFramework LEFT SIDEBAR Ad</Col>
                </Row>
                <Row className='svc-ad'>
                    <Col className="h-100 d-flex flex-column">Left SB ad</Col>
                </Row>
            </div>
        )
    }

    // function renderRightSidebar()
    // {
    //     return (
    //         <div className="d-flex flex-column flex-grow-1 h-100 mt-2">
    //             {/* <Row className='no-ads-cta'>
    //                 <div>Don't like ads? <Button className='btn-cta'>Sign Up</Button></div>
    //             </Row> */}
    //             <Row className='svc-card'>
    //                 {/* <Col className="h-100 d-flex flex-column">WebFramework RIGHT SIDEBAR Ad</Col> */}
    //                 <Col>
    //                     <img src='/images/NCSC-bulletin-card.png'/>
    //                 </Col>
    //             </Row>
    //             <Row className='svc-card'>
    //                 {/* <Col className="h-100 d-flex flex-column">Right SB ad</Col> */}
    //                 <Col>
    //                     <img src='/images/NCSC-bulletin-card-2.png'/>
    //                 </Col>
    //             </Row>
    //         </div>
    //     )
    // }

    function howItWorksClick()
    {
//        if (Debug)
            console.log('howItWorksClick ENTRY')

//TODO

    }

    function upgradeClick()
    {
//        if (Debug)
            console.log('upgradeClick ENTRY')

//TODO

    }

    function renderMenu()
    {
        return (
            <div className='profile-menu ms-auto'>
                <button
                    type="button"
                    className={`profile-menu-button ${isAuthenticated ? 'authenticated' : ''}`}
                    onClick={() => setProfileOpen(current => !current)}
                    aria-label={profileOpen ? "Close ThreatLab menu" : "Open ThreatLab menu"}
                    aria-expanded={profileOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        )
    }

    function renderHeader()
    {
        return (
            <Row className='header'>
                <Col sm={2} className='branding mx-2'>{defaultLogo}</Col>
                <Col className='menu'>
                    {!isAuthenticated && renderMenu()}
                </Col>
            </Row>
        )
    }

    function onCTAClick()
    {
//        if (Debug)
            console.log('WebFramework onCTAClick() ENTRY')

        setCommercialContactOpen(true);
    }

    function onLoginClick(onLogin = false)
    {
//      if (Debug)
            console.log('WebFramework onLoginClick() ENTRY', onLogin)

        if (onLogin === true)
            openLogin();
        else
            openSignup();
    }

    function renderFooter()
    {
        if (isAuthenticated)
            return null;

        return (
            <Row className="footer">
                <Col className="footer-content" onClick={onLoginClick}>
                    <div className='soca-cta'>
                        <div className='footer-copy'>Detect. Decide. Respond. → Autonomous Security Operations → at your fingertips</div>
                        {/* <div className='footer-copy'>Detect real-time Threat Actors at scale? → It's time for the Automated AI SOC</div> */}
                        {/* <div className='footer-copy'>Want all your events analyzed automatically?<br/>Try SOCAutomation's Automated SOC Service for free!</div> */}
                        <Button className='btn-cta' onClick={onLoginClick}>Sign Up</Button>
                    </div>
                </Col>
            </Row>
        );
    }


    function XXXrenderFooter()
    {
        return (
            <>
                <Row className='soca-cta'>
                    <Button className='btn-cta' onClick={onCTAClick}>Want all your events analyzed automatically?<br/>Try SOCAutomation's Automated SOC Service for free!</Button>
                </Row>
                <Row className='footer'>
                    <Row className='contact'>
                        {/* <Col></Col> */}
                    </Row>
                </Row>
            </>
        )
    }

    function renderAppBar()
    {
        if (!isAuthenticated)
            return null;

        const activeApp = authMode === 'dashboard'
            ? 'dashboard'
            : authMode === 'reports'
                ? 'reports'
                : authMode === 'automation'
                    ? 'automation'
                    : authMode === 'eventbox'
                        ? 'eventbox'
                        : authMode === 'management'
                            ? 'management'
                            : 'assistant';

        return (
            <AppBar
                expanded={appBarExpanded}
                activeApp={activeApp}
                onExpandedChange={setAppBarExpanded}
                onDashboard={openDashboard}
                onCyberAssistant={openCyberAssistant}
                onReports={openReports}
                onAutomationMgr={openAutomationMgr}
                onEventBox={openEventBox}
                onManagementPoints={openManagementPoints}
            />
        );
    }


    function renderApplicationPortal(portal)
    {
        return (
            <div
                key={authMode}
                className="threatlab-app-shell-content threatlab-app-entry"
            >
                {portal}
            </div>
        );
    }


    function renderCurrentApplication()
    {
        if (authMode === 'dashboard')
        {
            if (Debug)
                console.log('authMode -> DASHBOARD');

            return renderApplicationPortal(
                <DashboardsPortal
                    user={currentUser}
                    incidentLink={dashboardIncidentLink}
                    onCancel={closeAuthentication}
                />
            );
        }

        if (authMode === 'reports')
        {
            if (Debug)
                console.log('authMode -> REPORTS');

            return renderApplicationPortal(
                <ReportsPortal
                    user={currentUser}
                    onCancel={closeAuthentication}
                />
            );
        }

        if (authMode === 'eventbox')
        {
            if (Debug)
                console.log('authMode -> EVENTBOX');

            return renderApplicationPortal(
                <EventBoxPortal
                    user={currentUser}
                    onCancel={closeAuthentication}
                />
            );
        }

        if (authMode === 'automation')
        {
            if (Debug)
                console.log('authMode -> AUTOMATION');

            return renderApplicationPortal(
                <AutomationMgrPortal
                    user={currentUser}
                    onCancel={closeAuthentication}
                />
            );
        }

        if (authMode === 'management')
        {
            return renderApplicationPortal(
                <ManagementPortal
                    user={currentUser}
                    onCancel={closeAuthentication}
                />
            );
        }

        return null;
    }


    /**
     * render
     */
    if (authMode && !isApplicationMode)
    {
        if (Debug)
            console.log('WebFramework render AUTHMODE', authMode)

        if (authMode === 'login')
        {
            return (
                <AuthPage
                    initialMode={authMode}
                    onAuthenticated={handleAuthenticated}
                    onCancel={closeAuthentication}
                    onSignup={openSignup}
                />
            );
        }

        if (authMode === 'security')
        {
            return (
                <AccountSecurity
                    user={currentUser}
                    mode="profile"
                    onCancel={closeAuthentication}
                    onComplete={handleSecurityComplete}
                />
            );
        }

        if (authMode === 'password-reset')
        {
            return (
                <AccountSecurity
                    mode="reset"
                    resetToken={passwordResetToken || getPasswordResetToken()}
                    onCancel={cancelPasswordReset}
                    onComplete={handleSecurityComplete}
                />
            );
        }

        return (
            <Signup
                pricingMode="streaming"
                upgradeMode={authMode === 'upgrade'}
                currentUser={currentUser}
                navigationStep={signupStep}
                onNavigateStep={navigateSignupStep}
                onReplaceStep={replaceSignupStep}
                onNavigateBack={navigateBack}
                onLogin={openLogin}
                onCancel={closeAuthentication}
            />
        );
    }
//  if (Debug)
        console.log('WebFramework render PageMODE', authMode)

    return (
        <Container
            fluid
            className="datahelix-web-app outer-container main-layout"
        >
            {renderAppBar()}

            {
                isApplicationMode
                    ? (
                        <>
                            {renderCurrentApplication()}
                        </>
                    )
                    : (
                        <>
                            <div
                                key="assistant"
                                className='main-content threatlab-app-entry'
                            >
                                {renderHeader()}
                                {renderBody()}
                                {renderFooter()}
                            </div>

                            <CommercialContactModal
                                open={commercialContactOpen}
                                interest="ThreatLab commercial services"
                                onClose={() => setCommercialContactOpen(false)}
                            />
                        </>
                    )
            }

            {isAuthenticated && (
                <div className="threatlab-app-account-menu">
                    {renderMenu()}
                </div>
            )}

            <ProfileDrawer
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                user={currentUser}
                historyItems={props.historyItems || []}
                onLogin={openLogin}
                onSignup={openSignup}
                onUpgrade={openUpgrade}
                onSecurity={openSecurity}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onSupportRequest={handleSupportRequest}
            />

            {/* <Collapse
                orientation="horizontal"
                in={showThoughtLeadership}
                timeout={250}
            >
                <div className="thought-leadership-sidebar">
                    <ThoughtLeadershipBoard />
                </div>
            </Collapse> */}
        </Container>
    )


    // return (
    //     <Container
    //         fluid
    //         className="datahelix-web-app outer-container"
    //     >
    //         {renderHeader()}
    //         {renderBody()}
    //         {renderFooter()}
    //     </Container>
    // )

}
export default WebFramework;


