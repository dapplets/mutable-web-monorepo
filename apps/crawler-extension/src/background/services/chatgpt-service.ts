import { ParserConfig } from '@mweb/core'
import OpenAI from 'openai'
import {
  getChatGptApiKey,
  getOrganizationId,
  getProjectId,
  getAssistantId,
} from './settings-service'

export async function generateParserConfigByUrl(url: string): Promise<ParserConfig | null> {
  const [apiKey, organizationId, projectId, assistantId] = await Promise.all([
    getChatGptApiKey(),
    getOrganizationId(),
    getProjectId(),
    getAssistantId(),
  ])

  if (!apiKey || !organizationId || !projectId || !assistantId) {
    throw new Error('[AI Crawler] OpenAI API key is not set')
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    organization: organizationId,
    project: projectId,
  })

  const thread = await openai.beta.threads.create()

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: url,
  })

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id, { limit: 1 })
    const [response] = messages.data
    const [firstContent] = response.content

    if (firstContent.type === 'text') {
      return JSON.parse(firstContent.text.value)
    }
  }

  return null
}
