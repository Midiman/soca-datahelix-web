import React, { useState } from 'react';

import { Button } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaCode,
    FaShieldAlt,
    FaStream
} from 'react-icons/fa';
import { GiBrain } from "react-icons/gi";

import {
    BillingPeriodToggle,
    BILLING_ANNUAL
} from './BillingPeriodToggle';
import { SIGNUP_PLANS } from './SignupPricing';
import { DefaultBranding } from '../DefaultBranding';
import { CommercialContactModal } from './CommercialContactModal';
import { DataStreamLevels } from './DataStreamLevels';


const CURRENCY_USD = 'USD';
const CURRENCY_SYMBOL_USD = '$';

const STREAMING_POC = {
    id: 'streaming-poc',
    name: 'Streaming PoC',
    eyebrow: 'Try it with your data',
    action: 'streaming-onboarding',
    actionLabel: 'Start a streaming PoC',
    requiresBilling: false,
    visible: true,
    sourceLimit: null,
    throughputLimit: null,
    capabilities: [
        'Webhook push ingest',
        'Deliberately limited PoC event volume',
        'DataHelix AI event-level detection and analysis',
        'Prove fit before production scoping'
    ]
};


const STREAMING_DESTINATIONS = [
    {
        id: 'continuous-detection',
        name: 'Real-time Data Streaming AI Analysis',
        eyebrow: 'Production streaming',
        action: 'streaming-onboarding',
        actionLabel: 'Setup AI Data Streaming Analysis',
        requiresBilling: true,
        visible: true,
        sourceLimit: null,
        throughputLimit: null,
        capabilities: [
            'Continuous event ingest and automated threat detection',
            'Analysis and enrichment for every relevant event',
            'CyberFlow automation and response options',
            'Deployment sized to your environment and throughput',
            'Cyber AI Assistant included'
        ]
    },
    {
        id: 'managed-detection-response',
        name: 'Managed Detection & Response',
        eyebrow: 'Automated SOC Managed Services',
        action: 'contact',
        actionLabel: 'Setup Automated Managed Services',
        requiresBilling: true,
        visible: true,
        sourceLimit: null,
        throughputLimit: null,
        capabilities: [
            'Full CyberFlow Stream AI Analysis included',
            'Continuous managed threat monitoring and analysis',
            'Automated investigation, response and escalation',
            'Human-led response options for critical attacks',
            'SOCAutomation operates the security outcome',
            'Cyber AI Assistant included'
        ]
    },
    {
        id: 'automated-soc-api',
        name: 'Automated SOC - API',
        eyebrow: 'Programmatic REST API',
        icon: <FaCode />,
        action: 'contact',
        actionLabel: 'Setup Automated Managed Services',
        requiresBilling: true,
        visible: true,
        capabilities: [
            'Programmatic DataHelix AI and Deep Thinking analysis',
            'Request-based high-throughput commercial tiers',
            'Application and workflow integration',
            'Structured responses for automated downstream processing'
        ]
    }
];


const CONNECTION_METHODS = [
    {
        id: 'webhook',
        name: 'Webhook',
        icon: <FaStream />,
        visible: true,
        description: 'Push JSON security events directly into the ThreatLab streaming pipeline.'
    },
    {
        id: 'api',
        name: 'API',
        icon: <FaCode />,
        visible: false,
        description: 'Pull or submit events programmatically through the ThreatLab API.'
    }
];


const PIPELINE_STEPS = [
    'Connect Data',
    'Detect Attacks Early',
    'Analyse & Augment',
    'Automate the Response',
    'Human-led Governance'
];


const ThreatLabMark = () => (
    <svg
        className="signup-streaming-mark"
        viewBox="0 0 100 100"
        aria-hidden="true"
    >
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
        />
        <line x1="50" y1="20" x2="50" y2="6" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        <line x1="50" y1="80" x2="50" y2="94" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        <line x1="20" y1="50" x2="6" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        <line x1="80" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
    </svg>
);


