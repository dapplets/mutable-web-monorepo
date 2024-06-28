import { AppMetadata } from '../../services/application/application.entity';
import { ParserConfig } from '../../services/parser-config/parser-config.entity';
import { Engine } from '../../../engine';
export declare const useMutationParsers: (engine: Engine, apps: AppMetadata[]) => {
    parserConfigs: ParserConfig[];
    isLoading: boolean;
    error: string | null;
};
//# sourceMappingURL=use-mutation-parsers.d.ts.map