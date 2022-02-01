type ParamsNetwork = {
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

type Params = {
    tonTransferUrl: string,
    tonExplorerUrl: {
        main: string,
        test: string
    },
    appName: string,
    appLogoUrl: string,
    networks: {
        [key: string]: {
            main: ParamsNetwork,
            test: ParamsNetwork
        }
    }
}