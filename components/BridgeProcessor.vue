<template>
    <div class="BridgeProcessor">
        <button
            class="BridgeProcessor-transfer"
            v-if="state.step === 0"
            @click="onTransferClick">{{$t('Bridge.transfer')}}</button>

        <div class="BridgeProcessor-infoWrapper" v-else>
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 1, 'pending': state.step === 1, 'done': state.step > 1}"></div>
                <div class="BridgeProcessor-info-text" v-html="getStepInfoText1"></div>
            </div>
            <div class="BridgeProcessor-infoLine" v-if="!isFromTon">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 2, 'pending': state.step === 2, 'done': state.step > 2}"></div>
                <div class="BridgeProcessor-info-text" v-html="getStepInfoText2"></div>
            </div>
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 3, 'pending': state.step === 3, 'done': state.step > 3}"></div>
                <div class="BridgeProcessor-info-text" v-html="getStepInfoText3"></div>
            </div>
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 4, 'pending': state.step === 4, 'done': state.step > 4}"></div>
                <div class="BridgeProcessor-info-text" v-html="getStepInfoText4"></div>
            </div>
        </div>

        <button
            v-if="isGetTonCoinVisible"
            class="BridgeProcessor-getTonCoin"
            @click="mint">{{$t('Bridge.getToncoin')}}</button>

        <button
            v-if="isDoneVisible"
            class="BridgeProcessor-done"
            @click="onDoneClick">{{$t('Bridge.done')}}</button>

        <button
            v-if="isCancelVisible"
            class="BridgeProcessor-cancel"
            @click="onCancelClick">{{$t('Bridge.cancel')}}</button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Web3 from 'web3';
import TonWeb from 'tonweb';
import WTON from '~/assets/WTON.json';
import { ethers } from "ethers";
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { httpGet, toUnit, fromUnit, getNumber, getBool, decToHex, parseAddressFromDec } from '~/utils/helpers';
import { PARAMS } from '~/utils/constants';

declare interface IEthToTon {
    transactionHash: string,
    logIndex: number,
    to: {
        workchain: number,
        address_hash: string
    }
    value: number,
    blockTime: number,
    blockHash: string,
    blockNumber: number,
    from: string
}

declare interface ISwapData {
    type: string,
    receiver: string,
    amount: string,
    tx: {
        address_: {
            workchain: number,
            address_hash: string
        },
        tx_hash: string,
        lt: number
    }
}

declare interface IVoteEth {
    publicKey: string,
    r: string,
    s: string,
    v: number | undefined
}

declare interface IProvider {
    oraclesTotal: number,
    blockNumber: number,
    myEthAddress: string,
    wtonContract: Contract,
    web3: Web3,
    tonweb: TonWeb,
    feeFlat: typeof BN,
    feeFactor: typeof BN,
    feeBase: typeof BN
}

declare interface IState {
    swapId: string,
    queryId: string,
    fromCurrencySent: boolean,
    toCurrencySent: boolean,
    step: number,
    votes: IVoteEth[] | number[] | null,
    swapData: ISwapData | null,
    createTime: number,
    blockNumber: number,
}

declare interface IComponentData {
    newBlockHeadersSubscription: any,
    updateStateInterval: null | ReturnType<typeof setInterval>,
    provider: IProvider | null,
    state: IState,
    ethToTon: IEthToTon | null
}

const BN = TonWeb.utils.BN;

