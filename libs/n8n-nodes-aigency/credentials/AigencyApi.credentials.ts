import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AigencyApi implements ICredentialType {
	name = 'aigencyCredentialsApi';
	displayName = 'Aigency Credentials API';
	documentationUrl =
		'https://github.com/dapplets/mutable-web-monorepo/blob/develop/libs/n8n-nodes-aigency/README.md';

	icon = { light: 'file:aigency.light.svg', dark: 'file:aigency.dark.svg' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				// Send this as part of the query string
				n8n: 'rocks',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://example.com/',
			url: '',
		},
	};
}
