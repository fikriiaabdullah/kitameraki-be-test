import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function GetTasks(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const organizationId = request.query.get('organizationId');
    if (!organizationId) {
        return { status: 400, jsonBody: { error: "organizationId is required" } };
    }

    try {
        const client = getCosmosClient();
        const result = await client.database("TaskApp")
            .container("Tasks")
            .items.query({
                query: "SELECT * FROM c WHERE c.organizationId = @organizationId",
                parameters: [{ name: "@organizationId", value: organizationId }]
            })
            .fetchNext();

        return { jsonBody: result.resources, status: 200 };
    } catch (error) {
        context.error("Error fetching tasks:", error);
        return { status: 500, jsonBody: { error: "Failed to fetch tasks" } };
    }
};

app.http('GetTasks', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetTasks
});