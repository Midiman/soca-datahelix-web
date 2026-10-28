import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import { ActionEditor } from './ActionEditor';
import { createAction } from './automation.utils';

const ActionList = ({ actions = [], workflows = [], timeoutActions = [], onChange }) =>
{
    function normaliseOrders(next)
    {
        return next.map((action, index) => ({
            ...action,
            order: (index + 1) * 10
        }));
    }

    function updateAction(index, action)
    {
        onChange?.(actions.map((item, itemIndex) => itemIndex === index ? action : item));
    }

    function addAction()
    {
        onChange?.([...actions, createAction((actions.length + 1) * 10)]);
    }

    function removeAction(index)
    {
        onChange?.(normaliseOrders(actions.filter((_, itemIndex) => itemIndex !== index)));
    }

    function moveAction(index, direction)
    {
        const target = index + direction;

        if (target < 0 || target >= actions.length)
            return;

        const next = [...actions];
        [next[index], next[target]] = [next[target], next[index]];
        onChange?.(normaliseOrders(next));
    }

    return (
        <section className="automation-editor-section">
            <div className="automation-section-heading automation-section-heading-row">
                <div>
                    <h6>Then - Actions</h6>
                    <p>Actions execute in order. CyberFlow owns the workflow; this layer owns routing and execution policy.</p>
                </div>

                <Button variant="secondary" className="automation-secondary-button" onClick={addAction}>
                    <FaPlus />
                    Add Action
                </Button>
            </div>

            <div className="automation-action-list">
                {actions.map((action, index) => (
                    <ActionEditor
                        key={action.id || index}
                        action={action}
                        index={index}
                        actionCount={actions.length}
                        workflows={workflows}
                        timeoutActions={timeoutActions}
                        onChange={(nextAction) => updateAction(index, nextAction)}
                        onMove={moveAction}
                        onRemove={removeAction}
                    />
                ))}

                {!actions.length && (
                    <div className="automation-empty-state">
                        No actions configured. Add at least one CyberFlow action.
                    </div>
                )}
            </div>
        </section>
    );
};

export { ActionList };
