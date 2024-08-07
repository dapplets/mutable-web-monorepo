import { AnyParserValue, AppMetadata } from '../application/application.entity'
import { ParserConfig, ParserConfigId } from './parser-config.entity'
import { ParserConfigRepository } from './parser-config.repository'

export class ParserConfigService {
  constructor(private parserConfigRepository: ParserConfigRepository) {}

  public async getParserConfig(parserId: ParserConfigId): Promise<ParserConfig | null> {
    return this.parserConfigRepository.getParserConfig(parserId)
  }

  public async getAllParserConfigs(): Promise<ParserConfig[]> {
    // ToDo: out of gas
    return this.parserConfigRepository.getAllParserConfigs()
  }

  public async getParserConfigsForApps(apps: AppMetadata[]): Promise<ParserConfig[]> {
    const namespaces = new Set<ParserConfigId>()

    for (const app of apps) {
      if (!app.parsers) {
        app.targets.forEach((target) => namespaces.add(target.namespace))
      } else if (app.parsers === AnyParserValue) {
        return this.getAllParserConfigs() // returns all parsers and breaks the loop!
      } else {
        app.parsers.forEach((parserGlobalId) => namespaces.add(parserGlobalId))
      }
    }

    // ToDo: catch errors
    const parserConfigs = await Promise.all(
      Array.from(namespaces).map((ns) => this.getParserConfig(ns))
    )

    return parserConfigs.filter((pc) => pc !== null)
  }
}
