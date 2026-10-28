import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { SOCASelect } from '@hct/soca-toolkit';

import { CONDITION_MATCH, CONDITION_MODES } from './automation.constants';
import {
    buildJexlExpression,
    createCondition,
    optionFor
} from './automation.utils';

const ConditionBuilder = ({ conditions, metadata = {}, onChange }) =>
{
    const fields = metadata?.conditionFields || [];
    const operators = metadata?.operators || [];
    const mode = conditions?.mode || CONDITION_MODES.BUILDER;
    const clauses = conditions?.clauses || [];
    const match = conditions?.match || CONDITION_MATCH.ALL;
    const generatedExpression = buildJexlExpression(clauses, match, operators);

    function emit(patch)
    {
        onChange?.({
            ...(conditions || {}),
            ...patch
        });
    }

    function setMode(nextMode)
    {
        emit({
            mode: nextMode,
            expression: nextMode === CONDITION_MODES.JEXL
                ? (conditions?.expression || generatedExpression)
                : generatedExpression
        });
    }

    function updateClause(index, patch)
    {
        const next = clauses.map((clause, clauseIndex) =>
            clauseIndex === index ? { ...clause, ...patch } : clause
        );

        emit({
            clauses: next,
            expression: buildJexlExpression(next, match, operators)
        });
    }

    function addClause()
    {
        const next = [...clauses, createCondition()];
        emit({
            clauses: next,
            expression: buildJexlExpression(next, match, operators)
        });
    }

    function removeClause(index)
    {
        const next = clauses.filter((_, clauseIndex) => clauseIndex !== index);
        emit({
            clauses: next,
            expression: buildJexlExpression(next, match, operators)
        });
    }

    function setMatch(nextMatch)
    {
        emit({
            match: nextMatch,
            expression: buildJexlExpression(clauses, nextMatch, operators)
        });
    }

    return (
        <section className="automation-editor-section">
            <div className="automation-section-heading automation-section-heading-row">
                <div>
                    <h6>If - Conditions</h6>
                    <p>Use the builder for common conditions or JEXL for advanced expressions.</p>
                </div>

                <div className="automation-segmented-control">
                    <button
                        type="button"
                        className={mode === CONDITION_MODES.BUILDER ? 'selected' : ''}
                        onClick={() => setMode(CONDITION_MODES.BUILDER)}
                    >
                        Builder
                    </button>
                    <button
                        type="button"
                        className={mode === CONDITION_MODES.JEXL ? 'selected' : ''}
                        onClick={() => setMode(CONDITION_MODES.JEXL)}
                    >
                        Advanced JEXL
                    </button>
                </div>
            </div>

            {mode === CONDITION_MODES.BUILDER ? (
                <>
                    <div className="automation-condition-match-row">
                        <span>Match</span>
                        <SOCASelect
                            key={match}
                            optionsData={[
                                { value: CONDITION_MATCH.ALL, label: 'ALL conditions' },
                                { value: CONDITION_MATCH.ANY, label: 'ANY condition' }
                            ]}
                            defaultValue={optionFor([
                                { value: CONDITION_MATCH.ALL, label: 'ALL conditions' },
                                { value: CONDITION_MATCH.ANY, label: 'ANY condition' }
                            ], match)}
                            onChange={(option) => setMatch(option?.value || CONDITION_MATCH.ALL)}
                        />
                    </div>

                    <div className="automation-condition-list">
                        {clauses.map((clause, index) => {
                            const operator = clause?.operator || 'eq';
                            const valueNotRequired = operator === 'exists' || operator === 'notExists';

                            return (
                                <div className="automation-condition-row" key={clause.id || index}>
                                    <SOCASelect
                                        key={`field-${clause.id}-${clause.field}`}
                                        optionsData={fields}
                                        defaultValue={optionFor(fields, clause.field)}
                                        onChange={(option) => updateClause(index, { field: option?.value || '' })}
                                    />

                                    <SOCASelect
                                        key={`operator-${clause.id}-${operator}`}
                                        optionsData={operators}
                                        defaultValue={optionFor(operators, operator)}
                                        onChange={(option) => updateClause(index, { operator: option?.value || 'eq' })}
                                    />

                                    <Form.Control
                                        value={valueNotRequired ? '' : (clause?.value ?? '')}
                                        disabled={valueNotRequired}
                                        placeholder={valueNotRequired ? 'No value required' : 'Value'}
                                        onChange={(event) => updateClause(index, { value: event.target.value })}
                                    />

                                    <Button
                                        variant="secondary"
                                        className="automation-icon-button automation-danger-button"
                                        title="Remove condition"
                                        onClick={() => removeClause(index)}
                                        disabled={clauses.length <= 1}
                                    >
                                        <FaTrashAlt />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    <Button variant="secondary" className="automation-secondary-button" onClick={addClause}>
                        <FaPlus />
                        Add Condition
                    </Button>

                    <div className="automation-generated-expression">
                        <span>Generated JEXL</span>
                        <code>{generatedExpression}</code>
                    </div>
                </>
            ) : (
                <Form.Group>
                    <Form.Label>JEXL expression</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        className="automation-code-input"
                        value={conditions?.expression || ''}
                        onChange={(event) => emit({ expression: event.target.value })}
                        placeholder="incident.severity == 'critical' && alert.confidence >= 80"
                    />
                    <Form.Text>
                        Gatekeeper remains authoritative for validating and evaluating the expression.
                    </Form.Text>
                </Form.Group>
            )}
        </section>
    );
};

export { ConditionBuilder };