const SignupPricingStreaming = ({
    onSelectPlan,
    onStreamingSetup = null,
    onLogin = null,
    onCancel = null,
    onShowTerms = null,
    upgradeMode = false
}) =>
{
    const [billingPeriod, setBillingPeriod] = useState(BILLING_ANNUAL);
    const [contactService, setContactService] = useState(null);
    const [showDataStreamLevels, setShowDataStreamLevels] = useState(false);
    const currency = CURRENCY_USD;


    function selectService(service)
    {
        if (service?.action === 'streaming-onboarding')
        {
            onStreamingSetup?.();
            return;
        }

        if (service?.action === 'contact')
        {
            openCommercialContact(`${service.name} - enquiry`);
            return;
        }

        onSelectPlan?.({
            ...service,
            billingPeriod: null,
            currency,
            currencySymbol: CURRENCY_SYMBOL_USD,
            selectedPrice: null
        });
    }

    function openDataStreamLevels(event = null)
    {
        event?.stopPropagation();
        setShowDataStreamLevels(true);
    }


    function closeDataStreamLevels()
    {
        setShowDataStreamLevels(false);
    }


    function openCommercialContact(interest)
    {
        setContactService({
            interest
        });
    }


    function startStreamingPoc()
    {
        setShowDataStreamLevels(false);
        onStreamingSetup?.();
    }

    function selectInteractivePlan(plan)
    {
        const selectedPrice = plan.price
            ? plan.price[billingPeriod]?.[currency]
            : null;

        onSelectPlan?.({
            ...plan,
            billingPeriod,
            currency,
            currencySymbol: CURRENCY_SYMBOL_USD,
            selectedPrice
        });
    }


    function renderDestination(service)
    {
        if (service.id === 'continuous-detection' && upgradeMode)
            return;
        return (
            <article
                key={service.id}
                className={`signup-streaming-service-card ${service.id === 'continuous-detection' ? 'featured' : ''}`}
                onClick={() => selectService(service)}
            >
                <div className="signup-streaming-service-eyebrow">
                    {service.eyebrow}
                </div>

                <h2>{service.name}</h2>

                <ul className="signup-streaming-capabilities">
                    {service.capabilities.map(capability => (
                        <li key={capability}>
                            <FaCheck aria-hidden="true" />
                            <span>{capability}</span>
                        </li>
                    ))}
                </ul>

                {
                    service.id === 'continuous-detection' &&
                    <li className="streaming-feature-link-item">
                        <button
                            type="button"
                            className="streaming-feature-link"
                            onClick={(event) =>
                            {
                                event.stopPropagation();
                                openDataStreamLevels?.();
                            }}
                        >
                            <FaArrowRight aria-hidden="true" />
                            <span>Compare Data Streaming Levels</span>
                        </button>
                    </li>
                }
                <div className='signup-streaming-capabilities-end'></div>
                <Button
                    type="button"
                    className="signup-streaming-primary-button"
                    onClick={(event) =>
                    {
                        event.stopPropagation();
                        selectService(service);
                    }}
                >
                    {service.actionLabel}
                    <FaArrowRight aria-hidden="true" />
                </Button>
            </article>
        );
    }


    function renderInteractivePlan(plan)
    {
        const price = plan.price
            ? plan.price[billingPeriod]?.[currency]
            : null;

        return (
            <article
                key={plan.id}
                className={plan.id == 'free' && upgradeMode ? 'signup-streaming-interactive-card disabled' : 'signup-streaming-interactive-card'}
                onClick={() => selectInteractivePlan(plan)}
            >
                <div className="signup-streaming-interactive-heading">
                    <h3>{plan.name}</h3>
                    <div className="signup-streaming-interactive-price">
                        {price != null
                            ? `${CURRENCY_SYMBOL_USD}${price}`
                            : 'Customize'
                        }
                    </div>
                </div>

                <p>{plan.strapline}</p>

                <Button
                    type="button"
                    className="signup-streaming-secondary-button"
                    onClick={(event) =>
                    {
                        event.stopPropagation();
                        selectInteractivePlan(plan);
                    }}
                >
                    {plan.id == 'free' && upgradeMode ? 'Already have access' : plan.actionLabel}
                    <FaArrowRight aria-hidden="true" />
                </Button>
            </article>
        );
    }


    const visibleDestinations = STREAMING_DESTINATIONS.filter(service => service.visible);
    const visibleConnections = CONNECTION_METHODS.filter(method => method.visible);
    const visibleInteractivePlans = SIGNUP_PLANS.filter(plan => plan.visible);


    return (
        <main className="signup-streaming-page">
            <header className="signup-streaming-header">
                <div className="signup-streaming-brand">
                    <DefaultBranding orientation="horizontal" />
                </div>

                <div className="signup-streaming-actions">
                    {onCancel &&
                        <Button
                            type="button"
                            className="signup-streaming-header-link"
                            onClick={onCancel}
                        >
                            <FaArrowLeft aria-hidden="true" />
                            &nbsp;Back to ThreatLab
                        </Button>
                    }

                    {onLogin && !upgradeMode &&
                        <Button
                            type="button"
                            className="signup-streaming-header-button"
                            onClick={onLogin}
                        >
                            Sign in
                        </Button>
                    }
                </div>
            </header>

            {showDataStreamLevels
                ?
                <DataStreamLevels
                    backLabel="Back to streaming plans"
                    onBack={closeDataStreamLevels}
                    onStartPoc={startStreamingPoc}
                    onCommercialContact={level => openCommercialContact(
                        `Data Streaming AI Analysis - ${level}`
                    )}
                />
                :
                <>
                    <section className="signup-streaming-hero">
                        <div className="signup-streaming-eyebrow">
                            <ThreatLabMark />
                            <div className="signup-streaming-brand-name">
                                <span>THREAT</span>LAB
                            </div>
                        </div>

                        {
                            !upgradeMode ?
                            <>
                                <h1>Connect your data.<br/>Automate threat detection 24/7/365.</h1>
                                <p>
                                    Maximize your security posture with DataHelix's multi-layer AI analysis across live data streams, automated response and managed security operations.
                                </p>
                            </>
                            :
                            <>
                                <h1>Choose your next level of ThreatLab</h1>
                                <p>
                                    Increase your security posture with high bandidth, multi-point ingest capabilities into DataHelix's multi-layer AI analysis.
                                </p>
                            </>
                        }
                    </section>

                    <section className="signup-streaming-pipeline" aria-label="ThreatLab streaming workflow">
                        {PIPELINE_STEPS.map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="signup-streaming-pipeline-step">
                                    {step}
                                </div>

                                {index < PIPELINE_STEPS.length - 1 &&
                                    <FaArrowRight
                                        className="signup-streaming-pipeline-arrow"
                                        aria-hidden="true"
                                    />
                                }
                            </React.Fragment>
                        ))}
                    </section>

        {/* //PDS TEST Streaming PoC SECTION */}
                    <section className="signup-streaming-section">
                        {/* <div className="signup-streaming-poc">
                            <div className="signup-streaming-poc-copy">
                                <div className="signup-streaming-service-eyebrow">
                                    {STREAMING_POC.eyebrow}
                                </div>
                                <h2>{STREAMING_POC.name}</h2>
                                <p>
                                    Send a limited live Webhook stream into ThreatLab and see continuous
                                    event-level detection against your own data before scoping production.
                                </p>
                            </div>

                            <ul className="signup-streaming-poc-capabilities">
                                {STREAMING_POC.capabilities.map(capability => (
                                    <li key={capability}>
                                        <FaCheck aria-hidden="true" />
                                        <span>{capability}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                type="button"
                                className="signup-streaming-primary-button signup-streaming-poc-button"
                                onClick={() => selectService(STREAMING_POC)}
                            >
                                {STREAMING_POC.actionLabel}
                                <FaArrowRight aria-hidden="true" />
                            </Button>
                        </div> */}

                        <div className="signup-streaming-section-heading signup-streaming-destination-heading">
                            <FaShieldAlt aria-hidden="true" />
                            <div>
                                <h2>CyberFlow Stream: End-to-End Data Streaming AI Analysis</h2>
                                <p>
                                    Choose integrated Data Streaming analysys, or full automated Managed Services.
                                </p>
                            </div>
                        </div>

                        <div className={upgradeMode ? 'signup-streaming-service-grid-2' : 'signup-streaming-service-grid-3'}>
                            {visibleDestinations.map(renderDestination)}
                        </div>
                    </section>

                    {/* <section className="signup-streaming-section signup-streaming-connect-section">
                        <div className="signup-streaming-section-heading">
                            <FaStream aria-hidden="true" />
                            <div>
                                <h2>Connect your data</h2>
                                <p>
                                    Keep the first integration simple: push events into ThreatLab and
                                    prove detection against your own data.
                                </p>
                            </div>
                        </div>

                        <div className="signup-streaming-connection-grid">
                            {visibleConnections.map(method => (
                                <article
                                    key={method.id}
                                    className="signup-streaming-connection-card"
                                >
                                    <div className="signup-streaming-connection-icon" aria-hidden="true">
                                        {method.icon}
                                    </div>
                                    <div>
                                        <h3>{method.name}</h3>
                                        <p>{method.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section> */}

                    <section className="signup-streaming-section signup-streaming-interactive-section">
                        <div className="signup-streaming-interactive-header">
                            <div className="signup-streaming-section-heading">
                                <GiBrain aria-hidden="true" />
                                <div>
                                    <h2>Cyber AI Assistant</h2>
                                    <p>
                                        Want human-led AI analysis? ThreatLab SaaS plans give you direct access to AI cyber security analysis.
                                    </p>
                                </div>
                            </div>

                            <BillingPeriodToggle
                                value={billingPeriod}
                                onChange={setBillingPeriod}
                                annualLabel="Save 20%"
                            />
                        </div>

                        <div className="signup-streaming-interactive-grid">
                            {visibleInteractivePlans.map(renderInteractivePlan)}
                        </div>

                        <div className="signup-streaming-price-note">
                            Interactive plan prices are USD per user, per month.
                        </div>
                    </section>

                    <footer className="signup-streaming-footer">
                        <span>Use of ThreatLab is subject to our </span>
                        {onShowTerms
                            ?
                            <button type="button" onClick={onShowTerms}>
                                Terms and Conditions
                            </button>
                            :
                            <span>Terms and Conditions</span>
                        }
                        <span>.</span>
                    </footer>

            </>
            }

            <CommercialContactModal
                open={Boolean(contactService)}
                interest={
                    contactService?.interest ||
                    'ThreatLab commercial services'
                }
                onClose={() => setContactService(null)}
            />
        </main>
    );
};


export {
    CONNECTION_METHODS,
    STREAMING_DESTINATIONS,
    STREAMING_POC,
    SignupPricingStreaming
};
