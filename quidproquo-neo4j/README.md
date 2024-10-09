# quidproquo-neo4j

1. Go to [https://neo4j.com/product/auradb/](https://neo4j.com/product/auradb/)
2. Select **Start Free** to set up a free database.
3. Create an account (I used Sign in with Google).
4. Agree to the Terms of Service and Privacy Policy.
5. Choose an instance type; for development, I used **AuraDB Free** since it’s free.
6. Save the credentials for `Instance01` (we will need this later).
7. Wait for `Instance01` to create (this could take a few minutes).
8. Add the database to your QPQ config, give it a name; I will call mine `graph`.

```
import { defineGraphDatabaseNeo4j } from 'quidproquo-neo4j';

export default [
    // other config
    defineGraphDatabaseNeo4j('graph', apiBuildPath)
];
```

9. Deploy your service.
10. Once the Neo4j database is created, under the name, you should see an instance ID. It will also be in the connection URI at the bottom, like this:

`neo4j+s://XXXXXXXX.databases.neo4j.io`.

11. Note that instance ID down, we will need it for our config.
12. On your deployed site, update the parameter `neo4j-${databaseName}-instance` with the instance ID we just got.
13. Update the secret `neo4j-${databaseName}-password` with the password we downloaded earlier.
14. You should then be able to run queries using QPQ.

```
const responseA = yield* askGraphDatabaseExecuteOpenCypherQuery(
    'graph',
    GraphDatabaseInstanceType.Write,
    `
        CREATE (p:Person $personProps)
        CREATE (b:Backpack $backpackProps)
        CREATE (p)-[:OWNS]->(b)
        RETURN p, b
    `,
    {
        personProps: { id: '1234', name: 'Joe', age: 30 },
        backpackProps: { brand: 'Fun', color: 'Red' },
    }
);

const responseB = yield* askGraphDatabaseExecuteOpenCypherQuery(
    'graph',
    GraphDatabaseInstanceType.Read,
    'MATCH (a) RETURN a LIMIT 10'
);
```

# Notes

To set a version, you can pass it via the config

```
import { defineGraphDatabaseNeo4j, Neo4jVersion } from  'quidproquo-neo4j';

defineGraphDatabaseNeo4j('graph', apiBuildPath, Neo4jVersion.Version5)
```
