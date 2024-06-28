import { SocialDbService } from '../social-db/social-db.service';
import { ParserConfig } from './parser-config.entity';
export declare class ParserConfigRepository {
    private socialDb;
    constructor(socialDb: SocialDbService);
    getParserConfig(globalParserId: string): Promise<ParserConfig | null>;
    saveParserConfig(config: ParserConfig): Promise<void>;
    private _extractParserIdFromNamespace;
}
//# sourceMappingURL=parser-config.repository.d.ts.map