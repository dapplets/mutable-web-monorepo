import { NearSigner } from "./near-signer";
import { IParserConfigProvider } from "./parser-config-provider";
import { ParserConfig } from "../core/parsers/json-parser";
export declare class SocialDbParserConfigProvider implements IParserConfigProvider {
    private _signer;
    private _contractName;
    constructor(_signer: NearSigner, _contractName: string);
    getParserConfig(ns: string): Promise<ParserConfig | null>;
    createParserConfig(config: ParserConfig): Promise<void>;
    private _extractParserIdFromNamespace;
}
//# sourceMappingURL=social-db-parser-config-provider.d.ts.map