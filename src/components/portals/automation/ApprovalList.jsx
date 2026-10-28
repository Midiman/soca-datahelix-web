import React from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { SOCATable } from '@hct/soca-toolkit';

import { formatDate } from './automation.utils';

const ApprovalList = ({ approvals = [], loading = false, busyId = null, onResolve }) =>
{
    const columns = [
        {
            dataField: 'createdAt',
            text: 'Created',
            sort: true,
            render: (row) => formatDate(row.createdAt)
        },
        {
            dataField: 'incidentId',
            text: 'Incident',
            sort: true,
            render: (row) => row.incidentUrl ? (
                <a href={row.incidentUrl}>{row.incidentId || '-'}</a>
            ) : (row.incidentId || '-')
        },
        {
            dataField: 'automationName',
            text: 'Automation',
            sort: true
        },
        {
            dataField: 'actionName',
            text: 'Action',
            sort: true
        },
        {
            dataField: 'expiresAt',
            text: 'Timeout',
            sort: true,
            render: (row) => formatDate(row.expiresAt)
        },
        {
            dataField: 'status',
            text: 'Status',
            sort: true,
            render: (row) => (
                <span className={`automation-status automation-status-${String(row.status || '').replace(/_/g, '-')}`}>
                    {String(row.status || '-').replace(/_/g, ' ')}
                </span>
            )
        },
        {
            dataField: 'actions',
            text: '',
            sort: false,
            render: (row) => {
                if (row.status !== 'pending')
                    return null;

                const busy = busyId === row.actionExecutionId;

                return (
                    <span className="automation-approval-actions" onClick={(event) => event.stopPropagation()}>
                        <Button
                            size="sm"
                            className="automation-approve-button"
                            disabled={busy}
                            onClick={() => onResolve?.(row, 'approve')}
                        >
                            <FaCheck /> Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="automation-deny-button"
                            disabled={busy}
                            onClick={() => onResolve?.(row, 'deny')}
                        >
                            <FaTimes /> Deny
                        </Button>
                    </span>
                );
            }
        }
    ];

    return (
        <section className="automation-list-view">
            <div className="automation-view-toolbar">
                <div>
                    <h5>Pending approvals</h5>
                    <span>Approval is API-driven and may also be performed from Incident Management or other clients.</span>
                </div>
            </div>

            {loading ? (
                <div className="automation-loading">Loading approvals...</div>
            ) : (
                <SOCATable
                    title=""
                    data={approvals}
                    columns={columns}
                    filterPlaceholder="Search approvals"
                    keyField="actionExecutionId"
                    selectedSizePerPage={25}
                    selectableRows={false}
                    searchBar
                    search
                    includeHr={false}
                    noStripes
                />
            )}
        </section>
    );
};

export { ApprovalList };
