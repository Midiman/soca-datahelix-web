import React, { useState } from 'react';
import { useQuery } from 'react-query'

import { Container, Card, Row, Col, Button, OverlayTrigger } from "react-bootstrap";

import { FaArrowRight, FaFileAlt } from 'react-icons/fa';

import { SOCAAPITable, SOCATitleToolbar, ThemeContext, Spinner, SOCASelect } from '@hct/soca-toolkit';
import { Debug } from "@/util/Utilities";
import { DefaultBranding } from '../DefaultBranding';

const DEFAULT_ROW_PER_AGE = 10;
var lastRowsPerPage = localStorage.getItem('_dharpp');    //cache for saving rrp for bass ackwards JS <sigh>


const ReportsPortal = ({
    user = null,
    onCancel = null
}) =>
{
    const [closing, setClosing] = useState(false);

    const [tableData, setTableData] = useState([]);
    const [sortField, setSortField] = useState('@timestamp');
    const [totalRows, setTotalRows] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(lastRowsPerPage ? lastRowsPerPage : DEFAULT_ROW_PER_AGE);
    const [timeRange, setTimeRange] = useState('1M');

	/************************************************
		Table schema
	************************************************/
    const tableColumns =
    [
        {
            dataField: '@timestamp',
            text: 'Scan Date',
            sortable: true,
            headerStyle: (colum, colIndex) => {
                return { width: '20%', textAlign: 'left' };
            },
            render: (row) => {
                return (
                    <div className='time-ago-col'><IoIosTimer className='timer-icon'/><ReactTimeAgo date={new Date(row['@timestamp'])} timeStyle="mini"/> ago<br/>{formatDate(row['@timestamp'])}</div>
                )
            },
            className:'tscroller-20'
        },
        {
            dataField: 'name',
            text: 'Name',
            sortable: true,
            headerStyle: (colum, colIndex) => {
                return { width: '65%', textAlign: 'left' };
            },
            render: (row) => {
                return row.name;
            },
            className:'tscroller-65'
        },
        {
            dataField: 'data.meta.severity',
            text: 'Severity',
            sortable: true,
            headerStyle: (colum, colIndex) => {
                return { width:'15%',textAlign:'center' };
            },
            render: (row) => {
                let sev;
                if (row.type && row.type === 'agentics')
                {
                    sev = row && row?.meta && row.meta?.severity ? row.meta.severity : '3';
                    if (Debug)
                        console.log('render PT1 sev=' + sev)
                }
                else
                {
                    if (row && row?.data && row.data?.datahelix && row.data?.datahelix?.meta?.severity)
                    {
                        sev = row.data.datahelix.meta.severity;
                        if (Debug)
                            console.log('render PT2 sev=' + sev)
                    }
                    else
                    {
                        sev = row && row?.meta && row.meta?.severity ? row.meta.severity : '3';
                        if (Debug)
                            console.log('render PT3 sev=' + sev)
                    }
                }
                const style = {fontWeight:'bold',textAlign:'center',width:'70px',cursor:'pointer',pointerEvents:'none', ...(sev.toLowerCase() === 'high' && {color:'#333'})};
                return (
                    <label className={`pill ${sev.toLowerCase()} center m-0 p-0`} style={style}>{sev}</label>
                )
            },
            className:'tscroller-15'
        },
        {
            dataField: 'data.meta.unsafe',
            text: 'Unsafe',
            sortable: true,
            headerStyle: (colum, colIndex) => {
                return { width: '10%', marginInline:0,paddingLeft:0, textAlign: 'center' };
            },
            render: (row) => {
                let sev;
                let unsafe;
                if (row.type && row.type === 'agentics')
                {
                    if (row?.meta && row.meta?.unsafe)
                    {
                        sev = row.meta.unsafe <= 0 ? 'low' : row.meta.unsafe > 3 ? 'high' : 'warning';
                        unsafe = row.meta.unsafe;
                    }
                    else
                    {
                        sev = 'medium';
                        unsafe = '-';
                    }
                }
                else
                if (row?.data?.datahelix?.meta?.unsafe)
                {
                    sev = row.data.datahelix.meta.unsafe <= 0 ? 'low' : row.data.datahelix.meta.unsafe > 3 ? 'high' : 'warning';
                    unsafe = row.data.datahelix.meta.unsafe;
                }
                else
                {
                    sev = 'medium';
                    unsafe = '-';
                }
                const style = {fontWeight:'bold',textAlign:'center',width:'50px',cursor:'pointer',pointerEvents:'none'};
                return (
                    <label className={`pill ${sev} center m-0 p-0`} style={style}>{unsafe}</label>
                )
            },
            className:'tscroller-10'
        },
        {
            dataField: 'data.meta.analyzed',
            text: 'Entities',
            hidden: true,
            sortable: true,
            headerStyle: (colum, colIndex) => {
                return { width: '10%', textAlign: 'center', paddingInline:0 };
            },
            render: (row) => {
                let anal;
                if (row.type && row.type === 'agentics')
                {
                    anal = row?.meta?.analyzed;
                }
                else
                {
                    anal = row?.data?.datahelix?.meta?.analyzed;
                }
                if (!anal)
                    anal = '-';
                return (
                    <label className={`pill center`} style={{cursor:'pointer',pointerEvents:'none',margin:0,textAlign:'center'}}>{anal}</label>
                )
            },
            className:'tscroller-10'
        },
        {
            sortable: false,
            headerStyle: (colum, colIndex) => {
                return { width: '15%', textAlign: 'right' };
            },
            render: (row) => {
                return (
                    <span>
                        <button 
                            className='toolbar-btn'
                            style={{fontSize:'0.85em', 
                                    color:'#DDDDDD', 
                                    float:'right', 
                                    paddingBottom:0,
                                    marginRight:0,
                                    height:'100%'
                            }} type='button' 
                            onClick={(evt) => onDeleteReport(evt, row)}
                        >
                            <Trash/>
                        </button>
{/* //PDS TEST MARCH26         */}
                        <button 
                            className='toolbar-btn'
                            style={{fontSize:'0.85em', 
                                    color:'#DDDDDD', 
                                    float:'right', 
                                    paddingBottom:0,
                                    marginRight:0,
                                    height:'100%'
                            }} type='button' 
                            onClick={(evt) => onIncidentOperation(evt, row)}
                        >
                            <BiShieldQuarter/>
                        </button>
                    </span>
                )
            },
            className:'tscroller-15'
        },
        {
            dataField: 'id',
            text: 'ID',
            sortable: false,
            hidden: true
        }
    ];


    /*******************************************************************
      * * * D A T A   F E T C H I N G * * * 

      Data fetch for Report data

    *******************************************************************/
    const dataFetch = async ({queryKey}) =>
    {
        try
        {
            const [_key, page, rowsPerPage, sortField, sortOrder, timeRange] = queryKey;
            if (props.hasHistory != undefined && props.hasHistory === false)
                return [];
        
            if (Debug)
                console.log("dataFetch() DHRPTVIEW PT19DENTRY >>> ");
            const dhResults = await searchService.getDataHelixReports(rowsPerPage, page, sortField, sortOrder, timeRange, null, searchCriteria);
            if (Debug)
                console.log('dataFetch() DHRPTVIEW dh results: ',dhResults);

            // setTotalRows(dhResults.totalRows ? dhResults.totalRows : 0)
            // setData(dhResults.data ? dhResults.data : []);

            if (Debug)
                console.log('dataFetch() DHRPTVIEW PT19DE EXIT')

            return {
                dta: dhResults.data || [],
                ttlRows: dhResults.totalRows || 0
            };
        }
        catch (exc)
        {
            if (Debug)
                console.log('dataFetch() dataFetch exception', exc)
            return { dta: [], ttlRows: 0 };
        }
    };

    const queryKey = ['dataHelix', page, rowsPerPage, sortField, sortOrder, timeRange];

    const { data: queryData, status, isIdle, isFetching, isLoading, isSuccess, isError, error, failureCount, refetch } = useQuery(
        queryKey,
        dataFetch,
        {
            refetchOnWindowFocus: false,
            notifyOnChangeProps: ['data', 'error'],
            keepPreviousData: true
        }
    );


    function handleBack()
    {
        if (closing)
            return;

        setClosing(true);
    }


    function handleSlideAnimationEnd(event)
    {
        if (!closing || event.target !== event.currentTarget)
            return;

        onCancel?.();
    }

    function onRowClick()
    {
    }

    function onSortChanged()
    {
    }

    function onRefresh()
    {
    }

    function searchChangeHandler()
    {
    }

    function onPageChanged()
    {
    }

    function onRowsPerPageChanged()
    {
    }

    function onRowSelection()
    {
    }


    function renderReportView()
    {
        if (Debug)
            console.log('renderReportView ENTRY ');
        return (
            <>
                <SOCAAPITable
                    className='pr-0 tbody-scroller has-row-click'
                    title='Analysis Reports' 
                    includeHr={false}
                    data={tableData != undefined ? tableData : []} 
                    dataTotalLength={totalRows ? totalRows : tableData ? tableData.length : 0}
                    columns = { tableColumns }
                    keyField='id' 

                    onRowClick={onRowClick}
                    onSort={onSortChanged}
                    onRefresh={onRefresh}
                    defaultSort={{dataField:'@timestamp', order:'desc'}}
                    
                    onSearch={searchChangeHandler}
                    // pageSizeDefault={rowsPerPage}

                    pageable
                    pageNumber={page}
                    onPageChanged={onPageChanged}
                    onPageSizeChanged={onRowsPerPageChanged}
                    selectableRows={true}
                    onRowSelection={onRowSelection}
                    searchBar
                />
            </>
        )
    }

    return (
        <main
            className={`dashboards-portal-page reports-portal-page${closing ? ' closing' : ''}`}
            onAnimationEnd={handleSlideAnimationEnd}
        >
            <section className="portal-dashboard-card">
                <header className="portal-dashboard-header">
                    <div className="portal-dashboard-brand">
                        <DefaultBranding orientation="horizontal" />
                    </div>

                    <button
                        type="button"
                        className="portal-dashboard-back"
                        onClick={handleBack}
                        disabled={closing}
                    >
                        Back
                        <FaArrowRight aria-hidden="true" />
                    </button>
                </header>

                <div fluid className="form-container px-0 w-100">
                    <SOCATitleToolbar title={"Reports"} icon={<FaFileAlt />} />
                    <div className="portal-reports-content">
                        {/* <div className="management-points-empty"> */}
                            {renderReportView()}
                        {/* </div> */}
                    </div>
                </div>
            </section>
        </main>
    );
};


export { ReportsPortal };
