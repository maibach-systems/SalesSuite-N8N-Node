import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function salessuiteApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object | string = {},
	qs: Record<string, string | number | boolean> = {},
	contentType = 'application/json',
): Promise<any> {
	const credentials = await this.getCredentials('salessuiteApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IRequestOptions = {
		method,
		uri: `${baseUrl}${endpoint}`,
		qs,
		json: true,
	};

	if (contentType === 'text/plain') {
		options.body = body as string;
		options.json = false;
		options.headers = { 'Content-Type': 'text/plain' };
	} else if (typeof body === 'object' && Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'salessuiteApi',
			options,
		);

		// When json:false, the response is a raw string - parse it
		if (contentType === 'text/plain' && typeof response === 'string') {
			try {
				return JSON.parse(response);
			} catch {
				return response;
			}
		}

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
