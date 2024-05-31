import { BosParserConfig } from './parsers/bos-parser';
import { JsonParserConfig } from './parsers/json-parser';
export declare enum AdapterType {
    Bos = "bos",
    Microdata = "microdata",
    Json = "json",
    MWeb = "mweb"
}
export type ParserConfig = ({
    parserType: AdapterType.Json;
    id: string;
} & JsonParserConfig) | ({
    parserType: AdapterType.Bos;
    id: string;
} & BosParserConfig) | {
    parserType: AdapterType.MWeb;
    id: string;
};
//# sourceMappingURL=types.d.ts.map