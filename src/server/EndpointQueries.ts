/**
 * This class contains the queries for the endpoints.
 * @class EndpointQueries
 */
export class EndpointQueries {
    /**
     * Get the query for the given name.
     * @param {string} name - The name of the query.
     * @param {Date} from_timestamp - The start of the time window.
     * @param {Date} to_timestamp - The end of the time window.
     * @returns {string} - The query.
     * @memberof EndpointQueries
     */
    get_query(name: string, from_timestamp: Date, to_timestamp: Date) {
        const from = Date.parse(from_timestamp.toString())
        const to = Date.parse(to_timestamp.toString());
        let query:string = '';
        const difference_seconds = (to - from);
        console.log(`The name of the query is ${name}.`);
        switch (name) {
            case 'averageHRPatient1':
                query = `
                PREFIX saref: <https://saref.etsi.org/core/> 
                PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
                PREFIX : <https://rsp.js/>
                REGISTER RStream <output> AS
                SELECT (AVG(?o) AS ?averageHR1)
                FROM NAMED WINDOW :w1 ON STREAM <http://localhost:3000/dataset_participant1/data/> [RANGE ${difference_seconds} STEP 20]
                WHERE{
                    WINDOW :w1 { ?s saref:hasValue ?o .
                                 ?s saref:relatesToProperty dahccsensors:wearable.bvp .}
                }  
                `;
                break;
            case 'averageHRPatientMultiple':
                query = `
                PREFIX saref: <https://saref.etsi.org/core/> 
                PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
                PREFIX : <https://rsp.js/>
                REGISTER RStream <output> AS
                SELECT (AVG(?o) AS ?averageHR1)
                FROM NAMED WINDOW :w1 ON STREAM <http://localhost:3000/dataset_participant1/data/> [RANGE ${difference_seconds} STEP 20]
                FROM NAMED WINDOW :w2 ON STREAM <http://localhost:3000/dataset_participant2/data/> [RANGE ${difference_seconds} STEP 20]
                WHERE{
                    WINDOW :w1 { ?s saref:hasValue ?o .
                                 ?s saref:relatesToProperty dahccsensors:wearable.bvp .}
                    WINDOW :w2 { ?s saref:hasValue ?o .
                                    ?s saref:relatesToProperty dahccsensors:wearable.bvp .}
                } 
                `;
                break;
            case 'averageHRPatient2':
                query = `
                PREFIX saref: <https://saref.etsi.org/core/>
                PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
                PREFIX : <https://rsp.js/>
                REGISTER RStream <output> AS
                SELECT (AVG(?o) AS ?averageHR2)
                FROM NAMED WINDOW :w1 ON STREAM <http://localhost:3000/dataset_participant2/data/> [RANGE ${difference_seconds} STEP 20]
                WHERE{
                    WINDOW :w1 { ?s saref:hasValue ?o .
                                    ?s saref:relatesToProperty dahccsensors:wearable.bvp .}
                }`;
                break;
            default:
                break;
        }
        return query;
    }
}
