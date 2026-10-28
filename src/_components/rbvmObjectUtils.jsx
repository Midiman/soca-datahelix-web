/*********************************************************************************
 * rbvmObjectutils
 * 
 * Helper exports for things like displaying Asset data et.
 * 
 * @autor pds
 * @since 7.6
 * @sterotype data export
*********************************************************************************/
import React, { useState } from 'react';
import { Row, Col, Container, Button, Card, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useMap, MapContainer, ImageOverlay, TileLayer, Marker, Tooltip as LeafletTooltip, Popup } from 'react-leaflet';
import { BiEditAlt, BiLockAlt, BiRefresh, BiUndo } from 'react-icons/bi';
import { Slide } from "react-awesome-reveal";
import HCChart from './HCChart';
import SmallStats from './SmallStats';
import { SOCATable } from '@hct/soca-toolkit';
import { RBVMAssetExpandRow } from '@/_components/RBVMAssetExpandRow';
import { Debug, capitalize, lookupSeverity } from '../util/Utilities';

///////////////////////////////////////////////////////////////////////////////////
//PDS TEST
//var behaviorData = [5, 7, 0 , 14, 51, 21, 0, 29, 31, 19, 21, 0, 4, 5, 7, 0 , 14, 51, 21, 0, 29, 31, 19, 21, 0, 4, 5, 7, 0 , 14, 51, 21, 0, 29, 31, 19, 21, 0, 4];
var behaviorData = { "2022-10-10T00:00:00Z": 5, "2022-10-11T00:00:00Z": 0, "2022-10-12T00:00:00Z": 3, "2022-10-13T00:00:00Z": 4, "2022-10-14T00:00:00Z": 9, "2022-10-15T00:00:00Z": 0, "2022-10-16T00:00:00Z": 27, "2022-10-17T00:00:00Z": 2, "2022-10-18T00:00:00Z": 3, "2022-10-19T00:00:00Z": 0, "2022-10-20T00:00:00Z": 17, "2022-10-21T00:00:00Z": 5, "2022-10-22T00:00:00Z": 0, "2022-10-23T00:00:00Z": 11, "2022-10-24T00:00:00Z": 5, "2022-10-25T00:00:00Z": 19, "2022-10-26T00:00:00Z": 8, "2022-10-27T00:00:00Z": 10, "2022-10-28T00:00:00Z": 2, "2022-10-29T00:00:00Z": 0, "2022-10-30T00:00:00Z": 11, "2022-10-31T00:00:00Z": 14, "2022-11-01T00:00:00Z": 7, "2022-11-02T00:00:00Z": 4, "2022-11-03T00:00:00Z": 2, "2022-11-04T00:00:00Z": 1, "2022-11-05T00:00:00Z": 8, "2022-11-06T00:00:00Z": 1, "2022-11-07T00:00:00Z": 6, "2022-11-08T00:00:00Z": 0 };
var userData = [3, 17, 0, 1, 5, 21, 0, 129, 11, 19, 21, 0, 4, 5, 7, 0, 14, 51, 21, 0, 29, 31, 19, 21, 0, 4, 5, 7, 0, 14, 51, 21, 0, 29, 31, 19, 21, 0, 4];

export var scoreColorGood = "#66AA66";
export var scoreColorMedium = "#AAAA66";
export var scoreColorHigh = "#AA6666";
///////////////////////////////////////////////////////////////////////////////////

//PDS TEST
const position = [51.509865, -0.11809275];
const ResizeMap = () => {
  const map = useMap();
  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  const container = document.getElementById("map-container");
  resizeObserver.observe(container);

  return null;
};

/**
  * Used to display errors
*/
var alert = undefined;
function toggleModal() 
{
    alert = undefined;
}

var isModalPopup = false;

var modalWorkflowText = "No connectivity to workflow engine. API server is not available.";
var modalTicketText = "No Ticketing access is configured.";
var modalPushAgentText = "Unable to push agent.    Missing Azure App configuration.";

var modalText = modalWorkflowText;

