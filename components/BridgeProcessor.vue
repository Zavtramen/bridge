<template>
    <div class="BridgeProcessor">
        <button
            class="BridgeProcessor-transfer"
            :disabled="!isInputsValid"
            :class="{ showLoader: isInitInProgress }"
            v-if="state.step === 0"
            @click="onTransferClick">{{$t('Bridge.transfer')}}</button>

        <button
            v-if="isCancelVisible"
            class="BridgeProcessor-cancel"
            @click="onCancelClick">{{$t('Bridge.cancel')}}</button>

        <div class="BridgeProcessor-infoWrapper" v-if="state.step > 0">
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 1, 'pending': state.step === 1, 'done': state.step > 1}"></div>
                <div class="BridgeProcessor-info-text" v-if="!getStepInfoText1.isOnlyText">
                    <div class="BridgeProcessor-info-text-send">
                        <div>
                            {{ getStepInfoText1.send1 }}
                            <button class="BridgeProcessor-info-text-copy" @click="onCopyClick">{{ getStepInfoText1.amount }}</button>
                            {{ getStepInfoText1.send2 }}<br/>
                            <button class="BridgeProcessor-info-text-copy" @click="onCopyClick">{{ getStepInfoText1.toAddress }}</button><br/>
                            {{ getStepInfoText1.withComment }}<br/>
                            <button class="BridgeProcessor-info-text-copy" @click="onCopyClick">{{ getStepInfoText1.comment }}</button><br/>
                        </div>

                        <div class="BridgeProcessor-info-text-send-buttons">
                            <a :href="getStepInfoText1.openWalletUrl" class="BridgeProcessor-info-text-openWallet" target="_blank">{{ getStepInfoText1.openWalletLabel }}</a>

                            <button class="BridgeProcessor-info-text-generateQRCode" v-if="!isQRCodeShown" @click="generateQRCode">{{ getStepInfoText1.generateQRCode }}</button>
                            <div class="BridgeProcessor-info-text-scanQRCode" v-if="isQRCodeShown">{{ getStepInfoText1.scanQRCode }}</div>

                            <div class="BridgeProcessor-info-text-QRCode" ref="qrcode" v-show="isQRCodeShown"></div>
                        </div>
                    </div>
                </div>
                <div class="BridgeProcessor-info-text" v-else>{{ getStepInfoText1.text }}</div>
            </div>
            <div class="BridgeProcessor-infoLine" v-if="!isFromTon">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 2, 'pending': state.step === 2, 'done': state.step > 2}"></div>
                <div class="BridgeProcessor-info-text">{{ getStepInfoText2 }}</div>
            </div>
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 3, 'pending': state.step === 3, 'done': state.step > 3}"></div>
                <div class="BridgeProcessor-info-text">{{ getStepInfoText3 }}</div>
            </div>
            <div class="BridgeProcessor-infoLine">
                <div
                    class="BridgeProcessor-info-icon"
                    :class="{'none': state.step < 4, 'pending': state.step === 4, 'done': state.step > 4}"></div>
                <div class="BridgeProcessor-info-text">{{ getStepInfoText4 }}</div>
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Web3 from 'web3';
import TonWeb from 'tonweb';
import QRCode from 'easyqrcodejs';
import WTON from '~/assets/WTON.json';
import { ethers } from "ethers";
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { getNumber, getBool, decToHex, parseAddressFromDec, getLegacyQueryString } from '~/utils/helpers';
import { PARAMS } from '~/utils/constants';

const BN = TonWeb.utils.BN;

type EthToTon = {
    transactionHash: string,
    logIndex: number,
    to: {
        workchain: number,
        address_hash: string
    }
    value: number,
    blockTime: number,
    blockHash: string,
    from: string
}

