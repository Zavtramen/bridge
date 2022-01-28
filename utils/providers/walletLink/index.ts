import { Provider } from "../provider";
import Web3 from 'web3';
import { parseChainId } from '~/utils/helpers';
// import { WalletLink as WalletLinkProvider } from 'walletlink';
import { PARAMS } from '~/utils/constants';
import { getScript } from '~/utils/helpers';
import { createNanoEvents, Emitter } from "nanoevents";

interface Events {
  disconnect: () => void
}

export class WalletLink implements Provider {
    public name: string = 'walletLink';
    public title: string = 'WalletLink';
    public web3: Web3 | null = null;
    public myAddress: string = '';
    public chainId: number = 0;
    public isConnected: boolean = false;
    private provider: any = null;
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
        if (window.ethereum && window.ethereum.isCoinbaseWallet === true) {
            this.provider = window.ethereum;
        } else {

            try {
                await getScript('walletLink@2.4.2.js');
            } catch (err) {
                console.log(err.message);
                return false;
            }

            const walletLink = new window.WalletLinkBundle.default({
                appName: PARAMS.appName,
                appLogoUrl: PARAMS.appLogoUrl,
                darkMode: false
            });
            this.provider = walletLink.makeWeb3Provider(params.rpcEndpoint, params.chainId);
        }

        try {
            await this.provider!.enable();
        } catch (e) {
            console.log(e.message);
            if (e.message === 'User denied account authorization') { // soft error: User rejected the request.
                console.log(e.message);
                return false;
            }
            throw new Error(e.message);
        }

        this.web3 = new Web3(this.provider!);

        const accounts = await this.web3.eth.getAccounts();
        this.myAddress = accounts[0];

        this.chainId = parseChainId(await this.web3.eth.net.getId());

        if (this.chainId !== params.chainId) {
            await this.switchChain(params.chainId);
        }

        this.isConnected = true;

        this.provider!.on('accountsChanged', this.onAccountsChanged);
        this.provider!.on('chainChanged', this.onChainChanged);
        this.provider!.on('disconnect', this.onDisconnect);
        this.provider!.on('connect', this.onConnect);

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

        this.provider!.off('accountsChanged', this.onAccountsChanged);
        this.provider!.off('chainChanged', this.onChainChanged);
        this.provider!.off('disconnect', this.onDisconnect);
        this.provider!.off('connect', this.onConnect);

        this.emitter.emit('disconnect');
        this.emitter.events = { };
    }

    onConnect(connectInfo: any): void {
        this.isConnected = true;
        console.log('connected');
    }

    async switchChain(chainId: number): Promise<boolean> {
        try {
            await this.provider
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
        this.provider.close();
    }
}