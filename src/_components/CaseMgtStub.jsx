import React, { Suspense } from 'react';
import { CaseMgtWrapper } from '@hct/soca-casemgt';
import { Spinner } from '@hct/soca-toolkit';

function Loading()
{
    return (
        <center style={{width:'100%'}}><Spinner/></center>
    )
}

const CaseMgtStub = (props) =>
{
    return (
        <>
            <Suspense fallback={Loading}>
                <CaseMgtWrapper {...props} threatActorHidden={window?.SHOW_THREAT_ACTORS === 'true' ? false : true}/>
            </Suspense>
        </>
    )
}
export default CaseMgtStub
