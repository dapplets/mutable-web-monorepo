import { ApplicationDto } from '../../services/application/dtos/application.dto'
import { ParserConfig } from '../../services/parser-config/parser-config.entity'
import { Engine } from '../../../engine'
import { useQueryArray } from '../../hooks/use-query-array'

export const useMutationParsers = (engine: Engine, apps: ApplicationDto[]) => {
  const { data, isLoading, error } = useQueryArray<ParserConfig>({
    query: () => engine.parserConfigService.getParserConfigsForApps(apps),
    deps: [engine, apps],
  })

  return { parserConfigs: data, isLoading, error }
}
