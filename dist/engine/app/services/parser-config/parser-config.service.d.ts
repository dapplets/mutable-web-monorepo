import { ParserConfigId } from './parser-config.entity';
import { ParserConfigRepository } from './parser-config.repository';
export declare class ParserConfigService {
    private parserConfigRepository;
    constructor(parserConfigRepository: ParserConfigRepository);
    getParserConfig(parserId: ParserConfigId): Promise<import("./parser-config.entity").ParserConfig | null>;
}
//# sourceMappingURL=parser-config.service.d.ts.map