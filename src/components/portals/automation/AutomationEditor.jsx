import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaTrashAlt } from 'react-icons/fa';
import { SOCASelect, SOCASwitch } from '@hct/soca-toolkit';

import { TriggerEditor } from './TriggerEditor';
import { ConditionBuilder } from './ConditionBuilder';
import { ActionList } from './ActionList';
import {
    AUTOMATION_ERROR_BEHAVIOUR,
    AUTOMATION_MATCH_BEHAVIOUR
} from './automation.constants';
import {
    buildJexlExpression,
    clone,
    optionFor,
    prepareAutomationForSave,
    validateAutomation
} from './automation.utils';

const AutomationEditor = ({
    automation,
    metadata = {},
    workflows = [],
    saving = false,
    onSave,
    onDelete,
    onCancel
}) =>
{
    const [draft, setDraft] = useState(() => clone(automation));
    const [errors, setErrors] = useState([]);

    useEffect(() =>
    {
        setDraft(clone(automation));
        setErrors([]);
    }, [automation]);

    if (!draft)
        return null;

    function patch(patchValue)
    {
        setDraft(current => ({ ...current, ...patchValue }));
    }

    function save()
    {
        const next = clone(draft);

        if (next?.conditions?.mode === 'builder')
        {
            next.conditions.expression = buildJexlExpression(
                next.conditions?.clauses || [],
                next.conditions?.match || 'all',
                metadata?.operators || []
            );
        }

        const validationErrors = validateAutomation(next);
        setErrors(validationErrors);

        if (validationErrors.length)
            return;

        onSave?.(prepareAutomationForSave(next));
    }

    return (
        <section className="automation-editor-view">
            <div className="automation-editor-toolbar">
                <Button variant="secondary" className="automation-secondary-button" onClick={onCancel} disabled={saving}>
                    <FaArrowLeft />
                    Back
                </Button>

                <div className="automation-editor-toolbar-actions">
                    {draft.id && (
                        <Button
                            variant="secondary"
                            className="automation-danger-outline-button"
                            onClick={() => onDelete?.(draft)}
                            disabled={saving}
                        >
                            <FaTrashAlt />
                            Delete
                        </Button>
                    )}

                    <Button className="automation-primary-button" onClick={save} disabled={saving}>
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Automation'}
                    </Button>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="automation-alert automation-alert-error">
                    <strong>Cannot save this automation.</strong>
                    <ul>
                        {errors.map(error => <li key={error}>{error}</li>)}
                    </ul>
                </div>
            )}

            <section className="automation-editor-section">
                <div className="automation-section-heading">
                    <div>
                        <h6>Identity</h6>
                        <p>Name, priority and whether this automation is active.</p>
                    </div>
                </div>

                <div className="automation-form-grid automation-form-grid-2">
                    <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            value={draft.name || ''}
                            onChange={(event) => patch({ name: event.target.value })}
                            placeholder="Critical Incident SOC Notification"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        <Form.Control
                            type="number"
                            value={draft.priority ?? 100}
                            onChange={(event) => patch({ priority: Number(event.target.value) })}
                        />
                        <Form.Text>Higher priorities are evaluated first.</Form.Text>
                    </Form.Group>

                    <Form.Group className="automation-form-wide">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={draft.description || ''}
                            onChange={(event) => patch({ description: event.target.value })}
                        />
                    </Form.Group>

                    <div className="automation-switch-row automation-form-wide">
                        <div>
                            <strong>Enabled</strong>
                            <span>Disabled automations are not evaluated.</span>
                        </div>
                        <SOCASwitch
                            key={`enabled-${draft.enabled}`}
                            id={`automation-editor-enabled-${draft.id || 'new'}`}
                            initialValue={draft.enabled === true}
                            onChange={(value) => patch({ enabled: Boolean(value) })}
                        />
                    </div>
                </div>
            </section>

            <TriggerEditor
                trigger={draft.trigger}
                triggerTypes={metadata?.triggerTypes || []}
                onChange={(trigger) => patch({ trigger })}
            />

            <ConditionBuilder
                conditions={draft.conditions}
                metadata={metadata}
                onChange={(conditions) => patch({ conditions })}
            />

            <ActionList
                actions={draft.actions || []}
                workflows={workflows}
                timeoutActions={metadata?.timeoutActions || []}
                onChange={(actions) => patch({ actions })}
            />

            <section className="automation-editor-section">
                <div className="automation-section-heading">
                    <div>
                        <h6>Execution behaviour</h6>
                        <p>Controls routing across matching automations and behaviour when an action fails.</p>
                    </div>
                </div>

                <div className="automation-form-grid automation-form-grid-2">
                    <Form.Group>
                        <Form.Label>After this automation matches</Form.Label>
                        <SOCASelect
                            key={draft.matchBehaviour || AUTOMATION_MATCH_BEHAVIOUR.CONTINUE}
                            optionsData={[
                                { value: AUTOMATION_MATCH_BEHAVIOUR.CONTINUE, label: 'Continue evaluating automations' },
                                { value: AUTOMATION_MATCH_BEHAVIOUR.STOP, label: 'Stop evaluating further automations' }
                            ]}
                            defaultValue={optionFor([
                                { value: AUTOMATION_MATCH_BEHAVIOUR.CONTINUE, label: 'Continue evaluating automations' },
                                { value: AUTOMATION_MATCH_BEHAVIOUR.STOP, label: 'Stop evaluating further automations' }
                            ], draft.matchBehaviour || AUTOMATION_MATCH_BEHAVIOUR.CONTINUE)}
                            onChange={(option) => patch({ matchBehaviour: option?.value || AUTOMATION_MATCH_BEHAVIOUR.CONTINUE })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>When an action fails</Form.Label>
                        <SOCASelect
                            key={draft.errorBehaviour || AUTOMATION_ERROR_BEHAVIOUR.STOP}
                            optionsData={[
                                { value: AUTOMATION_ERROR_BEHAVIOUR.STOP, label: 'Stop remaining actions' },
                                { value: AUTOMATION_ERROR_BEHAVIOUR.CONTINUE, label: 'Continue with remaining actions' }
                            ]}
                            defaultValue={optionFor([
                                { value: AUTOMATION_ERROR_BEHAVIOUR.STOP, label: 'Stop remaining actions' },
                                { value: AUTOMATION_ERROR_BEHAVIOUR.CONTINUE, label: 'Continue with remaining actions' }
                            ], draft.errorBehaviour || AUTOMATION_ERROR_BEHAVIOUR.STOP)}
                            onChange={(option) => patch({ errorBehaviour: option?.value || AUTOMATION_ERROR_BEHAVIOUR.STOP })}
                        />
                    </Form.Group>
                </div>
            </section>
        </section>
    );
};

export { AutomationEditor };
