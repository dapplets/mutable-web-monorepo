import { ParserConfig } from "../core/parsers/json-parser";
export interface IParserConfigProvider {
    getParserConfig(namespace: string): Promise<ParserConfig | null>;
    createParserConfig(parserConfig: ParserConfig): Promise<void>;
}
//# sourceMappingURL=parser-config-provider.d.ts.map