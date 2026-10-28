import React from 'react';
import { SOCASelect } from '@hct/soca-toolkit';

import { optionFor } from './automation.utils';

const WorkflowPicker = ({ workflows = [], value, onChange }) =>
{
    const options = workflows.map(workflow => ({
        value: workflow.id,
        label: workflow.name || workflow.id,
        description: workflow.description
    }));

    return (
        <SOCASelect
            key={value || 'workflow'}
            optionsData={options}
            defaultValue={optionFor(options, value)}
            onChange={(option) => onChange?.(option?.value || '')}
        />
    );
};

export { WorkflowPicker };
