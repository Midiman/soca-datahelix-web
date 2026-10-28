import React, { useEffect, useState, useRef } from "react";
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import {Card} from "react-bootstrap";
//import HighchartsReact from 'highcharts-react-official'
//import Highcharts from 'highcharts/highstock'
import HCChart from "./HCChart";
//import '../css/dashcards.css';

/*
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)
*/

const Defaults = {
//	categories: ['QRadar', 'DataHelix NDR', 'DataHelix PDR', 'Palo Alto','Splunk'],
//  series: {data: [ 25, {data}, 14, 15, 13], type: "pie"}
}

/**
 * ChartCard.jsx
 * @param {*} param0 
 * @returns 
 */
const ChartCard = (props) =>
{
	const [name, setName] = useState(props.name);
	const [title, setTitle] = useState(props.title);
	const [annotation, setAnnotation] = useState(props.annotation);
	const [type, setType] = useState(props.type);
	const [chartLib, setChartLib] = useState(props.chartLib);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
	const [config, setConfig] = useState(props.config);
	const [categoryData, setCategoryData] = useState(props.categories);
	const [seriesData, setSeriesData] = useState(props.series);
  const data = [];
	const node = useRef();


	const [trigger, setTrigger] = useState(props.trigger);

/*
	const [chartOptions, setChartOptions] = useState(
		{
	    series: seriesData
	  });
*/


//	if (seriesData == undefined)
//		setSeriesData([]);

	const [chartOptions, setChartOptions] = useState({
	//Highchart options
		  title: {
			text: null
		  },
		  exporting: {
		  	enabled: false
		  },
		  scrollbar: {
		    enabled: false
		  },
		  rangeSelector: {
		    enabled: false
		  },
		  navigator: {
		    enabled: false
		  },
		  yAxis: {
			title: {
				style: {
					color: '#FFFFE0',
				},
				margin: 2
			},
			labels: {
				style: {
					color: '#FFFFE0',
				}
			},
			offset: -15,
		  },
		  xAxis: {
				title: {
					text: 'Users',
					margin: 0,
					style: {
						color: '#FFFFE0',
					}
				},
				color: '#FFFFE0',
				labels: {
					style: {
						color: '#FFFFE0',
					}
				},
				offset: 0,
				categories: categoryData
		  },
		  plotOptions: {
				series: {
					dataLabels: {
						crop: false,
						overflow: 'allow',
						shadow: false,
						padding: 0,
						style: {
							fontFamily: 'Roboto,Arial,Sans-Serif',
							fontWeight: 500,
						},
						color: '#FFFFE0'
					}
				},
				pie: {
					startAngle: 45,
					dataLabels: {
						crop: false,
						overflow: 'allow',
						shadow: false,
						distance: 20,
						padding: 0,
					},
					borderWidth: 0,
					size: '110rem'
				}
		  },
		  chart: {
				marginLeft: 30,
				marginBottom: 46,
				height: '40%',
		    reflow: true
		  },
			legend: {
				enabled: false
		  },
		  credits: {
			enabled: false
		  },
		  reflow: true,
		  series: seriesData
	});


/*
	useEffect(() => {


		setCategoryData(props.categories);
		setSeriesData(props.series);
console.log("34a: useEffect() " + seriesData);
		chartOptions.xAxis.categories = categoryData;
		chartOptions.series = seriesData;
		setChartOptions(chartOptions);
// 		Highcharts.current = Highcharts.chart(node., chartOptions);
 		console.log("34b: useEffect() " + chartOptions.xAxis.categories + " : " + chartOptions.series);
  }, [trigger, categoryData, seriesData, chartOptions, chartOptions.series])
	*/

//PDS TEST - test recharts tooltip
	function tooltip(props) {
	    var price = ""
	    var date = ""
	    console.log(props)

	    if (props.data[props.label]) {
	        price = props.data[props.label]["1. open"]
	        date = props.data[props.label]["date"]
	    }

	    return (
	        <div>
	            <div >{date} </div>
	            <div style={{ color: "rgb(0,200,5)"}}> $ {price}</div>

	        </div>
	    )

	}

    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    useEffect(() => {
		setTrigger(props.trigger);
		if (chartLib === 'recharts') {
	        fetch("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=IBM&apikey=")
	            .then(res => res.json())
	            .then(
	                (result) => {

	                    for (var instance in result["Weekly Time Series"] ) {
	                        	var thedata = (result["Weekly Time Series"][instance])
	                        	thedata.date = instance
	                        	data.push(thedata)
	                    }
	                    setItems(data.reverse())
	                },

	                // Note: it's important to handle errors here
	                // instead of a catch() block so that we don't swallow
	                // exceptions from actual bugs in components.
	                (error) => {
	                    setIsLoaded(true);
	                    setError(error);
	                }
	            )
		}
		else {
/*
//TODO - highcharts
			var ltype;
			switch (type)
			{
				default:
				case 'spline':
					ltype = "spline";
					setSeriesData([
//					  ["Bill", "Susan", "Harry", "Meghan"],
					  [{
							type: ltype,
					    name: 'Fully Compliant',
					    data: [10, 3, 5, 0]
					  }, {
							type: 'column',
					    name: 'Half compliant',
					    data: [3, 6, 8, 1]
					  }, {
						type: 'areaspline',
					    name: 'Non compliant',
					    data: [7, 5, 3, 4]
					  }]
					]);
					break;
				case 'pie':
console.log("34c pie")				;
					ltype = "pie";

					setCategoryData([ "QRadar", "Cisco", "Splunk", "three", "four" ]);

					setSeriesData([
//					  [ "QRadar", "Cisco", "Splunk" ],
					  [{
						type: ltype,
					    name: 'Fully Compliant',
//					    data: {seriesData}
					    data: [['QRadar', 45], ['DataHelix NDR', 30], ['DataHelix PDR', 14], ['Palo Alto', 5], ['Splunk', 3]]
					  }]
				]);

//				chartOptions.xAxis.categories = {categoryData};
//					chartOptions.series = seriesData;
					chartOptions.series = { data: [Math.random(10) * 12, Math.random(10) * 40, Math.random(10) * 13], type:'pie'};

//					chartOptions.series = { data: [Math.random(10) * 12, Math.random(10) * 40, Math.random(10) * 13], type:'pie'};
					break;
			}
//			setChartOptions(chartOptions);
			console.log("34d hc  " + JSON.stringify(chartOptions.series));
//			 setChartOptions({ series: [{ data: props.series }] });
*/
		}
	}, [props.trigger, props.series])

	//////////////////////////////////////////////////////////////////////////////
	//RENDER
	switch (chartLib) {
		case "recharts":
			return (
			        <Card className="dash-cards chart-card" style={{"width": "100%", "height":180}}>
			          <Card.Header as="h5">{title}</Card.Header>
			          <Card.Body>
										<ResponsiveContainer>
				            	<LineChart margin={{ top: 140, right: 2, left: 2, bottom: 2 }} data={items}>
												<Line dot={false}  type="monotone" isAnimationActive={false} dataKey="1. open" stroke="rgb(0,200,5)" yAxisId="100" />
											</LineChart>
										</ResponsiveContainer>
			          </Card.Body>
			        </Card>
		    );
			break;
		case "highcharts":
		default:
			return (
					<HCChart data={seriesData}>
					</HCChart>
		    );
			break;
	}

}
export default ChartCard;

