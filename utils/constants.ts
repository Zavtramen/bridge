export const PARAMS: IParams = {
    "tonTransferUrl": "ton://transfer/<BRIDGE_ADDRESS>?amount=<AMOUNT>&text=swapTo%23<TO_ADDRESS>",
    "networks": {
        "eth": {
            "main": {
                "getGasUrl": "https://ethereumgas.toncenter.com",
                "coinStatUrl": "https://etherscan.io/token/<ADDRESS>",
                "wTonAddress": "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
                "tonBridgeAddress": "Ef_dJMSh8riPi3BTUTtcxsWjG8RLKnLctNjAM4rw8NN-xWdr",
                "tonCollectorAddress": "EQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImgxT5",
                "tonMultisigAddress": "kf8rV4RD7BD-j_C-Xsu8FBO9BOOOwISjNPbBC8tcq688Gcmk",
                "tonCenterUrl": "https://tonchain.co/api/v2/jsonRPC",
                "ethChainId": 1,
                "blocksConfirmations": 12,
                "fallbackFeeTo": 0.004,
                "fallbackFeeFrom": 0.001,
            },
            "test": {
                "getGasUrl": "https://ethereumgas.toncenter.com",
                "coinStatUrl": "https://ropsten.etherscan.io/token/<ADDRESS>",
                "wTonAddress": "0x10922606e41e5b7Fcca21e773B00f0436D4F941F",
                "tonBridgeAddress": "Ef_dJMSh8riPi3BTUTtcxsWjG8RLKnLctNjAM4rw8NN-xWdr",
                "tonCollectorAddress": "UQCuzvIOXLjH2tv35gY4tzhIvXCqZWDuK9kUhFGXKLImg0k8",
                "tonMultisigAddress": "kf8seQ2TAIJJHhKRm8c5vyV6oDxUtZgwlhRRgZSlWnJaS37k",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "ethChainId": 3,
                "blocksConfirmations": 12,
                "fallbackFeeTo": 0.004,
                "fallbackFeeFrom": 0.001,
            }
        },
        "bsc": {
            "main": {
                "getGasUrl": "https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle",
                "coinStatUrl": "https://bscscan.com/token/<ADDRESS>",
                "wTonAddress": "0x76A797A59Ba2C17726896976B7B3747BfD1d220f",
                "tonBridgeAddress": "Ef9NXAIQs12t2qIZ-sRZ26D977H65Ol6DQeXc5_gUNaUys5r",
                "tonCollectorAddress": "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW",
                "tonMultisigAddress": "kf8OvX_5ynDgbp4iqJIvWudSEanWo0qAlOjhWHtga9u2Yo7j",
                "tonCenterUrl": "https://tonchain.co/api/v2/jsonRPC",
                "ethChainId": 56,
                "blocksConfirmations": 12,
                "fallbackFeeTo": 0.0008,
                "fallbackFeeFrom": 0.0002,
            },
            "test": {
                "getGasUrl": "https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle",
                "coinStatUrl": "https://testnet.bscscan.com/token/<ADDRESS>",
                "wTonAddress": "0xA345a7C8d88279165214f6dA6e857041902955C5",
                "tonBridgeAddress": "Ef9NXAIQs12t2qIZ-sRZ26D977H65Ol6DQeXc5_gUNaUys5r",
                "tonCollectorAddress": "EQAHI1vGuw7d4WG-CtfDrWqEPNtmUuKjKFEFeJmZaqqfWTvW",
                "tonMultisigAddress": "0f-a7dEc5xG4x2sWIzfYMzUvtUEFkcPKmhY6bzEFh-Bib2Eu",
                "tonCenterUrl": "https://testnet.toncenter.com/api/v2/jsonRPC",
                "ethChainId": 97,
                "blocksConfirmations": 12,
                "fallbackFeeTo": 0.0008,
                "fallbackFeeFrom": 0.0002,
            }
        }
    }
};
