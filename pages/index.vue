<template>
    <div class="Bridge">
        <Header
            :is-testnet="isTestnet"
            :show-menu="isConnected && walletsPopupState === 'closed'"
            :provider="provider"
            :disable-disconnect="isTransferInProgress"></Header>

        <main class="Bridge-content">
            <div class="Bridge-img" :class="{isFromTon}">
                <div class="Bridge-imgAspect"></div>
            </div>
            <div class="Bridge-form">
                <div class="Bridge-switchers" :class="{isFromTon}" :key="isFromTon">
                    <div class="Bridge-switcher" :class="{disabled: isPairsBlocked}">
                        <div class="Bridge-switcherTitle">
                            <span>{{$t(`Bridge.networks.ton.${netTypeName}.nameSwitcher`)}}<em></em></span>
                            <ul class="Bridge-switcherList" :class="{ left: isFromTon, right: !isFromTon}">
                                <li
                                    v-for="(item, index) in fromPairs"
                                    :key="item"><button :disabled="index === 0" @click="onPairClick(true, item)">{{$t(`Bridge.networks.${item}.${netTypeName}.name`)}}</button></li>
                            </ul>
                        </div>
                        <div class="Bridge-switcherAnno">{{$t(`Bridge.networks.ton.${netTypeName}.coin`)}}</div>
                    </div>

                    <button
                        class="Bridge-switcher-arrow"
                        :disabled="isPairsBlocked"
                        @click="toggleFromTon"></button>

                    <div class="Bridge-switcher" :class="{disabled: isPairsBlocked}">
                        <div class="Bridge-switcherTitle">
                            <span>{{$t(`Bridge.networks.${pair}.${netTypeName}.nameSwitcher`)}}<em></em></span>
                            <ul class="Bridge-switcherList" :class="{ left: !isFromTon, right: isFromTon}">
                                <li
                                    v-for="(item, index) in toPairs"
                                    :key="item"><button :disabled="index === 0" @click="onPairClick(item === 'ton', item === 'ton' ? pair : item)">{{$t(`Bridge.networks.${item}.${netTypeName}.name`)}}</button></li>
                            </ul>
                        </div>
                        <div class="Bridge-switcherAnno"><a :href="pairNetworkCoinUrl" target="_blank">{{$t(`Bridge.networks.${pair}.${netTypeName}.coin`)}}</a></div>
                    </div>
                </div>

                <CustomInput
                    key="token"
                    :disabled="true"
                    :label="$t('Bridge.sendToken')"
                    type="text"
                    :dropdown="[{ label: 'Toncoin', value: 'ton' }, { label: 'Litecoin', value: 'lth' }, { label: 'Bitcoin', value: 'bth' }]"
                    v-model="token"
                ></CustomInput>

                <CustomInput
                    key="amountInner"
                    :disabled="isInputsBlocked"
                    :label="$t('Bridge.amountOfTon')"
                    type="number"
                    :error="errors.amount"
                    @changed="errors.amount = ''"
                    @blur="checkInputs"
                    v-model="amountInner"
                ></CustomInput>

                <CustomInput
                    key="toAddress"
                    :disabled="isInputsBlocked"
                    :label="$t(`Bridge.addressInputLabel`)"
                    type="text"
                    :error="errors.toAddress"
                    @changed="errors.toAddress = ''"
                    @blur="checkInputs"
                    v-model="toAddress"
                ></CustomInput>

                <div class="Bridge-willReceive" v-show="(!isTransferInProgress || !isConnected || bridgeProcessorIsLoading) && willReceive" :class="{isFromTon}">{{willReceive}}</div>

                <div class="Bridge-bridgeWrapper">
                    <button
                         v-if="!isConnected"
                        class="Bridge-connect"
                        @click="walletsPopupState = 'opened'">{{$t('Bridge.connectWallet')}}</button>

                    <div class="Bridge-bridgeLoader" v-if="isConnected && bridgeProcessorIsLoading"></div>

                    <BridgeProcessor
                        v-if="isConnected"
                        ref="bridgeProcessor"
                        :key="pair"
                        :is-testnet="isTestnet"
                        :is-recover="isRecover"
                        :lt="lt"
                        :hash="hash"
                        :is-from-ton="isFromTon"
                        :pair="pair"
                        :amount="amount"
                        :to-address="toAddress"
                        :provider="provider"
                        :is-inputs-valid="isInputsValid"
                        @transfer-in-progress="onTransferInProgress"
                        @state-changed="getPairGasFee__debounced"
                        @reset-state="resetState"
                        @save-state="saveState"
                        @delete-state="deleteState"
                        @ready="onBridgeProcessorReady"
                        @error="onBridgeTransferError"
                    ></BridgeProcessor>
                </div>

                <div class="Bridge-pairFee" v-show="(!isTransferInProgress || !isConnected || bridgeProcessorIsLoading)">{{pairFee}}</div>
                <div class="Bridge-bridgeFee" v-show="(!isTransferInProgress || !isConnected || bridgeProcessorIsLoading)">{{bridgeFee}}</div>

                <WalletsPopup
                    v-if="walletsPopupState !== 'closed'"
                    :params="params"
                    :uncancellable="walletsPopupState === 'opened-uncancellable'"
                    @wallet-connected="onWalletConnected"
                    @cancel="walletsPopupState = 'closed'"
                ></WalletsPopup>
            </div>
        </main>

        <Footer></Footer>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TonWeb from 'tonweb';
