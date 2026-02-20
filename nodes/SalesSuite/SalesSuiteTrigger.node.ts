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
				type: 'options',
				required: true,
				default: 'contact.created',
				options: [
					{ name: 'New Contact Created', value: 'contact.created', description: 'Triggers when a new contact is created' },
					{ name: 'Contact Property Changed', value: 'contact.updated', description: 'Triggers when a contact property has been changed' },
					{ name: 'New Deal Created', value: 'deal.created', description: 'Triggers when a new deal is created' },
					{ name: 'Deal Property Changed', value: 'deal.updated', description: 'Triggers when a deal property has been changed' },
					{ name: 'Deal Stage Changed', value: 'deal.stageChanged', description: 'Triggers when a deal stage has been changed' },
					{ name: 'New Call Activity', value: 'call.created', description: 'Triggers when a new call activity is created' },
					{ name: 'New Form Submission', value: 'form.submitted', description: 'Triggers when a new form submission is created' },
					{ name: 'New Mail Activity', value: 'mail.created', description: 'Triggers when a new mail activity is created' },
				],
				description: 'The event to listen to',
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
