export const PARAMS: IParams = {
    "tonTransferUrl": "ton://transfer/<BRIDGE_ADDRESS>?amount=<AMOUNT>&text=swapTo%23<TO_ADDRESS>",
    "networks": {
        "eth": {
            "main": {
                "getGasUrl": "https://ethereumgas.toncenter.com",
                "explorerUrl": "https://etherscan.io/token/<ADDRESS>",
                "wTonAddress": "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
                "tonBridgeAddress": "Ef_dJMSh8riPi3BTUTtcxsWjG8RLKnLctNjAM4rw8NN-xWdr",
                "tonCollectorAddress": "EQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImgxT5",
                "tonMultisigAddress": "kf87m7_QrVM4uXAPCDM4DuF9Rj5Rwa5nHubwiQG96JmyAo-S",
                "tonCenterUrl": "https://wallet.toncenter.com/api/v2/jsonRPC",
                "chainId": 1,
                "blocksConfirmations": 12,
                "defaultGwei": 25,
                "coinsPerGweiTo": 0.004,
                "coinsPerGweiFrom": 0.001
            },
            "test": {
                "getGasUrl": "https://ethereumgas.toncenter.com",
                "explorerUrl": "https://goerli.etherscan.io/token/<ADDRESS>",
                "wTonAddress": "0xDB15ffaf2c88F2d89Db9365a5160D5b8c9448Ea6",
                "tonBridgeAddress": "Ef-56ZiqKUbtp_Ax2Qg4Vwh7yXXJCO8cNJAb229J6XXe4-aC",
                "tonCollectorAddress": "EQCA1W_I267-luVo9CzV7iCcrA1OO5vVeXD0QHACvBn1jIVU",
                "tonMultisigAddress": "kf-OV1dpgFVEzEmyvAETT8gnhqZ1IqHn8RzT6dmEmvnze-9n",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "chainId": 5,
                "blocksConfirmations": 12,
                "defaultGwei": 25,
                "coinsPerGweiTo": 0.004,
                "coinsPerGweiFrom": 0.001
            }
        },
        "bsc": {
            "main": {
                "getGasUrl": "https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle",
                "explorerUrl": "https://bscscan.com/token/<ADDRESS>",
                "wTonAddress": "0x76A797A59Ba2C17726896976B7B3747BfD1d220f",
                "tonBridgeAddress": "Ef9NXAIQs12t2qIZ-sRZ26D977H65Ol6DQeXc5_gUNaUys5r",
                "tonCollectorAddress": "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW",
                "tonMultisigAddress": "kf8OvX_5ynDgbp4iqJIvWudSEanWo0qAlOjhWHtga9u2Yo7j",
                "tonCenterUrl": "https://wallet.toncenter.com/api/v2/jsonRPC",
                "chainId": 56,
                "blocksConfirmations": 12,
                "defaultGwei": 5,
                "coinsPerGweiTo": 0.0008,
                "coinsPerGweiFrom": 0.0002
            },
            "test": {
                "getGasUrl": "https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle",
                "explorerUrl": "https://testnet.bscscan.com/token/<ADDRESS>",
                "wTonAddress": "0xdb15ffaf2c88f2d89db9365a5160d5b8c9448ea6",
                "tonBridgeAddress": "Ef_GmJntTDokxfhLGF1jRvMGC8Jav2V5keoNj4El2jzhHsID",
                "tonCollectorAddress": "EQDBNfV4DQzSyzNMw6BCTSZSoUi-CzWcYNsfhKxoDqfrwFtS",
                "tonMultisigAddress": "kf83VnnXuaqQV1Ts2qvUr6agacM0ydOux5NNa1mcU-cEO693",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "chainId": 97,
                "blocksConfirmations": 12,
                "defaultGwei": 5,
                "coinsPerGweiTo": 0.0008,
                "coinsPerGweiFrom": 0.0002
            }
        }
    }
};
