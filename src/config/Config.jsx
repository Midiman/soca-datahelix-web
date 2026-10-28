import React, {createContext} from 'react';
import { Debug } from '../util/Utilities.js';

export const GlobalContext = createContext();
export const ApplianceContext = createContext();
export const APIContext = createContext();

/**
 * Config.js
 * @param {*} props 
 * @returns 
 */
export const Config = (props) => {
  if (Debug)
    console.log("s env: ");
  const Server_API = undefined
  if (Debug) console.log("SERVER API: " + Server_API);
    return (
        <GlobalContext.Provider value={[Server_API]}>
            {props.children}
        </GlobalContext.Provider>
    );
}

export const ApplianceConfig = (props) => {
  if (Debug)
    console.log("a env: ");
  const Appliance_API = undefined;

    return (
        <ApplianceContext.Provider value={[Appliance_API]}>
            {props.children}
        </ApplianceContext.Provider>
    );
}

export const APIConfig = (props) => {
  if (Debug)
    console.log("s env: ");
  let APIKey = undefined;
  if (APIKey === undefined) {
    APIKey = '83rtX6#zp8th$3ib$Vm^NZe!u4itnAtl48CjgbYYdu!F@#3b20mG%Cau';
  }
  return (
        <APIContext.Provider value={[APIKey]}>
            {props.children}
        </APIContext.Provider>
    );
}
