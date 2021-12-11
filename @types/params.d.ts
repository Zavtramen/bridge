interface IParamsNetwork {
    getGasUrl: string,
    coinStatUrl: string,
    wTonAddress: string,
    tonBridgeAddress: string,
    tonCollectorAddress: string,
    tonMultisigAddress: string,
    tonCenterUrl: string,
    ethChainId: number,
    blocksConfirmations: number,
    fallbackFeeTo: number,
    fallbackFeeFrom: number
}

interface IParams {
    tonTransferUrl: string,
    networks: {
        [key: string]: {
            main: IParamsNetwork,
            test: IParamsNetwork
        }
    }
}