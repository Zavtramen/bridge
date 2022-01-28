import { Provider } from "../provider";
import Web3 from 'web3';
import { parseChainId } from '~/utils/helpers';
import { createNanoEvents, Emitter } from "nanoevents";

interface Events {
  disconnect: () => void
}

export class Metamask implements Provider {
    public name: string = 'metamask';
    public title: string = 'Metamask';
    public web3: Web3 | null = null;
    public myAddress: string = '';
    public chainId: number = 0;
    public isConnected: boolean = false;
    private emitter: Emitter;

    constructor() {
        this.emitter = createNanoEvents<Events>()
        this.onAccountsChanged = this.onAccountsChanged.bind(this);
        this.onChainChanged = this.onChainChanged.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onConnect = this.onConnect.bind(this);
    }

    on<E extends keyof Events>(event: E, callback: Events[E]) {
        return this.emitter.on(event, callback)
    }

    async connect(params: any): Promise<boolean> {
        if (!window.ethereum) {
            throw new Error('Bridge.errors.installMetamask');
        }

        try {
            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            })

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

        window.ethereum.on('accountsChanged', this.onAccountsChanged);
        window.ethereum.on('chainChanged', this.onChainChanged);
        window.ethereum.on('disconnect', this.onDisconnect);
        window.ethereum.on('connect', this.onConnect);

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

        // metamask doesn't fire disconnect event if all accounts has been disconnected, so we need to do it explicitly
        if (!this.myAddress) {
            this.onDisconnect(0, '');
        }
    }

    onChainChanged(chainId: number | string): void {
        console.log('chain changed, old chain: ', this.chainId);
        this.chainId = parseChainId(chainId);
        console.log('chain changed, new chain: ', this.chainId);
    }

    onDisconnect(code: number, reason: string): void {
        this.isConnected = false;
        console.log('disconnected');

        window.ethereum.removeAllListeners();

        this.emitter.emit('disconnect');
        this.emitter.events = { };
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

    disconnect(): void {
        // metamask has no disconnect method, strange, so simply report to FE about disconnect
        this.onDisconnect(0, '');
    }
}
