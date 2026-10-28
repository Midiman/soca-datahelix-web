import React, { useEffect, useRef, useState } from 'react';
import {
    FaArrowRight,
    FaNetworkWired,
    FaRedoAlt
} from 'react-icons/fa';

import { AutomationMgr } from './automation/AutomationMgr';
import { DashboardsWrapper } from '@hct/soca-dashboards';
import { DefaultBranding } from '../DefaultBranding';
import { searchService } from '@/_services/search.service';
import { Debug, getSessionProps } from '@/util/Utilities';


const AutomationMgrPortal = ({
    user = null,
    onCancel = null
}) =>
{
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
            className={`dashboards-portal-page${closing ? ' closing' : ''}`}
            onAnimationEnd={handleSlideAnimationEnd}
        >
            <section className="portal-card">
                <header className="portal-header">
                    <div className="portal-dashboard-brand">
                        <DefaultBranding orientation="horizontal" />
                    </div>

                    <button
                        type="button"
                        className="portal-dashboard-back"
                        onClick={handleBack}
                        disabled={closing}
                    >
                        Back
                        <FaArrowRight aria-hidden="true" />
                    </button>
                </header>

                <div className="portal-dashboard-content">
                    <AutomationMgr
                        app='threatlab'
                        user={user}
                        tenantId={getSessionProps?.tenantId}
                    />
                </div>
            </section>
        </main>
    );
};

export { AutomationMgrPortal };
