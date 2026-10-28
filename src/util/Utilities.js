/**
  React SessionContext Stuff
*/
import React, { useContext } from 'react';
import { SessionContext, GetDebug, SetDebug as SetToolKitDebug } from '@hct/soca-toolkit';

const SessionPropsProvider = () => 
{
    const sessionContext = useContext(SessionContext); //<-can come from App or Storybook (dev) or Framework (Full App)
    setSessionProps(sessionContext.getSessionProps()); //<- set the local properties for this component
}
export { SessionPropsProvider };

/**
  Utilities functions
*/
import { sessionProps, setSession } from './session';

export var Debug = false;

//SET APPLICATION DEBUG HERE >>>>>>>>>>>>>>>>>>>
//SetDebug(false);
export const SetDebug = () => 
{
    if (window.DEBUG != undefined && window.DEBUG.trim().toLowerCase() === 'true')
    {
        console.info('[datahelix-web] Debug is on')
        Debug = true;
        return true;
    }
    Debug = false;
    return false;
}



// export function SetDebug(dbg)
// {
//     Debug = dbg
//     SetToolKitDebug(Debug)

// //PDS TEST
// console.log("UTIL: Debug set: [false] " + GetDebug() + " : " + Debug);


// }

export function format(string) {
  if (string === 'sdathreathunter')
    return 'SDAThreatHunter';
  else
  if (string === 'sda')
    return 'SDA';
  else
  if (string === 'sdadatahelix')
    return 'SDADataHelix';
  return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

export function capitalize(text) {
  if (Debug)
    console.log("capitalize() " + text);
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  let result = words.join(" ");
  if (Debug)
    console.log("capitalize() EXIT " + result);
  return result;
}

export function lookupSeverity(sev) {
  if (Debug)
    console.log("lookupSeverity() " + sev)
  switch (sev)
  {
    case '0': return 'Info';
    case '1': return 'Low';
    case '2': return 'Medium';
    case '3': return 'High';
    case '4': return 'Critical';
  }
  return sev;
}

export function toDateTime(value) {
  if (Debug)
    console.log("toDateTime() " + value)
  return new Date(value).getTime();
}

export const getARandomNumber = async () => {
//  const res = await fetch("https://www.random.org/integers/?num=1&min=2&max=6&col=1&base=10&format=plain&rnd=new");
  const res = Math.random();
  if (Debug)
    console.log("renadom number inner response: " + res);
//  return res.json();
    return res;
};

export function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function invertColor(hex, bw) {
    if (Debug && false)
      console.log("invertColor ENTRY: " + hex);
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#333333'
            : '#EEEEEE';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    var result =  "#" + padZero(r) + padZero(g) + padZero(b);
    if (Debug && false)
      console.log("invertColor EXIT: " + result);
    return result;
}

export function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

var frameworkActive = false;

export function setFrameworkActive(fa)
{
  frameworkActive = fa != undefined ? fa : false;
  if (Debug)
    console.log("APP: setFrameworkActive() : " + frameworkActive);
}

export function isFrameworkActive()
{
  if (Debug)
    console.log("APP: isFrameworkActive() : " + frameworkActive);
  return frameworkActive;
}

/**
  SESSION PROPS
*/
//var sessionProps = undefined;

export function setSessionProps(sprops)
{
    if (Debug)
        console.log("APP: setSessionProps() ENTRY : " + JSON.stringify(sprops));
    setSession(sprops);
    if (Debug)
        console.log("APP: setSessionProps() [3] : " + JSON.stringify(sessionProps));
    if (Debug)
        console.log("APP: setSessionProps() : " + JSON.stringify(getSessionProps()));
    if (sprops != undefined)
        sessionStorage.setItem('_sps', JSON.stringify(sprops));
}

export function getSessionProps()
{
    if (Debug)
        console.log("APP: getSessionProps() ENTRY : " + JSON.stringify(sessionProps));

    const sprops = sessionStorage.getItem('_sps');
    if (Debug)
        console.log("APP: getSessionProps() _sps : ",sprops);
    if (sprops != undefined)
    {
        return JSON.parse(sprops);
    }

//PDS TEST
  if (sessionProps == undefined)
  {
    if (Debug)
        console.log("getSessionProps() Session props is null!");

    const sps = {
                        "status": 201,
                        "message": "ok",

//PDS TEST TODO                   
"appliance": "sdahtz.socautomation.com",

                        "sessionTimeout": 2147483,
                        "authenticated": 1786541026065,
                        "mfaMechanism": "none",
                        "mfaCompleted": 0,
                        "mfaCompletedThreshold": 2,
                        "name": "guest@nowhere.com",
                        "email": null,
                        "tenantId": "00000000-0000-0000-0000-000000000000",
                        "isAdmin": false,
                        "role": "user",
                        "stakeholders": [
                        ],
                        "prefs": {
                        },
                        "theme": "dark",
                        "subscriptions": [
                            {
                                "startDate": "2025-05-20T00:00:00.000Z",
                                "endDate": "2039-05-22T00:00:00.000Z",
                                "type": "threatlab",
                                "displayName": "SOCAutomation ThreatLab",
                                "users": 10000,
                                "assets": 10000,
                                "eps": 10000,
                                "features": "hosted",
                                "key": "c483a81b-dbda-47db-a06d-634258ce5c4b",
                                "id": "7a1ba5b3-f126-4c57-92c3-75aa9ce45b31",
                                "lastRenewalDate": "2025-05-22T10:56:20.541Z",
                                "flags": 0
                            }
                        ],
//PDS TEST TODO  TOKEN TOKEN                      
"token": "83rtX6#zp8th$3ib$Vm^NZe!u4itnAtl48CjgbYYdu!F@#3b20mG%Cau",
//"token": "83rtX6#zp8th$3ib$Vm^NZe!u4itnAtl48CjgbYYdu!F@#3b20mG%Cau",

                        "sessionMFA": "true",
                        "defaultApplication": "datahelix-web"
                    }
                    setSessionProps(sps);
                    if (Debug)
                        console.log("getSessionProps() EXIT Session props default guest", sps);
                    return sps;


    // setSession(
    // {
    //   status:201,
    //   message:"ok",
    //   appliance:"sda16.socautomation.com",
    //   sessionTimeout:900000,
    //   authenticated:1687810304999,
    //   mfaMechanism:"none",
    //   name:"Petina Godounya",
    //   email:"petina@commontalk.com",
    //   tenantId:"bfcc5e23-cc68-4feb-b8c5-e6a23f70c3dd",
    //   isAdmin:true,
    //   role:"manager",
    //   stakeholders: ['someone@riverbed.com', 'psturge@socautomation.com'],
    //   token:"eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmZDY3ZjhiOS0wYTY5LTQ5NTctOGQ4ZC01YzMyNzk4OWY1MDIiLCJpYXQiOjE2OTIzNjczNzQsInN1YiI6IndxZVguMGNFMDd6LUdXal81MFZhVjQ3dzU3WkFzLmJxOEwiLCJpc3MiOiJkMzMxOTUyMy05OWZiLTRjZjAtOTlhNS0yYzFmM2M0ZDgwNGUiLCJkYXRhIjoie1wic3RhdHNcIjpcInNvbWUgc3RhdHMgZ28gaGVyZVwiLFwiY29udGFjdFwiOlwiTWFyam9yaWUgVGF5bG9yIDxtYXJqb3JpZS50YXlsb3JAY29tdGVsLmNvPlwiLFwibG9uZyBrZXlcIjpcImFzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNhc2RmYXdldzM3ZGgzOGc2ZzgzZGJlNl4kNjg2NzQzYXNkZmF3ZXczN2RoMzhnNmc4M2RiZTZeJDY4Njc0M2FzZGZhd2V3MzdkaDM4ZzZnODNkYmU2XiQ2ODY3NDNcIn0iLCJleHAiOjE2OTQ1MTQ4NTh9.RPSVRSBI2QN1hcew-V3lZZ5QhXJBlUpjd1CM4hlJz5U"
    // })
  }
  else
  {
    if (Debug)
        console.log("getSessionProps() Session props is NOT null : " + JSON.stringify(sessionProps));
  }

    if (Debug)
        console.log("getSessionProps() EXIT : " + JSON.stringify(sessionProps));
    return sessionProps;
}

export function isCurrentUserSuperAdmin()
{
    const sps = getSessionProps();
    if (sps != undefined && sps.isAdmin != undefined && sps.isAdmin)
        return true;
    return false;
}

export function getBaseUrl()
{
    let sessionProps = JSON.stringify(getSessionProps());

    if (Debug)
        console.log("SWC utl : getBaseUrl() ENTRY : " + sessionProps);
    if (sessionProps != undefined)
    {
        sessionProps = JSON.parse(sessionProps);
        if (Debug)
            console.log("SWC utl : getBaseUrl() appliance : " + sessionProps.appliance);
    }
    else
    {
        if (Debug)
            console.log("SWC utl : getBaseUrl() appliance : none - it's undefined.");
        let srv = sessionStorage.getItem('loginServer')
        if (Debug)
            console.log("SWC utl : getBaseUrl() loginserver srv: " + srv);
        if (srv == undefined)
        {
            if (Debug)
                console.log("SWC utl : getBaseUrl() appliance : no loginserver defined")
            srv = "login.socautomation.com"
        }
        sessionProps = { appliance: srv};
        if (Debug)
        {
            console.log("SWC utl : getBaseUrl() appliance : is now? ");
            console.log("SWC utl : getBaseUrl() appliance : is now: ",sessionProps);
        }
    }
    var port = '';
    if (window.API_SRV_PORT)
        port = ':' + window.API_SRV_PORT;
    if (Debug)
        console.log("SWC utl : getBaseUrl() [parsed] : " + JSON.stringify(sessionProps));
    let baseUrl = `https://` + sessionProps.appliance + port;
    if (Debug)
        console.log("SWC utl : getBaseUrl() EXIT : " + baseUrl);
    return baseUrl;
}

export function sleep(milliseconds) 
{
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

export function hasSubscription(type)
{
    if (getSessionProps() == undefined || getSessionProps().subscriptions == undefined)
        return 'false'
    for (let sub of getSessionProps().subscriptions)
    {
        if (Debug)
            console.log('hasSubscription() Checking ' + type + " vs " + sub.type + " => " + JSON.stringify(sub))
        if (sub.type === type)
        {
            const now = new Date();
            const subExpiry = new Date(sub.endDate)

            if (now > subExpiry)
                return 'expired'
            return 'true'
        }
    }
    return 'false'
}
