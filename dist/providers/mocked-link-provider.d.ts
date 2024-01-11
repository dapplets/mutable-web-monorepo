import { IContextNode } from "../core/tree/types";
import { BosUserLink, ILinkProvider } from "./link-provider";
export declare class MockedLinkProvider implements ILinkProvider {
    getLinksForContext(context: IContextNode): Promise<BosUserLink[]>;
    createLink(link: BosUserLink): Promise<void>;
}
//# sourceMappingURL=mocked-link-provider.d.ts.map