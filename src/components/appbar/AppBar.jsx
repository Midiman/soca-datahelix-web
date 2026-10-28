import React from 'react';
import {
    FaChartBar,
    FaComments,
    FaChevronLeft,
    FaChevronRight,
    FaInbox,
    FaProjectDiagram,
    FaFileAlt,
    FaSlidersH
} from 'react-icons/fa';
import { Debug, getSessionProps } from '@/util/Utilities';


const APP_BAR_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: FaChartBar,
        handler: 'onDashboard',
        enabled: true
    },
    {
        id: 'assistant',
        label: 'AI Cyber Assistant',
        icon: FaComments,
        handler: 'onCyberAssistant',
        enabled: true
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: FaFileAlt,
        handler: 'onReports',
        enabled: false
    },
    {
        id: 'automation',
        label: 'Automation Manager',
        icon: FaProjectDiagram,
        handler: 'onAutomationMgr',
        enabled: false
    },
    {
        id: 'eventbox',
        label: 'EventBox',
        icon: FaInbox,
        handler: 'onEventBox',
        enabled: false
    },
    {
        id: 'management',
        label: 'Management Portal',
        icon: FaSlidersH,
        handler: 'onManagementPoints',
        enabled: false
    }
];


const AppBar = ({
    expanded = false,
    activeApp = null,
    onExpandedChange = null,
    onDashboard = null,
    onCyberAssistant = null,
    onReports = null,
    onAutomationMgr = null,
    onEventBox = null,
    onManagementPoints = null
}) =>
{
    const handlers = {
        onDashboard,
        onCyberAssistant,
        onReports,
        onAutomationMgr,
        onEventBox,
        onManagementPoints
    };


    function toggleExpanded()
    {
        if (typeof onExpandedChange === 'function')
            onExpandedChange(!expanded);
    }


    function handleAppClick(handlerName)
    {
        const handler = handlers[handlerName];

        if (typeof handler === 'function')
            handler();
    }


    return (
        <aside
            className={`threatlab-app-bar${expanded ? ' expanded' : ''}`}
            aria-label="ThreatLab applications"
        >
            <div className="threatlab-app-bar-header">
                <button
                    type="button"
                    className="threatlab-app-bar-toggle"
                    onClick={toggleExpanded}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse application bar' : 'Expand application bar'}
                    title={expanded ? 'Collapse applications' : 'Expand applications'}
                >
                    <span className="threatlab-app-bar-icon">
                        {expanded
                            ? <FaChevronLeft aria-hidden="true" />
                            : <FaChevronRight aria-hidden="true" />
                        }
                    </span>

                    <span className="threatlab-app-bar-label">
                        Applications
                    </span>
                </button>
            </div>

            <nav className="threatlab-app-bar-nav" aria-label="Application launchers">
                {APP_BAR_ITEMS.map(item =>
                {
                    const Icon = item.icon;
                    const handler = handlers[item.handler];
                    let disabled = typeof handler !== 'function' || !item.enabled;
                    const active = activeApp === item.id;

//PDS TEST                    
                    // if (!item.label.includes('Assistant') && (getSessionProps() == undefined || getSessionProps()?.email.includes('sturge')))
                    // {
                    //     if (Debug)
                    //         console.log('Skipping app item @ ' + item.label);
                    //     return
                    // }
                    if (!item.label.includes('Assistant') && (getSessionProps() == undefined || !getSessionProps()?.email.includes('sturge')))
                    {
                        if (Debug)
                            console.log('Disabling app item @ ' + item.label);
                        item.enabled = false;
                        disabled = true;
                    }

                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`threatlab-app-bar-item${active ? ' active' : ''}`}
                            onClick={() => handleAppClick(item.handler)}
                            disabled={disabled}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                            title={expanded && item.enabled ? undefined : item.enabled ? item.label : 'Upgrade to enable ' + item.label}
                        >
                            <span className="threatlab-app-bar-icon">
                                <Icon aria-hidden="true" />
                            </span>

                            <span className="threatlab-app-bar-label">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};


export { AppBar };
