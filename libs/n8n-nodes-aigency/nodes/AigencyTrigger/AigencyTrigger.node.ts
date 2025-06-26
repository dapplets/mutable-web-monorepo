import {
	INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

export class AigencyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aigency Trigger',
		name: 'aigencyTrigger',
		icon: { light: 'file:aigency.light.svg', dark: 'file:aigency.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Listens to Aigency events',
		eventTriggerDescription: '',
		defaults: {
			name: 'Aigency Trigger',
		},
		triggerPanel: {
			header: '',
			executionsHelp: {
				inactive:
					"<b>While building your workflow</b>, click the 'execute step' button, then trigger a Aigency event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time a change is detected, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
				active:
					"<b>While building your workflow</b>, click the 'execute step' button, then trigger a Aigency event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time a change is detected, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
			},
			activationHint:
				"Once you've finished building your workflow, <a data-key='activate'>activate</a> it to have it also listen continuously (you just won't see those executions here).",
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'aigencyCredentialsApi',
				required: false,
				testedBy: 'aigencyConnectionTest',
			},
		],
		properties: [
			{
				displayName: 'Listen For',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat Bot Messages',
						value: 'messageReceived',
						description: 'When a message is received by the chat bot',
						action: 'Message received',
					},
					{
						name: 'Contexts',
						value: 'contextReceived',
						description: 'When new context is received by the Aigency',
						action: 'Contexts received',
					},
				],
				default: 'messageReceived',
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				isFullPath: true,
				responseCode: '200',
				responseMode: 'onReceived',
				responseData: 'noData',
				path: 'aigency',
			},
		],
	};

	async aigencyConnectionTest({ apiKey, apiUrl }: { apiKey: string; apiUrl: string }) {
		if (!apiKey || !apiUrl) {
			return { status: 'Error', message: 'Credentials are empty' };
		}

		const isOk = await request({ apiKey, apiUrl, method: 'getStatus' })
			.then(() => true)
			.catch(() => false);

		if (isOk) {
			return { status: 'OK', message: 'Connection successful!' };
		} else {
			return { status: 'Error', message: 'Credentials are invalid or API is unreachable' };
		}
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const eventName = this.getNodeParameter('operation') as string;
		const req = this.getRequestObject();

		if (req.body.method !== eventName) {
			return { noWebhookResponse: true };
		}

		const response: INodeExecutionData = {
			json: req.body.params,
		};

		return {
			workflowData: [[response]],
		};
	}
}

const request = async ({
	apiKey,
	apiUrl,
	userId,
	method,
	params,
}: {
	apiKey: string;
	apiUrl: string;
	userId?: number;
	method: string;
	params?: any;
}): Promise<any> => {
	const payload = {
		jsonrpc: '2.0',
		method,
		params,
		id: 'dontcare',
	};

	const authTokenParams = new URLSearchParams();
	authTokenParams.set('api_key', apiKey);
	if (userId) {
		authTokenParams.set('user', JSON.stringify({ id: userId.toString() }));
	}

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authTokenParams.toString()}`,
		},
		body: JSON.stringify(payload),
	});

	const json: any = await response.json();

	return json;
};
