import { Provider } from "../provider";
import Web3 from 'web3';
import { parseChainId } from '~/utils/helpers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { PARAMS } from '~/utils/constants';
import { createNanoEvents, Emitter } from "nanoevents";

interface Events {
  disconnect: () => void
}

export class WalletConnect implements Provider {
    public name: string = 'walletConnect';
    public title: string = 'WalletConnect';
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
        type rpcObject = {
            [key: number]: string
        }

        var rpc: rpcObject = {};

        Object.keys(PARAMS.networks).forEach((netKey: string) => {
            const net = PARAMS.networks[netKey as keyof typeof PARAMS.networks];
            Object.keys(net).forEach((subnetKey: string) => {
                const subnet = net[subnetKey as keyof typeof net];
                rpc[subnet.chainId] = subnet.rpcEndpoint;
            });
        })

        this.provider = new WalletConnectProvider({
            qrcode: true,
            rpc
        });
        try {
            await this.provider!.enable();
        } catch (e) {
            if (e.message === 'User closed modal') { // soft error: User rejected the request.
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
        // try {
        //     await this.provider
        //         .request({
        //           method: 'wallet_switchEthereumChain',
        //           params: [{ chainId: '0x' + chainId.toString(16) }]
        //         })
        // } catch (e) {
        //     console.log(e.message);
        //     return false;
        // }
        // TODO currently wallet_switchEthereumChain is not supported
        return true;
    }

    disconnect(): void {
        this.provider!.disconnect();
    }
}