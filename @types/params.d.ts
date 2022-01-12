interface IParamsNetwork {
    getGasUrl: string,
    explorerUrl: string,
    wTonAddress: string,
    tonBridgeAddress: string,
    tonCollectorAddress: string,
    tonMultisigAddress: string,
    tonCenterUrl: string,
    rpcEndpoint: string,
    chainId: number,
    blocksConfirmations: number,
    defaultGwei: number,
    coinsPerGweiTo: number,
    coinsPerGweiFrom: number
}

interface IParams {
    tonTransferUrl: string,
    appName: string,
    appLogoUrl: string,
    networks: {
        [key: string]: {
            main: IParamsNetwork,
            test: IParamsNetwork
        }
    }
}