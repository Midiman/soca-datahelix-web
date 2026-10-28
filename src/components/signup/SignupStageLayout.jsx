import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { DefaultBranding } from '../DefaultBranding';


const SignupStageAside = ({
    kicker = null,
    title,
    price = null,
    priceNote = null,
    description = null,
    capabilities = [],
    children = null
}) =>
{
    return (
        <aside className="signup-stage-aside">
            <div className="signup-aside-content">
                {kicker &&
                    <div className="signup-aside-kicker">{kicker}</div>
                }

                <h2>{title}</h2>

                {price != null &&
                    <div className="signup-aside-price">{price}</div>
                }

                {priceNote &&
                    <div className="signup-aside-price-note">{priceNote}</div>
                }

                {description && <p>{description}</p>}

                {capabilities.length > 0 &&
                    <ul>
                        {capabilities.map(capability => (
                            <li key={capability}>{capability}</li>
                        ))}
                    </ul>
                }

                {children}
            </div>
        </aside>
    );
};


const SignupStageLayout = ({
    children,
    aside,
    onBack = null,
    backLabel = 'Plans',
    className = ''
}) =>
{
    const classes = ['signup-stage-page', className]
        .filter(Boolean)
        .join(' ');

    return (
        <main className={classes}>
            <section className="signup-stage-panel signup-form-panel">
                <div className="signup-stage-brand">
                    <DefaultBranding orientation="horizontal" />
                </div>

                {onBack &&
                    <button
                        type="button"
                        className="signup-back-button"
                        onClick={onBack}
                    >
                        <FaArrowLeft aria-hidden="true" />
                        {backLabel}
                    </button>
                }

                {children}
            </section>

            {aside}
        </main>
    );
};


export { SignupStageAside, SignupStageLayout };
