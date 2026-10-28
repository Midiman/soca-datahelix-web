import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { Container } from "react-bootstrap";
import { Spinner } from "@hct/soca-toolkit";
import { searchService } from '@/_services/';
import { rbvmRiskMapExpandRow } from '@/_components/rbvmObjectUtils';


const LclDebug = true;

/**
    Renderer for RiskMap form
*/    
const RBVMRiskMapExpandRow = (props) => 
{
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [riskMapData, setRiskMapData] = useState();


    if (LclDebug)
        console.log("RBVMAssetExpandRow ENTRY row: " + JSON.stringify(props.row));

    useEffect(() => 
    {
        if (LclDebug)
            console.log("useEffect() ENTRY : " + JSON.stringify(props.row));
        fetchRiskMapData();
        if (LclDebug)
            console.log("useEffect() EXIT : " + JSON.stringify(riskMapData));
    }, [props.row]);

    /**
        API fetch
    */
    function fetchRiskMapData() 
    {
        if (LclDebug)
            console.log("fetchRiskMapData() : " + JSON.stringify(props.row));

        setIsLoading(true);
        setError(false);
        try 
        {
            console.log("fetchRiskMapData() ENTRY : data calling for riskmap @ " + props.row.id);
            const assetData = searchService.doSearch("rbvm_riskmaps*", '{"query":{"match":{"_id":' + props.row.id + '}}}')
                .then(riskmap => 
                {
                    console.log("fetchRiskMapData() : riskmap api lookup rtn [then]: " + JSON.stringify(riskmap));
                    if (riskmap != undefined && riskmap.hasOwnProperty('hits')) 
                    {
                        if (riskmap.hits.hits.length > 0) {
                            let riskMapData = riskmap.hits.hits[0];
                            console.log("fetchRiskMapData() : riskmap api lookup found: " + JSON.stringify(riskMapData));
                            setRiskMapData(riskMapData);
                        }
                        else 
                        {
                            console.log("fetchRiskMapData() EXIT [Not found]");
                            setRiskMapData(undefined);
                        }
                    }
                    else 
                    {
                        console.log("fetchRiskMapData() EXIT [Not found]");
                        setRiskMapData(undefined);
                    }
                });
        }
        catch (ex) 
        {
            console.log("fetchRiskMapData() EXCEPTION in async promise for riskmap: " + ex);
            return Promise.reject(ex);
        }
        finally 
        {
            console.log("fetchRiskMapData() riskmap set api finally");
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading && (
                <Container
                    fluid
                    className="d-flex justify-content-center spinner-container"
                >
                    <Spinner />
                </Container>
            )}
            {!isLoading && riskMapData != undefined && 
            (
                <div className='riskmap-expand-row'>
                    {rbvmRiskMapExpandRow(riskMapData)}
                </div>
            )}
            {!isLoading && riskMapData == undefined && 
            (
                <div style={{visibility:'hidden'}}></div>
            )}
        </>
    );
};
export { RBVMRiskMapExpandRow };
