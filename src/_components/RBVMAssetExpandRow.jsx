import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { Container } from "react-bootstrap";
import { Spinner } from "@hct/soca-toolkit";
import { searchService } from '@/_services';
import { rbvmAssetExpandRow } from '@/_components/rbvmObjectUtils';


const LclDebug = true;

const RBVMAssetExpandRow = (props) => 
{
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [assetData, setAssetData] = useState();


    if (LclDebug)
        console.log("RBVMAssetExpandRow ENTRY row: " + JSON.stringify(props.row));

    useEffect(() => 
    {
        if (LclDebug)
            console.log("useEffect() ENTRY : " + JSON.stringify(props.row));
        fetchAssetData();
        if (LclDebug)
            console.log("useEffect() EXIT : " + JSON.stringify(assetData));
    }, [props.row]);

    function fetchAssetData() 
    {
        if (LclDebug)
            console.log("fetchAssetData() : " + JSON.stringify(props.row));

        setIsLoading(true);
        setError(false);
        try 
        {
            console.log("fetchAssetData() ENTRY : data calling for asset @ " + props.row.id);
            const assetData = searchService.doSearch("cmdb_asset*", '{"query":{"match":{"_id":' + props.row.id + '}}}')
                .then(asset => 
                {
                    console.log("fetchAssetData() : asset api lookup rtn [then]: " + JSON.stringify(asset));
                    if (asset != undefined && asset.hasOwnProperty('hits')) 
                    {
                        if (asset.hits.hits.length > 0) {
                            let assetData = asset.hits.hits[0];
                            console.log("fetchAssetData() : asset api lookup found: " + JSON.stringify(assetData));
                            setAssetData(assetData);
                        }
                        else 
                        {
                            console.log("fetchAssetData() EXIT [Not found]");
                            setAssetData(undefined);
                        }
                    }
                    else 
                    {
                        console.log("fetchAssetData() EXIT [Not found]");
                        setAssetData(undefined);
                    }
                });
        }
        catch (ex) 
        {
            console.log("fetchAssetData() EXCEPTION in async promise for assets: " + ex);
            return Promise.reject(ex);
        }
        finally 
        {
            console.log("fetchAssetData() asset api finally");
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
            {!isLoading && assetData != undefined && 
            (
                rbvmAssetExpandRow(assetData)
            )}
            {!isLoading && assetData == undefined && 
            (
                <div>Asset data not found</div>
            )}
        </>
    );
};
export { RBVMAssetExpandRow };
