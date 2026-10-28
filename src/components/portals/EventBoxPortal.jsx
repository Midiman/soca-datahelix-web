import React, { useEffect, useRef, useState } from 'react';
import {
    FaArrowRight,
    FaNetworkWired,
    FaRedoAlt
} from 'react-icons/fa';

import { EventBoxWrapper } from '@hct/soca-eventbox';
import { DefaultBranding } from '../DefaultBranding';
import { searchService } from '@/_services/search.service';
import { Debug } from '@/util/Utilities';


const EventBoxPortal = ({
    user = null,
    onCancel = null
}) =>
{
    const [managementPoints, setManagementPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regeneratingId, setRegeneratingId] = useState(null);
    const mountedRef = useRef(true);
    const [closing, setClosing] = useState(false);


    function handleBack()
    {
        if (Debug)
            console.log('handleBack ENTRY', closing)
        if (closing)
            return;

        setClosing(true);
    }


    function handleSlideAnimationEnd(event)
    {
        if (!closing || event.target !== event.currentTarget)
            return;

        onCancel?.();
    }

    return (
        <main
            className={`eventbox-portal dashboards-portal-page${closing ? ' closing' : ''}`}
            onAnimationEnd={handleSlideAnimationEnd}
        >
            <section className="portal-dashboard-card">
                <header className="portal-dashboard-header">
                    <div className="portal-dashboard-brand">
                        <DefaultBranding orientation="horizontal" />
                    </div>

                    <button
                        type="button"
                        className="portal-dashboard-back"
                        onClick={handleBack}
                        // disabled={closing}
                    >
                        Back
                        <FaArrowRight aria-hidden="true" />
                    </button>
                </header>

                <div className="portal-eventbox-content">
                    <EventBoxWrapper 
                        app='threatlab'
                    />
                </div>
            </section>
        </main>
    );
};

export { EventBoxPortal };
