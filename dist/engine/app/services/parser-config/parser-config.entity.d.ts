import { BosParserConfig, JsonParserConfig } from '../../../../core';
import { Target } from '../target/target.entity';
export type ParserConfigId = string;
export declare enum AdapterType {
    Bos = "bos",
    Microdata = "microdata",
    Json = "json",
    MWeb = "mweb"
}
export type ParserConfig = ({
    parserType: AdapterType.Json;
    id: ParserConfigId;
    targets: Target[];
} & JsonParserConfig) | ({
    parserType: AdapterType.Bos;
    id: ParserConfigId;
    targets: Target[];
} & BosParserConfig) | {
    parserType: AdapterType.MWeb;
    id: ParserConfigId;
    targets: Target[];
};
//# sourceMappingURL=parser-config.entity.d.ts.map