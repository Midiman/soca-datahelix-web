import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import {
    SOCATabButton,
    SOCATitleToolbar,
    Spinner
} from '@hct/soca-toolkit';
import {
    FaClipboardCheck,
    FaHistory,
    FaProjectDiagram
} from 'react-icons/fa';

import { AutomationList } from './AutomationList';
import { AutomationEditor } from './AutomationEditor';
import { ApprovalList } from './ApprovalList';
import { ExecutionHistory } from './ExecutionHistory';
import { ExecutionDetails } from './ExecutionDetails';
import { automationService } from './automation.service';
import { AUTOMATION_TABS, DEFAULT_METADATA } from './automation.constants';
import {
    clone,
    createAutomation,
    normaliseArrayResponse,
    responseError
} from './automation.utils';

const AutomationMgr = ({
    user = null,
    tenantId = null,
    service = automationService,
    title = 'Automation Management',
    subtitle = null,
    initialTab = AUTOMATION_TABS.AUTOMATIONS
}) =>
{
    const mountedRef = useRef(true);
    const lastLoadedTabRef = useRef(null);
    const [currentTab, setCurrentTab] = useState(initialTab);
    const [metadata, setMetadata] = useState(DEFAULT_METADATA);
    const [workflows, setWorkflows] = useState([]);
    const [automations, setAutomations] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [executions, setExecutions] = useState([]);
    const [selectedAutomation, setSelectedAutomation] = useState(null);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialised, setInitialised] = useState(false);
    const [saving, setSaving] = useState(false);
    const [approvalBusyId, setApprovalBusyId] = useState(null);
    const [error, setError] = useState(null);

    const context = {
        tenantId: tenantId || user?.tenantId || null,
        user
    };

    useEffect(() =>
    {
        mountedRef.current = true;
        initialise();

        return () =>
        {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() =>
    {
        if (!initialised || selectedAutomation || selectedExecution)
            return;

        if (lastLoadedTabRef.current === currentTab)
            return;

        lastLoadedTabRef.current = currentTab;
        loadCurrentTab();
    }, [currentTab, initialised]);

    async function initialise()
    {
        setLoading(true);
        setError(null);

        try
        {
            const [metadataResponse, workflowResponse] = await Promise.all([
                service.getAutomationMetadata(context),
                service.getAvailableWorkflows(context)
            ]);

            const metadataError = responseError(metadataResponse, 'Unable to load automation metadata.');
            const workflowError = responseError(workflowResponse, 'Unable to load CyberFlow workflows.');

            if (metadataError)
                throw new Error(metadataError);

            if (workflowError)
                throw new Error(workflowError);

            if (!mountedRef.current)
                return;

            setMetadata({
                ...DEFAULT_METADATA,
                ...(metadataResponse || {})
            });
            setWorkflows(normaliseArrayResponse(workflowResponse, ['workflows', 'flows']));

            if (currentTab === AUTOMATION_TABS.APPROVALS)
                await loadApprovals();
            else if (currentTab === AUTOMATION_TABS.HISTORY)
                await loadExecutionHistory();
            else
                await loadAutomations(false);

            if (mountedRef.current)
            {
                lastLoadedTabRef.current = currentTab;
                setInitialised(true);
            }
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to initialise Automation Management.');
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }

    async function loadCurrentTab()
    {
        if (currentTab === AUTOMATION_TABS.AUTOMATIONS)
            return loadAutomations();

        if (currentTab === AUTOMATION_TABS.APPROVALS)
            return loadApprovals();

        if (currentTab === AUTOMATION_TABS.HISTORY)
            return loadExecutionHistory();
    }

    async function loadAutomations(showLoading = true)
    {
        if (showLoading)
            setLoading(true);

        setError(null);

        try
        {
            const response = await service.getAutomations(context);
            const apiError = responseError(response, 'Unable to load automations.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
                setAutomations(normaliseArrayResponse(response, ['automations', 'rules']));
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to load automations.');
        }
        finally
        {
            if (mountedRef.current && showLoading)
                setLoading(false);
        }
    }

    async function loadApprovals()
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await service.getApprovals(context);
            const apiError = responseError(response, 'Unable to load approvals.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
                setApprovals(normaliseArrayResponse(response, ['approvals', 'pendingApprovals']));
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to load approvals.');
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }

    async function loadExecutionHistory()
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await service.getExecutionHistory(context);
            const apiError = responseError(response, 'Unable to load execution history.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
                setExecutions(normaliseArrayResponse(response, ['executions', 'history']));
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to load execution history.');
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }

    async function openAutomation(row)
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await service.getAutomation({ ...context, id: row.id });
            const apiError = responseError(response, 'Unable to load automation.');

            if (apiError)
                throw new Error(apiError);

            const automation = response?.automation || response?.data || row;

            if (mountedRef.current)
                setSelectedAutomation(clone(automation));
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to load automation.');
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }

    async function saveAutomation(automation)
    {
        setSaving(true);
        setError(null);

        try
        {
            const response = await service.saveAutomation({ ...context, automation });
            const apiError = responseError(response, 'Unable to save automation.');

            if (apiError)
                throw new Error(apiError);

            if (!mountedRef.current)
                return;

            setSelectedAutomation(null);
            await loadAutomations(false);
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to save automation.');
        }
        finally
        {
            if (mountedRef.current)
                setSaving(false);
        }
    }

    async function deleteAutomation(automation)
    {
        if (!automation?.id)
            return;

        if (!window.confirm(`Delete automation "${automation.name}"?`))
            return;

        setSaving(true);
        setError(null);

        try
        {
            const response = await service.deleteAutomation({ ...context, id: automation.id });
            const apiError = responseError(response, 'Unable to delete automation.');

            if (apiError)
                throw new Error(apiError);

            if (!mountedRef.current)
                return;

            setSelectedAutomation(null);
            await loadAutomations(false);
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to delete automation.');
        }
        finally
        {
            if (mountedRef.current)
                setSaving(false);
        }
    }

    async function toggleAutomation(row, enabled)
    {
        setError(null);

        try
        {
            const response = await service.setAutomationEnabled({
                ...context,
                id: row.id,
                enabled: Boolean(enabled)
            });
            const apiError = responseError(response, 'Unable to update automation status.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
            {
                setAutomations(current => current.map(item =>
                    item.id === row.id
                        ? { ...item, enabled: Boolean(enabled), ...(response?.automation || {}) }
                        : item
                ));
            }
        }
        catch (err)
        {
            if (mountedRef.current)
            {
                setError(err?.message || 'Unable to update automation status.');
                await loadAutomations(false);
            }
        }
    }

    async function resolveApproval(approval, decision)
    {
        setApprovalBusyId(approval.actionExecutionId);
        setError(null);

        try
        {
            const response = await service.resolveApproval({
                ...context,
                actionExecutionId: approval.actionExecutionId,
                decision
            });
            const apiError = responseError(response, 'Unable to update approval.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
                await loadApprovals();
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to update approval.');
        }
        finally
        {
            if (mountedRef.current)
                setApprovalBusyId(null);
        }
    }

    async function openExecution(row)
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await service.getAutomationExecution({
                ...context,
                executionId: row.executionId
            });
            const apiError = responseError(response, 'Unable to load execution details.');

            if (apiError)
                throw new Error(apiError);

            if (mountedRef.current)
                setSelectedExecution(response?.execution || response?.data || row);
        }
        catch (err)
        {
            if (mountedRef.current)
                setError(err?.message || 'Unable to load execution details.');
        }
        finally
        {
            if (mountedRef.current)
                setLoading(false);
        }
    }

    function renderTabs()
    {
        return (
            <>
                <SOCATabButton
                    label="Automations"
                    icon={FaProjectDiagram}
                    selected={currentTab === AUTOMATION_TABS.AUTOMATIONS}
                    onSelect={() => {
                        setSelectedAutomation(null);
                        setSelectedExecution(null);
                        setCurrentTab(AUTOMATION_TABS.AUTOMATIONS);
                    }}
                />
                <SOCATabButton
                    label="Approvals"
                    icon={FaClipboardCheck}
                    selected={currentTab === AUTOMATION_TABS.APPROVALS}
                    onSelect={() => {
                        setSelectedAutomation(null);
                        setSelectedExecution(null);
                        setCurrentTab(AUTOMATION_TABS.APPROVALS);
                    }}
                />
                <SOCATabButton
                    label="Execution History"
                    icon={FaHistory}
                    selected={currentTab === AUTOMATION_TABS.HISTORY}
                    onSelect={() => {
                        setSelectedAutomation(null);
                        setSelectedExecution(null);
                        setCurrentTab(AUTOMATION_TABS.HISTORY);
                    }}
                />
            </>
        );
    }

    function renderBody()
    {
        if (selectedAutomation)
        {
            return (
                <AutomationEditor
                    automation={selectedAutomation}
                    metadata={metadata}
                    workflows={workflows}
                    saving={saving}
                    onSave={saveAutomation}
                    onDelete={deleteAutomation}
                    onCancel={() => setSelectedAutomation(null)}
                />
            );
        }

        if (selectedExecution)
        {
            return (
                <ExecutionDetails
                    execution={selectedExecution}
                    onBack={() => setSelectedExecution(null)}
                />
            );
        }

        if (currentTab === AUTOMATION_TABS.APPROVALS)
        {
            return (
                <ApprovalList
                    approvals={approvals}
                    loading={loading}
                    busyId={approvalBusyId}
                    onResolve={resolveApproval}
                />
            );
        }

        if (currentTab === AUTOMATION_TABS.HISTORY)
        {
            return (
                <ExecutionHistory
                    executions={executions}
                    loading={loading}
                    onSelect={openExecution}
                />
            );
        }

        return (
            <AutomationList
                automations={automations}
                metadata={metadata}
                loading={loading}
                onCreate={() => setSelectedAutomation(createAutomation())}
                onEdit={openAutomation}
                onToggleEnabled={toggleAutomation}
            />
        );
    }

    return (
        <Container fluid className="automation-mgr base-container px-0">
            <SOCATitleToolbar
                icon={<FaProjectDiagram className="title-icon" />}
                title={subtitle ? <>{title}<div className="subtitle"> - {subtitle}</div></> : title}
            />

            <div className="automation-tabs tabs-row">
                {renderTabs()}
            </div>

            {error && (
                <div className="automation-alert automation-alert-error">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            {loading && !selectedAutomation && !selectedExecution && currentTab === AUTOMATION_TABS.AUTOMATIONS && automations.length === 0 ? (
                <div className="automation-initial-loading">
                    <Spinner />
                    <span>Loading Automation Management...</span>
                </div>
            ) : (
                <div className="automation-content">
                    {renderBody()}
                </div>
            )}
        </Container>
    );
};

export { AutomationMgr };
export default AutomationMgr;
