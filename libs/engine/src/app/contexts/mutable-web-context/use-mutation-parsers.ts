import { ApplicationDto } from '@mweb/backend'
import { ParserConfig } from '@mweb/backend'
import { Engine } from '@mweb/backend'
import { useQueryArray } from '../../hooks/use-query-array'

export const useMutationParsers = (engine: Engine, apps: ApplicationDto[]) => {
  const { data, isLoading, error } = useQueryArray<ParserConfig>({
    query: () => engine.parserConfigService.getParserConfigsForApps(apps),
    deps: [engine, apps],
  })

  return { parserConfigs: data, isLoading, error }
}
