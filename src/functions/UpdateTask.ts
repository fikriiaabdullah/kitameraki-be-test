import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PatchOperation } from "@azure/cosmos";
import { getCosmosClient } from "../CosmosClient";

export async function UpdateTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const taskId = request.query.get('id');
    const organizationId = request.query.get('organizationId');

    if (!taskId || !organizationId) {
        return { status: 400, jsonBody: { error: "id and organizationId are required" } };
    }

    let body: Record<string, unknown>;
    try {
        const parsed = await request.json();
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return { status: 400, jsonBody: { error: "Request body must be a JSON object" } };
        }
        body = parsed as Record<string, unknown>;
    } catch {
        return { status: 400, jsonBody: { error: "Invalid JSON body" } };
    }

    const patchOperations: PatchOperation[] = Object.keys(body).map((key) => ({
        op: "replace",
        path: `/${key}`,
        value: body[key]
    }));

    if (patchOperations.length === 0) {
        return { status: 400, jsonBody: { error: "Request body must not be empty" } };
    }

    try {
        const client = getCosmosClient();
        const updatedTask = await client.database("TaskApp")
            .container("Tasks")
            .item(taskId, organizationId)
            .patch(patchOperations);

        return { jsonBody: updatedTask.resource, status: 200 };
    } catch (error) {
        context.error("Error updating task:", error);
        return { status: 500, jsonBody: { error: "Failed to update task" } };
    }
};

app.http('UpdateTask', {
    methods: ['PATCH'],  // <-- diperbaiki
    authLevel: 'anonymous',
    handler: UpdateTask
});