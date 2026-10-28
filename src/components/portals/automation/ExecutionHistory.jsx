import React from 'react';
import { SOCATable } from '@hct/soca-toolkit';

import { formatDate } from './automation.utils';

const ExecutionHistory = ({ executions = [], loading = false, onSelect }) =>
{
    const columns = [
        {
            dataField: 'startedAt',
            text: 'Time',
            sort: true,
            render: (row) => formatDate(row.startedAt)
        },
        {
            dataField: 'incidentId',
            text: 'Incident',
            sort: true
        },
        {
            dataField: 'automationName',
            text: 'Automation',
            sort: true
        },
        {
            dataField: 'triggerType',
            text: 'Trigger',
            sort: true
        },
        {
            dataField: 'status',
            text: 'Result',
            sort: true,
            render: (row) => (
                <span className={`automation-status automation-status-${String(row.status || '').replace(/_/g, '-')}`}>
                    {String(row.status || '-').replace(/_/g, ' ')}
                </span>
            )
        },
        {
            dataField: 'actionExecutions',
            text: 'Actions',
            sort: false,
            render: (row) => row.actionExecutions?.length || 0
        }
    ];

    return (
        <section className="automation-list-view">
            <div className="automation-view-toolbar">
                <div>
                    <h5>Execution history</h5>
                    <span>Audit trail for trigger matches, condition results and action execution.</span>
                </div>
            </div>

            {loading ? (
                <div className="automation-loading">Loading execution history...</div>
            ) : (
                <SOCATable
                    title=""
                    data={executions}
                    columns={columns}
                    filterPlaceholder="Search execution history"
                    keyField="executionId"
                    selectedSizePerPage={25}
                    selectableRows={false}
                    onRowClick={(row) => onSelect?.(row)}
                    searchBar
                    search
                    includeHr={false}
                    noStripes
                />
            )}
        </section>
    );
};

export { ExecutionHistory };
