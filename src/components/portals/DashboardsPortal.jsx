import React, { useEffect, useRef, useState } from 'react';
import {
    FaArrowRight,
    FaNetworkWired,
    FaRedoAlt
} from 'react-icons/fa';

import { DashboardsWrapper } from '@hct/soca-dashboards';
import { DefaultBranding } from '../DefaultBranding';
import { searchService } from '@/_services/search.service';
import { Debug } from '@/util/Utilities';


const DashboardsPortal = ({
    user = null,
    incidentLink = null,
    onCancel = null
}) =>
{
    const [managementPoints, setManagementPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regeneratingId, setRegeneratingId] = useState(null);
    const mountedRef = useRef(true);
    const [closing, setClosing] = useState(false);

    if (Debug)
        console.log('DashboardsPortal ENTRY [ display ] incidentLink: ', incidentLink);

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
            className={`dashboards-portal-page${closing ? ' closing' : ''}`}
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

                <div className="portal-dashboard-content">
                    <DashboardsWrapper 
                        app='threatlab'
                        incidentLink={incidentLink || (window.location.href && window.location.href.includes('&operation=details&app=incident&id=') ? window.location.href : null)}
                        reportMode={undefined} 
                        title={undefined} 
                        subtitle={undefined}
                    />
                </div>
            </section>
        </main>
    );
};

export { DashboardsPortal };
