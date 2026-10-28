//import React, { Suspense, useState, useEffect, useRef, lazy, useContext } from 'react';
import React, {  useState,  useEffect,  useRef,  lazy,  Suspense,  useContext} from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";

import { useCookies } from 'react-cookie';

import { Slide } from "react-awesome-reveal";
import { GetSelectedTheme, SetSelectedTheme, GetDebug } from '@hct/soca-toolkit';
import { SessionContext, Spinner, ThemeContext } from '@hct/soca-toolkit';
import { QueryClientProvider, QueryClient } from 'react-query'
import { Debug, SetDebug } from '@/util/Utilities';

import WebFramework from '@/components/WebFramework';

import L from 'leaflet';
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

import { getSessionProps, setSessionProps, isFrameworkActive, setFrameworkActive } from '@/util/Utilities';
import { getSessionProps as getSessionProperties } from "@/util/Utilities";
import { searchService } from "@/_services//search.service";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(en);

const queryClient = new QueryClient();

const LOGIN_SESSION = '_socaloginsession_';
const DEFAULT_SESSION_TIMEOUT = 900;

const AUTO_LOGIN_SUFFIX = 'XZHS5HK31ZZZZZ';

function onReady(callback) {
    var intervalID = window.setInterval(checkReady, 50);

    function checkReady() {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalID);
            callback.call(this);
        }
    }
}

function show(id, value) {
    document.getElementById(id).style.display = value ? 'block' : 'none';
}

onReady(function () {
    show('page', true);
    show('loading', false);
});


/**
 * App.jsx
 * This is the main App entry point for the SOCA App Framework
 */
function App() 
{
    const {theme, setTheme} = useContext(ThemeContext);

    const queryClient = new QueryClient();

    // useEffect(() =>
    // {
    //     if (Debug)
    //         console.log("useEffect ");

// console.log("PT56 App ENTRY ");
//         const sps = {
//                     "status": 201,
//                     "message": "ok",
//                     "appliance": "sdahtz.socautomation.com",
//                     "sessionTimeout": 2147483,
//                     "authenticated": 1786541026065,
//                     "mfaMechanism": "none",
//                     "mfaCompleted": 0,
//                     "mfaCompletedThreshold": 2,
//                     "name": "guest@nowhere.com",
//                     "email": "guest@nowhere.com",
//                     "tenantId": "00000000-0000-0000-0000-000000000000",
//                     "isAdmin": false,
//                     "role": "user",
//                     "stakeholders": [
//                     ],
//                     "prefs": {
//                     },
//                     "theme": "dark",
//                     "subscriptions": [
//                         {
//                             "startDate": "2025-05-20T00:00:00.000Z",
//                             "endDate": "2039-05-22T00:00:00.000Z",
//                             "type": "datahelixai",
//                             "displayName": "SOCAutomation DataHelix AI",
//                             "users": 10000,
//                             "assets": 10000,
//                             "eps": 10000,
//                             "features": "hosted",
//                             "key": "c483a81b-dbda-47db-a06d-634258ce5c4b",
//                             "id": "7a1ba5b3-f126-4c57-92c3-75aa9ce45b31",
//                             "lastRenewalDate": "2025-05-22T10:56:20.541Z",
//                             "flags": 0
//                         }
//                     ],
//                     "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlZjI5NGE3Ny1lNDUwLTQ3ZTUtYjQxZi1hNzY1M2RhMzk1NzAiLCJpYXQiOjE3ODY1NDEwMjYsInN1YiI6IjYyLjMwLjEwOC4xMDEiLCJpc3MiOiJTT0NBdXRvbWF0aW9uIiwiYXVkIjoicHN0dXJnZUBzb2NhdXRvbWF0aW9uLmNvbSIsInBydiI6dHJ1ZSwiZGF0YSI6ImFjYmU3ZmRmNThhNCIsImV4cCI6MTc4NzE0NTgyNn0.IzCrbox3YSY7Pi8ZAj-D1lMCplr7V9t2ctJePDj34Kw",
//                     "sessionMFA": "true",
//                     "defaultApplication": "datahelix-web"
//                 }
//             setSessionProps(sps);
    // }, []);


    /**
        REAL SessionContext Provider so this App can authenticate to the Gatekeeper
    */
    const SessionPropsProvider = ({ children, ...context }) => 
    {
        function getSessionProps()
        {
            let sprops = getSessionProperties();
            // if (Debug)
                console.log("PT57a SessionProps getSessionProps() ENTRY ", sprops);

            if (sprops == undefined)
            {
            // if (Debug)
                console.log("PT57a SessionProps getSessionProps [default] ");
                const sps = {
                    "status": 201,
                    "message": "ok",
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
                            "type": "datahelixai",
                            "displayName": "SOCAutomation DataHelix AI",
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
                    "token": "83rtX6#zp8th$3ib$Vm^NZe!u4itnAtl48CjgbYYdu!F@#3b20mG%Cau", //"eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlZjI5NGE3Ny1lNDUwLTQ3ZTUtYjQxZi1hNzY1M2RhMzk1NzAiLCJpYXQiOjE3OTAwMDQzMzUsInN1YiI6IjYyLjMwLjEwOC4xMDEiLCJpc3MiOiJTT0NBdXRvbWF0aW9uIiwiYXVkIjoicHN0dXJnZUBzb2NhdXRvbWF0aW9uLmNvbSIsInBydiI6dHJ1ZSwiZGF0YSI6ImEwYjUzYjAyZjA0OCIsImV4cCI6MTc5MDYwOTEzNX0.x4-X_N8t-5qAJ8AXzKq-YfNFa0ijT85Id9eLQfT2jTA",
                    "sessionMFA": "true",
                    "defaultApplication": "datahelix-web"
                }
                sprops = sps;
            }

            if (Debug)
                console.log('PT57b getSessionProps() : ', sprops);    
            return sprops;
        }

        function setNavigation(nav)
        {   
    //TODO - handle internal nav    
            console.log('PT57 setNav ' + nav);    
        }

        return (
            <SessionContext.Provider value={{getSessionProps, setNavigation}}>
                {children}
            </SessionContext.Provider>
        )
    }

    SetDebug();

    /*
        RENDER
    */
    return (
        <>
            {Debug && console.log("App [1a] url: " + window.location.href)}
            <div id='approot' className={'threatlab theme ' + theme}>
           <SessionPropsProvider>
                <QueryClientProvider client={queryClient} contextSharing={true}>
                    <WebFramework/>
                </QueryClientProvider>
           </SessionPropsProvider>
            </div>
        </>
    );
};
export default App