import Web3 from 'web3';
import lodashDebounce from 'lodash.debounce';
import { supportsLocalStorage } from '~/utils/helpers';
import { PARAMS } from '~/utils/constants';
import CustomInput from '~/components/CustomInput.vue';
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
import { Provider } from '~/utils/providers/provider';

const PAIRS = ['eth', 'bsc'];

type ComponentData = {
    getPairGasFee__debounced: () => void,
    gasPrice: number,

    isTestnet: boolean,
    isRecover: boolean,
    lt: number,
    hash: string,

    isFromTon: boolean,
    pair: string,
    token: string,
    amountInner: string,
    toAddress: string,
    provider: Provider | null,

    isTransferInProgress: boolean,
    isConnected: boolean,
    walletsPopupState: string,
    bridgeProcessorIsLoading: boolean,
    errors: {
        amount: string,
        toAddress: string
    }
}

export default Vue.extend({
    name: 'Bridge',

    components: {
        'BridgeProcessor': () => import('~/components/BridgeProcessor.vue'),
        'WalletsPopup': () => import('~/components/WalletsPopup.vue'),
        CustomInput,
        Header,
        Footer
    },

    head(): object {
        return {
            title: this.$t(`Bridge.networks.${this.pair}.pageTitle`) as string
        }
    },

    data(): ComponentData {
        return {
            getPairGasFee__debounced: () => {},
            gasPrice: 0,

            isTestnet: false,
            isRecover: false,
            lt: 0,
            hash: '',

            isFromTon: true,
            pair: 'eth',
            token: 'ton',
            amountInner: '',
            toAddress: '',
            provider: null,

            isTransferInProgress: false,
            isConnected: false,
            walletsPopupState: 'closed',
            bridgeProcessorIsLoading: false,
            errors: {
                amount: '',
                toAddress: ''
            }
        }
    },

    computed: {
        isInputsValid(): boolean {
            return !this.errors.amount && !this.errors.toAddress;
        },
        netTypeName(): string {
            return this.isTestnet ? 'test' : 'main';
        },
        params(): ParamsNetwork {
            const pairParams = PARAMS.networks[this.pair];
            return pairParams[this.netTypeName as keyof typeof pairParams];
        },
        pairNetworkCoinUrl(): string {
            const url = this.params.explorerUrl as string;
            const address = this.params.wTonAddress as string;
            return url.replace('<ADDRESS>', address) as string;
        },
        willReceive(): string {
            if (this.bridgeFeeAmount) {
                const coin = this.$t(`Bridge.networks.${this.isFromTon ? this.pair : 'ton'}.${this.netTypeName}.coin`);
                return (this.$t('Bridge.willReceive') as string)
                    .replace('<FEE>', String(this.amount - this.bridgeFeeAmount))
                    .replace('<COIN>', coin);
            } else {
                return '';
            }
        },
        pairFee(): string {
            const n = this.gasPrice ? this.gasPrice / this.params.defaultGwei : 1;
            const fee = this.isFromTon ? (this.params.coinsPerGweiTo * n) : (this.params.coinsPerGweiFrom * n);

            return (this.$t(`Bridge.networks.${this.pair}.gasFee`) as string).replace('<FEE>', fee.toFixed(4));
        },
        amount: {
            get(): number {
                const amount = parseFloat(this.amountInner);
                return !amount || isNaN(amount) ? 0 : amount;
            },

            set(value: number): void {
                this.amountInner = isNaN(value) ? '' : String(value);
            }
        },
        bridgeFeeAmount(): number {
            if (!isNaN(this.amount) && this.amount >= 10) {
                return 5 + (this.amount - 5) * (0.25 / 100)
            } else {
                return 0
            }
        },
        bridgeFee(): string {
            if (this.bridgeFeeAmount) {
                return (this.$t('Bridge.bridgeFeeAbove10') as string).replace('<FEE>', String(this.bridgeFeeAmount));
            } else {
                return this.$t('Bridge.bridgeFeeBelow10') as string;
            }
        },
        fromPairs(): string[] {
            return [
                'ton',
                ...PAIRS
            ];
        },
        toPairs(): string[] {
            return [this.pair, ...PAIRS.filter(i => i !== this.pair), 'ton'];
        },
        isPairsBlocked(): boolean {
            return this.isTransferInProgress/* || this.isConnected*/;
        },
        isInputsBlocked(): boolean {
            return this.isTransferInProgress;
        }
    },

    watch: {
        isFromTon(newVal: boolean, oldVal: boolean): void {
            this.getPairGasFee__debounced();

            if (newVal !== oldVal) {
                this.checkInputs();
            }
        },
        async pair(newVal: string, oldVal: string): Promise<void> {
            this.getPairGasFee__debounced();

            if (newVal !== oldVal) {
                this.checkInputs();
            }

            if (newVal !== oldVal && this.isConnected && this.provider) {
                const isChanged = await this.provider.switchChain(this.params.chainId);
                if (!isChanged) {
                    this.pair = oldVal;
                }
            }
        }
    },

    created(): void {
        this.getPairGasFee__debounced = lodashDebounce(this.getPairGasFee, 100);

        if (this.$route.query.testnet) {
            this.isTestnet = (this.$route.query.testnet as string).toLowerCase() === 'true';
        }
        if (this.$route.query.recover || this.$route.query.recovery) {
            const isRecover = ((this.$route.query.recover || '') as string).toLowerCase() === 'true';
            const isRecovery = ((this.$route.query.recovery || '') as string).toLowerCase() === 'true';
            this.isRecover = isRecover || isRecovery;
        }
        if (this.$route.query.lt) {
            const lt = parseInt(this.$route.query.lt, 10);
            this.lt = !lt || isNaN(lt) ? 0 : lt;
        }
        if (this.$route.query.hash) {
            this.hash = this.$route.query.hash as string;
        }
        if (this.$route.query.amount) {
            const amount = parseFloat(TonWeb.utils.fromNano(this.$route.query.amount));
            this.amount = !amount || isNaN(amount) ? 0 : amount;
        }
        if (this.$route.query.toAddress) {
            this.toAddress = this.$route.query.toAddress as string;
        }
        if (this.$route.query.fromNetwork && this.$route.query.toNetwork) {
            const fromNetwork = this.$route.query.fromNetwork.toLowerCase();
            const toNetwork = this.$route.query.toNetwork.toLowerCase();

            if (fromNetwork === 'ton' && PAIRS.includes(toNetwork))  {
                this.isFromTon = true;
                this.pair = toNetwork;
            }

            if (toNetwork === 'ton' && PAIRS.includes(fromNetwork))  {
                this.isFromTon = false;
                this.pair = fromNetwork;
            }
        }
    },

    mounted(): void {
        this.getPairGasFee__debounced();
        this.loadStateBridge();
        this.checkInputs();
    },

    methods: {
        checkInputs(): void {
            this.errors.amount = '';
            this.errors.toAddress = '';

            if (isNaN(this.amount)) {
                this.errors.amount = this.$t('Bridge.errors.notValidAmount') as string;
            }
            if (this.amount < 10) {
                this.errors.amount = this.$t('Bridge.errors.amountBelow10') as string;
            }

            if (this.toAddress.toLowerCase() === this.params.wTonAddress.toLowerCase() ||
                this.toAddress.toLowerCase() === this.params.tonBridgeAddress.toLowerCase()) {
                this.errors.toAddress = this.$t('Bridge.errors.amountBelow10') as string;
            }

            if (this.isFromTon) {
                if (!Web3.utils.isAddress(this.toAddress)) {
                    this.errors.toAddress = this.$t(`Bridge.networks.${this.pair}.errors.invalidAddress`) as string;
                }
            } else {
                if (!TonWeb.utils.Address.isValid(this.toAddress)) {
                    this.errors.toAddress = this.$t(`Bridge.networks.ton.errors.invalidAddress`) as string;
                }
            }
        },
        onPairClick(switchDirection: boolean, toPair: string): void {
            if (this.isPairsBlocked) {
                return
            }

            if (switchDirection) {
                this.isFromTon = !this.isFromTon;
            }
            this.pair = toPair;
        },
        resetState(): void {
            this.isRecover = false;
            this.lt = 0;
            this.hash = '';
            this.amountInner = '';
            this.toAddress = '';
        },
        loadStateBridge(): void {
            if (!supportsLocalStorage) {
                return;
            }

            const raw = localStorage.getItem('bridgeState');

            if (raw) {
                let state: any;
                try {
                    state = JSON.parse(raw);
                } catch (e) {
                    return;
                }

                this.amount = state.amount;
                this.toAddress = state.toAddress;
                this.pair = state.pair;

                this.isTransferInProgress = true;
            }
        },
        loadStateProcessor(): void {
            if (!supportsLocalStorage) {
                return;
            }

            const raw = localStorage.getItem('bridgeState');

            if (raw) {
                let state: any;
                try {
                    state = JSON.parse(raw);
                } catch (e) {
                    return;
                }

                this.$refs.bridgeProcessor.loadState(state.processingState);
            }
        },
        saveState(processingState: any): void {
            if (!supportsLocalStorage) {
                return;
            }

            const state = {
                amount: this.amount,
                toAddress: this.toAddress,
                pair: this.pair,
                processingState: processingState
            }

            localStorage.setItem('bridgeState', JSON.stringify(state));
        },
        deleteState(): void {
            if (!supportsLocalStorage) {
                return;
            }

            localStorage.removeItem('bridgeState');
        },
        onTransferInProgress(isActive: boolean): void {
            this.isTransferInProgress = isActive;
            this.checkInputs();
        },
        toggleFromTon(): void {
            if (this.isPairsBlocked) {
                return
            }
            this.isFromTon = !this.isFromTon;
        },
        async getPairGasFee(): Promise<void> {
            let data;
            let gasPrice = 0;

            try {
                const response = await fetch(this.params.getGasUrl, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-store, max-age=0'
                    }
                });

                if (!response.ok) {
                    throw new Error(`An error has occured: ${response.status}`);
                }

                data = await response.json();
            } catch (e) {
                this.gasPrice = 0;
                return;
            }

            if (this.pair === 'eth') {
                gasPrice = parseFloat(data.average) / 10;
            }

            if (this.pair === 'bsc') {
                gasPrice = parseFloat(data.result.SafeGasPrice);
            }

            this.gasPrice = gasPrice > 0 ? gasPrice : this.params.defaultGwei;
        },
        onWalletConnected(provider: Provider): void {
            this.provider = provider;
            this.bridgeProcessorIsLoading = !this.$refs.bridgeProcessor;
            this.isConnected = true;
            this.walletsPopupState = 'closed';

            this.provider.on('disconnect', () => {
                if (this.isTransferInProgress) {
                    this.walletsPopupState = 'opened-uncancellable';
                } else {
                    this.provider = null;
                    this.isConnected = false;
                    this.bridgeProcessorIsLoading = false;
                }
            });
        },
        onBridgeProcessorReady(): void {
            this.loadStateProcessor();
            this.bridgeProcessorIsLoading = false;
        },
        onBridgeTransferError(params: {input: string, message: string}): void {
            if (params.input === 'amount') {
                this.errors.amount = params.message;
            }
            if (params.input === 'toAddress') {
                this.errors.toAddress = params.message;
            }
        }
    }
})
</script>


