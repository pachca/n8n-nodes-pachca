import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PachcaApi implements ICredentialType {
  name = 'pachcaApi';
  displayName = 'Pachca API';
  documentationUrl = 'https://crm.pachca.com/dev/getting-started/requests-and-responses/';
  properties: INodeProperties[] = [
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Access token for Pachca API. Can be obtained in developer settings.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.pachca.com/api/shared/v1',
      description: 'Base URL for Pachca API',
    },
    {
      displayName: 'Token Type',
      name: 'tokenType',
      type: 'options',
      options: [
        {
          name: 'Bot Token',
          value: 'bot',
          description: 'Bot token - access to core API methods',
        },
        {
          name: 'Admin Token',
          value: 'admin',
          description: 'Admin token - access to user and tag management',
        },
        {
          name: 'Owner Token',
          value: 'owner',
          description: 'Owner token - full access including export',
        },
      ],
      default: 'bot',
      description: 'Token type determines available API methods',
    },
    {
      displayName: 'User ID',
      name: 'userId',
      type: 'number',
      default: '',
      description: 'User/bot ID that owns the token (optional)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/profile',
    },
  };
}