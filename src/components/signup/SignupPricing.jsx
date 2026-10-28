import React, { useState } from 'react';

import { Button } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaArrowRight,
    FaBuilding,
    FaCheck,
    FaCode,
    FaShieldAlt,
    FaStream
} from 'react-icons/fa';

import {
    BillingPeriodToggle,
    BILLING_ANNUAL
} from './BillingPeriodToggle';

import { DefaultBranding } from '../DefaultBranding';


const CURRENCY_USD = 'USD';
const CURRENCY_SYMBOL_USD = '$';
const CURRENCY_GBP = 'GBP';
const CURRENCY_SYMBOL_GBP = '£';
const CURRENCY_EUR = 'EUR';
const CURRENCY_SYMBOL_EUR = '€';

const CURRENCY_SYMBOLS = {
    [CURRENCY_USD]: CURRENCY_SYMBOL_USD,
    [CURRENCY_GBP]: CURRENCY_SYMBOL_GBP,
    [CURRENCY_EUR]: CURRENCY_SYMBOL_EUR
};

const DEFAULT_CURRENCY = CURRENCY_USD;

const PLAN_RANK = {
    free: 0,
    business: 1,
    pro: 2,
    enterprise: 3
};



/*
 * Set visible=false to remove a tier from the current release.
 * Paid tiers use Contact until eCommerce is connected.
 */