<style lang="less" scoped>
@r: .Bridge;

@{r} {
    position: relative;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 100%;

    &-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 117px 40px 50px;

        @media (max-width: 800px) {
            padding: 100px 16px 50px;
        }
    }

    &-img {
        max-width: 464px;
        width: 100%;
        transition: transform 0.15s ease-out;
        transform: scale(-1, 1);
        margin-bottom: 58px;

        @media (max-width: 800px) {
            margin-bottom: 44px;
        }

        @media (max-width: 400px) {
            margin-bottom: 32px;
        }

        &.isFromTon {
            transform: none;
        }

        &Aspect {
            height: 0;
            width: 100%;
            padding-top: 70.17%;
            background-image: url('~assets/pics/swap.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
    }


    &-form {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 500px;
        width: 100%;
    }

    &-switchers {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        margin-bottom: 55px;

        &.isFromTon {
            flex-direction: row;
        }

        @media (max-width: 800px) {
            margin-bottom: 44px;
        }

        @media (max-width: 400px) {
            margin-bottom: 32px;
        }
    }

    &-switcher {
        position: relative;
        flex: 1 0;

        &.disabled {
            @{r}-switcherTitle {
                pointer-events: none;
            }
        }

        &Title {
            position: relative;
            font-size: 25px;
            font-weight: bold;
            letter-spacing: -0.1px;
            cursor: pointer;
            white-space: nowrap;
            transition: 0.15s color;

            @media (max-width: 800px) {
                font-size: 20px;
            }

            @media (max-width: 400px) {
                font-size: 16px;
            }

            span {
                white-space: pre;
            }

            em {
                display: inline-block;
                position: absolute;
                width: 20px;
                height: 20px;
                background-image: url('~assets/pics/dropdown.svg'), url('~assets/pics/dropdown-active.svg');
                background-size: contain, 0 0;
                background-repeat: no-repeat;
                background-position: center;
                transition: 0.15s transform;
                margin-left: 8px;
                margin-top: 9px;

                @media (max-width: 800px) {
                    margin-left: 6px;
                    margin-top: 7px;
                    width: 16px;
                    height: 16px;
                }

                @media (max-width: 400px) {
                    margin-left: 4px;
                    margin-top: 6px;
                    width: 12px;
                    height: 12px;
                }
            }
        }

        &Title:hover {
            color: #1D98DC;

            em {
                transform: rotate(180deg);
                background-image: url('~assets/pics/dropdown-active.svg');
            }
        }

        &Title:hover &List {
            transition: opacity 0.15s ease-in-out;
            opacity: 1;
            visibility: inherit;
        }

        &Anno {
            margin-top: 6px;
            height: 20px;
            font-size: 15px;
            color: #757575;

            a {
                display: inline-block;
                text-decoration: underline;
                color: #757575;

                .isPointer &:hover,
                .isTouch &:active {
                    text-decoration: none;
                }

                &:after {
                    content: '';
                    position: absolute;
                    display: inline-block;
                    height: 20px;
                    width: 20px;
                    background-image: url('~assets/pics/link.svg');
                    background-repeat: no-repeat;
                    background-size: contain;
                    vertical-align: -3px;

                    @media (max-width: 800px) {
                        display: none
                    };
                }
            }

            @media (max-width: 800px) {
                font-size: 12px;
            }
        }

        &List {
            background: #FFF;
            border-radius: 16px;
            box-shadow: 0px 8px 24px rgba(48, 55, 87, 0.12);
            box-sizing: border-box;
            list-style-type: none;
            margin: 0;
            padding: 10px 56px 10px 25px;
            position: absolute;
            top: calc(100% + 36px);
            width: 250px;
            word-break: break-word;
            white-space: normal;
            z-index: 1;
            cursor: default;
            text-align: left;

            transition: all 0 ease-in-out;
            opacity: 0;
            visibility: hidden;

            &.left {
                left: 0;
            }

            &.right {
                right: 0;
            }

            @media (max-width: 800px) {
                padding: 6px 32px 6px 16px;
                top: calc(100% + 32px);
                width: 200px;
            }

            @media (max-width: 400px) {
                top: calc(100% + 28px);
            }

            &:before {
                content: '';
                position: absolute;
                top: -36px;
                width: 100%;
                left: 0;
                height: 36px;

                @media (max-width: 800px) {
                    top: -32px;
                    height: 32px;
                }
            }


            li {
                position: relative;

                &:first-child {
                    pointer-events: none;

                    &:after {
                        content: '';
                        position: absolute;
                        display: inline-block;
                        right: -31px;
                        top: 14px;
                        width: 16px;
                        height: 17px;
                        background-image: url('~assets/pics/check.svg');
                        background-repeat: no-repeat;
                        background-size: contain;

                        @media (max-width: 800px) {
                            right: -20px;
                            top: 11px;
                        }
                    }
                }

                button {
                    padding: 12px 0 11px;
                    color: #303757;
                    font-size: 16px;
                    line-height: 22px;
                    font-weight: 700;
                    cursor: pointer;

                    .isPointer &:hover,
                    .isTouch &:active {
                        color: #1d98dc;
                    }

                    @media (max-width: 800px) {
                        padding: 10px 0 9px;
                        font-size: 14px;
                        line-height: 20px;
                    }
                }
            }
        }
    }

    &-switcher-arrow {
        cursor: pointer;
        background-image: url('~assets/pics/arrow.svg'), url('~assets/pics/arrow-disabled.svg');
        background-size: contain, 0 0;
        background-repeat: no-repeat;
        background-position: center;
        width: 34px;
        height: 34px;
        margin-left: 16px;
        margin-right: 16px;
        margin-bottom: 3px;

        &[disabled] {
            cursor: default;
            background-image: url('~assets/pics/arrow-disabled.svg');
        }

        @media (max-width: 400px) {
            width: 24px;
            height: 24px;
            margin-left: 8px;
            margin-right: 8px;
            margin-bottom: 3px;
        }
    }

    &-willReceive {
        margin-top: -10px;
        font-size: 15px;
        color: #858585;

        @media (max-width: 800px) {
            font-size: 14px;
        }

        @media (max-width: 400px) {
            font-size: 13px;
        }

        &:not(.isFromTon):after {
            content: '';
            display: inline-block;
            background-image: url('~assets/pics/crystal.svg');
            background-size: contain, 0 0;
            background-repeat: no-repeat;
            background-position: center;
            width: 20px;
            height: 20px;
            vertical-align: -4px;
            margin-left: 4px;
        }
    }

    &-bridgeWrapper {
        margin-top: 20px;
        position: relative;
    }

    &-connect {
        -webkit-appearance: none;
        background-color: #1d98dc;
        border-radius: 25px;
        font-weight: 700;
        color: white;
        font-size: 15px;
        line-height: 19px;
        border: none;
        padding: 16px 35px 15px;

        .isPointer &:hover,
        .isTouch &:active {
            background-color: #5fb8ea;
        }

        @media (max-width: 800px) {
            font-size: 14px;
            padding: 14px 32px 13px;
        }
    }

    &-bridgeLoader {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 800px) {
            height: 46px;
        }

        &:after {
            content: '';
            display: block;
            width: 24px;
            height: 24px;
            border: 3px solid #1d98dc;
            border-right-color: white;
            border-radius: 50%;
            animation: loading-animation-spin 1500ms infinite linear;

            @keyframes loading-animation-spin {
                to {
                    transform: rotate(1turn);
                }
            }
        }
    }

    &-pairFee,
    &-bridgeFee  {
        color: #AAAAAA;
        font-size: 14px;
        line-height: 20 / 14;
        letter-spacing: -0.1px;

        @media (max-width: 800px) {
            font-size: 13px;
        }

        @media (max-width: 400px) {
            font-size: 12px;
        }
    }

    &-pairFee {
        margin-top: 20px;
    }

    &-bridgeFee {
        margin-bottom: 20px;
    }

}
</style>
