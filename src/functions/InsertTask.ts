import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function InsertTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return { status: 400, jsonBody: { error: "Invalid JSON body" } };
    }

    if (!body || typeof body !== 'object') {
        return { status: 400, jsonBody: { error: "Request body is required" } };
    }

    try {
        const client = getCosmosClient();
        const createdTask = await client.database("TaskApp")
            .container("Tasks")
            .items.create(body);

        return { jsonBody: createdTask.resource, status: 201 };
    } catch (error) {
        context.error("Error inserting task:", error);
        return { status: 500, jsonBody: { error: "Failed to insert task" } };
    }
};

app.http('InsertTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: InsertTask
});