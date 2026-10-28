import React from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { SOCATable } from '@hct/soca-toolkit';

import { formatDate } from './automation.utils';

const ExecutionDetails = ({ execution, onBack }) =>
{
    if (!execution)
        return null;

    const conditionColumns = [
        { dataField: 'field', text: 'Field', sort: false },
        { dataField: 'operator', text: 'Operator', sort: false },
        { dataField: 'expected', text: 'Expected', sort: false },
        { dataField: 'actual', text: 'Actual', sort: false },
        {
            dataField: 'matched',
            text: 'Matched',
            sort: false,
            render: (row) => row.matched ? 'Yes' : 'No'
        }
    ];

    const actionColumns = [
        { dataField: 'actionName', text: 'Action', sort: false },
        {
            dataField: 'status',
            text: 'Status',
            sort: false,
            render: (row) => String(row.status || '-').replace(/_/g, ' ')
        },
        {
            dataField: 'startedAt',
            text: 'Started',
            sort: false,
            render: (row) => formatDate(row.startedAt)
        },
        {
            dataField: 'completedAt',
            text: 'Completed',
            sort: false,
            render: (row) => formatDate(row.completedAt)
        },
        {
            dataField: 'output',
            text: 'Output',
            sort: false,
            render: (row) => row.output == null
                ? '-'
                : (typeof row.output === 'string' ? row.output : JSON.stringify(row.output))
        }
    ];

    const conditionRows = (execution.conditionResults || []).map((item, index) => ({
        ...item,
        id: item.id || `condition-result-${index}`
    }));

    return (
        <section className="automation-execution-details">
            <div className="automation-editor-toolbar">
                <Button variant="secondary" className="automation-secondary-button" onClick={onBack}>
                    <FaArrowLeft />
                    Back to history
                </Button>
            </div>

            <div className="automation-execution-summary">
                <div><span>Automation</span><strong>{execution.automationName}</strong></div>
                <div><span>Version</span><strong>{execution.automationVersion ?? '-'}</strong></div>
                <div><span>Incident</span><strong>{execution.incidentId || '-'}</strong></div>
                <div><span>Alert</span><strong>{execution.triggeringAlertId || '-'}</strong></div>
                <div><span>Trigger</span><strong>{execution.triggerType || '-'}</strong></div>
                <div><span>Status</span><strong>{String(execution.status || '-').replace(/_/g, ' ')}</strong></div>
                <div><span>Started</span><strong>{formatDate(execution.startedAt)}</strong></div>
                <div><span>Completed</span><strong>{formatDate(execution.completedAt)}</strong></div>
            </div>

            <div className="automation-detail-table-block">
                <h6>Condition results</h6>
                <SOCATable
                    title=""
                    data={conditionRows}
                    columns={conditionColumns}
                    keyField="id"
                    selectedSizePerPage={25}
                    selectableRows={false}
                    searchBar={false}
                    search={false}
                    includeHr={false}
                    noStripes
                />
            </div>

            <div className="automation-detail-table-block">
                <h6>Action executions</h6>
                <SOCATable
                    title=""
                    data={execution.actionExecutions || []}
                    columns={actionColumns}
                    keyField="actionExecutionId"
                    selectedSizePerPage={25}
                    selectableRows={false}
                    searchBar={false}
                    search={false}
                    includeHr={false}
                    noStripes
                />
            </div>
        </section>
    );
};

export { ExecutionDetails };
