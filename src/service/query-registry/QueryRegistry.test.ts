import { Logger } from "tslog";
import { QueryRegistry } from "./QueryRegistry";

describe('QueryRegistry', () => {
    let query_registry: QueryRegistry;
    beforeAll(() => {
        query_registry = new QueryRegistry();
    })
    const logger = new Logger();
    const rspql_query = `
    PREFIX saref: <https://saref.etsi.org/core/>
    PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
    PREFIX : <https://rsp.js/>
    REGISTER RStream <output> AS
    SELECT (MAX(?o) as ?maxSKT)
    FROM NAMED WINDOW :w1 ON STREAM <http://n061-14a.wall2.ilabt.iminds.be:3000/participant6/skt/> [RANGE 180000 STEP 30000]
    WHERE {
        WINDOW :w1 {
            ?s saref:hasValue ?o .
            ?s saref:relatesToProperty dahccsensors:wearable.skt .
        }   
    }
`;

    it('initializing the QueryRegistry', () => {
        expect(query_registry).toBeInstanceOf(QueryRegistry);
    });
    it(`adding a query to the registry`, async () => {
        expect(await query_registry.add_query_in_registry(rspql_query, logger)).toBe(true);
        query_registry.delete_all_queries_from_the_registry();
    });

    it('delete_all_queries_from_the_registry', async () => {
        const query_one = `
        PREFIX saref: <https://saref.etsi.org/core/>
        PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
        PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT (MAX(?o) as ?maxSKT)
        FROM NAMED WINDOW :w1 ON STREAM <http://n061-14a.wall2.ilabt.iminds.be:3000/participant6/skt/> [RANGE 180000 STEP 30000]
        WHERE {
            WINDOW :w1 {
                ?s saref:hasValue ?o .
                ?s saref:relatesToProperty dahccsensors:wearable.skt .
            }   
        }
        `;

        const query_two = `
        PREFIX saref: <https://saref.etsi.org/core/>
        PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
        PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT (MIN(?o) as ?minSKT)
        FROM NAMED WINDOW :w1 ON STREAM <http://n061-14a.wall2.ilabt.iminds.be:3000/participant6/skt/> [RANGE 180000 STEP 30000]
        WHERE {
            WINDOW :w1 {
                ?s saref:relatesToProperty ?o .
            }   
        }
        `;
        await query_registry.add_query_in_registry(query_one, logger);
        await query_registry.add_query_in_registry(query_two, logger);
        expect(query_registry.get_registered_queries().get_length()).toBe(2);
        query_registry.delete_all_queries_from_the_registry();
        expect(query_registry.get_registered_queries().get_length()).toBe(0);
    });

    it('checking_unique_queries', () => {
        console.log(query_registry.get_executing_queries());
        const query_one = `
        PREFIX saref: <https://saref.etsi.org/core/>
        PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
        PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT (AVG(?o) as ?avgSKT)
        FROM NAMED WINDOW :w1 ON STREAM <http://n061-14/skt/> [RANGE 800 STEP 100]
        WHERE {
            WINDOW :w1{
                ?s saref:hasValue ?o
            }
        }
        `;

        const query_two = `
        PREFIX saref: <https://saref.etsi.org/core/>
        PREFIX dahccsensors: <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/>
        PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT (AVG(?o) as ?avgSKT)
        FROM NAMED WINDOW :w1 ON STREAM <http://n061-14/skt/> [RANGE 800 STEP 100]
        WHERE {
            WINDOW :w1{
                ?s saref:hasValue ?o
            }
        }
        `;
        expect(query_registry.checkUniqueQuery(query_one, logger)).toBe(false);
        expect(query_registry.checkUniqueQuery(query_two, logger)).toBe(true);
    });
});