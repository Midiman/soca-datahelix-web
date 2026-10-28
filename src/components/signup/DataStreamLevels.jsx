import React, { useLayoutEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaStream
} from 'react-icons/fa';


/*
 * Keep the commercial packaging data-driven. Values here are deliberately
 * easy to change as the production tiers and rate limits are finalised.
 */
const DATA_STREAM_LEVELS = [
    {
        id: 'poc',
        name: 'PoC',
        kicker: 'Evaluation',
        description: 'Prove the stream, detection and notification workflow.',
        feeds: '1',
        throughput: 'PoC rate-limited',
        retention: '6 days',
        notifications: 'Email',
        automation: '-',
        deployment: 'Shared',
        onboarding: 'Webhook',
        support: 'Standard',
        featured: false
    },
    {
        id: 'small-business',
        name: 'Small Business',
        kicker: 'Production',
        description: 'Production streaming for a focused security environment.',
        feeds: 'Up to 3',
        throughput: 'Up to 8GB/day',
        retention: '30 days',
        notifications: 'Email',
        automation: 'Available',
        deployment: 'Managed SaaS Shared',
        onboarding: 'Multiple',
        support: 'Business',
        featured: false
    },
    {
        id: 'medium-business',
        name: 'Medium Business',
        kicker: 'Scale',
        description: 'Higher-volume analysis across multiple security feeds.',
        feeds: 'Up to 5',
        throughput: 'Up to 15GB/day',
        retention: '60 days',
        notifications: 'Email + MS Teams',
        automation: 'Available',
        deployment: 'Managed SaaS Shared',
        onboarding: 'Multiple',
        support: 'Business',
        featured: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        kicker: 'Custom',
        description: 'Custom capacity, deployment and operational requirements.',
        feeds: 'Custom',
        throughput: 'Custom / dedicated',
        retention: 'Custom',
        notifications: 'Custom',
        automation: 'Advanced',
        deployment: 'Managed SaaS / dedicated / on-premise',
        onboarding: 'Managed',
        support: 'Enterprise',
        featured: false
    }
];


const COMPARISON_ROWS = [
    { id: 'feeds', label: 'Data feeds' },
    { id: 'throughput', label: 'Throughput' },
    { id: 'retention', label: 'Event retention' },
    { id: 'notifications', label: 'Threat notifications' },
    { id: 'automation', label: 'CyberFlow automation' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'support', label: 'Support' }
];


const DataStreamLevels = ({
    backLabel = 'Back',
    onBack = null,
    onStartPoc = null,
    onCommercialContact = null
}) =>
{
    const pageRef = useRef(null);


    useLayoutEffect(() =>
    {
        const page = pageRef.current;

        if (!page)
            return;

        const scrollContainer =
            page.closest('.streaming-onboarding-page') ||
            page.closest('.signup-shell');

        if (scrollContainer)
        {
            scrollContainer.scrollTop = 0;
            return;
        }

        window.scrollTo(0, 0);
    }, []);


    function renderValue(value)
    {
        if (value === true)
        {
            return (
                <span className="data-stream-levels-included">
                    <FaCheck aria-hidden="true" />
                    Included
                </span>
            );
        }

        return value || '-';
    }


    function handleLevelAction(level)
    {
        if (level.id === 'poc')
        {
            onStartPoc?.();
            return;
        }

        onCommercialContact?.(level.name);
    }


    return (
        <div ref={pageRef} className="data-stream-levels-page">
            <button
                type="button"
                className="data-stream-levels-back"
                onClick={onBack}
            >
                <FaArrowLeft aria-hidden="true" />
                {backLabel}
            </button>

            <div className="data-stream-levels-heading">
                <div className="data-stream-levels-icon">
                    <FaStream aria-hidden="true" />
                </div>

                <div>
                    <div className="data-stream-levels-kicker">DataStream Levels</div>
                    <h1>Scale the stream as your environment grows</h1>
                    <p>
                        Start with the free PoC, then move to production capacity as you add
                        feeds, throughput and automation. Production levels are scoped to the
                        environment before a commercial order is raised.
                    </p>
                </div>
            </div>

            <div className="data-stream-levels-table-wrap">
                <table className="data-stream-levels-table">
                    <thead>
                        <tr>
                            <th className="data-stream-levels-feature-heading">
                                Compare levels
                            </th>

                            {DATA_STREAM_LEVELS.map(level => (
                                <th
                                    key={level.id}
                                    className={level.featured ? 'featured' : ''}
                                >
                                    <div className="data-stream-levels-plan-head">
                                        <span>{level.kicker}</span>
                                        <strong>{level.name}</strong>
                                        <small>{level.description}</small>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {COMPARISON_ROWS.map(row => (
                            <tr key={row.id}>
                                <th scope="row">{row.label}</th>

                                {DATA_STREAM_LEVELS.map(level => (
                                    <td
                                        key={`${level.id}-${row.id}`}
                                        className={level.featured ? 'featured' : ''}
                                    >
                                        {renderValue(level[row.id])}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        <tr className="data-stream-levels-actions-row">
                            <th scope="row">Next step</th>

                            {DATA_STREAM_LEVELS.map(level => (
                                <td
                                    key={`${level.id}-action`}
                                    className={level.featured ? 'featured' : ''}
                                >
                                    <Button
                                        type="button"
                                        className={
                                            level.id === 'poc'
                                                ? 'data-stream-levels-secondary'
                                                : 'data-stream-levels-primary'
                                        }
                                        onClick={() => handleLevelAction(level)}
                                    >
                                        {level.id === 'poc'
                                            ? 'Setup PoC'
                                            : 'Setup Production'
                                        }
                                        <FaArrowRight aria-hidden="true" />
                                    </Button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="data-stream-levels-note">
                <strong>Need something between these levels?</strong>
                <span>
                    SOCAutomation is designed to tailor to your specific needs. Select Enterprise to get in touch with us. We are happy to help with your organization's specific requirements.
                </span>
            </div>
        </div>
    );
};


export { DataStreamLevels };
