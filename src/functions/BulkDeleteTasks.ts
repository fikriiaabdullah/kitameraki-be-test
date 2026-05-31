import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function BulkDeleteTasks(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const organizationId = request.query.get('organizationId');
    if (!organizationId) {
        return { status: 400, jsonBody: { error: "organizationId is required" } };
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return { status: 400, jsonBody: { error: "Invalid JSON body" } };
    }

    if (!Array.isArray(body) || body.length === 0) {
        return { status: 400, jsonBody: { error: "Request body must be a non-empty array of task IDs" } };
    }

    try {
        const client = getCosmosClient();
        const container = client.database("TaskApp").container("Tasks");

        await Promise.all(
            body.map((id: string) => container.item(id, organizationId).delete())
        );

        return { status: 204 };
    } catch (error) {
        context.error("Error bulk deleting tasks:", error);
        return { status: 500, jsonBody: { error: "Failed to bulk delete tasks" } };
    }
};

app.http('BulkDeleteTasks', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: BulkDeleteTasks
});