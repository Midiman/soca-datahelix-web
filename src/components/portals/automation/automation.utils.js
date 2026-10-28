import {
    DEFAULT_OPERATORS,
    EMPTY_ACTION,
    EMPTY_AUTOMATION,
    EMPTY_CONDITION
} from './automation.constants';

export function clone(value)
{
    if (value == null)
        return value;

    return JSON.parse(JSON.stringify(value));
}

export function createId(prefix = 'id')
{
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now()}-${random}`;
}

export function createAutomation()
{
    return {
        ...clone(EMPTY_AUTOMATION),
        conditions: {
            ...clone(EMPTY_AUTOMATION.conditions),
            clauses: [createCondition()]
        },
        actions: [createAction(10)]
    };
}

export function createCondition()
{
    return {
        id: createId('condition'),
        ...clone(EMPTY_CONDITION)
    };
}

export function createAction(order = 10)
{
    return {
        ...clone(EMPTY_ACTION),
        id: createId('action'),
        order
    };
}

export function formatDate(value)
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

export function optionFor(options, value)
{
    const option = (options || []).find(item => item?.value === value);
    return option || (value == null ? null : { value, label: String(value) });
}

export function getLabel(options, value, fallback = null)
{
    const option = optionFor(options, value);
    return option?.label || fallback || String(value || '-');
}

export function normaliseArrayResponse(response, keys = [])
{
    if (Array.isArray(response))
        return response;

    for (const key of keys)
    {
        if (Array.isArray(response?.[key]))
            return response[key];
    }

    if (Array.isArray(response?.items))
        return response.items;

    if (Array.isArray(response?.data))
        return response.data;

    return [];
}

export function responseError(response, fallback = 'Operation failed.')
{
    if (!response)
        return null;

    if (response?.ok === false || response?.status >= 400 || response?.error)
        return response.error || response.message || fallback;

    return null;
}

function formatJexlValue(value)
{
    if (value === null)
        return 'null';

    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);

    const trimmed = String(value ?? '').trim();

    if (trimmed === '')
        return "''";

    if (/^-?\d+(\.\d+)?$/.test(trimmed))
        return trimmed;

    if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null')
        return trimmed;

    return `'${trimmed.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function conditionToJexl(condition, operators = DEFAULT_OPERATORS)
{
    const field = String(condition?.field || '').trim();
    const operator = String(condition?.operator || 'eq');

    if (!field)
        return '';

    switch (operator)
    {
        case 'exists':
            return `${field} != null`;

        case 'notExists':
            return `${field} == null`;

        case 'contains':
            return `${field} != null && ${field}.contains(${formatJexlValue(condition?.value)})`;

        case 'startsWith':
            return `${field} != null && ${field}.startsWith(${formatJexlValue(condition?.value)})`;

        default:
        {
            const definition = operators.find(item => item?.value === operator);
            const jexlOperator = definition?.jexl || '==';
            return `${field} ${jexlOperator} ${formatJexlValue(condition?.value)}`;
        }
    }
}

export function buildJexlExpression(clauses = [], match = 'all', operators = DEFAULT_OPERATORS)
{
    const expressions = clauses
        .map(clause => conditionToJexl(clause, operators))
        .filter(Boolean)
        .map(expression => `(${expression})`);

    if (!expressions.length)
        return 'true';

    return expressions.join(match === 'any' ? ' || ' : ' && ');
}

export function safeJsonParse(value, fallback = {})
{
    if (value == null || value === '')
        return clone(fallback);

    if (typeof value === 'object')
        return clone(value);

    try
    {
        return JSON.parse(value);
    }
    catch (err)
    {
        return null;
    }
}

export function validateAutomation(automation)
{
    const errors = [];

    if (!String(automation?.name || '').trim())
        errors.push('Name is required.');

    if (!automation?.trigger?.type)
        errors.push('A trigger is required.');

    if (!Array.isArray(automation?.actions) || automation.actions.length === 0)
        errors.push('At least one action is required.');

    (automation?.actions || []).forEach((action, index) =>
    {
        if (!action?.workflowId)
            errors.push(`Action ${index + 1} requires a CyberFlow workflow.`);

        if (action?.__parametersInvalid)
            errors.push(`Action ${index + 1} parameters must be valid JSON.`);

        if (action?.executionMode === 'approval')
        {
            const timeoutSeconds = Number(action?.approval?.timeoutSeconds);

            if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 1)
                errors.push(`Action ${index + 1} approval timeout must be greater than zero.`);
        }
    });

    if (automation?.conditions?.mode === 'jexl' && !String(automation?.conditions?.expression || '').trim())
        errors.push('JEXL expression is required in Advanced mode.');

    return errors;
}

export function prepareAutomationForSave(automation)
{
    const next = clone(automation);

    next.actions = (next.actions || []).map(action => {
        const clean = { ...action };
        delete clean.__parametersInvalid;
        return clean;
    });

    return next;
}
