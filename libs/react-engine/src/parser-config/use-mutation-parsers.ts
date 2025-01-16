import { ApplicationDto, ParserConfig } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutationParsers = (apps: ApplicationDto[]) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery<ParserConfig[]>({
    queryKey: ['mutationParsers', { apps: apps.map((app) => app.id) }],
    // ToDo: apps is not scalar
    queryFn: () => engine.parserConfigService.getParserConfigsForApps(apps),
    initialData: [],
  })

  return { parserConfigs: data, isLoading, error }
}
