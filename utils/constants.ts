export const PARAMS: IParams = {
    "appName": "TON Bridge",
    "appLogoUrl": "https://ton.org/bridge/favicon.ico",
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
                "tonCenterUrl": "https://tonchain.co/api/v2/jsonRPC",
                "rpcEndpoint": "https://mainnet.infura.io/v3/d29ee9db9b7b4bbc8fa5d28047a3ff47",
                "chainId": 1,
                "blocksConfirmations": 12,
                "defaultGwei": 25,
                "coinsPerGweiTo": 0.004,
                "coinsPerGweiFrom": 0.001
            },
            "test": {
                "getGasUrl": "https://ethereumgas.toncenter.com",
                "explorerUrl": "https://ropsten.etherscan.io/token/<ADDRESS>",
                "wTonAddress": "0x10922606e41e5b7Fcca21e773B00f0436D4F941F",
                "tonBridgeAddress": "Ef_dJMSh8riPi3BTUTtcxsWjG8RLKnLctNjAM4rw8NN-xWdr",
                "tonCollectorAddress": "UQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImg0k8",
                "tonMultisigAddress": "kf8seQ2TAIJJHhKRm8c5vyV6oDxUtZgwlhRRgZSlWnJaS37k",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "rpcEndpoint": "https://ropsten.infura.io/v3/d29ee9db9b7b4bbc8fa5d28047a3ff47",
                "chainId": 3,
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
                "tonCenterUrl": "https://tonchain.co/api/v2/jsonRPC",
                "rpcEndpoint": "https://bsc-dataseed.binance.org/",
                "chainId": 56,
                "blocksConfirmations": 12,
                "defaultGwei": 5,
                "coinsPerGweiTo": 0.0008,
                "coinsPerGweiFrom": 0.0002
            },
            "test": {
                "getGasUrl": "https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle",
                "explorerUrl": "https://testnet.bscscan.com/token/<ADDRESS>",
                "wTonAddress": "0xA345a7C8d88279165214f6dA6e857041902955C5",
                "tonBridgeAddress": "Ef9NXAIQs12t2qIZ-sRZ26D977H65Ol6DQeXc5_gUNaUys5r",
                "tonCollectorAddress": "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW",
                "tonMultisigAddress": "0f-a7dEc5xG4x2sWIzfYMzUvtUEFkcPKmhY6bzEFh-Bib2Eu",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "rpcEndpoint": "https://data-seed-prebsc-1-s1.binance.org:8545/",
                "chainId": 97,
                "blocksConfirmations": 12,
                "defaultGwei": 5,
                "coinsPerGweiTo": 0.0008,
                "coinsPerGweiFrom": 0.0002
            }
        }
    }
};
