/*
 * Placeholder Automation Manager service.
 *
 * This deliberately has no dependency on the soca-web-client searchService so
 * the automation UI can move into @hct/soca-smartir without being coupled to a
 * host application.
 *
 * Replace these methods with Gatekeeper API calls, or pass an alternative
 * service object to <AutomationMgr service={...}/>.
 */

import { DEFAULT_METADATA } from './automation.constants';
import { clone, createId } from './automation.utils';

const now = Date.now();

let automations = [
    {
        id: 'automation-critical-incident-soc',
        name: 'Critical Incident SOC Notification',
        description: 'Notify the SOC team when a critical incident is generated.',
        enabled: true,
        priority: 100,
        trigger: {
            type: 'incident.created',
            config: {}
        },
        conditions: {
            mode: 'builder',
            match: 'all',
            clauses: [
                {
                    id: 'condition-critical',
                    field: 'incident.severity',
                    operator: 'eq',
                    value: 'critical'
                }
            ],
            expression: "(incident.severity == 'critical')"
        },
        matchBehaviour: 'continue',
        actions: [
            {
                id: 'action-teams-soc',
                order: 10,
                workflowId: 'cyberflow-teams-soc-message',
                name: 'Send SOC Teams message',
                executionMode: 'automatic',
                parameters: {
                    channel: 'SOC Incidents'
                },
                tools: ['teams.soc-channel'],
                approval: {
                    timeoutSeconds: 1800,
                    timeoutAction: 'deny',
                    timeoutConfig: ''
                }
            }
        ],
        errorBehaviour: 'stop',
        version: 3,
        createdAt: new Date(now - 30 * 86400000).toISOString(),
        createdBy: 'security-admin@example.invalid',
        updatedAt: new Date(now - 12 * 60000).toISOString(),
        updatedBy: 'security-admin@example.invalid',
        lastRunAt: new Date(now - 2 * 60000).toISOString()
    },
    {
        id: 'automation-actor-correlation',
        name: 'Correlated Actor Containment',
        description: 'Request approval before containment when a known actor is seen again on an existing incident.',
        enabled: true,
        priority: 80,
        trigger: {
            type: 'incident.alert_added',
            config: {}
        },
        conditions: {
            mode: 'builder',
            match: 'all',
            clauses: [
                {
                    id: 'condition-high-severity',
                    field: 'alert.severity',
                    operator: 'eq',
                    value: 'high'
                },
                {
                    id: 'condition-confidence',
                    field: 'alert.confidence',
                    operator: 'gte',
                    value: 80
                }
            ],
            expression: "(alert.severity == 'high') && (alert.confidence >= 80)"
        },
        matchBehaviour: 'stop',
        actions: [
            {
                id: 'action-contain-host',
                order: 10,
                workflowId: 'cyberflow-contain-host',
                name: 'Contain host',
                executionMode: 'approval',
                parameters: {},
                tools: ['endpoint.isolation'],
                approval: {
                    timeoutSeconds: 1800,
                    timeoutAction: 'deny',
                    timeoutConfig: ''
                }
            },
            {
                id: 'action-notify-after',
                order: 20,
                workflowId: 'cyberflow-teams-soc-message',
                name: 'Notify SOC Team',
                executionMode: 'automatic',
                parameters: {
                    channel: 'SOC Incidents'
                },
                tools: ['teams.soc-channel'],
                approval: {
                    timeoutSeconds: 1800,
                    timeoutAction: 'deny',
                    timeoutConfig: ''
                }
            }
        ],
        errorBehaviour: 'stop',
        version: 2,
        createdAt: new Date(now - 14 * 86400000).toISOString(),
        createdBy: 'security-admin@example.invalid',
        updatedAt: new Date(now - 65 * 60000).toISOString(),
        updatedBy: 'security-admin@example.invalid',
        lastRunAt: new Date(now - 17 * 60000).toISOString()
    }
];

const workflows = [
    {
        id: 'cyberflow-teams-soc-message',
        name: 'Send SOC Teams Message',
        description: 'Posts incident context and a direct incident link to the configured SOC Teams channel.'
    },
    {
        id: 'cyberflow-contain-host',
        name: 'Contain Host',
        description: 'Invokes the configured endpoint isolation workflow.'
    },
    {
        id: 'cyberflow-create-ticket',
        name: 'Create Service Ticket',
        description: 'Creates a ticket using the configured service-management integration.'
    }
];

let approvals = [
    {
        actionExecutionId: 'action-exec-2001',
        executionId: 'automation-exec-2001',
        incidentId: 'INC-48291',
        incidentUrl: null,
        automationId: 'automation-actor-correlation',
        automationName: 'Correlated Actor Containment',
        actionName: 'Contain host',
        createdAt: new Date(now - 6 * 60000).toISOString(),
        expiresAt: new Date(now + 24 * 60000).toISOString(),
        status: 'pending'
    }
];

