import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { salessuiteApiRequest } from './GenericFunctions';

export class SalesSuiteTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SalesSuite Trigger',
		name: 'salesSuiteTrigger',
		icon: 'file:salessuite.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when SalesSuite events occur',
		defaults: {
			name: 'SalesSuite Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'salessuiteApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. contact.created',
				description: 'The webhook event type to subscribe to. Check the SalesSuite documentation or API for available event types.',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional JSON filter for the webhook subscription (e.g. a pipeline ID or form ID)',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				try {
					const response = await salessuiteApiRequest.call(this, 'GET', '/webhooks/subscription');

					// API may return a single object or an array
					let subscriptions: any[];
					if (Array.isArray(response)) {
						subscriptions = response;
					} else if (response && typeof response === 'object') {
						if (Array.isArray(response.data)) {
							subscriptions = response.data;
						} else if (response.id) {
							// Single subscription object
							subscriptions = [response];
						} else {
							subscriptions = [];
						}
					} else {
						subscriptions = [];
					}

					for (const sub of subscriptions) {
						if (sub.hookUrl === webhookUrl && sub.type === event) {
							const webhookData = this.getWorkflowStaticData('node');
							webhookData.webhookId = sub.id;
							return true;
						}
					}
				} catch {
					// If listing fails, assume it doesn't exist
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const filterStr = this.getNodeParameter('filter') as string;

				const body: Record<string, any> = {
					hookUrl: webhookUrl,
					type: event,
					active: true,
				};

				if (filterStr) {
					try {
						body.filter = JSON.parse(filterStr);
					} catch {
						// If not valid JSON, send as string
						body.filter = filterStr;
					}
				}

				const response = await salessuiteApiRequest.call(this, 'POST', '/webhooks/subscription', body);
				const webhookData = this.getWorkflowStaticData('node');

				const id = response?.id || response?.data?.id;
				if (id) {
					webhookData.webhookId = id;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string;

				if (webhookId) {
					try {
						await salessuiteApiRequest.call(this, 'DELETE', `/webhooks/subscription/${webhookId}`);
					} catch {
						return false;
					}
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}
