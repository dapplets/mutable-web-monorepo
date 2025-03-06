import { Injectable } from '@nestjs/common';

const PostSchema = {
  id: 'dapplets.near/schema/post',
  metadata: {
    name: 'Post',
    description: 'Social Network Post',
  },
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The main content of the post.',
      },
      authorFullname: {
        type: 'string',
        description: 'The full name of the author.',
      },
      authorUsername: {
        type: 'string',
        description: 'The username/handle of the author.',
      },
      authorImg: {
        type: 'string',
        format: 'uri',
        description: "The URL of the author's profile image.",
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The timestamp when the post was created.',
      },
      url: {
        type: 'string',
        format: 'uri',
        description: 'The URL linking to the original post.',
      },
    },
  },
};

const SimpleAgentResponseSchema = {
  id: 'dapplets.near/schema/simple-agent-response',
  metadata: {
    name: 'Simple Agent Response',
    description: 'Simple Agent Response',
  },
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      keys_count: {
        type: ['integer', 'null'],
        description:
          'The number of keys if the input is a dictionary, otherwise null.',
      },
      depth: {
        type: 'integer',
        description: 'The maximum depth of the JSON structure.',
      },
      types: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'A list of data types found in the JSON structure.',
      },
      length: {
        type: 'integer',
        description:
          'The length of the JSON data in its string representation.',
      },
    },
  },
};

@Injectable()
export class SchemaService {
  /**
   * @param id schema id e.g: `dapplets.near/schema/post`
   */
  async getSchemaById(id: string) {
    if (id === PostSchema.id) {
      return PostSchema;
    } else if (id === SimpleAgentResponseSchema.id) {
      return SimpleAgentResponseSchema;
    } else {
      null;
    }
  }
}