type SwapData = {
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

type VoteEth = {
    publicKey: string,
    r: string,
    s: string,
    v: number | undefined
}

type ProviderData = {
    oraclesTotal: number,
    blockNumber: number,
    wtonContract: Contract,
    tonweb: TonWeb,
    feeFlat: typeof BN,
    feeFactor: typeof BN,
    feeBase: typeof BN
}

type State = {
    swapId: string,
    queryId: string,
    fromCurrencySent: boolean,
    toCurrencySent: boolean,
    step: number,
    votes: VoteEth[] | number[] | null,
    swapData: SwapData | null,
    createTime: number,
    blockNumber: number,
}

type ComponentData = {
    newBlockHeadersSubscription: any,
    updateStateInterval: null | ReturnType<typeof setInterval>,
    providerData: ProviderData | null,
    state: State,
    ethToTon: EthToTon | null,
    isInitInProgress: boolean,
    isQRCodeShown: boolean
}

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
        provider: {
            type: Object,
            required: true
        },
        isInputsValid: {
            type: Boolean,
            required: true
        },
    },

    data(): ComponentData {
        return {
            newBlockHeadersSubscription: null,
            updateStateInterval: null,
            providerData: null,
            ethToTon: null,
            isInitInProgress: false,
            isQRCodeShown: false,

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
        params(): ParamsNetwork {
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
        getStepInfoText1(): object {
            if (this.state.step === 1) {
                if (this.isFromTon) {
                    const url = PARAMS.tonTransferUrl
                        .replace('<BRIDGE_ADDRESS>', this.params.tonBridgeAddress)
                        .replace('<AMOUNT>', TonWeb.utils.toNano(this.amount).toString())
                        .replace('<TO_ADDRESS>', this.toAddress);

                    return {
                        isOnlyText: false,
                        send1: this.$t(`Bridge.networks.ton.transactionSend1`) as string,
                        amount: String(this.amount),
                        send2: this.$t(`Bridge.networks.ton.transactionSend2`) as string,
                        toAddress: this.params.tonBridgeAddress,
                        withComment: this.$t(`Bridge.networks.ton.transactionSendComment`) as string,
                        comment: 'swapTo#' + this.toAddress,
                        openWalletLabel: this.$t(`Bridge.networks.ton.openWallet`) as string,
                        openWalletUrl: url,
                        generateQRCode: this.isQRCodeShown ? '' : this.$t(`Bridge.networks.ton.generateQRCode`) as string,
                        scanQRCode: this.isQRCodeShown ? this.$t(`Bridge.networks.ton.scanQRCode`) as string : ''
                    }
                } else {
                    return {
                        isOnlyText: true,
                        text: this.state.fromCurrencySent ?
                            this.$t(`Bridge.networks.${this.pair}.transactionWait`) as string :
                            (this.$t(`Bridge.networks.${this.pair}.transactionSend`) as string)
                                .replace('<PROVIDER>', this.provider.title)
                    }
                }
            } else {
                const pair = this.isFromTon ? 'ton' : this.pair;
                return {
                    isOnlyText: true,
                    text: this.$t(`Bridge.networks.${pair}.transactionCompleted`) as string
                }
            }
        },
        getStepInfoText2(): string {
            if (this.isFromTon) {
                return '';
            }

            if (this.state.step === 2) {
                let blocksConfirmations = (this.providerData?.blockNumber || this.state.blockNumber) - this.state.blockNumber;
                blocksConfirmations = Math.max(Math.min(blocksConfirmations, this.params.blocksConfirmations), 0);

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
                const votesConfirmations = (this.state.votes?.length || 0) + '/' + (this.providerData?.oraclesTotal || 0);

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
                        (this.$t(`Bridge.getCoinsByProvider`) as string)
                            .replace('<TO_COIN>', this.toCoin)
                            .replace('<PROVIDER>', this.provider.title);

                } else {
                    return (this.$t(`Bridge.coinsSent`) as string)
                        .replace('<TO_COIN>', this.toCoin);
                }
            } else if (this.state.step > 4) {
                return (this.$t(`Bridge.coinsSent`) as string)
                    .replace('<TO_COIN>', this.toCoin);
            } else {
                const pair = this.isFromTon ? this.pair : 'ton';

                return (this.$t(`Bridge.getCoins`) as string)
                    .replace('<TO_COIN>', this.toCoin)
                    .replace('<TO_NETWORK>', this.$t(`Bridge.networks.${pair}.${this.netTypeName}.name`) as string);
            }
        }
    },

    watch: {
        'state.step': {
            immediate: true,
            handler(val): void {
                this.$emit('state-changed');
                this.$emit('transfer-in-progress', val > 0);
            }
        }
    },

    mounted(): void {
        this.updateState();
        this.updateStateInterval = setInterval(this.updateState, 5000);
        this.$emit('ready');
    },

    beforeDestroy(): void  {
        clearInterval(this.updateStateInterval as ReturnType<typeof setInterval>);
    },

    methods: {
        onCopyClick(e: MouseEvent): void {
            const target = e.target;

            let timeout1, timeout2;
            const triggerClass = (className) => {
                target.classList.remove(className);
                clearTimeout(timeout1);
                clearTimeout(timeout2);

                timeout1 = setTimeout(() => {
                    target.classList.add(className);
                }, 17);

                timeout2 = setTimeout(() => {
                    target.classList.remove(className);
                }, 500);
            }

            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                const value = '';
                navigator.clipboard.writeText(target.innerText).then(function() {
                    triggerClass('success');
                }, function() {
                    triggerClass('failure');
                });
            } else {
                triggerClass('failure');
            }
        },
        generateQRCode(): void {
            this.isQRCodeShown = true;

            const url = PARAMS.tonTransferUrl
                .replace('<BRIDGE_ADDRESS>', this.params.tonBridgeAddress)
                .replace('<AMOUNT>', TonWeb.utils.toNano(this.amount).toString())
                .replace('<TO_ADDRESS>', this.toAddress);

            const options = {
                text: url,
                width: 600,
                height: 600,
                logo: require("assets/pics/gem@large.png"),
                logoWidth: 142,
                logoHeight: 142,
                correctLevel: QRCode.CorrectLevel.L
            };
            new QRCode(this.$refs.qrcode, options);
        },
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

            this.isQRCodeShown = false;

            this.$emit('reset-state');
        },
        async loadState(processingState: State): Promise<void> {
            if (!processingState) {
                 return;
            }

            this.isInitInProgress = true;

            this.providerData = await this.initProvider();

            this.isInitInProgress = false;

            if (!this.providerData) {
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
                    this.state.swapId = this.getSwapTonToEthId(swap);
                    this.state.swapData = swap;
                    this.state.step = 3;
                }
            }

            if (this.state.step === 2 && !this.isFromTon) {
                const blockNumber = await this.provider.web3.eth.getBlockNumber();
                this.providerData!.blockNumber = blockNumber;

                console.log(this.providerData?.blockNumber, this.state.blockNumber);
                const blocksConfirmations = (this.providerData?.blockNumber || this.state.blockNumber) - this.state.blockNumber;

                if (blocksConfirmations > this.params.blocksConfirmations) {
                    const block = await this.provider.web3.eth.getBlock(this.state.blockNumber);

                    this.ethToTon!.blockTime = Number(block.timestamp);
                    this.ethToTon!.blockHash = block.hash;

                    this.state.queryId = this.getQueryId(this.ethToTon!).toString();
                    this.state.step = 3;
                }
            }

            if (this.state.step === 3) {
                this.state.votes = this.isFromTon ? await this.getEthVote(this.state.swapId) : await this.getTonVote(this.state.queryId);
                if (this.state.votes && this.state.votes!.length >= this.providerData!.oraclesTotal * 2 / 3) {
                    this.state.step = this.isFromTon ? 4 : 5;
                }
            }
        },
        getSwapTonToEthId(d: SwapData): string {
            let encodedParams;

            if (this.pair === 'eth') {
                encodedParams = this.provider.web3.eth.abi.encodeParameters(
                    ['int', 'address', 'uint256', 'int8', 'bytes32', 'bytes32', 'uint64'],
                    [0xDA7A, d.receiver, d.amount, d.tx.address_.workchain, d.tx.address_.address_hash, d.tx.tx_hash, d.tx.lt]
                )
            }

            if (this.pair === 'bsc') {
                encodedParams = this.provider.web3.eth.abi.encodeParameters(
                    ['int', 'address', 'address', 'uint256', 'int8', 'bytes32', 'bytes32', 'uint64'],
                    [0xDA7A, this.params.wTonAddress, d.receiver, d.amount, d.tx.address_.workchain, d.tx.address_.address_hash, d.tx.tx_hash, d.tx.lt]
                )
            }

            return Web3.utils.sha3(encodedParams) as string;
        },
        serializeEthToTon(ethToTon: EthToTon) {
            const bits = new TonWeb.boc.BitString(8 + 256 + 16 + 8 + 256 + 64);
            bits.writeUint(0, 8); // vote op
            bits.writeUint(new BN(ethToTon.transactionHash.substr(2), 16), 256);
            bits.writeInt(ethToTon.logIndex, 16);
            bits.writeUint(ethToTon.to.workchain, 8);
            bits.writeUint(new BN(ethToTon.to.address_hash, 16), 256);
            bits.writeUint(new BN(ethToTon.value), 64);
            return bits.array;
        },
        getQueryId(ethToTon: EthToTon): typeof BN {
            const MULTISIG_QUERY_TIMEOUT = 30 * 24 * 60 * 60; // 30 days
            const VERSION = 2;
            const timeout = ethToTon.blockTime + MULTISIG_QUERY_TIMEOUT + VERSION;
            const queryStr = ethToTon.blockHash + '_' + ethToTon.transactionHash + '_' + String(ethToTon.logIndex);

            const query_id = Web3.utils.sha3(getLegacyQueryString(queryStr))!.substr(2, 8); // get first 32 bit

            return new BN(timeout).mul(new BN(4294967296)).add(new BN(query_id, 16));
        },
        getFeeAmount(amount: typeof BN): string {
            const rest = new BN(amount).sub(this.providerData!.feeFlat);
            const percentFee = rest.mul(this.providerData!.feeFactor).div(this.providerData!.feeBase);
            return this.providerData!.feeFlat.add(percentFee)
        },
        makeAddress(address: string): string {
            if (!address.startsWith('0x')) throw new Error('Invalid address ' + address);
            let hex = address.substr(2);
            while (hex.length < 40) {
                hex = '0' + hex;
            }
            return '0x' + hex;
        },
        async getSwap(myAmount: number, myToAddress: string, myCreateTime: number): Promise<null | SwapData> {
            console.log('getTransactions', this.params.tonBridgeAddress, this.lt && this.hash ? 1 : (this.isRecover ? 200 : 40), this.lt || undefined, this.hash || undefined, undefined, this.lt && this.hash ? true : undefined);
            const transactions = await this.providerData!.tonweb.provider.getTransactions(this.params.tonBridgeAddress, this.lt && this.hash ? 1 : (this.isRecover ? 200 : 40), this.lt || undefined, this.hash || undefined, undefined, this.lt && this.hash ? true : undefined);
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

                    const event: SwapData = {
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

                    const myAmountNano = TonWeb.utils.toNano(myAmount);
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
        async getEthVote(voteId: string): Promise<null | VoteEth[]> {
            console.log('getEthVote ', voteId);

            const result = await this.providerData!.tonweb.provider.call(this.params.tonCollectorAddress, 'get_external_voting_data', [['num', voteId]]);
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

            const result = await this.providerData!.tonweb.provider.call(this.params.tonMultisigAddress, 'get_query_state', [['num', queryId]]);

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
            const count = a === -1 ? this.providerData!.oraclesTotal : b.toString(2).split('0').join('').length; // count of bits
            for (let i = 0; i < count; i++) {
                arr.push(1);
            }
            return arr;
        },
        onDoneClick(): void {
            this.resetState();
        },
        onCancelClick(): void {
            this.deleteState();
            this.resetState();
        },
        async checkProviderIsReady(): Promise<boolean> {
            try {
                if (!this.provider.isConnected) {
                    const error = (this.$t('Bridge.errors.providerIsDisconnected') as string)
                        .replace('<PROVIDER>', this.provider.title)
                    throw new Error(error);
                }

                if (!this.provider.myAddress) {
                    throw new Error(this.$t('Bridge.errors.cantGetAddress') as string);
                }

                if (this.provider.chainId !== this.params.chainId) {
                    const error = (this.$t('Bridge.errors.wrongProviderNetwork') as string)
                        .replace('<NETWORK>', this.$t(`Bridge.networks.${this.pair}.${this.netTypeName}.name`) as string)
                        .replace('<PROVIDER>', this.provider.title)
                    throw new Error(error);
                }

                if (!(new BN(await this.provider.web3.eth.getBalance(this.provider.myAddress)).gt(new BN('0')))) {
                    throw new Error(this.$t(`Bridge.networks.${this.pair}.errors.lowBalance`) as string);
                }
            } catch (e) {
                console.error(e.message);
                this.$nuxt.$emit('alert', {
                    title: this.$t('Bridge.errors.alertTitleError') as string,
                    message: e.message,
                    buttonLabel: this.$t('Bridge.errors.alertButtonClose') as string
                });
                return false;
            }

            return true;
        },
        async mint(): Promise<any> {
            const isProviderReady = await this.checkProviderIsReady();

            if (!isProviderReady) {
                return;
            }

            let receipt;
            try {
                let signatures = (this.state.votes! as VoteEth[]).map(v => {
                    return {
                        signer: v.publicKey,
                        signature: ethers.utils.joinSignature({r: v.r, s: v.s, v: v.v})
                    }
                })

                signatures = signatures.sort((a, b) => {
                    return new BN(a.signer.substr(2), 16).cmp(new BN(b.signer.substr(2), 16));
                });

                console.log('voteForMinting', JSON.stringify(this.state.swapData!), JSON.stringify(signatures));

                receipt = await this.providerData!.wtonContract.methods.voteForMinting(this.state.swapData!, signatures).send({from: this.provider.myAddress})
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
            const isProviderReady = await this.checkProviderIsReady();

            if (!isProviderReady) {
                return;
            }

            const fromAddress = this.provider.myAddress;
            const toAddress = this.toAddress;
            const amount = this.amount;

            const addressTon = new TonWeb.utils.Address(toAddress);
            const wc = addressTon.wc;
            const hashPart = TonWeb.utils.bytesToHex(addressTon.hashPart);
            const amountUnit = TonWeb.utils.toNano(amount).toNumber(); // TODO, possible overflow

            let receipt;

            try {
                receipt = await this.providerData!.wtonContract.methods.burn(amountUnit, {
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
        async initProvider(): Promise<ProviderData | null> {
            const isProviderReady = await this.checkProviderIsReady();

            if (!isProviderReady) {
                return null;
            }

            const wtonContract = new this.provider.web3.eth.Contract(WTON as AbiItem[], this.params.wTonAddress);
            const oraclesTotal = (await wtonContract.methods.getFullOracleSet().call()).length;

            if (!(oraclesTotal > 0)) {
                return null;
            }

            const tonweb = new TonWeb(new TonWeb.HttpProvider(this.params.tonCenterUrl));
            const bridgeData = (await tonweb.provider.call(this.params.tonBridgeAddress, 'get_bridge_data', [])).stack;

            if (bridgeData.length !== 8) {
                console.error('Invalid bridge data', bridgeData);
                return null;
            }

            const stateFlags = getNumber(bridgeData[0]);
            const totalLocked = getNumber(bridgeData[1]);
            const collectorWc = getNumber(bridgeData[2]);
            const collectorAddr = bridgeData[3][1]; // string
            const feeFlat = new BN(getNumber(bridgeData[4]));
            const feeNetwork = new BN(getNumber(bridgeData[5]));
            const feeFactor = new BN(getNumber(bridgeData[6]));
            const feeBase = new BN(getNumber(bridgeData[7]));

            const res: ProviderData = {
                blockNumber: 0,
                wtonContract,
                tonweb,
                oraclesTotal,
                feeFlat: feeFlat.add(feeNetwork),
                feeFactor,
                feeBase
            };

            return res;
        },
        async onTransferClick(): Promise<void> {
            if (this.isInitInProgress) {
                return;
            }

            this.isInitInProgress = true;

            if (!this.isInputsValid) {
                this.isInitInProgress = false;
                return;
            }

            if (!this.providerData) {
                this.providerData = await this.initProvider();

                if (!this.providerData) {
                    this.isInitInProgress = false;
                    return;
                }
            }

            if (!this.isFromTon) {
                const userErcBalance = parseFloat(TonWeb.utils.fromNano(await (this.providerData!.wtonContract.methods.balanceOf(this.provider.myAddress).call())));
                if (this.amount > userErcBalance) {
                    this.$emit('error', {
                        'input': 'amount',
                        'message': (this.$t('Bridge.errors.toncoinBalance') as string).replace('<BALANCE>', String(userErcBalance))
                    });
                    this.isInitInProgress = false;
                    return;
                }
            }

            this.isInitInProgress = false;

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
    &-cancel,
    &-info-text-openWallet {
        -webkit-appearance: none;
        background-color: #1D98DC;
        display: inline-block;
        border-radius: 25px;
        color: white;
        font-size: 15px;
        font-weight: 700;
        line-height: 19px;
        border: none;
        padding: 16px 35px 15px;
        white-space: nowrap;

        .isPointer &:hover,
        .isTouch &:active {
            background-color: #5fb8ea;
        }

        &[disabled] {
            pointer-events: none;
            background-color: #AAAAAA;
        }

        @media (max-width: 800px) {
            font-size: 14px;
            padding: 14px 32px 13px;
        }

        &.showLoader:after {
            content: '';
            position: absolute;
            transform: translate(8px, 3px);
            width: 12px;
            height: 12px;
            border: 3px solid #fff;
            border-left: 3px solid transparent;
            border-radius: 50%;
            animation: loading-animation-spin 2s infinite linear;

            @keyframes loading-animation-spin {
                to {
                    transform: translate(8px, 3px) rotate(1turn);
                }
            }
        }
    }

    &-cancel {
        margin-top: -10px;
        margin-bottom: 40px;
        background-color: white;
        color: #e53935;
        box-shadow: inset 0 0 0 2px #e53935;

        .isPointer &:hover,
        .isTouch &:active {
            background-color: rgba(#e53935, 0.1);
        }
    }

    &-getTonCoin,
    &-done {
        margin-top: 30px;
    }

    &-infoWrapper {
        text-align: left;
        width: fit-content;
        font-size: 17px;
        line-height: 25px;

        @media (max-width: 800px) {
            font-size: 15px;
            line-height: 23px;
        }

        @media (max-width: 400px) {
            font-size: 14px;
            line-height: 21px;
        }
    }

    &-infoLine {
        position: relative;
        margin-top: 28px;

        &:first-child {
            margin-top: 0;
        }

        @media (max-width: 550px) {
            padding-left: 28px;
            margin-top: 20px;
        }
    }

    &-info-icon {
        position: absolute;
        left: -28px;
        margin-top: 4px;
        width: 18px;
        height: 18px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;

        @media (max-width: 550px) {
            left: 0;
        }

        &.done {
            background-image: url('~assets/pics/progress/done.svg');
        }

        &.pending {
            background-image: url('~assets/pics/progress/loader.svg');
            animation: rotating 2s linear infinite;
        }

        &.none {
            background-image: url('~assets/pics/progress/dot.svg');
        }
    }

    &-info-text-send {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        text-align: left;
        line-height: 27px;

        @media (max-width: 800px) {
            line-height: 25px;
        }

        @media (max-width: 400px) {
            line-height: 23px;
        }
    }

    &-info-text-send-buttons {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        @media (max-width: 550px) {
            padding-right: 28px;
        }
    }

    &-info-text-openWallet {
        margin: 22px 0 20px;
    }

    &-info-text-copy,
    &-info-text-generateQRCode {
        color: #1D98DC;
        text-decoration: underline;
        -webkit-appearance: none;
        background-color: transparent;
        border: none;
        padding: 0;
        margin: 0;
        letter-spacing: -0.3px;

        .isPointer &:hover,
        .isTouch &:active {
            text-decoration: none;
        }
    }

    &-info-text-generateQRCode,
    &-info-text-scanQRCode {
        font-size: 15px;

        @media (max-width: 800px) {
            font-size: 14px;
        }

        @media (max-width: 400px) {
            font-size: 13px;
        }
    }

    &-info-text-scanQRCode {
        margin-top: -3px;
        color: #222222;
    }

    &-info-text-copy {
        position: relative;
        padding-left: 18px;
        word-break: break-word;

        &:before {
            content: '';
            position: absolute;
            left: -3px;
            display: inline-block;
            height: 20px;
            width: 20px;
            background-image: url('~assets/pics/copy.svg');
            background-repeat: no-repeat;
            background-size: contain;
            top: 1px;
        }

        &.success:after {
            content: 'Copied';
        }

        &.failure:after {
            background: #e53935;
            content: 'Failed';
        }

        &.success:after,
        &.failure:after {
            content: 'Copied';
            position: absolute;
            padding: 4px;
            font-size: 12px;
            color: white;
            background: #1D98DC;
            border-radius: 4px;
            top: -22px;
            left: 7px;
            white-space: nowrap;
            animation: fade-tooltip 0.45s linear both;

            @keyframes fade-tooltip {
                0% {
                    transform: translate(-50%, 0);
                    opacity: 0;
                }
                20% {
                    opacity: 1;
                }
                60% {
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -5px);
                    opacity: 0;
                }
            }
        }
    }

    &-info-text-QRCode {
        margin-top: 16px;
        width: 100%;
        height: 190px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 7px;

        /deep/ canvas {
            width: 100%;
            height: 100%;
            object-fit: contain;
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