export default Vue.extend({
    props: {
        isTestnet: {
            type: Boolean,
            required: true
        },
        isRecover: {
            type: Boolean,
            required: true
        },
        lt: {
            type: Number,
            required: true
        },
        hash: {
            type: String,
            required: true
        },
        isFromTon: {
            type: Boolean,
            required: true
        },
        pair: {
            type: String,
            required: true
        },
        amount: {
            type: Number
        },
        toAddress: {
            type: String,
            required: true
        },
    },

    data(): IComponentData {
        return {
            newBlockHeadersSubscription: null,
            updateStateInterval: null,
            provider: null,
            ethToTon: null,

            state: {
                swapId: '',
                queryId: '0',
                fromCurrencySent: false,
                toCurrencySent: false,
                step: 0,
                votes: null,
                swapData: null,
                createTime: 0,
                blockNumber: 0
            }
        }
    },

    computed: {
        netTypeName(): string {
            return this.isTestnet ? 'test' : 'main';
        },
        params(): IParamsNetwork {
            const pairParams = PARAMS.networks[this.pair];
            return pairParams[this.netTypeName as keyof typeof pairParams];
        },
        isGetTonCoinVisible(): boolean {
            return this.isFromTon && !this.state.toCurrencySent && this.state.step === 4;
        },
        isDoneVisible(): boolean {
            return this.state.step > 4;
        },
        isCancelVisible(): boolean {
            return this.isFromTon && this.state.step === 1;
        },
        fromCoin(): string {
            return this.isFromTon ?
                this.$t(`Bridge.networks.ton.${this.netTypeName}.coinShort`) as string :
                this.$t(`Bridge.networks.${this.pair}.${this.netTypeName}.coinShort`) as string;
        },
        toCoin(): string {
            return !this.isFromTon ?
                this.$t(`Bridge.networks.ton.${this.netTypeName}.coinShort`) as string :
                this.$t(`Bridge.networks.${this.pair}.${this.netTypeName}.coinShort`) as string;
        },
        toNetwork(): string {
            const pair = this.isFromTon ? this.pair : 'ton';
            return this.$t(`Bridge.networks.${pair}.${this.netTypeName}.name`) as string;
        },
        getStepInfoText1(): string {
            if (this.state.step === 1) {
                if (this.isFromTon) {
                    const url = PARAMS.tonTransferUrl
                        .replace('<BRIDGE_ADDRESS>', this.params.tonBridgeAddress)
                        .replace('<AMOUNT>', String(toUnit(this.amount)))
                        .replace('<TO_ADDRESS>', this.toAddress);

                    return (this.$t(`Bridge.networks.ton.transactionSend`) as string)
                        .replace('<AMOUNT>', String(this.amount))
                        .replace('<FROM_COIN>', this.fromCoin)
                        .replace('<URL>', url)
                        .replace('<URL>', url);
                } else {
                    return this.state.fromCurrencySent ?
                        this.$t(`Bridge.networks.${this.pair}.transactionWait`) as string :
                        this.$t(`Bridge.networks.${this.pair}.transactionSend`) as string;
                }
            } else {
                const pair = this.isFromTon ? 'ton' : this.pair;
                return this.$t(`Bridge.networks.${pair}.transactionCompleted`) as string;
            }
        },
        getStepInfoText2(): string {
            if (this.isFromTon) {
                return '';
            }

            if (this.state.step === 2) {
                let blocksConfirmations = (this.provider?.blockNumber || this.state.blockNumber) - this.state.blockNumber;
                blocksConfirmations = Math.min(blocksConfirmations, this.params.blocksConfirmations);

                return (this.$t(`Bridge.networks.${this.pair}.blocksConfirmations`) as string)
                    .replace('<COUNT>', String(blocksConfirmations) + '/' + String(this.params.blocksConfirmations));
            } else if (this.state.step > 2) {
                return this.$t('Bridge.blocksConfirmationsCollected') as string;
            } else {
                return this.$t('Bridge.blocksConfirmationsWaiting') as string;
            }
        },
        getStepInfoText3(): string {
            if (this.state.step === 3) {
                const votesConfirmations = (this.state.votes?.length || 0) + '/' + (this.provider?.oraclesTotal || 0);

                return (this.$t(`Bridge.oraclesConfirmations`) as string)
                    .replace('<COUNT>', String(votesConfirmations));
            } else if (this.state.step > 3) {
                return this.$t('Bridge.oraclesConfirmationsCollected') as string;
            } else {
                return this.$t('Bridge.oraclesConfirmationsWaiting') as string;
            }
        },
        getStepInfoText4(): string {
            if (this.state.step === 4) {
                if (this.isFromTon) {
                    return this.state.toCurrencySent ?
                        this.$t(`Bridge.networks.${this.pair}.transactionWait`) as string :
                        (this.$t(`Bridge.getCoinsByMetamask`) as string)
                            .replace('<TO_COIN>', this.toCoin);

                } else {
                    return (this.$t(`Bridge.coinsSent`) as string)
                        .replace('<TO_COIN>', this.toCoin);
                }
            } else if (this.state.step > 4) {
                return (this.$t(`Bridge.coinsSent`) as string)
                    .replace('<TO_COIN>', this.toCoin);
            } else {
                return 'Get ' + this.toCoin + 's in ' + this.toNetwork;
                return (this.$t(`Bridge.getCoins`) as string)
                    .replace('<TO_COIN>', this.toCoin)
                    .replace('<TO_NETWORK>', this.toNetwork);
            }
        }
    },

    watch: {
        'state.step': {
            immediate: true,
            handler(val): void {
                this.$emit('state-changed');
                this.$emit('interface-blocked', val > 0);
            }
        }
    },

    mounted(): void {
        this.updateState();
        this.updateStateInterval = setInterval(this.updateState, 5000);
    },

    beforeDestroy(): void  {
        clearInterval(this.updateStateInterval as ReturnType<typeof setInterval>);

        if (this.newBlockHeadersSubscription) {
            this.newBlockHeadersSubscription.unsubscribe();
        }

        const ethereum = window.ethereum;

        if (ethereum) {
            ethereum.removeListener('accountsChanged', this.onAccountChanged);
        }
    },

    methods: {
        resetState(): void {
            this.state.swapId = '';
            this.state.queryId = '0';
            this.state.fromCurrencySent = false;
            this.state.toCurrencySent = false;
            this.state.step = 0;
            this.state.votes = null;
            this.state.swapData = null;
            this.state.createTime = 0;
            this.state.blockNumber = 0;

            this.$emit('reset-state');
        },
        async loadState(processingState: IState): Promise<void> {
            if (!processingState) {
                 return;
            }

            this.provider = await this.initProvider();

            if (!this.provider) {
                return;
            }
            Object.assign(this.state, processingState);

            await this.updateState();
        },
        saveState(): void {
            this.$emit('save-state', this.state);
        },
        deleteState(): void {
            this.$emit('delete-state');
        },
        async updateState(): Promise<void> {
            if (this.state.step === 1 && this.isFromTon) {
                const swap = await this.getSwap(this.amount, this.toAddress, this.state.createTime);
                if (swap) {
                    this.state.swapId = this.getSwapTonToEthId(this.provider!.web3, swap);
                    this.state.swapData = swap;
                    this.state.step = 3;
                }
            }

            if (this.state.step === 2 && !this.isFromTon) {
                let blocksConfirmations = (this.provider?.blockNumber || this.state.blockNumber) - this.state.blockNumber;

                if (blocksConfirmations > this.params.blocksConfirmations) {
                    const block = await this.provider!.web3.eth.getBlock(this.state.blockNumber);

                    this.ethToTon!.blockTime = Number(block.timestamp);
                    this.ethToTon!.blockHash = block.hash;

                    this.state.queryId = this.getQueryId(this.ethToTon!).toString();
                    this.state.step = 3;
                }
            }

            if (this.state.step === 3) {
                this.state.votes = this.isFromTon ? await this.getEthVote(this.state.swapId) : await this.getTonVote(this.state.queryId);
                if (this.state.votes && this.state.votes!.length >= this.provider!.oraclesTotal * 2 / 3) {
                    this.state.step = this.isFromTon ? 4 : 5;
                }
            }
        },
        getSwapTonToEthId(web3: any, d: ISwapData): string {
            let encodedParams;

            if (this.pair === 'eth') {
                encodedParams = web3.eth.abi.encodeParameters(
                    ['int', 'address', 'uint256', 'int8', 'bytes32', 'bytes32', 'uint64'],
                    [0xDA7A, d.receiver, d.amount, d.tx.address_.workchain, d.tx.address_.address_hash, d.tx.tx_hash, d.tx.lt]
                )
            }

            if (this.pair === 'bsc') {
                encodedParams = web3.eth.abi.encodeParameters(
                    ['int', 'address', 'address', 'uint256', 'int8', 'bytes32', 'bytes32', 'uint64'],
                    [0xDA7A, this.params.wTonAddress, d.receiver, d.amount, d.tx.address_.workchain, d.tx.address_.address_hash, d.tx.tx_hash, d.tx.lt]
                )
            }

            return Web3.utils.sha3(encodedParams) as string;
        },
        serializeEthToTon(ethToTon: IEthToTon) {
            const bits = new TonWeb.boc.BitString(8 + 256 + 16 + 8 + 256 + 64);
            bits.writeUint(0, 8); // vote op
            bits.writeUint(new BN(ethToTon.transactionHash.substr(2), 16), 256);
            bits.writeInt(ethToTon.logIndex, 16);
            bits.writeUint(ethToTon.to.workchain, 8);
            bits.writeUint(new BN(ethToTon.to.address_hash, 16), 256);
            bits.writeUint(new BN(ethToTon.value), 64);
            return bits.array;
        },
        getQueryId(ethToTon: IEthToTon): typeof BN {
            const MULTISIG_QUERY_TIMEOUT = 30 * 24 * 60 * 60; // 30 days
            const VERSION = 2;
            const timeout = ethToTon.blockTime + MULTISIG_QUERY_TIMEOUT + VERSION;

            const query_id = Web3.utils.sha3(ethToTon.blockHash + '_' + ethToTon.transactionHash + '_' + String(ethToTon.logIndex))!.substr(2, 8); // get first 32 bit

            return new BN(timeout).mul(new BN(4294967296)).add(new BN(query_id, 16));
        },
        getFeeAmount(amount: typeof BN): string {
            const rest = new BN(amount).sub(this.provider!.feeFlat);
            const percentFee = rest.mul(this.provider!.feeFactor).div(this.provider!.feeBase);
            return this.provider!.feeFlat.add(percentFee)
        },
        makeAddress(address: string): string {
            if (!address.startsWith('0x')) throw new Error('Invalid address ' + address);
            let hex = address.substr(2);
            while (hex.length < 40) {
                hex = '0' + hex;
            }
            return '0x' + hex;
        },
        async getSwap(myAmount: number, myToAddress: string, myCreateTime: number): Promise<null | ISwapData> {
            console.log('getTransactions', this.params.tonBridgeAddress, this.lt && this.hash ? 1 : (this.isRecover ? 200 : 40), this.lt || undefined, this.hash || undefined, undefined, this.lt && this.hash ? true : undefined);
            const transactions = await this.provider!.tonweb.provider.getTransactions(this.params.tonBridgeAddress, this.lt && this.hash ? 1 : (this.isRecover ? 200 : 40), this.lt || undefined, this.hash || undefined, undefined, this.lt && this.hash ? true : undefined);
            console.log('ton txs', transactions.length);

            const findLogOutMsg = (outMessages?: any[]) => {
                if (!outMessages) return null;
                for (let outMsg of outMessages) {
                    if (outMsg.destination === '') return outMsg;
                }
                return null;
            }

            for (let t of transactions) {
                const logMsg = findLogOutMsg(t.out_msgs);
                if (logMsg) {
                    if (!this.isRecover && !(this.lt && this.hash)) {
                        if (t.utime * 1000 < myCreateTime) continue;
                    }

                    const message = logMsg.message.substr(0, logMsg.message.length - 1); // remove '\n' from end
                    const bytes = TonWeb.utils.base64ToBytes(message);
                    if (bytes.length !== 28) {
                        continue;
                    }
                    const destinationAddress = this.makeAddress('0x' + TonWeb.utils.bytesToHex(bytes.slice(0, 20)));
                    const amountHex = TonWeb.utils.bytesToHex(bytes.slice(20, 28));
                    const amount = new BN(amountHex, 16);
                    const senderAddress = new TonWeb.utils.Address(t.in_msg.source);

                    const event: ISwapData = {
                        type: 'SwapTonToEth',
                        receiver: destinationAddress,
                        amount: amount.toString(),
                        tx: {
                            address_: { // sender address
                                workchain: senderAddress.wc,
                                address_hash: '0x' + TonWeb.utils.bytesToHex(senderAddress.hashPart),
                            },
                            tx_hash: '0x' + TonWeb.utils.bytesToHex(TonWeb.utils.base64ToBytes(t.transaction_id.hash)),
                            lt: t.transaction_id.lt,
                        }
                    };
                    console.log(JSON.stringify(event));

                    const myAmountNano = new BN(myAmount * 1e9);
                    const amountAfterFee = myAmountNano.sub(this.getFeeAmount(myAmountNano));

                    if (amount.eq(amountAfterFee) && event.receiver.toLowerCase() === myToAddress.toLowerCase()) {
                        return event;
                    }
                }
            }
            return null;
        },
        parseEthSignature(data: any) {
            const tuple = data.tuple.elements;
            const publicKey = this.makeAddress(decToHex(tuple[0].number.number));

            const rsv = tuple[1].tuple.elements;
            const r = decToHex(rsv[0].number.number);
            const s = decToHex(rsv[1].number.number);
            const v = Number(rsv[2].number.number);
            return {
                publicKey,
                r,
                s,
                v
            }
        },
        async getEthVote(voteId: string): Promise<null | IVoteEth[]> {
            console.log('getEthVote ', voteId);

            const result = await this.provider!.tonweb.provider.call(this.params.tonCollectorAddress, 'get_external_voting_data', [['num', voteId]]);
            if (result.exit_code === 309) {
                return null;
            }

            let list;
            try {
                list = result.stack[0][1].elements;
            } catch (e) {
                console.log('getEthVote, corrupted result', result);
                return null;
            }

            const status = {
                signatures: list.map(this.parseEthSignature)
            };

            return status.signatures;
        },
        async getTonVote(queryId: string): Promise<null | number[]> {
            console.log('getTonVote ', queryId);

            const result = await this.provider!.tonweb.provider.call(this.params.tonMultisigAddress, 'get_query_state', [['num', queryId]]);

            let a, b;
            try {
                a = getNumber(result.stack[0]);
                b = getNumber(result.stack[1]);
            } catch (e) {
                console.log('getTonVote, corrupted result', result);
                return null;
            }
            console.log('getTonVote', result, a, b);

            const arr = [];
            const count = a === -1 ? this.provider!.oraclesTotal : b.toString(2).split('0').join('').length; // count of bits
            for (let i = 0; i < count; i++) {
                arr.push(1);
            }
            return arr;
        },
        async mint(): Promise<any> {
            let receipt;
            try {
                let signatures = (this.state.votes! as IVoteEth[]).map(v => {
                    return {
                        signer: v.publicKey,
                        signature: ethers.utils.joinSignature({r: v.r, s: v.s, v: v.v})
                    }
                })

                signatures = signatures.sort((a, b) => {
                    return new BN(a.signer.substr(2), 16).cmp(new BN(b.signer.substr(2), 16));
                });

                console.log('voteForMinting', JSON.stringify(this.state.swapData!), JSON.stringify(signatures));

                receipt = await this.provider!.wtonContract.methods.voteForMinting(this.state.swapData!, signatures).send({from: this.provider!.myEthAddress})
                    .on('transactionHash', () => {
                        this.state.toCurrencySent = true;
                        this.deleteState();
                    });
            } catch (e) {
                console.error(e);
                return;
            }

            if (receipt.status) {
                this.state.step = 5;
                this.deleteState();
            } else {
                console.error('transaction fail', receipt);
            }
        },
        async burn(): Promise<void> {
            const fromAddress = this.provider!.myEthAddress;
            const toAddress = this.toAddress;
            const amount = this.amount;

            const addressTon = new TonWeb.utils.Address(toAddress);
            const wc = addressTon.wc;
            const hashPart = TonWeb.utils.bytesToHex(addressTon.hashPart);
            const amountUnit = toUnit(amount);

            let receipt;

            try {
                receipt = await this.provider!.wtonContract.methods.burn(amountUnit, {
                    workchain: wc,
                    address_hash: '0x' + hashPart
                }).send({from: fromAddress})
                    .on('transactionHash', () => {
                        this.state.fromCurrencySent = true;
                    });
            } catch (e) {
                console.error(e);
                this.resetState();
                return;
            }

            if (receipt.status) {
                console.log('receipt', receipt);

                this.state.blockNumber = receipt.blockNumber;
                this.ethToTon = {
                    transactionHash: receipt.transactionHash,
                    logIndex: receipt.events.SwapEthToTon.logIndex,
                    blockNumber: this.state.blockNumber,
                    blockTime: 0,
                    blockHash: '',
                    from: fromAddress,
                    to: {
                        workchain: wc,
                        address_hash: hashPart
                    },
                    value: amountUnit
                };

                this.state.step = 2;
            } else {
                console.error('transaction fail', receipt);
            }
        },
        onDoneClick(): void {
            this.resetState();
        },
        onCancelClick(): void {
            this.deleteState();
            this.resetState();
        },
        async onAccountChanged(accounts: Array<any>): Promise<void>  {
            console.log('accountsChanged', accounts);
            const address: string = accounts[0] as string;
            if (!this.provider) {
                this.provider = await this.initProvider();
                if (!this.provider) {
                    return;
                }
            }
            if (!(new BN(await this.provider!.web3.eth.getBalance(address)).gt(new BN('0')))) {
                alert(this.$t(`Bridge.networks.${this.pair}.errors.lowBalance`) as string);
                return;
            }
            this.provider!.myEthAddress = address;
            console.log('address is', this.provider!.myEthAddress);
        },
        async initProvider(): Promise<IProvider | null> {
            const ethereum = window.ethereum;

            if (!ethereum) {
                alert(this.$t('Bridge.errors.installMetamask') as string);
                return null;
            } else {
                let myEthAddress;
                try {
                    const accounts = (await ethereum.send('eth_requestAccounts')).result;
                    myEthAddress = accounts[0];
                    console.log('address is', myEthAddress);
                } catch (error) {
                    console.log(error);
                    return null;
                }

                ethereum.addListener('accountsChanged', this.onAccountChanged);

                if (ethereum.networkVersion as string !== String(this.params.ethChainId)) {
                    //eth
                    const error = (this.$t('Bridge.errors.wrongMetamaskNetwork') as string)
                        .replace('<NETWORK>', this.$t(`Bridge.networks.${this.pair}.${this.netTypeName}.full`) as string)
                    alert(error);
                    return null;
                }

                const web3 = new Web3(ethereum);
                const wtonContract = new web3.eth.Contract(WTON as AbiItem[], this.params.wTonAddress);
                const oraclesTotal = (await wtonContract.methods.getFullOracleSet().call()).length;

                if (!(oraclesTotal > 0)) {
                    return null;
                }

                if (!(new BN(await web3.eth.getBalance(myEthAddress)).gt(new BN('0')))) {
                    alert(this.$t(`Bridge.networks.${this.pair}.errors.lowBalance`) as string);
                    return null;
                }

                this.newBlockHeadersSubscription = web3.eth.subscribe('newBlockHeaders')
                    .on('data', (blockHeader) => {
                        this.provider!.blockNumber = blockHeader.number;
                    })
                    .on('error', (error) => {
                        console.error("Error on newBlockHeaders", error);
                    });

                const tonweb = new TonWeb(new TonWeb.HttpProvider(this.params.tonCenterUrl));

                const bridgeData = (await tonweb.provider.call(this.params.tonBridgeAddress, 'get_bridge_data', [])).stack;

                if (bridgeData.length !== 8) throw new Error('Invalid bridge data')
                const stateFlags = getNumber(bridgeData[0]);
                const totalLocked = getNumber(bridgeData[1]);
                const collectorWc = getNumber(bridgeData[2]);
                const collectorAddr = bridgeData[3][1]; // string
                const feeFlat = new BN(getNumber(bridgeData[4]));
                const feeNetwork = new BN(getNumber(bridgeData[5]));
                const feeFactor = new BN(getNumber(bridgeData[6]));
                const feeBase = new BN(getNumber(bridgeData[7]));

                const res: IProvider = {
                    blockNumber: 0,
                    myEthAddress,
                    web3,
                    wtonContract,
                    tonweb,
                    oraclesTotal,
                    feeFlat: feeFlat.add(feeNetwork),
                    feeFactor,
                    feeBase
                };

                return res;
            }
        },
        async onTransferClick(): Promise<void> {
            if (isNaN(this.amount)) {
                alert(this.$t('Bridge.errors.notValidAmount') as string);
                return;
            }
            if (this.amount < 10) {
                alert(this.$t('Bridge.errors.amountBelow10') as string);
                return;
            }

            if (this.toAddress.toLowerCase() === this.params.wTonAddress.toLowerCase() ||
                this.toAddress.toLowerCase() === this.params.tonBridgeAddress.toLowerCase()) {
                alert(this.$t('Bridge.errors.needPersonalAddress') as string);
                return;
            }

            if (this.isFromTon) {
                if (!Web3.utils.isAddress(this.toAddress)) {
                    alert(this.$t(`Bridge.networks.${this.pair}.errors.invalidAddress`) as string);
                    return;
                }
            } else {
                if (!TonWeb.utils.Address.isValid(this.toAddress)) {
                    alert(this.$t(`Bridge.networks.ton.errors.invalidAddress`) as string);
                    return;
                }
            }

            if (!this.provider) {
                this.provider = await this.initProvider();
                if (!this.provider) {
                    return;
                }
            }

            if (!this.isFromTon) {
                const userErcBalance = fromUnit(Number(await (this.provider!.wtonContract.methods.balanceOf(this.provider!.myEthAddress).call())));
                if (this.amount > userErcBalance) {
                    alert((this.$t('Bridge.errors.toncoinBalance') as string).replace('<BALANCE>', String(userErcBalance)));
                    return;
                }
            }

            this.state.createTime = Date.now();
            this.state.step = 1;

            if (this.isFromTon) {
                this.saveState();
            } else {
                await this.burn();
            }
        }
    }
})
</script>


