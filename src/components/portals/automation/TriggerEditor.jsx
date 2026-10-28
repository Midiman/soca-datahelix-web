import React from 'react';
import { Form } from 'react-bootstrap';
import { SOCASelect } from '@hct/soca-toolkit';

import { optionFor } from './automation.utils';

const TriggerEditor = ({ trigger, triggerTypes = [], onChange }) =>
{
    const selected = optionFor(triggerTypes, trigger?.type);
    const selectedDefinition = triggerTypes.find(item => item.value === trigger?.type);

    function handleTypeChange(option)
    {
        onChange?.({
            ...(trigger || {}),
            type: option?.value || '',
            config: trigger?.config || {}
        });
    }

    return (
        <section className="automation-editor-section">
            <div className="automation-section-heading">
                <div>
                    <h6>When - Trigger</h6>
                    <p>The event that starts evaluation of this automation.</p>
                </div>
            </div>

            <div className="automation-form-grid automation-form-grid-2">
                <Form.Group>
                    <Form.Label>Trigger type</Form.Label>
                    <SOCASelect
                        key={trigger?.type || 'trigger'}
                        optionsData={triggerTypes}
                        defaultValue={selected}
                        onChange={handleTypeChange}
                    />
                    {selectedDefinition?.description && (
                        <Form.Text>{selectedDefinition.description}</Form.Text>
                    )}
                </Form.Group>
            </div>
        </section>
    );
};

export { TriggerEditor };
