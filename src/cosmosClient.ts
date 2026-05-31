import { CosmosClient } from "@azure/cosmos";

let client: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
    if (!client) {
        const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("COSMOS_DB_CONNECTION_STRING environment variable is not set");
        }
        client = new CosmosClient(connectionString);
    }
    return client;
}