<style lang="less" scoped>
@r: .BridgeProcessor;

@{r} {
    &-transfer,
    &-getTonCoin,
    &-done,
    &-cancel {
        -webkit-appearance: none;
        background-color: #1d98dc;
        border-radius: 25px;
        color: white;
        font-size: 16px;
        line-height: 19px;
        border: none;
        padding: 15px 35px 14px;
        margin-top: 20px;

        .isPointer &:hover,
        .isTouch &:active {
            background-color: #5fb8ea;
        }
    }

    &-infoWrapper {
        text-align: left;
        width: fit-content;
        font-size: 18px;

        @media (max-width: 800px) {
            font-size: 16px;
        }
    }

    &-infoLine {
        margin-top: 20px;
        display: flex;
        align-items: center;
    }

    &-info-icon {
        flex-shrink: 0;

        &.done {
            width: 18px;
            height: 18px;
            background-image: url('~assets/pics/done.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            margin-right: 10px;
        }

        &.pending {
            width: 12px;
            height: 12px;
            border: 3px solid #1d98dc;
            border-left: 3px solid transparent;
            border-radius: 50%;
            animation: rotating 2s linear infinite;
            margin-right: 13px;
            margin-left: 3px;
        }

        &.none {
            width: 8px;
            height: 8px;
            margin-left: 4px;
            margin-right: 14px;
            background-color: #1d98dc;
            border-radius: 50%;
        }
    }

    &-info-text {
        /deep/ a {
            color: #1d98dc;
            text-decoration: underline;

            .isPointer &:hover,
            .isTouch &:active {
                text-decoration: none;
            }
        }

        /deep/ .note {
            margin-top: 8px;
        }
    }

    @keyframes rotating {
        from {
            -ms-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -webkit-transform: rotate(0deg);
            -o-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        to {
            -ms-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -webkit-transform: rotate(360deg);
            -o-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
}
</style>
