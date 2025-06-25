import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Aigency implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aigency',
		name: 'aigency',
		icon: { light: 'file:aigency.light.svg', dark: 'file:aigency.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Interact with Aigency API',
		defaults: {
			name: 'Aigency',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'aigencyCredentialsApi',
				required: false,
				testedBy: 'aigencyConnectionTest',
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Add Message', value: 'addMessage' },
					{ name: 'Add Subscription', value: 'addSubscription' },
					{ name: 'Delete All Memories', value: 'deleteAllMemories' },
					{ name: 'Delete All Messages', value: 'deleteMessages' },
					{ name: 'Delete All Warnings', value: 'deleteAllWarnings' },
					{ name: 'Delete Memory', value: 'deleteMemory' },
					{ name: 'Delete Message', value: 'deleteMessage' },
					{ name: 'Disable Capability', value: 'disableCapability' },
					{ name: 'Disable Dev Mode', value: 'disableDevMode' },
					{ name: 'Disable Subscription', value: 'disableSubscription' },
					{ name: 'Enable Capability', value: 'enableCapability' },
					{ name: 'Enable Dev Mode', value: 'enableDevMode' },
					{ name: 'Enable Subscription', value: 'enableSubscription' },
					{ name: 'Get Balance', value: 'getBalance' },
					{ name: 'Get Capabilities', value: 'getCapabilities' },
					{ name: 'Get Current User', value: 'getCurrentUser' },
					{ name: 'Get Dev Mode', value: 'getDevMode' },
					{ name: 'Get Memories', value: 'getMemories' },
					{ name: 'Get Messages', value: 'getMessages' },
					{ name: 'Get Next Scan', value: 'getNextScanOfSubscriptions' },
					{ name: 'Get OpenRPC Document', value: 'getOpenRPCDocument' },
					{ name: 'Get Reward Amount', value: 'getRewardAmount' },
					{ name: 'Get Status', value: 'getStatus' },
					{ name: 'Get Subscriptions', value: 'getSubscriptions' },
					{ name: 'Get Usage History', value: 'getUsageHistory' },
					{ name: 'Get Warnings', value: 'getWarnings' },
					{ name: 'Login', value: 'login' },
					{ name: 'Logout', value: 'logout' },
					{ name: 'Remove Capability', value: 'removeCapability' },
					{ name: 'Remove Subscription', value: 'removeSubscription' },
					{ name: 'Scan Subscriptions', value: 'scanSubscriptions' },
					{ name: 'Send Message', value: 'sendMessage' },
					{ name: 'Sync Capabilities', value: 'syncCapabilities' },
					{ name: 'Throw Error', value: 'throw' },
				],
				default: 'getStatus',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getCapabilities',
							'removeCapability',
							'enableCapability',
							'disableCapability',
							'syncCapabilities',
							'getCurrentUser',
							'getBalance',
							'enableDevMode',
							'disableDevMode',
							'getDevMode',
							'logout',
							'login',
							'throw',
							'getSubscriptions',
							'enableSubscription',
							'disableSubscription',
							'addSubscription',
							'removeSubscription',
							'getNextScanOfSubscriptions',
							'scanSubscriptions',
							'getWarnings',
							'deleteAllWarnings',
							'getMemories',
							'deleteAllMemories',
							'deleteMemory',
							'getUsageHistory',
							'getRewardAmount',
							'sendMessage',
						],
					},
				},
				default: '',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'removeCapability',
							'enableCapability',
							'disableCapability',
							'enableSubscription',
							'disableSubscription',
							'removeSubscription',
							'deleteMemory',
						],
					},
				},
				default: '',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				description: 'Max number of results to return',
				typeOptions: { minValue: 1 },
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getCapabilities',
							'getSubscriptions',
							'getWarnings',
							'getMemories',
							'getUsageHistory',
							'getMessages',
						],
					},
				},
				default: 50,
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getCapabilities',
							'getSubscriptions',
							'getWarnings',
							'getMemories',
							'getUsageHistory',
							'getMessages',
						],
					},
				},
				default: 0,
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['addSubscription'] } },
				default: '',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['addSubscription'] } },
				default: '',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['sendMessage'] } },
				default: '',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getMessages', 'addMessage', 'deleteMessages'] } },
				default: '',
			},
			{
				displayName: 'Message (JSON)',
				name: 'message',
				type: 'json',
				required: true,
				displayOptions: { show: { operation: ['addMessage'] } },
				default: '',
				description: 'A message object with content and type as required fields',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['deleteMessage'],
					},
				},
				default: '',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		let apiKey: string | undefined;
		let apiUrl: string | undefined;
		try {
			const credentials = (await this.getCredentials('aigencyCredentialsApi')) as {
				apiKey: string;
				apiUrl: string;
			};
			apiKey = credentials.apiKey;
			apiUrl = credentials.apiUrl;
		} catch (error) {
			apiKey = process.env.AIGENCY_API_KEY;
			apiUrl = process.env.AIGENCY_API_URL;
		}
		if (!apiKey || !apiUrl) {
			throw new NodeOperationError(
				this.getNode(),
				'Credentials are empty. Please set environment variables AIGENCY_API_KEY and AIGENCY_API_URL or configure credentials in N8N Web interface.',
			);
		}

		const parametersToCollect = [
			'id',
			'limit',
			'offset',
			'source',
			'link',
			'text',
			'userId',
			'sessionId',
			'message',
			'messageId',
		];

		for (let i = 0; i < items.length; i++) {
			const method = this.getNodeParameter('operation', i) as string;
			const params: any = {};
			for (const parameter of parametersToCollect) {
				try {
					params[parameter] = this.getNodeParameter(parameter, i, undefined, {
						extractValue: true,
					});
				} catch (_) {}
			}
			try {
				const response = await request({ apiKey, apiUrl, userId: params.userId, method, params });
				if (response.error) {
					if (this.continueOnFail()) {
						returnItems.push({ json: { error: response.error } });
					} else {
						throw new NodeOperationError(this.getNode(), response.error, { itemIndex: i });
					}
				} else {
					returnItems.push({ json: response.result });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({ json: { error: (error as Error).message } });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}
		return [returnItems];
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
