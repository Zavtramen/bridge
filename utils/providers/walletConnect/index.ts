import { Provider } from "../provider";
import Web3 from 'web3';
import { parseChainId } from '~/utils/helpers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { PARAMS } from '~/utils/constants';

export class WalletConnect implements Provider {
    public title: string = 'WalletConnect';
    public web3: Web3 | null = null;
    public myAddress: string = '';
    public chainId: number = 0;
    public isConnected: boolean = false;
    private initialChainId: number = 0;
    private provider: any = null;


    constructor(params: any) {
        this.initialChainId = params.chainId;

        interface IrpcObject {
            [key: number]: string
        }

        var rpc: IrpcObject = {};

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
    }

    async connect(): Promise<boolean> {
        if (!this.provider) {
            return false;
        }

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

        if (this.chainId !== this.initialChainId) {
            await this.switchChain(this.initialChainId);
        }

        this.isConnected = true;

        this.provider!.on('accountsChanged', this.onAccountsChanged.bind(this));
        this.provider!.on('chainChanged', this.onChainChanged.bind(this));
        this.provider!.on('disconnect', this.onDisconnect.bind(this));
        this.provider!.on('connect', this.onConnect.bind(this));

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
}