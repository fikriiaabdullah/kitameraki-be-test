import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function DeleteTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const taskId = request.query.get('id');
    const organizationId = request.query.get('organizationId');

    if (!taskId || !organizationId) {
        return { status: 400, jsonBody: { error: "id and organizationId are required" } };
    }

    try {
        const client = getCosmosClient();
        await client.database("TaskApp")
            .container("Tasks")
            .item(taskId, organizationId)
            .delete();

        return { status: 204 };
    } catch (error) {
        context.error("Error deleting task:", error);
        return { status: 500, jsonBody: { error: "Failed to delete task" } };
    }
};

app.http('DeleteTask', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: DeleteTask
});