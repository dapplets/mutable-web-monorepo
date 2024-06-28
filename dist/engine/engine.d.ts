import { WalletSelector } from '@near-wallet-selector/core';
import { IStorage } from './app/services/local-db/local-storage';
import { MutationService } from './app/services/mutation/mutation.service';
import { ApplicationService } from './app/services/application/application.service';
import { UserLinkSerivce } from './app/services/user-link/user-link.service';
import { ParserConfigService } from './app/services/parser-config/parser-config.service';
export type EngineConfig = {
    networkId: string;
    gatewayId: string;
    selector: WalletSelector;
    storage?: IStorage;
    bosElementName?: string;
    bosElementStyleSrc?: string;
};
export declare class Engine {
    #private;
    readonly config: EngineConfig;
    mutationService: MutationService;
    applicationService: ApplicationService;
    userLinkService: UserLinkSerivce;
    parserConfigService: ParserConfigService;
    constructor(config: EngineConfig);
}
//# sourceMappingURL=engine.d.ts.map