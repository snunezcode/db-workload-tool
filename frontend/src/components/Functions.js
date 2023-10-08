import { configuration } from '../pages/Configs';
import { createSearchParams } from "react-router-dom";

export async function applicationVersionUpdate(params) {
        var version = await gatherVersionJsonFile(params);
        return version;
}


const gatherVersionJsonFile = async (params) => {
    var json = { release : "0.0.0", date : "2023-09-01"}
    try {
        const response = await fetch(configuration["apps-settings"]["version-code-url"] 
        + '?' + createSearchParams({
                                codeId: params.codeId,
                                moduleId: params.moduleId
                                }).toString()
        );
        json = await response.json();
    }
    catch{
        
    }
    return(json);
}

