import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function GetTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const taskId = request.query.get('id');
    const organizationId = request.query.get('organizationId');

    if (!taskId || !organizationId) {
        return { status: 400, jsonBody: { error: "id and organizationId are required" } };
    }

    try {
        const client = getCosmosClient();
        const task = await client.database("TaskApp")
            .container("Tasks")
            .item(taskId, organizationId)
            .read();

        if (!task.resource) {
            return { status: 404, jsonBody: { error: "Task not found" } };
        }

        return { jsonBody: task.resource, status: 200 };
    } catch (error) {
        context.error("Error fetching task:", error);
        return { status: 500, jsonBody: { error: "Failed to fetch task" } };
    }
};

app.http('GetTask', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetTask
});