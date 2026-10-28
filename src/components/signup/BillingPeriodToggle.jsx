
import React from 'react';

const BILLING_MONTHLY = 'monthly';
const BILLING_ANNUAL = 'annual';

export const BillingPeriodToggle = ({
    value = BILLING_MONTHLY,
    onChange,
    annualLabel = null
}) => {

    // UI functions

    const handleMonthlyClick = () => {
        onChange?.(BILLING_MONTHLY);
    };

    const handleAnnualClick = () => {
        onChange?.(BILLING_ANNUAL);
    };

    // Render

    return (
        <div className="billing-period">
            <div
                className={`billing-period-toggle ${
                    value === BILLING_ANNUAL ? 'annual' : 'monthly'
                }`}
                role="group"
                aria-label="Billing period"
            >
                <button
                    type="button"
                    className={value === BILLING_MONTHLY ? 'active' : ''}
                    onClick={handleMonthlyClick}
                    aria-pressed={value === BILLING_MONTHLY}
                >
                    Monthly
                </button>

                <button
                    type="button"
                    className={value === BILLING_ANNUAL ? 'active' : ''}
                    onClick={handleAnnualClick}
                    aria-pressed={value === BILLING_ANNUAL}
                >
                    Annually
                </button>
            </div>

            {annualLabel && (
                <span className="billing-period-label">
                    {annualLabel}
                </span>
            )}
        </div>
    );
};

export {
    BILLING_MONTHLY,
    BILLING_ANNUAL
};