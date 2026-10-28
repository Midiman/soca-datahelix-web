import React, { Suspense } from 'react';
import { SmartIRWrapper } from '@hct/soca-smartir';
import { Spinner } from '@hct/soca-toolkit';

function Loading()
{
    return (
        <center style={{width:'100%'}}><Spinner/></center>
    )
}

const SmartIRStub = (props) =>
{
    const bodyBaseElement = document.querySelector('#body-base');
    if (bodyBaseElement) {
        bodyBaseElement.className = 'smartir';
    }

    return (
        <>
            <Suspense fallback={Loading}>
                <SmartIRWrapper props={{...props}}/>
            </Suspense>
        </>
    )
}
export default SmartIRStub
