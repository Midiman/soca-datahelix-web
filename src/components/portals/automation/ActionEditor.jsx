import React, { useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
    FaArrowDown,
    FaArrowUp,
    FaChevronDown,
    FaChevronUp,
    FaTrashAlt
} from 'react-icons/fa';
import { SOCASelect } from '@hct/soca-toolkit';

import { EXECUTION_MODES } from './automation.constants';
import { optionFor, safeJsonParse } from './automation.utils';
import { WorkflowPicker } from './WorkflowPicker';
import { ApprovalConfig } from './ApprovalConfig';

const ActionEditor = ({
    action,
    index,
    actionCount,
    workflows = [],
    timeoutActions = [],
    onChange,
    onMove,
    onRemove
}) =>
{
    const [expanded, setExpanded] = useState(true);
    const [parameterText, setParameterText] = useState(() => JSON.stringify(action?.parameters || {}, null, 2));
    const [parameterError, setParameterError] = useState(null);

    const workflow = useMemo(
        () => workflows.find(item => item.id === action?.workflowId),
        [workflows, action?.workflowId]
    );

    function emit(patch)
    {
        onChange?.({ ...action, ...patch });
    }

    function updateParameters(text)
    {
        setParameterText(text);
        const parsed = safeJsonParse(text);

        if (parsed === null)
        {
            setParameterError('Parameters must be valid JSON.');
            emit({ __parametersInvalid: true });
            return;
        }

        setParameterError(null);
        emit({ parameters: parsed, __parametersInvalid: false });
    }

    function updateTools(text)
    {
        emit({
            tools: text
                .split(',')
                .map(value => value.trim())
                .filter(Boolean)
        });
    }

    return (
        <article className="automation-action-card">
            <header className="automation-action-header">
                <button
                    type="button"
                    className="automation-action-expand"
                    onClick={() => setExpanded(current => !current)}
                >
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                    <span className="automation-action-number">{index + 1}</span>
                    <span>
                        <strong>{action?.name || workflow?.name || 'New action'}</strong>
                        <small>{workflow?.name || action?.workflowId || 'Select a CyberFlow workflow'}</small>
                    </span>
                </button>

                <div className="automation-action-controls">
                    <Button
                        variant="secondary"
                        className="automation-icon-button"
                        title="Move action up"
                        disabled={index === 0}
                        onClick={() => onMove?.(index, -1)}
                    >
                        <FaArrowUp />
                    </Button>
                    <Button
                        variant="secondary"
                        className="automation-icon-button"
                        title="Move action down"
                        disabled={index >= actionCount - 1}
                        onClick={() => onMove?.(index, 1)}
                    >
                        <FaArrowDown />
                    </Button>
                    <Button
                        variant="secondary"
                        className="automation-icon-button automation-danger-button"
                        title="Remove action"
                        onClick={() => onRemove?.(index)}
                    >
                        <FaTrashAlt />
                    </Button>
                </div>
            </header>

            {expanded && (
                <div className="automation-action-body">
                    <div className="automation-form-grid automation-form-grid-2">
                        <Form.Group>
                            <Form.Label>CyberFlow workflow</Form.Label>
                            <WorkflowPicker
                                workflows={workflows}
                                value={action?.workflowId || ''}
                                onChange={(workflowId) => {
                                    const selected = workflows.find(item => item.id === workflowId);
                                    emit({
                                        workflowId,
                                        name: action?.name || selected?.name || ''
                                    });
                                }}
                            />
                            {workflow?.description && <Form.Text>{workflow.description}</Form.Text>}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Action name</Form.Label>
                            <Form.Control
                                value={action?.name || ''}
                                onChange={(event) => emit({ name: event.target.value })}
                                placeholder={workflow?.name || 'Action name'}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Execution mode</Form.Label>
                            <SOCASelect
                                key={action?.executionMode || EXECUTION_MODES.AUTOMATIC}
                                optionsData={[
                                    { value: EXECUTION_MODES.AUTOMATIC, label: 'Automatic' },
                                    { value: EXECUTION_MODES.APPROVAL, label: 'Require approval' }
                                ]}
                                defaultValue={optionFor([
                                    { value: EXECUTION_MODES.AUTOMATIC, label: 'Automatic' },
                                    { value: EXECUTION_MODES.APPROVAL, label: 'Require approval' }
                                ], action?.executionMode || EXECUTION_MODES.AUTOMATIC)}
                                onChange={(option) => emit({ executionMode: option?.value || EXECUTION_MODES.AUTOMATIC })}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Tool / credential references</Form.Label>
                            <Form.Control
                                value={(action?.tools || []).join(', ')}
                                onChange={(event) => updateTools(event.target.value)}
                                placeholder="teams.soc-channel, endpoint.isolation"
                            />
                            <Form.Text>References only. Secrets are resolved by Gatekeeper/CyberFlow.</Form.Text>
                        </Form.Group>
                    </div>

                    <Form.Group className="mt-3">
                        <Form.Label>Action-specific parameters (JSON)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            className={`automation-code-input${parameterError ? ' is-invalid' : ''}`}
                            value={parameterText}
                            onChange={(event) => updateParameters(event.target.value)}
                            placeholder={'{\n  "channel": "SOC Incidents"\n}'}
                        />
                        {parameterError && <div className="invalid-feedback d-block">{parameterError}</div>}
                    </Form.Group>

                    {action?.executionMode === EXECUTION_MODES.APPROVAL && (
                        <ApprovalConfig
                            approval={action?.approval}
                            timeoutActions={timeoutActions}
                            onChange={(approval) => emit({ approval })}
                        />
                    )}
                </div>
            )}
        </article>
    );
};

export { ActionEditor };
