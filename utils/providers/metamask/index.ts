import { Provider } from "../provider";
import Web3 from 'web3';
import { parseChainId } from '~/utils/helpers';

export class Metamask implements Provider {
    public title: string = 'Metamask';
    public web3: Web3 | null = null;
    public myAddress: string = '';
    public chainId: number = 0;
    public isConnected: boolean = false;

    async connect(params: any): Promise<boolean> {
        if (!window.ethereum) {
            throw new Error('Bridge.errors.installMetamask');
        }

        try {
            const accounts = (await window.ethereum.send('eth_requestAccounts')).result;
            this.myAddress = accounts[0];
        } catch (e) {
            if (e.code === 4001) { // soft error: User rejected the request.
                console.log(e.message);
                return false;
            }
            throw new Error(e.message);
        }

        this.chainId = parseChainId(window.ethereum.networkVersion);

        if (this.chainId !== params.chainId) {
            await this.switchChain(params.chainId);
        }

        this.isConnected = window.ethereum.isConnected();
        this.web3 = new Web3(window.ethereum);

        window.ethereum.on('accountsChanged', this.onAccountsChanged.bind(this));
        window.ethereum.on('chainChanged', this.onChainChanged.bind(this));
        window.ethereum.on('disconnect', this.onDisconnect.bind(this));
        window.ethereum.on('connect', this.onConnect.bind(this));

        return true;
    }

    onAccountsChanged(accounts: Array<string>): void {
        console.log('account changed, old address: ', this.myAddress);
        if (accounts && accounts.length) {
            this.myAddress = accounts[0];
        } else {
            this.myAddress = '';
        }
        console.log('account changed, new address: ', this.myAddress);
    }

    onChainChanged(chainId: number | string): void {
        console.log('chain changed, old chain: ', this.chainId);
        this.chainId = parseChainId(chainId);
        console.log('chain changed, new chain: ', this.chainId);
    }

    onDisconnect(code: number, reason: string): void {
        this.isConnected = false;
        console.log('disconnected');
    }

    onConnect(connectInfo: any): void {
        this.isConnected = true;
        console.log('connected');
    }

    async switchChain(chainId: number): Promise<boolean> {
        try {
            await window.ethereum
                .request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x' + chainId.toString(16) }]
                })
        } catch (e) {
            console.log(e.message);
            return false;
        }
        return true;
    }
}
