import Web3 from 'web3';

export interface Provider {
    title: string;
    web3: Web3 | null;
    myAddress: string;
    chainId: number;
    isConnected: boolean;

    connect(): Promise<boolean>;
    onAccountsChanged(accounts: Array<string>): void;
    onChainChanged(chainId: number | string): void;
    onDisconnect(code: number, reason: string): void;
    onConnect(connectInfo: any): void;
    switchChain(chainId: number): Promise<boolean>;
}