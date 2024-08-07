import { SocialDbService } from '../social-db/social-db.service'
import { ParserConfig } from './parser-config.entity'

const ProjectIdKey = 'dapplets.near'
const ParserKey = 'parser'
const SettingsKey = 'settings'
const SelfKey = ''
const KeyDelimiter = '/'
const WildcardKey = '*'
const RecursiveWildcardKey = '**'

export class ParserConfigRepository {
  constructor(private socialDb: SocialDbService) {}

  async getAllParserConfigs(): Promise<ParserConfig[]> {
    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      ParserKey,
      WildcardKey, // any app local id
    ]

    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const parsersByKey = SocialDbService.splitObjectByDepth(queryResult, keys.length)

    const parsers = Object.entries(parsersByKey).map(([key, parser]: [string, any]) => {
      const [authorId, , , , appLocalId] = key.split(KeyDelimiter)
      const globalParserId = [authorId, ParserKey, appLocalId].join(KeyDelimiter)

      const config = JSON.parse(parser[SelfKey])

      return {
        id: globalParserId,
        parserType: config.parserType,
        contexts: config.contexts,
        targets: config.targets,
      }
    })

    return parsers
  }

  async getParserConfig(globalParserId: string): Promise<ParserConfig | null> {
    if (globalParserId === 'mweb') return null
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(globalParserId)

    const queryResult = await this.socialDb.get([
      `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
    ])

    const parserConfigJson =
      queryResult[accountId]?.[SettingsKey]?.[ProjectIdKey]?.[ParserKey]?.[parserLocalId]?.[SelfKey]

    if (!parserConfigJson) return null

    const config = JSON.parse(parserConfigJson)

    return {
      id: globalParserId,
      parserType: config.parserType,
      contexts: config.contexts,
      targets: config.targets,
    }
  }

  async saveParserConfig(config: ParserConfig): Promise<void> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.id)

    const keys = [accountId, SettingsKey, ProjectIdKey, ParserKey, parserLocalId]

    const storedParserConfig = {
      [SelfKey]: JSON.stringify({
        parserType: config.parserType,
        targets: config.targets,
        contexts: (config as any).contexts, // ToDo: types
      }),
    }

    await this.socialDb.set(SocialDbService.buildNestedData(keys, storedParserConfig))
  }

  private _extractParserIdFromNamespace(parserGlobalId: string): {
    accountId: string
    parserLocalId: string
  } {
    // Example: example.near/parser/social-network
    const [accountId, entityType, parserLocalId] = parserGlobalId.split(KeyDelimiter)

    if (entityType !== 'parser' || !accountId || !parserLocalId) {
      throw new Error(`Invalid namespace: ${parserGlobalId}`)
    }

    return { accountId, parserLocalId }
  }
}
