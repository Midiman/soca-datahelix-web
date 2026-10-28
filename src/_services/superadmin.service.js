import { Debug } from '@/util/Utilities';
import { fetchWrapper } from '@/_helpers';
import { getBaseUrl } from '@/util/Utilities';


/**
 * Wrapper for fetching elastic search query results
 */
export const superUserService = {
    getTenants
};

async function getTenants() 
{
    if (Debug)
        console.log("getTenants() ENTRY")
    const index = "customer";
    const search = `{"query":{"match_all":{}}}`;
    let url = getBaseUrl() + `/api/app/search/?index=${index}&showAll=true`;
    let dsearch = `${search}`;
    if (Debug)
        console.log("getTenants() ENTRY  url: " + url + " srch: " + dsearch);
    var response = await fetchWrapper.post(url, dsearch)            
        .then(result => 
        {
            let finalTenantsArray = [];

            if (Debug)
                console.log("getTenants() [then] result: " + JSON.stringify(result))
            if (result && result.hits && Array.isArray(result.hits.hits))
            {
                if (Debug)
                    console.log("getTenants() [then] got hits: " + JSON.stringify(result.hits.hits))
                for (let tnt of result.hits.hits)
                {
                    if (tnt.id == 'ad419ad4-ad41-ad41-ad41-ad4119ad419a')
                        continue;
                    finalTenantsArray.push(tnt);
                }
            }
            if (Debug)
                console.log("getTenants() EXIT [then] : " + JSON.stringify(finalTenantsArray))
            return finalTenantsArray;
        });
    if (Debug)
        console.log("getTenants() EXIT response : " + JSON.stringify(response))
    return response;
}

