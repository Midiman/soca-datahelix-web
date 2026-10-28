import React, { Component, useState, useEffect, useRef } from 'react';
import {Card} from "react-bootstrap";
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
//import '@/hcchart.css';

function tooltipFormatter() {
  let date = new Date(this.x);
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);  
  let hr = (date.getHours() + "").padStart(2, "0");
  let mn = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(date).padStart(2, "0");  
  let se = new Intl.DateTimeFormat('en', { second: 'numeric' }).format(date);  
  let ampm = new Intl.DateTimeFormat('en', { hour: 'numeric'}).format(date);  
return da + ' ' + mo + ' ' + ye + ': <b>' + this.y + '</b>';
}

const defaultChartOptions =
{
  chart: {
    renderTo: 'chart',
    margin: 0,
    marginTop: 10,
    offset: 0,
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false,
  },
  credits: { enabled: false },
  title: { text: null },
  tooltip: {
    style: { color: '#FFF' },
    backgroundColor: 'rgba(64, 128, 128, 0.8)',
    borderRadius: 4,
    borderColor: 'rgba(64, 128, 128, 0.5)',
    pointFormat: '{x} {point.y}'
  },
  accessibility: {
      point: {
          valueSuffix: null
      }
  },
  legend: {
    enabled: false
  },
  xAxis: {
    minPadding: 0,
    maxPadding: 0,
    title: false,
    visible: false,
    grouping: false,
    labels: {
      useHTML: true,
      style: {
        color: '#EEE'
      }
    },
//    categories: props.data != undefined ? Object.keys(props.data) : undefined
  },
  yAxis: {
    minPadding: 0,
    maxPadding: 0,
    title: false,
    align:'right',
    visible: false
  },
  plotOptions: {
      pie: {
          className: 'pie-options',
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          format: '{point.name}: {y}',
          dataLabels: {
              enabled: true,
              distance: 15,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          }
      },
      column: {
          className: 'column-options',
          color: '#408080',
          borderWidth: 0.3,
          borderRadius: 2,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          distance: 20,
          padding: 0,
          format: '{point.name}: {y}',
          dataLabels: {
              enabled: true,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          }
      },
      bar: {
          className: 'bar-options',
          color: '#408080',
          borderWidth: 0.3,
          borderRadius: 2,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          distance: 20,
          padding: 0,
          format: '{point.name}: {y}',
          dataLabels: {
              enabled: true,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          }
      },
      line: {
          className: 'line-options',
          lineColor: '#7CA4AB',
          color: '#59838A',
          lineWidth: 1,
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          distance: 20,
          padding: 0,
          format: '{point.name}: {y}',
          marker: {
            enabled: false
          },
          dataLabels: {
              enabled: true,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          }
      },
      spline: {
          className: 'spline-options',
          lineColor: '#7CA4AB',
          color: '#59838A',
          lineWidth: 1,
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          distance: 20,
          padding: 0,
          format: '{point.name}: {y}',
          marker: {
            enabled: false
          },
          dataLabels: {
              enabled: true,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          }
      },
      areaspline: {
          className: 'spline-options',
          pointPlacement: 'on',              
          lineColor: '#7CA4AB',
          color: '#59838A',
          clip: false,
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          crop: false,
          overflow: 'allow',
          shadow: false,
          center: ['50%', '50%'],
          padding: 0,
          format: '{point.name}: {y}',
          marker: {
            enabled: false
          },
          dataLabels: {
              enabled: false,
              crop: true,
              useHTML: true,
              color: '#EEE',
              format: '{point.name}: {y}'
          },
          animation: false,
          lineWidth: 0.5,
          fillOpacity: 0.3
      }
  }
  // ,
  // series: [
  //     { data: props != undefined && props.data != undefined ? Object.values(props.data) : undefined}
  //   ]
};


/**
 * HCChart.jsx
 * @param {*} props 
 * @returns 
 */
const HCChart = ( props ) => 
{
  const [name, setName] = useState(props.name);
  const [title, setTitle] = useState(props.title);
  const [xaxisTitle, setXaxisTitle] = useState(props.xaxistitle != undefined ? props.xaxistitle : "Time");
  const [yaxisTitle, setYaxisTitle] = useState(props.yaxistitle);
	const [annotation, setAnnotation] = useState(props.annotation);
	const [type, setType] = useState(props.type);
	const [categoryData, setCategoryData] = useState(props.categoryData != undefined ? props.categoryData : props.data != undefined ? Object.keys(props.data) : undefined);
	const [seriesData, setSeriesData] = useState(props.series);
  const [data, setData] = useState(props.data);
  const [plotOptions, setPlotOptions] = useState(props.plotOptions);
  const [xAxisOptions, setXAxisOptions] = useState(props.xAxisOptions);
  const [yAxisOptions, setYAxisOptions] = useState(props.yAxisOptions);
  const [color, setColor] = useState(props.color);
  const [chartOptions, setChartOptions] = useState(
    props.chartOptions != undefined 
      ?
        {
          ...defaultChartOptions,
          ...props.chartOptions,
          type: props.type != 'sparkline' ? props.type : 'areaspline',
          xAxis: {
            ...props.chartOptions.xAxis,
            categories: props.categoryData != undefined && categoryData
          }
        }
      :
        defaultChartOptions
  );

  var className = "dash-cards chart-card";
  if (props.className !== undefined )
    className += " " + props.className;

  /**
    useEffect()
  */
  useEffect(() => 
  {
    if (props.data != undefined)
    {
      setCategoryData(Object.keys(props.data));
      setData(Object.values(props.data));
    }
    else 
    {
      setCategoryData(props.categories);
      setData(props.data);
    }

    setChartOptions({ 
      ...chartOptions,
      chart: {
        type: props.type != 'sparkline' ? props.type : 'areaspline'
      },
      // xAxis: {
      //   categories: categoryData,
      // }
    });

    if (props.chartOptions != undefined)
    {
      setChartOptions({
        ...props.chartOptions,
        chart: {
          type: props.type != 'sparkline' ? props.type : 'areaspline'
        },
        xAxis: {
          ...props.chartOptions.xAxis,
//          categories: categoryData,
          labels: {
            step: 1,
            rotation: 45,
            style: {
              fontSize: '8px',
              fontFamily: 'lato'
            }
          }
        },
        series: [
          { data: props != undefined && props.data != undefined ? Object.values(props.data) : undefined}
        ]
      });
    }
  }, [props.data])

  /*************************************************
    render
  *************************************************/
  switch (type)
  {
    case "pie":
    default:
      return (
        <Card className={className} style={{padding:0, width: "100%", height:props.height != undefined ? props.height : '100%'}}>
          <Card.Header as="h5">{title}</Card.Header>
          <Card.Body style={{paddingTop: 0}}>
            <HighchartsReact
                  highcharts={Highcharts}
                  constructorType = { 'chart' }
                  options={chartOptions}
                />
          </Card.Body>
        </Card>
      );
    case 'sparkline':
      setType('areaspline');
      return (
        <Card className={className} style={{padding:0, width: "100%", height:props.height != undefined ? props.height : '100%'}}>
          <Card.Header as="h5">{title}</Card.Header>
          <Card.Body style={{display:'block', margin:0, paddingTop: 0}}>
            <HighchartsReact
                  style={{display:'block',paddingTop:'10px', margin:0, offset:0}}
                  highcharts={Highcharts}
                  constructorType = { 'chart' }
                  options={chartOptions}
                />
          </Card.Body>
        </Card>
      );
  }
}
export default HCChart;