const executions = [
    {
        executionId: 'automation-exec-2002',
        automationId: 'automation-critical-incident-soc',
        automationVersion: 3,
        automationName: 'Critical Incident SOC Notification',
        incidentId: 'INC-48296',
        triggerType: 'incident.created',
        triggeringAlertId: 'ALT-99217',
        startedAt: new Date(now - 2 * 60000).toISOString(),
        completedAt: new Date(now - 2 * 60000 + 1500).toISOString(),
        status: 'completed',
        conditionResults: [
            {
                field: 'incident.severity',
                operator: 'eq',
                expected: 'critical',
                actual: 'critical',
                matched: true
            }
        ],
        actionExecutions: [
            {
                actionExecutionId: 'action-exec-2002-a1',
                actionId: 'action-teams-soc',
                actionName: 'Send SOC Teams message',
                status: 'completed',
                startedAt: new Date(now - 2 * 60000 + 500).toISOString(),
                completedAt: new Date(now - 2 * 60000 + 1400).toISOString(),
                output: 'Message accepted by CyberFlow.'
            }
        ]
    },
    {
        executionId: 'automation-exec-2001',
        automationId: 'automation-actor-correlation',
        automationVersion: 2,
        automationName: 'Correlated Actor Containment',
        incidentId: 'INC-48291',
        triggerType: 'incident.alert_added',
        triggeringAlertId: 'ALT-99212',
        startedAt: new Date(now - 6 * 60000).toISOString(),
        completedAt: null,
        status: 'awaiting_approval',
        conditionResults: [
            {
                field: 'alert.severity',
                operator: 'eq',
                expected: 'high',
                actual: 'high',
                matched: true
            },
            {
                field: 'alert.confidence',
                operator: 'gte',
                expected: 80,
                actual: 94,
                matched: true
            }
        ],
        actionExecutions: [
            {
                actionExecutionId: 'action-exec-2001',
                actionId: 'action-contain-host',
                actionName: 'Contain host',
                status: 'awaiting_approval',
                startedAt: new Date(now - 6 * 60000 + 500).toISOString(),
                completedAt: null,
                output: null
            }
        ]
    }
];

function delay(value, ms = 100)
{
    return new Promise(resolve => setTimeout(() => resolve(clone(value)), ms));
}

function contextUser(context)
{
    return context?.user?.email || context?.user?.username || 'current-user';
}

async function getAutomationMetadata()
{
    return delay({ ok: true, ...DEFAULT_METADATA });
}

async function getAvailableWorkflows()
{
    return delay({ ok: true, workflows });
}

async function getAutomations()
{
    const ordered = [...automations].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
    return delay({ ok: true, automations: ordered });
}

async function getAutomation({ id })
{
    const automation = automations.find(item => item.id === id);

    if (!automation)
        return delay({ ok: false, status: 404, error: 'Automation not found.' });

    return delay({ ok: true, automation });
}

async function saveAutomation({ automation, user = null })
{
    const timestamp = new Date().toISOString();
    const next = clone(automation);
    const existingIndex = next.id
        ? automations.findIndex(item => item.id === next.id)
        : -1;

    if (existingIndex >= 0)
    {
        const existing = automations[existingIndex];
        next.version = Number(existing.version || 0) + 1;
        next.createdAt = existing.createdAt;
        next.createdBy = existing.createdBy;
        next.updatedAt = timestamp;
        next.updatedBy = contextUser({ user });
        automations[existingIndex] = next;
    }
    else
    {
        next.id = createId('automation');
        next.version = 1;
        next.createdAt = timestamp;
        next.createdBy = contextUser({ user });
        next.updatedAt = timestamp;
        next.updatedBy = contextUser({ user });
        automations = [...automations, next];
    }

    return delay({ ok: true, automation: next });
}

async function deleteAutomation({ id })
{
    automations = automations.filter(item => item.id !== id);
    return delay({ ok: true });
}

async function setAutomationEnabled({ id, enabled, user = null })
{
    const existing = automations.find(item => item.id === id);

    if (!existing)
        return delay({ ok: false, status: 404, error: 'Automation not found.' });

    existing.enabled = Boolean(enabled);
    existing.version = Number(existing.version || 0) + 1;
    existing.updatedAt = new Date().toISOString();
    existing.updatedBy = contextUser({ user });

    return delay({ ok: true, automation: existing });
}

async function getApprovals()
{
    return delay({ ok: true, approvals });
}

async function resolveApproval({ actionExecutionId, decision })
{
    const approval = approvals.find(item => item.actionExecutionId === actionExecutionId);

    if (!approval)
        return delay({ ok: false, status: 404, error: 'Approval request not found.' });

    approval.status = decision === 'approve' ? 'approved' : 'denied';
    approval.decidedAt = new Date().toISOString();
    return delay({ ok: true, approval });
}

async function getExecutionHistory()
{
    return delay({ ok: true, executions });
}

async function getAutomationExecution({ executionId })
{
    const execution = executions.find(item => item.executionId === executionId);

    if (!execution)
        return delay({ ok: false, status: 404, error: 'Execution not found.' });

    return delay({ ok: true, execution });
}

export const automationService = {
    getAutomationMetadata,
    getAvailableWorkflows,
    getAutomations,
    getAutomation,
    saveAutomation,
    deleteAutomation,
    setAutomationEnabled,
    getApprovals,
    resolveApproval,
    getExecutionHistory,
    getAutomationExecution
};
