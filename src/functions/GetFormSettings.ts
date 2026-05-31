import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient } from "../CosmosClient";

export async function GetFormSettings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const organizationId = request.query.get('organizationId');
    if (!organizationId) {
        return { status: 400, jsonBody: { error: "organizationId is required" } };
    }

    try {
        const client = getCosmosClient();
        const result = await client.database("TaskApp")
            .container("FormSettings")
            .item(organizationId, organizationId)
            .read();

        if (!result.resource) {
            return { jsonBody: { organizationId, fields: [] }, status: 200 };
        }

        return { jsonBody: result.resource, status: 200 };
    } catch (error) {
        context.error("Error fetching form settings:", error);
        return { status: 500, jsonBody: { error: "Failed to fetch form settings" } };
    }
}

app.http('GetFormSettings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetFormSettings
});