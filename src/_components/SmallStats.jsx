import React, { useEffect, useState, useMemo, useRef } from "react";
import { Card } from "react-bootstrap";
import { genUUID, invertColor } from "../util/Utilities.js";
//import "../css/smallstats.css";

/**
 * SmallStats.jsx
 * smallstats widget
 */
 const SmallStats = (state) => 
 {
  const [name, setName] = useState(state.name);
  const [title, setTitle] = useState(state.title);
  const [value, setValue] = useState(state.value);
  const [api, setApi] = useState(state.api);
  const [apiType, setApiType] = useState(state.apiType);
  const [valueColor, setValueColor] = useState(state.valueColor);
  const [annotation, setAnnotation] = useState(state.annotation);
  const [previousValue, setPreviousValue] = useState(state.previousValue);
  const [previousColor, setPreviousColor] = useState(state.previousColor);
  //If true, +4 is a good thing (e.g. 4 more incidents reolved)
  //If false, -4 is a good thing - all this affects the color of the previousValue
  const [increasingIsGood, setIncreasingIsGood] = useState(state.increasingIsGood);
  const [data, setData] = useState([]);

  const [valueUuid, setValueUuid] = useState(genUUID());
  const [previousValueUuid, setPreviousValueUuid] = useState(genUUID());

  if (increasingIsGood == undefined)
    setIncreasingIsGood(true);

  useEffect(() => {
    setValue(state.value);
    setValueColor(state.valueColor);
    setValueUuid(genUUID());
  }, [state.value])

  useEffect(() => {
    setIncreasingIsGood(state.increasingIsGood);
    setPreviousValue(state.previousValue);
    setPreviousColor(increasingIsGood && state.previousValue > 0 ? state.previousColor : invertColor(state.previousColor));
    setPreviousValueUuid(genUUID());
  }, [state.previousValue])

  function getValueColor() {
    if (valueColor === undefined) {
      setValueColor('#FFFFE0');
    }
    return valueColor;
  }

  function getPreviousColor() {
    if (previousColor === undefined) {
      setPreviousColor('#88CC88');
    }
    return previousColor;
  }

  return (
    <Card className="dash-cards dash-cards-smallstats smallstats">
      <Card.Header as="h5">{title}</Card.Header>
      <Card.Body>
        <div key={valueUuid} className={previousValue != undefined ? "value" : "value no-previous"} style={{"color": getValueColor() }}>{value}</div>
        <div className="annotation">{annotation}</div>
        {previousValue != undefined &&
          <div key={previousValueUuid} className="previous" style={{"color": getPreviousColor() }}>{(previousValue > 0 && increasingIsGood ? "+" : "") + previousValue}</div>
        }
      </Card.Body>
    </Card>
  )
}
export default SmallStats;
