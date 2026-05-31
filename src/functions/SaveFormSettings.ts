import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function SaveFormSettings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { status: 400, jsonBody: { error: "Request body must be a JSON object" } };
    }

    const settings = {
        ...(body as Record<string, unknown>),
        id: organizationId,
        organizationId,
    };

    try {
        const client = getCosmosClient();
        const saved = await client.database("TaskApp")
            .container("FormSettings")
            .items.upsert(settings);

        return { jsonBody: saved.resource, status: 200 };
    } catch (error) {
        context.error("Error saving form settings:", error);
        return { status: 500, jsonBody: { error: "Failed to save form settings" } };
    }
}

app.http('SaveFormSettings', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: SaveFormSettings
});