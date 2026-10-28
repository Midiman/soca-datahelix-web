export const AUTOMATION_TABS = {
    AUTOMATIONS: 'automations',
    APPROVALS: 'approvals',
    HISTORY: 'history'
};

export const AUTOMATION_MATCH_BEHAVIOUR = {
    CONTINUE: 'continue',
    STOP: 'stop'
};

export const AUTOMATION_ERROR_BEHAVIOUR = {
    STOP: 'stop',
    CONTINUE: 'continue'
};

export const EXECUTION_MODES = {
    AUTOMATIC: 'automatic',
    APPROVAL: 'approval'
};

export const CONDITION_MODES = {
    BUILDER: 'builder',
    JEXL: 'jexl'
};

export const CONDITION_MATCH = {
    ALL: 'all',
    ANY: 'any'
};

export const DEFAULT_TRIGGER_TYPES = [
    {
        value: 'incident.created',
        label: 'New incident generated',
        description: 'A new incident is created for an alert that does not correlate to an existing incident.'
    },
    {
        value: 'incident.alert_added',
        label: 'Alert added to existing incident',
        description: 'A newly generated alert is correlated and added to an existing incident.'
    }
];

export const DEFAULT_CONDITION_FIELDS = [
    { value: 'incident.severity', label: 'Incident severity', type: 'string' },
    { value: 'incident.category', label: 'Incident category', type: 'string' },
    { value: 'incident.status', label: 'Incident status', type: 'string' },
    { value: 'incident.id', label: 'Incident ID', type: 'string' },
    { value: 'alert.severity', label: 'Alert severity', type: 'string' },
    { value: 'alert.category', label: 'Alert category', type: 'string' },
    { value: 'alert.type', label: 'Alert type', type: 'string' },
    { value: 'alert.confidence', label: 'Alert confidence', type: 'number' },
    { value: 'alert.source', label: 'Alert source', type: 'string' },
    { value: 'alert.actor.ip', label: 'Actor IP', type: 'string' },
    { value: 'alert.actor.user', label: 'Actor user', type: 'string' },
    { value: 'event.sourceType', label: 'Event source type', type: 'string' }
];

export const DEFAULT_OPERATORS = [
    { value: 'eq', label: '=', jexl: '==' },
    { value: 'neq', label: '!=', jexl: '!=' },
    { value: 'gt', label: '>', jexl: '>' },
    { value: 'gte', label: '>=', jexl: '>=' },
    { value: 'lt', label: '<', jexl: '<' },
    { value: 'lte', label: '<=', jexl: '<=' },
    { value: 'contains', label: 'contains', jexl: 'contains' },
    { value: 'startsWith', label: 'starts with', jexl: 'startsWith' },
    { value: 'exists', label: 'exists', jexl: 'exists' },
    { value: 'notExists', label: 'does not exist', jexl: 'notExists' }
];

export const DEFAULT_TIMEOUT_ACTIONS = [
    { value: 'deny', label: 'Auto-deny' },
    { value: 'approve', label: 'Auto-approve' },
    { value: 'remind', label: 'Send reminder' },
    { value: 'redirect', label: 'Redirect approval' }
];

export const DEFAULT_METADATA = {
    triggerTypes: DEFAULT_TRIGGER_TYPES,
    conditionFields: DEFAULT_CONDITION_FIELDS,
    operators: DEFAULT_OPERATORS,
    timeoutActions: DEFAULT_TIMEOUT_ACTIONS
};

export const EMPTY_CONDITION = {
    field: 'incident.severity',
    operator: 'eq',
    value: 'critical'
};

export const EMPTY_ACTION = {
    id: null,
    order: 10,
    workflowId: '',
    name: '',
    executionMode: EXECUTION_MODES.AUTOMATIC,
    parameters: {},
    tools: [],
    approval: {
        timeoutSeconds: 1800,
        timeoutAction: 'deny',
        timeoutConfig: ''
    }
};

export const EMPTY_AUTOMATION = {
    id: null,
    name: '',
    description: '',
    enabled: true,
    priority: 100,
    trigger: {
        type: 'incident.created',
        config: {}
    },
    conditions: {
        mode: CONDITION_MODES.BUILDER,
        match: CONDITION_MATCH.ALL,
        clauses: [],
        expression: ''
    },
    matchBehaviour: AUTOMATION_MATCH_BEHAVIOUR.CONTINUE,
    actions: [],
    errorBehaviour: AUTOMATION_ERROR_BEHAVIOUR.STOP,
    version: 1,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null
};
