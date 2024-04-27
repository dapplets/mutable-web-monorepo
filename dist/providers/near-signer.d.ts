import { WalletSelector } from '@near-wallet-selector/core';
import * as nearAPI from 'near-api-js';
import { JsonStorage } from '../storage/json-storage';
import Big from 'big.js';
import { NearConfig } from '../constants';
export declare const DefaultGas = "30000000000000";
export declare const TGas: Big.Big;
/**
 * NearSigner is a wrapper around near-api-js JsonRpcProvider and WalletSelector
 * that provides a simple interface for calling and viewing contract methods.
 *
 * Methods view and call are based on near-social-vm
 * Repo: https://github.com/dapplets/near-social-vm/blob/2ba7b77ada4c8e898cc5599f7000b4e0f30991a4/src/lib/data/near.js
 */
export declare class NearSigner {
    private _selector;
    private _jsonStorage;
    private _nearConfig;
    readonly provider: nearAPI.providers.JsonRpcProvider;
    constructor(_selector: WalletSelector, _jsonStorage: JsonStorage, _nearConfig: NearConfig);
    getAccountId(): Promise<string | null>;
    view(contractName: string, methodName: string, args: any): Promise<any>;
    call(contractName: string, methodName: string, args: any, gas?: string, deposit?: string): Promise<void | nearAPI.providers.FinalExecutionOutcome | nearAPI.providers.FinalExecutionOutcome[]>;
    private _sendTxViaWallet;
    private _getKeyStoreForContract;
    private _createConnectionForContract;
    private _signInAndSetCallMethod;
}
//# sourceMappingURL=near-signer.d.ts.map