import React, { useEffect, useRef, useState } from 'react';
import {
    FaArrowRight,
    FaNetworkWired,
    FaRedoAlt
} from 'react-icons/fa';

import { SmartIRWrapper } from '@hct/soca-smartir';
import { searchService } from '@/_services/search.service';
import { DefaultBranding } from '../DefaultBranding';


const ManagementPortal = ({
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

    useEffect(() =>
    {
        mountedRef.current = true;
        loadManagementPoints();

        return () =>
        {
            mountedRef.current = false;
        };
    }, []);


    function getResponseError(response, fallback)
    {
        if (!response)
            return fallback;

        if (response?.ok === false || response?.status >= 400 || response?.error)
            return response.error || response.message || fallback;

        return null;
    }


    function normaliseManagementPoints(response)
    {
        const points = Array.isArray(response)
            ? response
            : (
                response?.ingestPoints ||
                response?.points ||
                response?.webhooks ||
                response?.items ||
                response?.data ||
                []
            );

        return Array.isArray(points) ? points : [];
    }


    async function loadManagementPoints()
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await searchService.getThreatLabManagementPoints({
                tenantId: user?.tenantId || null
            });

            const responseError = getResponseError(
                response,
                'Unable to load management portal.'
            );

            if (responseError)
                throw new Error(responseError);

            if (mountedRef.current)
                setManagementPoints(normaliseManagementPoints(response));
        }
        catch (err)
        {
            if (mountedRef.current)
            {
                setManagementPoints([]);
                setError(err?.message || 'Unable to load management portal.');
            }
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }


    async function regenerateToken(point, index)
    {
        const ingestPointId =
            point?.id ||
            point?.ingestPointId ||
            point?.key ||
            point?.name ||
            String(index);

        if (regeneratingId !== null)
            return;

        setRegeneratingId(ingestPointId);
        setError(null);

        try
        {
            const response = await searchService.regenerateThreatLabIngestToken({
                ingestPointId,
                type: point?.type || 'webhook',
                tenantId: user?.tenantId || null
            });

            const responseError = getResponseError(
                response,
                'Unable to regenerate the ingest credential.'
            );

            if (responseError)
                throw new Error(responseError);

            await loadManagementPoints();
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to regenerate the ingest credential.');
        }
        finally
        {
            if (mountedRef.current)
                setRegeneratingId(null);
        }
    }


    function formatDate(value)
    {
        if (!value)
            return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime()))
            return String(value);

        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }


    function getPointId(point, index)
    {
        return point?.id || point?.ingestPointId || point?.key || `${point?.type || 'ingest'}-${index}`;
    }


    function getType(point)
    {
        const type = String(point?.type || point?.ingestType || 'webhook').trim();

        return type
            ? type.charAt(0).toUpperCase() + type.slice(1)
            : 'Webhook';
    }


    function getName(point, index)
    {
        return point?.name || point?.displayName || point?.label || `Ingest point ${index + 1}`;
    }


    function getEndpoint(point)
    {
        return point?.endpoint || point?.url || point?.uri || '-';
    }


    function getExpiry(point)
    {
        return point?.expiresAt || point?.expiry || point?.expiryDate || point?.expires || null;
    }


    function getStatus(point)
    {
        return point?.status || (point?.enabled === false ? 'disabled' : 'active');
    }

    function handleBack()
    {
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
            className={`management-points-page${closing ? ' closing' : ''}`}
            onAnimationEnd={handleSlideAnimationEnd}
        >
            <section className="management-points-card">
                <header className="management-points-header">
                    <div className="management-points-brand">
                        <DefaultBranding orientation="horizontal" />
                    </div>

                    <button
                        type="button"
                        className="management-points-back"
                        onClick={handleBack}
                        disabled={closing}
                    >
                        Back
                        <FaArrowRight aria-hidden="true" />
                    </button>
                </header>

                <div className="management-points-content">

                    <SmartIRWrapper app='threatlab'/>

                    {/* <div className="management-points-heading">
                        <FaNetworkWired aria-hidden="true" />
                        <div>
                            <h2>Management Portal</h2>
                            <p>Manage data ingest, alerts, notifications.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="management-points-alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadManagementPoints}>Try again</button>
                        </div>
                    )}

                    {loading && (
                        <div className="management-points-loading">Loading Management portal...</div>
                    )}

                    {!loading && !error && managementPoints.length === 0 && (
                        <div className="management-points-empty">
                            No Management permissions are configured for this account.
                        </div>
                    )}

                    {!loading && managementPoints.length > 0 && (
                        <div className="management-points-table-wrap">
                        <table className="management-points-table">
                            <thead>
                                <tr>
                                        <th>Type</th>
                                        <th>Name</th>
                                        <th>Endpoint</th>
                                        <th>Credential</th>
                                        <th>Expiry</th>
                                        <th>Status</th>
                                        <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                    {managementPoints.map((point, index) =>
                                    {
                                        const pointId = getPointId(point, index);
                                        const busy = regeneratingId === pointId;

                                        return (
                                            <tr key={pointId}>
                                                <td>
                                                    <span className="management-type-badge">
                                                        {getType(point)}
                                                    </span>
                                                </td>
                                                <td>{getName(point, index)}</td>
                                                <td>
                                                    <code className="management-endpoint">
                                                        {getEndpoint(point)}
                                                    </code>
                                                </td>
                                                <td>
                                                    <span className="management-token-obscured" aria-label="Token hidden">
                                                        ••••••••••••
                                                    </span>
                                                </td>
                                                <td>{formatDate(getExpiry(point))}</td>
                                                <td>
                                                    <span className={`management-status management-status-${String(getStatus(point)).toLowerCase()}`}>
                                                        {getStatus(point)}
                                                    </span>
                                                </td>
                                                <td className="management-actions">
                                                    <button
                                                        type="button"
                                                        className="management-regenerate"
                                                        onClick={() => regenerateToken(point, index)}
                                                        disabled={regeneratingId !== null}
                                                        title="Generate a new credential for this management point"
                                                    >
                                                        <FaRedoAlt aria-hidden="true" />
                                                        {busy ? 'Regenerating...' : 'Regenerate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                            </table>
                        </div>
                    )} */}
                </div>
            </section>
        </main>
    );
};


export { ManagementPortal };
