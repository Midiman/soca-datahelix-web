import React, { useEffect, useRef, useState } from "react";
import ColumnResizer from "column-resizer";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, Comparator } from 'react-bootstrap-table2-filter';


const ResizableBootstrapTable = ({ data, resizable, resizeOptions }) => {
  const tableRef = useRef(null);

  const [resize, setResize] = useState();

  const enableResize = () => {
    if (!resize) {
      const resizeFn = new ColumnResizer(tableRef.current, resizeOptions);

      //@ts-ignore
      tableRef.current.className = tableRef.current?.className?.replace(
        "grip-padding",
        ""
      );

      setResize(resizeFn);
    } else {
      resize?.reset(resizeOptions);
    }
  };

  const disableResize = () => {
    if (!!resize) {
      resize?.reset({ disable: true });
    }
  };

  useEffect(() => {
    if (tableRef.current && resizable) {
      enableResize();
    }
  }, [tableRef]);

  useEffect(() => {
    return disableResize();
  }, []);




  ////////////////////////////////////////////////////
  // L O C A L S
  ////////////////////////////////////////////////////
  const defaultSort = 
  [
    {
      dataField: '_id',
      order: 'asc'
    }
  ];

  //This just changes the prompt
  const customFilter = textFilter(
    { placeholder: 'Filter' }
  );

  /**
  * Table column schema for Incidents
  * This holds the table column options.
  * 'dataField' is the mapping used for rows data field to column
  */
  const columns = 
  [
    {
      dataField: '_id',
      text: 'Incident ID',
      sort: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '10%', textAlign: 'left' };
      }
    }, 
    {
      dataField: 'displayname',
      text: 'Name',
      sort: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '40%', textAlign: 'left' };
      }
    }, 
    {
      dataField: 'runbook',
      text: 'Runbook',
      sort: true,
      filter: customFilter
    }, 
    {
      dataField: 'phase',
      sort: true,
      text: 'Phase',
      filter: customFilter
    }, 
    {
      dataField: 'assignedto',
      text: 'Assigned To',
      sort: true,
      filter: customFilter
    }, 
    {
      dataField: 'severity',
      text: 'Severity',
      sort: true,
      filter: customFilter
    }
  ];

  /**
   * Expand extension for incident stuff
   * TODO - setup a rendered component for Incident stuff - actions, summary
   */
  const expandRow = 
  {
    renderer: row => (
      <div>
        <p>{ `This Expand row is for:  ${row.id}` }</p>
        <p>Very cool, we can put an entire incident render in here</p>
        <p>or knowledgebase information, quick actions etc. <b>So cool!!</b> :-)</p>
        <p>This took only about two minutes to add!</p>
      </div>
    )
  };

  ////////////////////////////////////////////////////
  // D A T A   P R E - P R O C E S S I N G
  ////////////////////////////////////////////////////
  /**
   * Pre-process data for final rendering
   * This changes row field data e.g. mapping severity:1 => severity 'Critical'
  */
  if (Debug)
    console.log("IncidentCardTable: data [effect-pre]: " + data);
  if (data == undefined) 
  {
    if (Debug)
      console.log("data not ready");
  }
  else 
  {
    for (let i = 0; i < data.length; i++) 
    {
      console.log("IncidentCardTable: jobj: " + i + " => " + JSON.stringify(data[i]));
      //RUNBOOK
      if (data[i].runbook != 'undefined')
        data[i].runbook = capitalize(data[i].runbook);
      else
      if (Debug)
       console.log("IncidentCardTable: no runbook field found in row data");
      //PHASE
      if (data[i].phase != 'undefined')
        data[i].phase = capitalize(data[i].phase);
      else
      if (Debug)
         console.log("IncidentCardTable: no phase field found in row data");
      //SEVERITY
      if (data[i].phase != 'undefined')
        data[i].severity = lookupSeverity(data[i].severity);
      else
      if (Debug)
         console.log("IncidentCardTable: no severity field found in row data");
    }
  }







  return (
    <ResizableBootstrapTable
    fluid 
    resizable={true} resizerOptions={{}}
    keyField='_id' 
    defaultSorted={ defaultSort }
    data={ data } 
    columns={ columns } 
    striped={ true }
    bordered={ false }
    fixed={ true }
    expandRow={ expandRow } 
    filter={ filterFactory() }
  />
);
}
export default ResizableBootstrapTable;