function onClick(evt) {
  console.log("onClick() ENTRY : " + evt + " isModalPopup: " + isModalPopup);
  //  evt.preventDefault();
  if (evt === 'workflow')
    modalText = modalWorkflowText;
  else
    if (evt === 'ticket')
      modalText = modalTicketText;
    else
      if (evt === 'pushagent')
        modalText = modalPushAgentText;
  isModalPopup = true;

  if (evt === 'automations')
    isModalPopup = false;
  if (evt === 'correlations')
    isModalPopup = false;
  console.log("onClick() EXIT isModalPopup: " + isModalPopup);
}

function handleModalClose() {
  console.log("handleModalClose() ENTRY isModalPopup: " + isModalPopup);
  isModalPopup = false;
  console.log("handleModalClose() EXIT isModalPopup: " + isModalPopup);
}

export var customFilter;

const rbvmPlotOptions = {
  series: {
    dataLabels: {
      enabled: true,
      crop: false,
      overflow: 'allow',
      shadow: false,
      padding: 5,
      backgrounColor: 'transparent',
      style: {
        fontFamily: "'Roboto Light',Arial,Sans-Serif",
        fontWeight: 500
      },
      color: 'rgba(238, 238, 208, 0.8)'
    },
    lineWidth: 1,
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  },
  pie: {
    dataLabels: {
      crop: false,
      overflow: 'allow',
      shadow: false,
      distance: 20,
      padding: 0,
      format: '{point.name} ({y})'
    },
    borderWidth: 0,
    size: '110rem'
  },
  spline: {
    dataLabels: {
      enabled: false,
    },
    series: {
      xAxis: {
        visible: false
      },
      yAxis: {
        visible: false
      },
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  },
  areaspline: {
    dataLabels: {
      enabled: false,
    },
    series: {
      xAxis: {
        visible: false
      },
      yAxis: {
        visible: false
      },
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  },
  bar: {
    borderRadiusTopLeft: 3,
    borderRadiusTopRight: 3,
    dataLabels: {
      crop: false,
      overflow: 'allow',
      shadow: false,
      distance: 20,
      padding: 0,
    },
    borderWidth: 0,
    color: '#6A8888'
  },
  column: {
    borderRadiusTopLeft: 3,
    borderRadiusTopRight: 3,
    dataLabels: {
      crop: false,
      overflow: 'allow',
      shadow: false,
      distance: 20,
      padding: 0,
    },
    borderWidth: 0,
    color: '#6A8888'
  }
};

/**
* Table column schema for RBVM
* This holds the table column options.
* 'dataField' is the mapping used for rows data field to column
*/
export const assetColumns =
  [
    {
      dataField: 'id',
      text: 'ID',
      sort: false,
      hidden: true
    },
    {
      dataField: 'name',
      text: 'Asset Name',
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: '60%', textAlign: 'left' };
      }
    },
    {
      dataField: 'dnsName',
      text: 'DNS Name',
      sort: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '25%', textAlign: 'left' };
      }
    },
    {
      dataField: 'ipAddress',
      text: 'IP Address',
      sort: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '15%', textAlign: 'left' };
      }
    },
    {
      dataField: 'type',
      text: 'Type',
      sort: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '15%', textAlign: 'left' };
      }
    },
    {
      dataField: 'source',
      text: 'Source',
      sort: true,
      hidden: true,
      filter: customFilter,
      headerStyle: (colum, colIndex) => {
        return { width: '15%', textAlign: 'left' };
      }
    },
  ];

/**
 * Expand extension for RBVM asset stuff
 *
 * Note that 'data' is our normalized schema so is consistent across VM vendors.
 *
 */
