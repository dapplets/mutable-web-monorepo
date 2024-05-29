import { FC } from 'react';
export interface Props {
    image?: {
        ipfs_cid?: string;
        url?: string;
    };
    fallbackUrl?: string;
    alt?: string;
}
export declare const Image: FC<Props>;
//# sourceMappingURL=Image.d.ts.map