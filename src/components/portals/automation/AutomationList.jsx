import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { SOCATable, SOCASwitch } from '@hct/soca-toolkit';

import { formatDate, getLabel } from './automation.utils';

const AutomationList = ({
    automations = [],
    metadata = {},
    loading = false,
    onCreate,
    onEdit,
    onToggleEnabled
}) =>
{
    const triggerTypes = metadata?.triggerTypes || [];

    const columns = [
        {
            dataField: 'enabled',
            text: 'Enabled',
            sort: true,
            headerStyle: () => ({ width: '90px', textAlign: 'left' }),
            render: (row) => (
                <span
                    className="automation-switch-cell"
                    onClick={(event) => event.stopPropagation()}
                >
                    <SOCASwitch
                        key={`${row.id}-${row.enabled}`}
                        id={`automation-enabled-${row.id}`}
                        initialValue={row.enabled === true}
                        onChange={(value) => onToggleEnabled?.(row, value)}
                    />
                </span>
            )
        },
        {
            dataField: 'priority',
            text: 'Priority',
            sort: true,
            headerStyle: () => ({ width: '90px', textAlign: 'left' })
        },
        {
            dataField: 'name',
            text: 'Name',
            sort: true,
            render: (row) => (
                <div className="automation-name-cell">
                    <strong>{row.name || 'Untitled automation'}</strong>
                    {row.description && <small>{row.description}</small>}
                </div>
            )
        },
        {
            dataField: 'trigger',
            text: 'Trigger',
            sort: false,
            render: (row) => getLabel(triggerTypes, row?.trigger?.type, row?.trigger?.type)
        },
        {
            dataField: 'conditions',
            text: 'Conditions',
            sort: false,
            render: (row) => {
                if (row?.conditions?.mode === 'jexl')
                    return <span className="automation-pill">JEXL</span>;

                const count = row?.conditions?.clauses?.length || 0;
                const match = String(row?.conditions?.match || 'all').toUpperCase();
                return `${count} / ${match}`;
            }
        },
        {
            dataField: 'actions',
            text: 'Actions',
            sort: false,
            headerStyle: () => ({ width: '90px', textAlign: 'left' }),
            render: (row) => row?.actions?.length || 0
        },
        {
            dataField: 'matchBehaviour',
            text: 'After match',
            sort: true,
            render: (row) => row?.matchBehaviour === 'stop' ? 'Stop evaluating' : 'Continue'
        },
        {
            dataField: 'errorBehaviour',
            text: 'On failure',
            sort: true,
            render: (row) => row?.errorBehaviour === 'continue' ? 'Continue' : 'Stop'
        },
        {
            dataField: 'updatedAt',
            text: 'Modified',
            sort: true,
            render: (row) => formatDate(row.updatedAt)
        }
    ];

    return (
        <section className="automation-list-view">
            <div className="automation-view-toolbar">
                <div>
                    <h5>Automations</h5>
                    <span>Configure when and how CyberFlow workflows are invoked.</span>
                </div>

                <Button className="automation-primary-button" onClick={onCreate}>
                    <FaPlus />
                    New Automation
                </Button>
            </div>

            {loading ? (
                <div className="automation-loading">Loading automations...</div>
            ) : (
                <SOCATable
                    title=""
                    data={automations}
                    columns={columns}
                    filterPlaceholder="Search automations"
                    keyField="id"
                    selectedSizePerPage={25}
                    selectableRows={false}
                    onRowClick={(row) => onEdit?.(row)}
                    searchBar
                    search
                    includeHr={false}
                    noStripes
                />
            )}
        </section>
    );
};

export { AutomationList };