export const rbvmAssetExpandRow = (data) => 
{

  if (Debug)
    console.log("rbvmExpandRow() ENTRY : " + JSON.stringify(data));

  const onboarded = data.data.vmMetaData.onboardingStatus != undefined && data.data.vmMetaData.onboardingStatus.includes("Onboarded");
  const avstatus = data.data.vmMetaData.defenderAvStatus != undefined && data.data.vmMetaData.defenderAvStatus.includes("Disabled");
  const onboardedsupported = data.data.vmMetaData.onboardingStatus != undefined &&
                             (data.data.vmMetaData.onboardingStatus.includes("Unsupported") || data.data.vmMetaData.defenderAvStatus.includes("NotSupported"));

    var score = Math.max(1, Math.floor(Math.random() * 10));
    if (score == 0)
    score = 1;

    return (
      <>
        <Container fluid className="rbvm-table incident-table" style={{ paddingRight: 0 }}>
          {/* HEADER ROW */}
          <Row style={{ width: "100%", marginTop:0 }}>
            <Col className="col-8" style={{ "margin": 0, "borderBottomRightRadius": 0, "borderTopRightRadius": 0 }}>
              <table className="incident-summary">
                <tbody>
                  <tr>
                    <th className="title-cell">{data._id} {data.name}</th>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col className="col-4" style={{ "margin": 0, "paddingRight": "0", "borderBottomLeftRadius": 0, "borderTopLeftRadius": 0 }}>
              {score >= 7 &&
                  <span className="badge bg-danger" style={{ "float": "right", "margin": "0 7px 4px 0" }}>High Vulnerability!</span>
              }
              {data.data.osPlatform != undefined && data.data.osPlatform.includes("Windows") &&
                <span className="badge bg-primary" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Windows</span>
              }
              {data.data.osPlatform != undefined && (data.data.osPlatform.includes("Linux") || data.data.osPlatform.includes("Ubuntu") || data.data.osPlatform.includes("CentOS")) &&
                <span className="badge bg-primary" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Linux</span>
              }
              {data.data.osPlatform != undefined && data.data.osPlatform.includes("Cisco") &&
                <span className="badge bg-primary" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Cisco</span>
              }
              {/*} TVM-specific ****************** {*/}
              {onboarded &&
                <span className="badge bg-success" style={{ "float": "right", "margin": "0 7px 4px 0" }}>On Boarded</span>
              }
              {onboarded &&
                <span className="badge bg-warning text-dark" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Not On Boarded</span>
              }
              {avstatus &&
                <span className="badge bg-danger" style={{ "float": "right", "margin": "0 7px 4px 0" }}>AV Disabled</span>
              }
              {onboardedsupported &&
                <span className="badge bg-warning text-dark" style={{ "float": "right", "margin": "0 7px 4px 0" }}>AV Not Supported</span>
              }
              {/*} ****************** TVM-specific {*/}
              <span className="badge bg-danger" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Needs Patching</span>
              <span className="badge bg-secondary" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Auto-Discovered</span>
              <span className="badge bg-secondary" style={{ "float": "right", "margin": "0 7px 4px 0" }}>Under Review</span>
            </Col>
          </Row>
          {/* STATS ROW */}
          <Row className="chart-row-expand" style={{ height: "100px", width: "100%" }}>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Total number of vulnerabilities currently detected for this device</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <SmallStats
                  name="totalvulnerabilities"
                  title="Total Vulnerabilities"
                  value="17"
                  valueColor="#AA6666"
                  previousValue="13"
                  previousColor="#A55555"
                  api="incidents-{$open}"
                  apiType="facet"
                />
              </Col>
            </OverlayTrigger>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Number of critical patches missing for this device</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <SmallStats
                  name="criticalpatches"
                  title="Critical Patches"
                  value="6"
                  valueColor="#DD6666"
                  previousValue="2"
                  previousColor="#A55555"
                  api="incidents-{$open}"
                  apiType="facet"
                />
              </Col>
            </OverlayTrigger>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Number of active workflows where this device is inlcuded</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <SmallStats
                  name="worfklowsunderway"
                  title="Workflows Underway"
                  value="0"
                  valueColor="#666666"
                  previousValue=""
                  previousColor="#A55555"
                  api="incidents-{$open}"
                  apiType="facet"
                />
              </Col>
            </OverlayTrigger>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Number of pending workflows where this device is inlcuded</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <SmallStats
                  name="worfklowpending"
                  title="Workflows Pending"
                  value="2"
                  valueColor="#66AA66"
                  previousValue=""
                  previousColor="#A55555"
                  api="incidents-{$open}"
                  apiType="facet"
                />
              </Col>
            </OverlayTrigger>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Time-based vulnerability activity detections over this time period</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <HCChart
                  title="Vulnerability Trend"
                  type="sparkline"
                  plotOptions={rbvmPlotOptions}
                  series={behaviorData}
                  data={behaviorData}
                >
                </HCChart>
              </Col>
            </OverlayTrigger>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>Time-based user and entity activity over this time period</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="chart-col-expand">
                <HCChart
                  title="UEBA Behavior Trend"
                  type="sparkline"
                  plotOptions={rbvmPlotOptions}
                  color="#59A78A"
                  series={userData}
                  data={userData}
                >
                </HCChart>
              </Col>
            </OverlayTrigger>
            <Col className='p-0 mr-0'>

              <div id="map" style={{ height:'100px', padding:'0px', border:'0px solid #161D1D', borderRadius:'4px' }}>
                <MapContainer
                  id="map-container"
                  style={{ borderRadius:'4px', height:'100%', minHeight:'100%', width:'100%', minWidth:'100%' }}
                  center={data.data.location != undefined ? [data.data.location.geo.latitude, data.data.location.geo.longitude] : position}
                  zoom={3}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    noWrap={false}
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  />
                  <Marker icon={L.icon({iconUrl: 'marker-icon.png'})} position={data.data.location != undefined ? [data.data.location.geo.latitude, data.data.location.geo.longitude] : position} style={{height:'16px'}} isActive>
                    {data.data.location != undefined &&
                      <Popup>
                        {data.data.location.name}<br />{data.data.location.description}
                      </Popup>
                    }
                  </Marker>
                  <ResizeMap />
                    </MapContainer>
              </div>

            </Col>
          </Row>
          {/* TABLE / ACTIONS ROW */}
          <Row className="chart-row-expand" style={{ width: "100%" }}>
            {/* TABLE COL 
        
//					"id": "05f6d4239f7c1adf6648542e6b317bb3d3a60e11",
//					"computerDnsName": "sql-01.dagon.local",
//					"firstSeen": "2022-10-26T17:08:21.272Z",
//					"lastSeen": "2022-11-04T08:32:54.409Z",
//					"osPlatform": "WindowsServer2019",
//					"osVersion": null,
//					"osProcessor": null,
//					"version": "1809",
//					"lastIpAddress": "10.0.75.12",
//					"lastExternalIpAddress": null,
					"agentVersion": "1.1500",
					"osBuild": 17763,
//					"healthStatus": "Active",
					"deviceValue": "Normal",
					"rbacGroupId": 819,
					"rbacGroupName": "Full Remediation",
					// "riskScore": "None",
					// "exposureLevel": "None",
					"isAadJoined": false,
					"aadDeviceId": null,
					"machineTags": [],
					"defenderAvStatus": "Unknown",
					"onboardingStatus": "CanBeOnboarded",
					"osArchitecture": null,
					"managedBy": "Unknown",
					"managedByStatus": "Unknown",
					"ipAddresses": [
						{
							"ipAddress": "10.0.75.12",
							"macAddress": null,
							"type": null,
							"operationalStatus": "Unknown"
						}
					],
					"vmMetadata": null

        
        
        */}
            <Col className="table-col-expand">
              <table className="incident-summary">
                <tbody>
                  <tr>
                    <th>Name</th><td>{data.name}</td>
                  </tr>
                  <tr>
                    <th>IP Address</th><td>{data.data.ipAddress}</td>
                  </tr>
                  <tr>
                    <th>Platform</th><td>{data.data.osPlatform}</td>
                  </tr>
                  <tr>
                    <th>Version</th><td>{data.data.version}</td>
                  </tr>
                  <tr>
                    <th>VM Vendor</th><td>{data.data.vendor}</td>
                  </tr>
                  <tr>
                    <th>Location</th><td>{data.data.location != undefined ? data.data.location.name : "-"}</td>
                  </tr>
                  <tr>
                    <th>Agent Version</th><td>{data.data.agentVersion}</td>
                  </tr>
                  <tr>
                    <th>On-Boarding Status</th><td>{data.data.vmMetaData.onboardingStatus}</td>
                  </tr>
                  <tr>
                    <th>AAD Joined</th><td>{data.data.vmMetaData.isAadJoined ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <th>AV Status</th><td>{data.data.vmMetaData.defenderAvStatus}</td>
                  </tr>
                  <tr>
                    <th>Managed by</th><td>{data.data.managedBy != undefined ? data.data.managedBy : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col className="table-col-expand">
              <table className="incident-summary">
                <tbody>
                  <tr>
                    <th>Health Status</th>
                    <td>
                      <span className="badge bg-success" style={{ "width": 100, "margin": "0 7px 4px 0" }}>{data.data.healthStatus}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Device Status</th>
                    <td>
                      <span className="badge bg-info" style={{ "width": 100, "margin": "0 7px 4px 0" }}>{data.data.deviceStatus}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Risk Score</th><td>{data.data.riskScore != undefined ? data.data.riskScore : "-"}</td>
                  </tr>
                  <tr>
                    <th>Exposure Level</th><td>{data.data.exposureLevel}</td>
                  </tr>
                  <tr>
                    <th>Impact Level</th><td>{data.data.impactLevel != undefined && data.data.impactLevel > 0 ? data.data.impactLevel : "-"}</td>
                  </tr>
                  <tr>
                    <th>First Seen</th><td>{data.data.firstSeen}</td>
                  </tr>
                  <tr>
                    <th>Last Seen</th><td>{data.data.lastSeen}</td>
                  </tr>
                  <tr>
                    <th>ID</th><td>{data.id}</td>
                  </tr>
                  <tr>
                    <th>Action Group</th><td>{data.data.vmMetaData.rbacGroupName}</td>
                  </tr>
                  <tr>
                    <th>Managed by Status</th><td>{data.data.managedByStatus != undefined ? data.data.managedByStatus : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            {/* SCORE COL */}
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>
                  <Slide bottom duration={350}>
                    <div><span>A score of less than 4 is good health.<br />7 and above means this device needs attention</span></div>
                  </Slide>
                </Tooltip>
              }
            >
              <Col className="risk-score-card col-sm-2 chart-col-expand full" style={{ verticalAlign: "middle" }}>
                <SmallStats
                  style={{ height: "100%"}}
                  name="score"
                  title="Risk Score"
                  value={score}
                  valueColor={score < 4 ? scoreColorGood : score >= 7 ? scoreColorHigh : scoreColorMedium}
                  previousValue=""
                  previousColor="#A55555"
                />
              </Col>
            </OverlayTrigger>
            {/* ACTIONS COL */}
            <Col className="col-sm-1 col-action-center">
              <Card className="action-center" style={{ "backgroundColor": "#265058", "width": "100%", "height": 200 }}>
                <Card.Header as="h5">Actions</Card.Header>
                <Card.Body>
                  <table className="action-table">
                    <tbody>
                      <tr>
                        <td><Button className="action-button" variant="info" onClick={() => onClick('workflow')}>Add To Workflow</Button></td>
                      </tr>
                      <tr>
                        <td><Button className="action-button" variant="info" onClick={() => onClick('ticket')}>Create Ticket</Button></td>
                      </tr>
                      <tr>
                        <td><Button className="action-button" variant="info" onClick={() => onClick('pushagent')}>Push Agent</Button></td>
                      </tr>
                      <tr>
                        <td><Button className="action-button action-button-alt" variant="info" onClick={() => onClick('automations')}>Automations</Button></td>
                      </tr>
                      <tr>
                        <td><Button className="action-button action-button-alt" variant="info" onClick={() => onClick('correlations')}>Correlations</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        {/* MODAL */}
        <Modal
          show={isModalPopup}
          onHide={handleModalClose}
          backdrop="static"
          keyboard={true}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Workflow Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalText}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  };

function onUndoAll(evt)
{
  if (Debug)
    console.log("toolbar: onUndoAll() ENTRY : " + evt.target);
//TODO
  evt.preventDefault();
}

function onEditClick(evt)
{
  if (Debug)
    console.log("toolbar: onEditClick() ENTRY : " + evt.target);
//TODO
  evt.preventDefault();
}

function onLockClick(evt)
{
  if (Debug)
    console.log("toolbar: onLockClick() ENTRY : " + evt.target);
//TODO
  evt.preventDefault();
}

function onRefreshClick(evt)
{
  if (Debug)
    console.log("toolbar: onRefreshClick() ENTRY : " + evt.target);
//TODO
  evt.preventDefault();
}

function renderButtonGroup()
{
  return (
    <span style={{float:'right'}}>
      <Button onClick={onEditClick} className='toolbar-btn' style={{marginTop:'-5px'}}><BiEditAlt className='disabled'/></Button>
      <Button onClick={onLockClick} className='toolbar-btn' style={{marginTop:'-5px'}}><BiLockAlt className='disabled'/></Button>    
      <Button onClick={onRefreshClick} className='toolbar-btn' style={{marginTop:'-5px'}}><BiRefresh/></Button>
    </span>
  )
}

/**
  * expandRow handler for riskmap to expand assets
  */
const expandAssetRow = (row) => 
{
    return <RBVMAssetExpandRow row={row} />
}

/**
 * Expand extension for RBVM riskmap stuff
 *
 * Note that 'data' is our normalized schema so is consistent across VM vendors.
 *
 */
export const rbvmRiskMapExpandRow = (data, 
                                     desc, 
                                     onSubmit,
                                     nameChangeHandler,
                                     typeChangeHandler,
                                     criteriaChangeHandler,
                                     criteria,
                                     expandRow,
                                     autoAdd,
                                     autoAddChangeHandler) => 
{
  console.log("rbvmRiskMapExpandRow() ENTRY : " + JSON.stringify(data));

  return (
      <Container fluid className="form-container px-0 d-flex flex-column">
{/*}          { desc != undefined && <h5 className='desc'>{desc}</h5> }
{*/}
          <div>

            <Row>
              <Col md={10}>
                {/*} *** NAME FIELD ***{*/}
                <Form.Group className='mb-1' controlId='name'>
                    <Form.Label style={{ display: 'flex' }}>RiskMap Name</Form.Label>
                    <OverlayTrigger
                        delay={{ show: 900, hide: 400 }}
                        overlay={
                            <Tooltip>
                                <Slide direction='left' triggerOnce duration={350}>
                                    <span width='100%'>
                                        The name of this RiskMap
                                    </span>
                                </Slide>
                            </Tooltip>
                        }
                    >
                        <Form.Control
                            style={{paddingTop:10, paddingBottom:30}}
                            className='form-title'
                            type='text'
                            defaultValue={data.data.name}
                            onChange={nameChangeHandler}
                            placeholder='Name'
                        />
                    </OverlayTrigger>
                </Form.Group>
              </Col>
              <Col md={2} style={{float:'right'}}>
                <Form.Label style={{ display: 'flex' }}>&nbsp;</Form.Label>
                {renderButtonGroup()}
              </Col>
            </Row>
            <Row>
              <Col>
                {/*} *** NAME FIELD ***{*/}
{/*}                
                <Form.Group className='mb-1' controlId='name'>
                    <Form.Label style={{ display: 'flex' }}>RiskMap Name</Form.Label>
                    <OverlayTrigger
                        delay={{ show: 900, hide: 400 }}
                        overlay={
                            <Tooltip>
                                <Slide direction='up' triggerOnce duration={350}>
                                    <span>
                                        The name of this RiskMap
                                    </span>
                                </Slide>
                            </Tooltip>
                        }
                    >
                        <Form.Control
                            className='form-title'
                            type='text'
                            value={data.data.name}
                            onChange={nameChangeHandler}
                            placeholder='Name'
                        />
                    </OverlayTrigger>
                </Form.Group>
{*/}

<Form.Group className='mb-1' controlId='tid'>
  <Form.Label style={{ display: 'flex' }}>ID</Form.Label>
      <Form.Control
          type='text'
          defaultValue={data.id}
          placeholder='ID'
      />
</Form.Group>


              </Col>
              <Col>
                {/*} *** TYPE FIELD ***{*/}
                <Form.Group className='mb-1' controlId='type'>
                    <Form.Label style={{ display: 'flex' }}>Type</Form.Label>
                    <OverlayTrigger
                        delay={{ show: 900, hide: 400 }}
                        overlay={
                            <Tooltip>
                                <Slide direction='up' triggerOnce duration={350}>
                                    <span>
                                        Element RiskMap type
                                    </span>
                                </Slide>
                            </Tooltip>
                        }
                    >
                        <Form.Select
                            className="combobox-type"
                            aria-label="Select type.."
                            value={data.data.type}
                            onChange={typeChangeHandler}

  //                          disabled
                        >
                            <option value="0">Select type..</option>
                            <option value="subnet">Subnet</option>
                            <option value="platform">Platform</option>
                            <option value="priority">Priority</option>
                            <option value="score">Risk Score</option>
                            <option value="vuln">Vulnerabilities</option>
                            <option value="custom">Custom</option>
                        </Form.Select>
                    </OverlayTrigger>
                </Form.Group>

                {/*} *** CRITERIA FIELD ***{*/}
                <Form.Group className='mb-1' controlId='criteria'>
                    <Form.Label style={{ display: 'flex' }}>Match Criteria</Form.Label>
                    <OverlayTrigger
                        delay={{ show: 900, hide: 400 }}
                        overlay={
                            <Tooltip>
                                <Slide direction='up' triggerOnce duration={350}>
                                    <span>
                                        The criteria used for membership
                                    </span>
                                </Slide>
                            </Tooltip>
                        }
                    >
                        <Form.Control
  //                          className='readonly'
                            type='text'
                            defaultValue={data.data.matchCriteria}
                            onChange={criteriaChangeHandler}
                        />
                    </OverlayTrigger>
                </Form.Group>
              </Col>
            </Row>
            {/*} *** MEMBER TABLE ***{*/}
            <Row className='mb-1' style={{display:'grid'}} controlId='members'>
                <Form.Label style={{ display: 'flex' }}>Risk Map Members</Form.Label>
                <SOCATable
                    title='Assets'
                    data={data.data.members != undefined ? data.data.members : []}
                    columns={assetColumns}
                    filterPlaceholder="Search"
                    keyField='source'
                    selectedSizePerPage={50}
                    selectableRows={false}
                    expandRow={expandRow != undefined ? expandRow : expandAssetRow}
                    searchBar
                    noStripes
                />
            </Row>

            {/*} *** AUTO-ADD FIELD ***{*/}
{/*}            
            <Form.Group className='mb-1' controlId='autoAdd'>
                <OverlayTrigger
                    delay={{ show: 900, hide: 400 }}
                    overlay={
                        <Tooltip>
                            <Slide direction='up' triggerOnce duration={350}>
                                <span>
                                    If selected, matching items will be automatically added
                                </span>
                            </Slide>
                        </Tooltip>
                    }
                >
                    <Form.Check
                        className='checkbox-lg'
                        type="checkbox"
                        label="Automatic"
                        checked={autoAdd}
                        onChange={autoAddChangeHandler}
                    />
                </OverlayTrigger>
            </Form.Group>
{*/}
            {/*} *** SUBMIT BUTTON ***{*/}
{/*}
            { onSubmit != undefined &&
              <span>
                <Button onClick={onUndoAll} style={{ height:'2.3em', float: 'right', padding:'4.3px 12px', marginLeft:'5px' }} variant="primary" disabled={data.updated == undefined || data.updated}><BiUndo style={{fontSize:'1.7em'}}/></Button>
                <Button style={{ height:'2.3em', float:'right' }} variant="primary" type="submit" disabled={data.updated == undefined || data.updated}>
                  Update RiskMap
                </Button>
              </span>
            }
{*/}            
          </div>

          {/*} ***  A L E R T   M O D A L   S T U F F  ***{*/}
          <Slide direction='up' duration={350}>
              <Modal
                  isOpen={alert != undefined}
                  className="alert-modal"
                  overlayClassName="alert-modal-overlay"
                  onRequestClose={toggleModal}
              >
                  <Card>
                      <Card.Header>
                          {alert != undefined ? alert.title : ""}                    
                      </Card.Header>
                      <Card.Body>
                          <span style={{display:"inline-flex"}}>
                              <Image className='ms-1' color="warning" icon='warning' size='4x' style={{margin:"auto 0", paddingRight:20}}/>
                              <pre style={{margin:"auto 0"}}>
                                  { alert != undefined ? alert.message : "An unknown error occurred" }
                              </pre>
                          </span>
                      </Card.Body>
                      <Card.Footer>
                          <Button onClick={toggleModal}>Close</Button>
                      </Card.Footer>
                  </Card>
              </Modal>
          </Slide>
      </Container>
  )
}

/**
 * Expand extension for RBVM riskmap  stuff
 *
 * Note that 'data' is our normalized schema so is consistent across VM vendors.
 *
 */
export const rbvmStakeholderExpandRow = (data) => 
{
  console.log("rbvmStakeholderExpandRow() ENTRY : " + JSON.stringify(data));

  return (
    <>
    </>
  )
}