const SIGNUP_PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: {
            monthly: {
                USD: 0
            },
            annual: {
                USD: 0
            }
        },
        strapline: "Explore ThreatLab's capabilities with a free AI Assistant account.",
        // badge: 'Start here',
        action: 'signup',
        actionLabel: 'Create free account',
        requiresBilling: false,
        featured: false,
        visible: true,
        capabilities: [
            'DataHelix AI threat analysis',
            'Higher allowance than Guest access',
            'Email notifications',
            'Individual, non-commercial use only'
        ]
    },
    {
        id: 'business',
        name: 'Business',
        price: {
            monthly: {
                USD: 27
            },
            annual: {
                USD: 22
            }
        },
        strapline: 'For everyday human-led AI threat analysis.',
        action: 'contact',
        actionLabel: 'Contact',
        requiresBilling: true,
        featured: false,
        visible: true,
        capabilities: [
            'Higher interactive analysis limits',
            'Limited Deep Thinking allowance',
            'No advertising',
            'Basic export',
            'Commercial use'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: {
            monthly: {
                USD: 117
            },
            annual: {
                USD: 97
            }
        },
        strapline: 'For professional analysts who need more depth and capacity.',
        badge: 'Most popular',
        action: 'contact',
        actionLabel: 'Contact',
        requiresBilling: true,
        featured: true,
        visible: true,
        capabilities: [
            'Highest interactive analysis limits',
            'Expanded Deep Thinking allowance',
            'Notifications',
            'Richer export and analysis features',
            'Commercial use'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        strapline: 'Custom capabilities for security teams and enterprise workflows.',
        action: 'contact',
        actionLabel: 'Contact',
        requiresBilling: true,
        featured: false,
        visible: true,
        capabilities: [
            'Full SOCAutomation platform',
            'Company licensing and controls',
            'Advanced integrations',
            'Enterprise deployment options'
        ]
    }
];


const AUTOMATED_SOC_PLANS = [
    {
        id: 'automated-managed-security',
        name: 'Automated Managed Security Services',
        icon: <FaShieldAlt />,
        visible: true,
        capabilities: [
            'Continuous managed threat monitoring and analysis',
            'Automated investigation, response and escalation',
            'Options for human-led response for critical attacks',
            'MSSP-style security service 24/7/365'
        ]
    },
    {
        id: 'automated-soc-api',
        name: 'Automated SOC - API',
        icon: <FaCode />,
        visible: true,
        capabilities: [
            'Programmatic DataHelix AI and Deep Thinking analysis',
            'Request-based high-throughput commercial tiers',
            'Application and workflow integration',
            'Structured responses for automated downstream processing'
        ]
    },
    {
        id: 'automated-soc-streaming',
        name: 'Automated SOC - Streaming',
        icon: <FaStream />,
        visible: true,
        capabilities: [
            'Continuous autonomous analysis',
            'Source/webhook and EPS-based tiers',
            'Notifications and integrations',
            'Perfect for adding security to Data Pipeline Platforms'
        ]
    }
];


const ThreatLabMark = () => (
    <svg
        className="signup-threatlab-mark"
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

/**
 * 
 * >>>>> CLASS START <<<<<

 */
const SignupPricing = ({
    onSelectPlan,
    onLogin = null,
    onCancel = null,
    onShowTerms = null,
    upgradeMode = false,
    currentPlan = 'free'
}) =>
{
    const [billingPeriod, setBillingPeriod] = useState(BILLING_ANNUAL);
    const currency = DEFAULT_CURRENCY;
    const currentPlanId = getPlanId(currentPlan);
    const currentPlanName = SIGNUP_PLANS.find(plan => plan.id === currentPlanId)?.name || currentPlanId;


    function getPlanId(value)
    {
        if (!value)
            return 'free';

        if (typeof value === 'string')
            return value.trim().toLowerCase();

        return String(
            value.id || value.plan || value.name || 'free'
        ).trim().toLowerCase();
    }


    function getVisiblePlans()
    {
        return SIGNUP_PLANS.filter(plan =>
        {
            if (!plan.visible)
                return false;

            if (!upgradeMode)
                return true;

            return (PLAN_RANK[plan.id] ?? 0) > (PLAN_RANK[currentPlanId] ?? 0);
        });
    }


    function selectPlan(plan)
    {
        onSelectPlan({
            ...plan,
            billingPeriod,
            currency,
            currencySymbol: CURRENCY_SYMBOLS[currency],
            selectedPrice: plan.price
                ? plan.price[billingPeriod][currency]
                : null
        });
    }

    function renderPlan(plan)
    {
        return (
            <article
                key={plan.id}
                className={`signup-plan-card ${plan.featured ? 'featured' : ''}`}
                onClick={() => selectPlan(plan)}
            >
                <div className="signup-plan-card-top">
                    <div>
                        <h2>{plan.name}</h2>
                        <div className="signup-plan-price">
                            {plan.price
                                ? `${CURRENCY_SYMBOLS[currency]}${plan.price[billingPeriod][currency]}`
                                : 'Customize'
                            }
                        </div>
                    </div>
                    {plan.badge &&
                        <span className="signup-plan-badge">{plan.badge}</span>
                    }
                </div>

                <p className="signup-plan-strapline">{plan.strapline}</p>

                <ul className="signup-capability-list">
                    {plan.capabilities.map(capability => (
                        <li key={capability}>
                            <FaCheck aria-hidden="true" />
                            <span>{capability}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    type="button"
                    className={plan.featured ? 'signup-plan-button featured' : 'signup-plan-button'}
                    onClick={(evt) =>
                    {
                        evt.stopPropagation();
                        selectPlan(plan);
                    }}
                >
                    {plan.actionLabel}
                    <FaArrowRight aria-hidden="true" />
                </Button>
            </article>
        );
    }


    function renderAutomatedSocPlan(plan)
    {
        return (
            <article
                key={plan.id}
                className="signup-automation-card"
                onClick={() => selectPlan({
                    ...plan,
                    action: 'contact'
                })}
            >
                <div className="signup-automation-header">
                    <div className="signup-automation-icon" aria-hidden="true">
                        {plan.icon}
                    </div>

                    <h3>{plan.name}</h3>

                    <Button
                        type="button"
                        className="signup-secondary-button"
                        onClick={(evt) =>
                        {
                            evt.stopPropagation();
                            selectPlan({
                                ...plan,
                                action: 'contact'
                            });
                        }}
                    >
                        Contact
                    </Button>
                </div>

                <ul className="signup-automation-benefits">
                    {plan.capabilities.map(capability => (
                        <li key={capability}>{capability}</li>
                    ))}
                </ul>
            </article>
        );
    }


    return (
        <main className="signup-pricing-page">
            <header className="signup-pricing-header">
                <div className="signup-pricing-brand">
                    <DefaultBranding orientation="horizontal" />
                </div>

                <div className="signup-pricing-actions">
                    {onCancel &&
                        <Button
                            type="button"
                            className="signup-header-link"
                            onClick={onCancel}
                        >
                            <FaArrowLeft aria-hidden="true" />
                            Back to ThreatLab
                        </Button>
                    }

                    {onLogin &&
                        <Button
                            type="button"
                            className="signup-header-button"
                            onClick={onLogin}
                        >
                            Sign in
                        </Button>
                    }
                </div>
            </header>

            <section className="signup-pricing-intro">
                <div className="signup-eyebrow signup-threatlab-eyebrow">
                    <ThreatLabMark />
                    <div className="threatlab-brand-name">
                        <span>THREAT</span>LAB
                    </div>
                </div>
                <h4 className="signup-eyebrow-subtitle">The future of Cyber Security is Automated</h4>
                <h1>
                    {upgradeMode
                        ? <>Choose your next level of ThreatLab</>
                        : <>Choose the depth of knowledge<br/>to fit how you work</>
                    }
                </h1>
                <p>
                    {upgradeMode
                        ? `Showing plans above your current ${currentPlanName} plan.`
                        : 'Start free, then move to higher analysis capacity or automated services when you need them.'
                    }
                </p>
                <div className="signup-price-note">
                    Prices shown are USD per user, per month.
                </div>
            </section>

            <BillingPeriodToggle
                value={billingPeriod}
                onChange={setBillingPeriod}
                annualLabel="Save 20%"
            />

            <section className={`signup-plan-grid ${upgradeMode ? 'upgrade' : ''}`}>
                {getVisiblePlans().map(renderPlan)}
            </section>

            {AUTOMATED_SOC_PLANS.some(plan => plan.visible) &&
                <section className="signup-automation-section">
                    <div className="signup-section-heading">
                        <FaBuilding aria-hidden="true" />
                        <div>
                            <h2>Automated SOC Services</h2>
                            <p>Data-driven always-on threat analysis.</p>
                        </div>
                    </div>

                    <div className="signup-automation-grid">
                        {AUTOMATED_SOC_PLANS
                            .filter(plan => plan.visible)
                            .map(renderAutomatedSocPlan)
                        }
                    </div>
                </section>
            }

            <footer className="signup-pricing-footer">
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
        </main>
    );
};

export { AUTOMATED_SOC_PLANS, SIGNUP_PLANS, SignupPricing };
