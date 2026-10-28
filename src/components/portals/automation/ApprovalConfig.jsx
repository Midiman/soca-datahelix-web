import React from 'react';
import { Form } from 'react-bootstrap';
import { SOCASelect } from '@hct/soca-toolkit';

import { optionFor } from './automation.utils';

const ApprovalConfig = ({ approval, timeoutActions = [], onChange }) =>
{
    const value = approval || {};
    const timeoutAction = value.timeoutAction || 'deny';

    function emit(patch)
    {
        onChange?.({ ...value, ...patch });
    }

    return (
        <div className="automation-approval-config">
            <Form.Group>
                <Form.Label>Approval timeout (seconds)</Form.Label>
                <Form.Control
                    type="number"
                    min="1"
                    value={value.timeoutSeconds ?? 1800}
                    onChange={(event) => emit({ timeoutSeconds: Number(event.target.value) })}
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>On timeout</Form.Label>
                <SOCASelect
                    key={timeoutAction}
                    optionsData={timeoutActions}
                    defaultValue={optionFor(timeoutActions, timeoutAction)}
                    onChange={(option) => emit({ timeoutAction: option?.value || 'deny' })}
                />
            </Form.Group>

            {(timeoutAction === 'remind' || timeoutAction === 'redirect') && (
                <Form.Group className="automation-approval-config-wide">
                    <Form.Label>Timeout configuration</Form.Label>
                    <Form.Control
                        value={value.timeoutConfig || ''}
                        onChange={(event) => emit({ timeoutConfig: event.target.value })}
                        placeholder={timeoutAction === 'redirect'
                            ? 'Role, user or escalation target'
                            : 'Reminder target/configuration'}
                    />
                </Form.Group>
            )}
        </div>
    );
};

export { ApprovalConfig };
