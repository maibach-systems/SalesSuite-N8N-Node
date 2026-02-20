import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { salessuiteApiRequest } from './GenericFunctions';

export class SalesSuite implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SalesSuite',
		name: 'salesSuite',
		icon: 'file:salessuite.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the SalesSuite CRM API',
		defaults: {
			name: 'SalesSuite',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'salessuiteApi',
				required: true,
			},
		],
		properties: [
			// ----------------------------------
			//         Resource
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Call', value: 'call' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Form', value: 'form' },
					{ name: 'Mail', value: 'mail' },
					{ name: 'Note', value: 'note' },
					{ name: 'Pipeline', value: 'pipeline' },
				],
				default: 'contact',
			},

			// ----------------------------------
			//         Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create a new contact', action: 'Create a contact' },
					{ name: 'Get', value: 'get', description: 'Get a contact by ID', action: 'Get a contact' },
					{ name: 'Get by Email', value: 'getByEmail', description: 'Get contacts by email address', action: 'Get contact by email' },
					{ name: 'Get Many', value: 'getAll', description: 'Get many contacts', action: 'Get many contacts' },
					{ name: 'Search', value: 'search', description: 'Search contacts', action: 'Search contacts' },
					{ name: 'Update', value: 'update', description: 'Update an existing contact', action: 'Update a contact' },
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['deal'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create a new deal', action: 'Create a deal' },
					{ name: 'Get', value: 'get', description: 'Get a deal by ID', action: 'Get a deal' },
					{ name: 'Get by Contact', value: 'getByContact', description: 'Get deals by contact ID', action: 'Get deals by contact' },
					{ name: 'Get by Email', value: 'getByEmail', description: 'Get deals by email', action: 'Get deals by email' },
					{ name: 'Get Many', value: 'getAll', description: 'Get many deals', action: 'Get many deals' },
					{ name: 'Update', value: 'update', description: 'Update an existing deal', action: 'Update a deal' },
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['form'] } },
				options: [
					{ name: 'Get Many', value: 'getAll', description: 'Get all forms', action: 'Get many forms' },
					{ name: 'Get Submissions', value: 'getSubmissions', description: 'Get form submissions', action: 'Get form submissions' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['call'] } },
				options: [
					{ name: 'Get Activities', value: 'getActivities', description: 'Get call activities', action: 'Get call activities' },
					{ name: 'Get Types', value: 'getTypes', description: 'Get all call types', action: 'Get call types' },
				],
				default: 'getTypes',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['mail'] } },
				options: [
					{ name: 'Get Activities', value: 'getActivities', description: 'Get mail activities', action: 'Get mail activities' },
				],
				default: 'getActivities',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['note'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create a note', action: 'Create a note' },
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['pipeline'] } },
				options: [
					{ name: 'Get Many', value: 'getAll', description: 'Get all pipelines', action: 'Get many pipelines' },
				],
				default: 'getAll',
			},

			// ========================================
			//         CONTACT: CREATE
			// ========================================
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				description: 'Email address of the contact person (required)',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				options: [
					{ displayName: 'Address', name: 'address', type: 'string', default: '' },
					{ displayName: 'Already Advertising (Bereits Werbung?)', name: 'x_bereits_werbung', type: 'string', default: '', description: 'Whether paid advertising is already being run' },
					{ displayName: 'Birthday (Geburtstag)', name: 'x_geburtstag', type: 'dateTime', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Closing Date (Closing-Termin)', name: 'x_closing_termin', type: 'dateTime', default: '' },
					{ displayName: 'Company Name', name: 'companyName', type: 'string', default: '' },
					{ displayName: 'Country Code', name: 'countryCode', type: 'string', default: '', description: 'ISO country code (e.g. DE, AT, CH)' },
					{ displayName: 'Current Revenue (Aktueller Umsatz)', name: 'x_aktueller_umsatz', type: 'string', default: '' },
					{ displayName: 'Data Protection (Datenschutz)', name: 'x_datenschutz', type: 'string', default: '' },
					{ displayName: 'Employees (Mitarbeiter)', name: 'x_mitarbeiter', type: 'string', default: '' },
					{ displayName: 'Facebook Click ID', name: 'fbclid', type: 'string', default: '' },
					{ displayName: 'Follow-Up Date (Follow-Up-Termin)', name: 'x_follow_up_termin', type: 'dateTime', default: '' },
					{ displayName: 'Google Click ID', name: 'gclid', type: 'string', default: '' },
					{ displayName: 'Industry (Branche)', name: 'x_branche', type: 'string', default: '', description: 'The industry of the lead' },
					{ displayName: 'Interest Expressed (Interesse geäußert)', name: 'interestExpressed', type: 'boolean', default: false },
					{ displayName: 'Lead Source', name: 'leadSource', type: 'string', default: '' },
					{ displayName: 'LinkedIn', name: 'x_linkedin', type: 'string', default: '', description: 'LinkedIn profile URL' },
					{ displayName: 'Mobile Phone (Handynummer)', name: 'x_handynummer', type: 'string', default: '' },
					{ displayName: 'Note (Notiz)', name: 'x_notiz', type: 'string', default: '', description: 'Notes on master data' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
					{ displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
					{ displayName: 'Possible Investment (Mögliches Investment)', name: 'x_m_gliches_investment', type: 'string', default: '' },
					{ displayName: 'Referrer', name: 'referer', type: 'string', default: '' },
					{ displayName: 'Salutation (Anrede)', name: 'x_anrede', type: 'string', default: '' },
					{ displayName: 'Setter Name (Settername)', name: 'x_settername', type: 'string', default: '' },
					{ displayName: 'Setting Date (Setting-Termin)', name: 'x_setting_termin', type: 'dateTime', default: '' },
					{ displayName: 'State', name: 'state', type: 'string', default: '' },
					{ displayName: 'UTM Campaign', name: 'utm_campaign', type: 'string', default: '' },
					{ displayName: 'UTM Content', name: 'utm_content', type: 'string', default: '' },
					{ displayName: 'UTM Medium', name: 'utm_medium', type: 'string', default: '' },
					{ displayName: 'UTM Source', name: 'utm_source', type: 'string', default: '' },
					{ displayName: 'UTM Term', name: 'utm_term', type: 'string', default: '' },
					{ displayName: 'Website', name: 'website', type: 'string', default: '' },
					{ displayName: 'Webseite (x_webseite)', name: 'x_webseite', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Custom Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				description: 'Set any additional field by its internal API name (e.g. x_custom_field). Use this for fields not listed in Additional Fields.',
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{ displayName: 'Field Name', name: 'key', type: 'string', default: '', description: 'Internal API field name' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
			},

			// ========================================
			//         CONTACT: UPDATE
			// ========================================
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
			},
			{
				displayName: 'Append Multi-Select Values',
				name: 'appendMultiSelectValues',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
				description: 'Whether to append values to multi-select fields instead of replacing them',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
				options: [
					{ displayName: 'Address', name: 'address', type: 'string', default: '' },
					{ displayName: 'Already Advertising (Bereits Werbung?)', name: 'x_bereits_werbung', type: 'string', default: '' },
					{ displayName: 'Birthday (Geburtstag)', name: 'x_geburtstag', type: 'dateTime', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Closing Date (Closing-Termin)', name: 'x_closing_termin', type: 'dateTime', default: '' },
					{ displayName: 'Company Name', name: 'companyName', type: 'string', default: '' },
					{ displayName: 'Country Code', name: 'countryCode', type: 'string', default: '' },
					{ displayName: 'Current Revenue (Aktueller Umsatz)', name: 'x_aktueller_umsatz', type: 'string', default: '' },
					{ displayName: 'Data Protection (Datenschutz)', name: 'x_datenschutz', type: 'string', default: '' },
					{ displayName: 'Employees (Mitarbeiter)', name: 'x_mitarbeiter', type: 'string', default: '' },
					{ displayName: 'Facebook Click ID', name: 'fbclid', type: 'string', default: '' },
					{ displayName: 'Follow-Up Date (Follow-Up-Termin)', name: 'x_follow_up_termin', type: 'dateTime', default: '' },
					{ displayName: 'Google Click ID', name: 'gclid', type: 'string', default: '' },
					{ displayName: 'Industry (Branche)', name: 'x_branche', type: 'string', default: '' },
					{ displayName: 'Interest Expressed (Interesse geäußert)', name: 'interestExpressed', type: 'boolean', default: false },
					{ displayName: 'Lead Source', name: 'leadSource', type: 'string', default: '' },
					{ displayName: 'LinkedIn', name: 'x_linkedin', type: 'string', default: '' },
					{ displayName: 'Mobile Phone (Handynummer)', name: 'x_handynummer', type: 'string', default: '' },
					{ displayName: 'Note (Notiz)', name: 'x_notiz', type: 'string', default: '' },
					{ displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
					{ displayName: 'Possible Investment (Mögliches Investment)', name: 'x_m_gliches_investment', type: 'string', default: '' },
					{ displayName: 'Referrer', name: 'referer', type: 'string', default: '' },
					{ displayName: 'Salutation (Anrede)', name: 'x_anrede', type: 'string', default: '' },
					{ displayName: 'Setter Name (Settername)', name: 'x_settername', type: 'string', default: '' },
					{ displayName: 'Setting Date (Setting-Termin)', name: 'x_setting_termin', type: 'dateTime', default: '' },
					{ displayName: 'State', name: 'state', type: 'string', default: '' },
					{ displayName: 'UTM Campaign', name: 'utm_campaign', type: 'string', default: '' },
					{ displayName: 'UTM Medium', name: 'utm_medium', type: 'string', default: '' },
					{ displayName: 'UTM Source', name: 'utm_source', type: 'string', default: '' },
					{ displayName: 'Website', name: 'website', type: 'string', default: '' },
					{ displayName: 'Webseite (x_webseite)', name: 'x_webseite', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Custom Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
				description: 'Set any additional field by its internal API name',
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{ displayName: 'Field Name', name: 'key', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
			},

			// ========================================
			//         CONTACT: GET / SEARCH
			// ========================================
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['get'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['getByEmail'] } },
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
				description: 'Max number of results to return',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['search'] } },
				description: 'Search query string',
			},
			{
				displayName: 'Full Results',
				name: 'full',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['contact'], operation: ['search'] } },
				description: 'Whether to return full contact details in search results',
			},

			// ========================================
			//         DEAL: CREATE
			// ========================================
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipelineId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getPipelines' },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
				description: 'The pipeline to create the deal in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Contact Name or ID',
				name: 'contactId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getContacts' },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
				description: 'The contact to associate with this deal. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Phase Name or ID',
				name: 'phaseId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelinePhases',
					loadOptionsDependsOn: ['pipelineId'],
				},
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
				description: 'The phase/stage within the pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
				options: [
					{ displayName: 'Closing Date (Abschluss-Datum)', name: 'closingDate', type: 'dateTime', default: '' },
					{ displayName: 'Closing Volume (Auftrags-Volumen)', name: 'closingVolume', type: 'string', default: '' },
					{ displayName: 'DMC Dispatch (DMC-Versand)', name: 'x_dmc_versand', type: 'string', default: '' },
					{ displayName: 'Follow-Up Date (Wiedervorlagedatum)', name: 'x_wiedervorlagedatum', type: 'dateTime', default: '' },
					{ displayName: 'Follow-Up Reason (Wiedervorlagegrund)', name: 'x_wiedervorlagegrund', type: 'string', default: '' },
					{ displayName: 'Has Investment Sum Available', name: 'x_person_hat_die_investitionssum', type: 'string', default: '', description: 'Person has the investment sum immediately available' },
					{ displayName: 'Is Content-Qualified', name: 'x_person_ist_inhaltlich_geeignet', type: 'string', default: '', description: 'Person is content-wise suitable' },
					{ displayName: 'Is Sole Decision Maker', name: 'x_person_ist_alleiniger_entschei', type: 'string', default: '', description: 'Person is the sole decision maker' },
					{ displayName: 'Can Start Soon', name: 'x_person_kann_zeitnah_starten', type: 'string', default: '', description: 'Person can start soon' },
					{ displayName: 'Mailing Type (Mailing-Art)', name: 'x_mailing_art', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Number of Installments (Anzahl der Raten)', name: 'x_anzahl_der_raten', type: 'string', default: '' },
					{ displayName: 'Product (Produkt)', name: 'x_produkt', type: 'string', default: '' },
					{ displayName: 'Reason for Non-Purchase', name: 'x_grund_f_r_nicht_kauf', type: 'string', default: '' },
					{ displayName: 'Reason for Second Appointment', name: 'x_grund_f_r_zweittermin', type: 'string', default: '' },
					{ displayName: 'Rejection Reason (Ablehnungsgrund)', name: 'x_ablehnungsgrund', type: 'string', default: '' },
					{ displayName: 'Responsible Employee', name: 'x_f_r_deal_zust_ndiger_mitarbeit', type: 'string', default: '' },
					{ displayName: 'Responsible Person (Wer verantwortet)', name: 'x_wer_verantwortet_sich_daf_r', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Custom Field',
				default: {},
				displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
				description: 'Set any additional field by its internal API name',
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{ displayName: 'Field Name', name: 'key', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
			},

			// ========================================
			//         DEAL: UPDATE
			// ========================================
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['update'] } },
			},
			{
				displayName: 'Append Multi-Select Values',
				name: 'appendMultiSelectValues',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['deal'], operation: ['update'] } },
				description: 'Whether to append values to multi-select fields instead of replacing them',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['deal'], operation: ['update'] } },
				options: [
					{ displayName: 'Closing Date (Abschluss-Datum)', name: 'closingDate', type: 'dateTime', default: '' },
					{ displayName: 'Closing Volume (Auftrags-Volumen)', name: 'closingVolume', type: 'string', default: '' },
					{ displayName: 'DMC Dispatch (DMC-Versand)', name: 'x_dmc_versand', type: 'string', default: '' },
					{ displayName: 'Follow-Up Date (Wiedervorlagedatum)', name: 'x_wiedervorlagedatum', type: 'dateTime', default: '' },
					{ displayName: 'Follow-Up Reason (Wiedervorlagegrund)', name: 'x_wiedervorlagegrund', type: 'string', default: '' },
					{ displayName: 'Has Investment Sum Available', name: 'x_person_hat_die_investitionssum', type: 'string', default: '' },
					{ displayName: 'Is Content-Qualified', name: 'x_person_ist_inhaltlich_geeignet', type: 'string', default: '' },
					{ displayName: 'Is Sole Decision Maker', name: 'x_person_ist_alleiniger_entschei', type: 'string', default: '' },
					{ displayName: 'Can Start Soon', name: 'x_person_kann_zeitnah_starten', type: 'string', default: '' },
					{ displayName: 'Mailing Type (Mailing-Art)', name: 'x_mailing_art', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Number of Installments (Anzahl der Raten)', name: 'x_anzahl_der_raten', type: 'string', default: '' },
					{
						displayName: 'Phase Name or ID',
						name: 'phaseId',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getPipelinePhases', loadOptionsDependsOn: ['pipelineId'] },
						default: '',
						description: 'Move deal to this phase. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Pipeline Name or ID',
						name: 'pipelineId',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getPipelines' },
						default: '',
						description: 'Move deal to this pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{ displayName: 'Product (Produkt)', name: 'x_produkt', type: 'string', default: '' },
					{ displayName: 'Reason for Non-Purchase', name: 'x_grund_f_r_nicht_kauf', type: 'string', default: '' },
					{ displayName: 'Reason for Second Appointment', name: 'x_grund_f_r_zweittermin', type: 'string', default: '' },
					{ displayName: 'Rejection Reason (Ablehnungsgrund)', name: 'x_ablehnungsgrund', type: 'string', default: '' },
					{ displayName: 'Responsible Employee', name: 'x_f_r_deal_zust_ndiger_mitarbeit', type: 'string', default: '' },
					{ displayName: 'Responsible Person (Wer verantwortet)', name: 'x_wer_verantwortet_sich_daf_r', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Custom Field',
				default: {},
				displayOptions: { show: { resource: ['deal'], operation: ['update'] } },
				description: 'Set any additional field by its internal API name',
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{ displayName: 'Field Name', name: 'key', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
			},

			// ========================================
			//         DEAL: GET / LIST
			// ========================================
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['get'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['getByEmail'] } },
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['getByContact'] } },
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['deal'], operation: ['getByContact'] } },
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				displayOptions: { show: { resource: ['deal'], operation: ['getByContact'], returnAll: [false] } },
				description: 'Max number of results to return',
			},
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipelineIdFilter',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getPipelines' },
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['getByContact'] } },
				description: 'Filter deals by pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['deal'], operation: ['getAll'] } },
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				displayOptions: { show: { resource: ['deal'], operation: ['getAll'], returnAll: [false] } },
				description: 'Max number of results to return',
			},
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipelineIdFilter',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getPipelines' },
				default: '',
				displayOptions: { show: { resource: ['deal'], operation: ['getAll'] } },
				description: 'Filter deals by pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			// ========================================
			//         FORM
			// ========================================
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getForms' },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['form'], operation: ['getSubmissions'] } },
				description: 'The form to get submissions for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['form'], operation: ['getSubmissions'] } },
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				displayOptions: { show: { resource: ['form'], operation: ['getSubmissions'], returnAll: [false] } },
				description: 'Max number of results to return',
			},

			// ========================================
			//         CALL
			// ========================================
			{
				displayName: 'Filters',
				name: 'callFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['call'], operation: ['getActivities'] } },
				options: [
					{
						displayName: 'Call Type Name or ID',
						name: 'callTypeId',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getCallTypes' },
						default: '',
						description: 'Filter by call type. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '' },
					{ displayName: 'Deal ID', name: 'dealId', type: 'string', default: '' },
				],
			},

			// ========================================
			//         MAIL
			// ========================================
			{
				displayName: 'Filters',
				name: 'mailFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['mail'], operation: ['getActivities'] } },
				options: [
					{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '' },
					{ displayName: 'Contact Person ID', name: 'contactPersonId', type: 'string', default: '' },
					{ displayName: 'Deal ID', name: 'dealId', type: 'string', default: '' },
				],
			},

			// ========================================
			//         NOTE
			// ========================================
			{
				displayName: 'Content',
				name: 'noteContent',
				type: 'string',
				typeOptions: { rows: 5 },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['note'], operation: ['create'] } },
				description: 'The plain text content of the note (max 10,000 characters). Line breaks are allowed.',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['note'], operation: ['create'] } },
				description: 'The contact to attach the note to (provide Contact ID and/or Deal ID)',
			},
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['note'], operation: ['create'] } },
				description: 'The deal to attach the note to (provide Contact ID and/or Deal ID)',
			},
		],
	};

	methods = {
		loadOptions: {
			async getPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await salessuiteApiRequest.call(this, 'GET', '/pipelines');
				const pipelines = Array.isArray(response) ? response : (response.data || response.pipelines || []);
				return pipelines.map((p: any) => ({
					name: p.displayName || p.name || p.title || p.id,
					value: p.id || p._id,
				}));
			},

			async getPipelinePhases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const pipelineId = this.getCurrentNodeParameter('pipelineId') as string;
				if (!pipelineId) {
					return [];
				}
				const response = await salessuiteApiRequest.call(this, 'GET', '/pipelines');
				const pipelines = Array.isArray(response) ? response : (response.data || response.pipelines || []);
				const pipeline = pipelines.find((p: any) => (p.id || p._id) === pipelineId);
				if (!pipeline) {
					return [];
				}
				const phases = pipeline.phases || pipeline.stages || pipeline.columns || [];
				return phases.map((phase: any) => ({
					name: phase.displayName || phase.name || phase.title || phase.id,
					value: phase.id || phase._id,
				}));
			},

			async getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await salessuiteApiRequest.call(this, 'GET', '/contact', {}, { page: 0, pageSize: 100 });
				let contacts: any[];
				if (Array.isArray(response)) {
					contacts = response;
				} else if (response && typeof response === 'object') {
					contacts = response.contacts || response.data || response.items || [];
				} else {
					contacts = [];
				}
				return contacts.map((c: any) => {
					const contact = c.contact || c;
					const person = c.mainContactPerson || {};
					const label = [person.firstName, person.lastName].filter(Boolean).join(' ')
						|| contact.companyName
						|| contact.id;
					const description = contact.companyName && person.firstName
						? contact.companyName
						: (person.email || '');
					return {
						name: label,
						value: contact.id || contact._id,
						description,
					};
				});
			},

			async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await salessuiteApiRequest.call(this, 'GET', '/form');
				const forms = Array.isArray(response) ? response : (response.data || response.forms || []);
				return forms.map((f: any) => ({
					name: f.displayName || f.name || f.title || f.id,
					value: f.id || f._id,
				}));
			},

			async getCallTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await salessuiteApiRequest.call(this, 'GET', '/call-types');
				const types = Array.isArray(response) ? response : (response.data || response.callTypes || []);
				return types.map((t: any) => ({
					name: t.displayName || t.name || t.title || t.id,
					value: t.id || t._id,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'contact') {
					responseData = await executeContact.call(this, operation, i);
				} else if (resource === 'deal') {
					responseData = await executeDeal.call(this, operation, i);
				} else if (resource === 'form') {
					responseData = await executeForm.call(this, operation, i);
				} else if (resource === 'call') {
					responseData = await executeCall.call(this, operation, i);
				} else if (resource === 'mail') {
					responseData = await executeMail.call(this, operation, i);
				} else if (resource === 'note') {
					responseData = await executeNote.call(this, operation, i);
				} else if (resource === 'pipeline') {
					responseData = await salessuiteApiRequest.call(this, 'GET', '/pipelines');
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// ===================================================
//  Execute functions per resource
// ===================================================

async function executeContact(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'create') {
		const email = this.getNodeParameter('email', i) as string;
		const firstName = this.getNodeParameter('firstName', i) as string;
		const lastName = this.getNodeParameter('lastName', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
		const customFieldsData = this.getNodeParameter('customFields', i) as { field?: Array<{ key: string; value: string }> };

		const contactFields: Record<string, any> = {};
		const contactPersonFields: Record<string, any> = { email, firstName, lastName };

		// Fields that belong to contactPerson, not contact
		const contactPersonFieldNames = new Set(['phone']);

		for (const [key, value] of Object.entries(additionalFields)) {
			if (value === '' || value === undefined) continue;
			if (contactPersonFieldNames.has(key)) {
				contactPersonFields[key] = value;
			} else {
				contactFields[key] = value;
			}
		}

		if (customFieldsData.field) {
			for (const f of customFieldsData.field) {
				if (f.key) contactFields[f.key] = f.value;
			}
		}

		return salessuiteApiRequest.call(this, 'POST', '/contact/create', {
			contact: contactFields,
			contactPerson: contactPersonFields,
		});

	} else if (operation === 'update') {
		const contactId = this.getNodeParameter('contactId', i) as string;
		const appendMultiSelect = this.getNodeParameter('appendMultiSelectValues', i) as boolean;
		const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;
		const customFieldsData = this.getNodeParameter('customFields', i) as { field?: Array<{ key: string; value: string }> };

		const body: Record<string, any> = {};
		for (const [key, value] of Object.entries(updateFields)) {
			if (value === '' || value === undefined) continue;
			body[key] = value;
		}
		if (customFieldsData.field) {
			for (const f of customFieldsData.field) {
				if (f.key) body[f.key] = f.value;
			}
		}

		const qs: Record<string, any> = {};
		if (appendMultiSelect) qs.appendMultiSelectValues = true;

		return salessuiteApiRequest.call(this, 'PATCH', `/contact/${contactId}`, body, qs);

	} else if (operation === 'get') {
		const contactId = this.getNodeParameter('contactId', i) as string;
		return salessuiteApiRequest.call(this, 'GET', `/contact/${contactId}`);

	} else if (operation === 'getByEmail') {
		const email = this.getNodeParameter('email', i) as string;
		return salessuiteApiRequest.call(this, 'GET', '/contact/by-email', {}, { email });

	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) {
			return fetchAll.call(this, 'GET', '/contact');
		}
		const limit = this.getNodeParameter('limit', i) as number;
		return fetchWithLimit.call(this, 'GET', '/contact', limit);

	} else if (operation === 'search') {
		const query = this.getNodeParameter('query', i) as string;
		const full = this.getNodeParameter('full', i) as boolean;
		const qs: Record<string, any> = { query };
		if (full) qs.full = true;
		return salessuiteApiRequest.call(this, 'GET', '/contact/search', {}, qs);
	}
}

async function executeDeal(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'create') {
		const pipelineId = this.getNodeParameter('pipelineId', i) as string;
		const contactId = this.getNodeParameter('contactId', i) as string;
		const phaseId = this.getNodeParameter('phaseId', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
		const customFieldsData = this.getNodeParameter('customFields', i) as { field?: Array<{ key: string; value: string }> };

		const body: Record<string, any> = {};
		for (const [key, value] of Object.entries(additionalFields)) {
			if (value === '' || value === undefined) continue;
			body[key] = value;
		}
		if (customFieldsData.field) {
			for (const f of customFieldsData.field) {
				if (f.key) body[f.key] = f.value;
			}
		}

		return salessuiteApiRequest.call(this, 'POST', '/deal', body, { pipelineId, contactId, phaseId });

	} else if (operation === 'update') {
		const dealId = this.getNodeParameter('dealId', i) as string;
		const appendMultiSelect = this.getNodeParameter('appendMultiSelectValues', i) as boolean;
		const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;
		const customFieldsData = this.getNodeParameter('customFields', i) as { field?: Array<{ key: string; value: string }> };

		const body: Record<string, any> = {};
		const qs: Record<string, any> = {};

		// pipelineId and phaseId go as query params, not body
		if (updateFields.pipelineId) { qs.pipelineId = updateFields.pipelineId; delete updateFields.pipelineId; }
		if (updateFields.phaseId) { qs.phaseId = updateFields.phaseId; delete updateFields.phaseId; }
		if (appendMultiSelect) qs.appendMultiSelectValues = true;

		for (const [key, value] of Object.entries(updateFields)) {
			if (value === '' || value === undefined) continue;
			body[key] = value;
		}
		if (customFieldsData.field) {
			for (const f of customFieldsData.field) {
				if (f.key) body[f.key] = f.value;
			}
		}

		return salessuiteApiRequest.call(this, 'PATCH', `/deal/${dealId}`, body, qs);

	} else if (operation === 'get') {
		const dealId = this.getNodeParameter('dealId', i) as string;
		return salessuiteApiRequest.call(this, 'GET', `/deal/${dealId}`);

	} else if (operation === 'getByEmail') {
		const email = this.getNodeParameter('email', i) as string;
		return salessuiteApiRequest.call(this, 'GET', '/deal/by-email', {}, { email });

	} else if (operation === 'getByContact') {
		const contactId = this.getNodeParameter('contactId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const pipelineIdFilter = this.getNodeParameter('pipelineIdFilter', i) as string;
		const extraQs: Record<string, any> = {};
		if (pipelineIdFilter) extraQs.pipelineId = pipelineIdFilter;

		if (returnAll) return fetchAll.call(this, 'GET', `/deal/by-contact/${contactId}`, extraQs);
		const limit = this.getNodeParameter('limit', i) as number;
		return fetchWithLimit.call(this, 'GET', `/deal/by-contact/${contactId}`, limit, extraQs);

	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const pipelineIdFilter = this.getNodeParameter('pipelineIdFilter', i) as string;
		const extraQs: Record<string, any> = {};
		if (pipelineIdFilter) extraQs.pipelineId = pipelineIdFilter;

		if (returnAll) return fetchAll.call(this, 'GET', '/deal', extraQs);
		const limit = this.getNodeParameter('limit', i) as number;
		return fetchWithLimit.call(this, 'GET', '/deal', limit, extraQs);
	}
}

async function executeForm(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'getAll') {
		return salessuiteApiRequest.call(this, 'GET', '/form');
	} else if (operation === 'getSubmissions') {
		const formId = this.getNodeParameter('formId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return fetchAll.call(this, 'GET', `/form/${formId}/submissions`);
		const limit = this.getNodeParameter('limit', i) as number;
		return fetchWithLimit.call(this, 'GET', `/form/${formId}/submissions`, limit);
	}
}

async function executeCall(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'getTypes') {
		return salessuiteApiRequest.call(this, 'GET', '/call-types');
	} else if (operation === 'getActivities') {
		const filters = this.getNodeParameter('callFilters', i) as Record<string, any>;
		const body: Record<string, any> = {};
		if (filters.contactId) body.contactId = filters.contactId;
		if (filters.dealId) body.dealId = filters.dealId;
		if (filters.callTypeId) body.callTypeId = filters.callTypeId;
		return salessuiteApiRequest.call(this, 'POST', '/get-call-activities', body);
	}
}

async function executeMail(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'getActivities') {
		const filters = this.getNodeParameter('mailFilters', i) as Record<string, any>;
		const body: Record<string, any> = {};
		if (filters.contactId) body.contactId = filters.contactId;
		if (filters.dealId) body.dealId = filters.dealId;
		if (filters.contactPersonId) body.contactPersonId = filters.contactPersonId;
		return salessuiteApiRequest.call(this, 'POST', '/get-mail-activities', body);
	}
}

async function executeNote(this: IExecuteFunctions, operation: string, i: number): Promise<any> {
	if (operation === 'create') {
		const noteContent = this.getNodeParameter('noteContent', i) as string;
		const contactId = this.getNodeParameter('contactId', i) as string;
		const dealId = this.getNodeParameter('dealId', i) as string;

		if (!contactId && !dealId) {
			throw new NodeOperationError(
				this.getNode(),
				'You must provide either a Contact ID or a Deal ID for the note',
				{ itemIndex: i },
			);
		}

		const qs: Record<string, any> = {};
		if (contactId) qs.contactId = contactId;
		if (dealId) qs.dealId = dealId;

		return salessuiteApiRequest.call(this, 'POST', '/note', noteContent, qs, 'text/plain');
	}
}

// ===================================================
//  Pagination helpers
// ===================================================

async function fetchAll(
	this: IExecuteFunctions,
	method: 'GET',
	endpoint: string,
	extraQs: Record<string, any> = {},
): Promise<any[]> {
	const allResults: any[] = [];
	let page = 0;
	const pageSize = 100;

	for (let guard = 0; guard < 200; guard++) {
		const qs = { page, pageSize, ...extraQs };
		const response = await salessuiteApiRequest.call(this, method, endpoint, {}, qs);
		const items = extractItems(response);

		if (items.length === 0) break;
		allResults.push(...items);
		if (items.length < pageSize) break;

		page++;
	}

	return allResults;
}

async function fetchWithLimit(
	this: IExecuteFunctions,
	method: 'GET',
	endpoint: string,
	limit: number,
	extraQs: Record<string, any> = {},
): Promise<any[]> {
	const allResults: any[] = [];
	let page = 0;
	const pageSize = Math.min(limit, 100);

	for (let guard = 0; guard < 200; guard++) {
		const qs = { page, pageSize, ...extraQs };
		const response = await salessuiteApiRequest.call(this, method, endpoint, {}, qs);
		const items = extractItems(response);

		if (items.length === 0) break;
		allResults.push(...items);
		if (allResults.length >= limit) break;
		if (items.length < pageSize) break;

		page++;
	}

	return allResults.slice(0, limit);
}

function extractItems(response: any): any[] {
	if (Array.isArray(response)) return response;
	if (response && typeof response === 'object') {
		for (const key of ['data', 'items', 'results', 'contacts', 'deals', 'submissions', 'forms']) {
			if (Array.isArray(response[key])) return response[key];
		}
	}
	return [response];
}
