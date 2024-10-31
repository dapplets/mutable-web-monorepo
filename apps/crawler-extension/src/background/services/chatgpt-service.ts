import { ParserConfig } from '@mweb/core'
import OpenAI from 'openai'
import {
  getChatGptApiKey,
  getOrganizationId,
  getProjectId,
  getAssistantId,
} from './settings-service'
import { getNameFromId } from '../helpers'

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

  const parsedUrl = new URL(url)

  const prompt = `Create an adapter for ${url}`

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: prompt,
  })

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id, { limit: 1 })
    const [response] = messages.data
    const [firstContent] = response.content

    if (firstContent.type === 'text') {
      const parserConfig = JSON.parse(firstContent.text.value)

      // ToDo: add logged in user
      return {
        ...parserConfig,
        threadId: run.thread_id,
        id: `bos.dapplets.near/parser/${parsedUrl.hostname}`,
        parserType: 'json',
        targets: [
          { namespace: 'engine', contextType: 'website', if: { id: { eq: parsedUrl.hostname } } },
        ],
      }
    }
  }

  return null
}

export async function improveParserConfig(
  parserConfig: ParserConfig & { threadId?: string; targets: any[] },
  html: string
): Promise<ParserConfig | null> {
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

  let run: OpenAI.Beta.Threads.Runs.Run
  if (!parserConfig.threadId) {
    const thread = await openai.beta.threads.create()
    const prompt = `This is an adapter for ${getNameFromId(parserConfig.id)}:\n${parserConfig}\nAdd this:\n${html}`
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: prompt,
    })
    run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    })
  } else {
    const prompt = `Add this:\n${html}`
    await openai.beta.threads.messages.create(parserConfig.threadId, {
      role: 'user',
      content: prompt,
    })
    run = await openai.beta.threads.runs.createAndPoll(parserConfig.threadId, {
      assistant_id: assistantId,
    })
  }

  if (run?.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id, { limit: 1 })
    const [response] = messages.data
    const [firstContent] = response.content

    if (firstContent.type === 'text') {
      const newParserConfig = JSON.parse(firstContent.text.value)

      // ToDo: add logged in user
      return {
        ...newParserConfig,
        threadId: run.thread_id,
        id: parserConfig.id,
        parserType: 'json',
        targets: parserConfig.targets,
      }
    }
  }

  return null
}
