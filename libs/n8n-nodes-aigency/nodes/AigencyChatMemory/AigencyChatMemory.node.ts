import { BaseListChatMessageHistory } from '@langchain/core/chat_history';
import {
	BaseMessage,
	mapChatMessagesToStoredMessages,
	mapStoredMessagesToChatMessages,
} from '@langchain/core/messages';
import { BufferWindowMemory } from 'langchain/memory';
import type {
	ISupplyDataFunctions,
	INodeType,
	INodeTypeDescription,
	SupplyData,
} from 'n8n-workflow';
import { ApplicationError, NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class AigencyChatMemory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aigency Chat Memory',
		name: 'aigencyChatMemory',
		icon: { light: 'file:aigency.light.svg', dark: 'file:aigency.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Stores the chat history in Aigency storage.',
		defaults: {
			name: 'Aigency Chat Memory',
		},
		credentials: [
			{
				name: 'aigencyCredentialsApi',
				required: false,
				testedBy: 'aigencyConnectionTest',
			},
		],
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Memory'],
				Memory: ['Other memories'],
			},
		},
		inputs: [],
		outputs: [NodeConnectionType.AiMemory],
		outputNames: ['Memory'],
		properties: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				required: true,
				default: '',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: 'Context Window Length',
				name: 'contextWindowLength',
				type: 'number',
				default: 5,
				hint: 'How many past interactions the model receives as context',
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

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
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

		const contextWindowLength = this.getNodeParameter('contextWindowLength', itemIndex, {
			extractValue: true,
		}) as number;
		const userId = this.getNodeParameter('userId', itemIndex, { extractValue: true }) as number;
		const sessionId = this.getNodeParameter('sessionId', itemIndex, {
			extractValue: true,
		})?.toString() as string;

		const pgChatHistory = new AigencyChatMessageHistory({
			sessionId,
			contextWindowLength,
			rpcCall: (options: { method: string; params: any }) =>
				request({ apiKey, apiUrl, userId, ...options }),
		});

		const memory = new BufferWindowMemory({
			memoryKey: 'chat_history',
			chatHistory: pgChatHistory,
			returnMessages: true,
			inputKey: 'input',
			outputKey: 'output',
			k: contextWindowLength,
		});

		return {
			response: memory,
		};
	}
}

class AigencyChatMessageHistory extends BaseListChatMessageHistory {
	lc_namespace = ['langchain', 'stores', 'message', 'aigency'];

	sessionId: string;
	contextWindowLength: number;
	rpcCall: (options: { method: string; params: any }) => Promise<any>;

	constructor(fields: {
		sessionId: string;
		contextWindowLength: number;
		rpcCall: (options: { method: string; params: any }) => Promise<any>;
	}) {
		super(fields);
		this.sessionId = fields.sessionId;
		this.contextWindowLength = fields.contextWindowLength;
		this.rpcCall = fields.rpcCall;
	}

	async getMessages(): Promise<BaseMessage[]> {
		const { error, result } = await this.rpcCall({
			method: 'getMessages',
			params: { sessionId: this.sessionId, limit: this.contextWindowLength, offset: 0 },
		});

		if (error) {
			throw new ApplicationError(error);
		}

		return mapStoredMessagesToChatMessages(
			result.items.reverse().map((row: any) => {
				const { type, ...data } = row.message;
				return { type, data };
			}),
		);
	}

	async addMessage(baseMessage: BaseMessage): Promise<void> {
		const [message] = mapChatMessagesToStoredMessages([baseMessage]);

		await this.rpcCall({
			method: 'addMessage',
			params: {
				sessionId: this.sessionId,
				message: {
					type: message.type,
					...message.data,
				},
			},
		});
	}

	async clear(): Promise<void> {
		await this.rpcCall({
			method: 'deleteMessages',
			params: { sessionId: this.sessionId },
		});
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
