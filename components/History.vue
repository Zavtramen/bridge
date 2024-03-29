<template>
    <transition name="HistoryTransition" appear>
        <aside class="History">
            <div class="History-content">
                <div class="History-header">
                    <h2>{{$t(`Bridge.history.recentHistory`)}}</h2>
                    <div class="History-headerAddress"><a :href="explorerUrl" target="_blank">{{ address }}</a></div>
                    <div class="History-headerAddressShort"><a :href="explorerUrl" target="_blank">{{ addressShort }}</a></div>
                </div>
                <table class="History-grid">
                    <thead>
                        <tr>
                            <th>{{$t(`Bridge.history.age`)}}</th>
                            <th>{{$t(`Bridge.history.amountFrom`)}}</th>
                            <th>{{$t(`Bridge.history.amountTo`)}}</th>
                            <th>{{$t(`Bridge.history.fee`)}}</th>
                            <th>{{$t(`Bridge.history.status`)}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in dataRendered">
                            <td>{{ item.date }}<br/>{{ item.time }}</td>
                            <td>{{ item.amountFrom }}<br/><a :href="item.addressFromUrl" target="_blank">{{ item.addressFrom }}</a>&nbsp;({{ item.networkFrom }})</td>
                            <td>{{ item.amountTo }}<br/><a :href="item.addressToUrl" target="_blank">{{ item.addressTo }}</a>&nbsp;({{ item.networkTo }})</td>
                            <td>{{ item.gasAmount }}&nbsp;{{ item.gasCurrency }}<br/>{{ item.bridgeFeeAmount }}&nbsp;{{ item.bridgeFeeCoin }}</td>
                            <td>
                                <span class="completed" v-if="item.status === 'completed'">{{ item.statusLabel }}</span>
                                <span class="pending" v-if="item.status === 'pending'">{{ item.statusLabel }}</span>
                                <button
                                    class="mint"
                                    :class="{blocked: transactionInProgress > -1, showLoader: transactionInProgress === index}"
                                    v-if="item.status === 'mint'"
                                    @click="mint(index)">{{ item.statusLabel }}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="History-list">
                    <div class="History-listRow" v-for="(item, index)  in dataRendered">
                        <div class="History-listTitle">{{$t(`Bridge.history.age`)}}</div>
                        <div class="History-listValue">{{ item.date }} {{ item.time }}</div>

                        <div class="History-listTitle">{{$t(`Bridge.history.amountFrom`)}}</div>
                        <div class="History-listValue">{{ item.amountFrom }}<br/><a :href="item.addressFromUrl" target="_blank">{{ item.addressFrom }}</a>&nbsp;({{ item.networkFrom }})</div>

                        <div class="History-listTitle">{{$t(`Bridge.history.amountTo`)}}</div>
                        <div class="History-listValue">{{ item.amountTo }}<br/><a :href="item.addressToUrl" target="_blank">{{ item.addressTo }}</a>&nbsp;({{ item.networkTo }})</div>

                        <div class="History-listTitle">{{$t(`Bridge.history.fee`)}}</div>
                        <div class="History-listValue">{{ item.gasAmount }}&nbsp;{{ item.gasCurrency }} / {{ item.bridgeFeeAmount }}&nbsp;{{ item.bridgeFeeCoin }}</div>

                        <div class="History-listValue">
                            <span class="completed" v-if="item.status === 'completed'">{{ item.statusLabel }}</span>
                            <span class="pending" v-if="item.status === 'pending'">{{ item.statusLabel }}</span>
                            <button
                                class="mint"
                                :class="{blocked: transactionInProgress > -1, showLoader: transactionInProgress === index}"
                                v-if="item.status === 'mint'"
                                @click="mint(index)">{{ item.statusLabel }}</button>
                        </div>
                    </div>
                </div>
                <div class="History-loader" v-if="isLoading"></div>
                <div class="History-noTransfers" v-if="!dataRendered.length && !isLoading">{{$t(`Bridge.history.notFound`)}}</div>

                <BridgeProcessor
                    v-show="false"
                    v-if="bridge.isActive && provider"
                    ref="bridgeProcessor"
                    :key="bridge.pair"
                    :is-testnet="isTestnet"
                    :is-recover="false"
                    :lt="bridge.lt"
                    :hash="bridge.hash"
                    :is-from-ton="true"
                    :pair="bridge.pair"
                    :amount="bridge.amount"
                    :to-address="bridge.toAddress"
                    :provider="provider"
                    :is-inputs-valid="true"
                    @ready="onBridgeProcessorReady"
                    @ready-to-mint="onReadyToMint"
                    @mint-failed="onMintFailed"
                    @minted-successfully="onMintedSuccessfully"
                ></BridgeProcessor>
            </div>
        </aside>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { PARAMS } from '~/utils/constants';
import TonWeb from 'tonweb';

const BN = TonWeb.utils.BN;
const fromNano = TonWeb.utils.fromNano;

type ComponentData = {
    data: Array<TransferItem>,
    isLoading: boolean,
    transactionInProgress: number,
    bridge: {
        isActive: boolean,
        lt: number,
        hash: string,
        pair: string,
        amount: typeof BN,
        toAddress: string
    }
}

type TransferItem = {
    dateTime: string, //unix timestamp
    isFromTon: boolean,
    amount: string, // nano
    addressTon: string,
    addressEvm: string
    network: string,
    gasAmount: string, // exact float value (FE have no idea about wei/gwei for used network)
    bridgeFeeAmount: string, // nano
    status: string, // 'pending', 'mint', 'completed'
    oraclesConfirmed: number,
    oraclesTotal: number,
    lt: number,
    hash: string
}

type TransferItemRendered = {
    date: string,
    time: string,
    amountFrom: string,
    addressFrom: string,
    addressFromUrl: string;
    networkFrom: string,
    amountTo: string,
    addressTo: string,
    addressToUrl: string,
    networkTo: string,
    gasAmount: string,
    gasCurrency: string,
    bridgeFeeAmount: string,
    bridgeFeeCoin: string,
    status: string,
    statusLabel: string
}

export default Vue.extend({
    components: {
        'BridgeProcessor': () => import('~/components/BridgeProcessor.vue'),
    },
    props: {
        isTestnet: {
            type: Boolean,
            default: false
        },
        address: {
            type: String,
            required: true
        },
        network: {
            type: String,
            required: true
        },
        provider: {
            type: Object,
            default: null
        }
    },

    head(): object {
        return {
            title: this.$t(`Bridge.history.title`) as string
        }
    },

    data(): ComponentData {
        return {
            data: [],
            isLoading: false,
            transactionInProgress: -1,
            bridge: {
                isActive: false,
                lt: 0,
                hash: '',
                pair: '',
                amount: new BN(0),
                toAddress: ''
            }
        }
    },

    computed: {
        addressShort(): string {
            return this.address.slice(0, 10) + '…' + this.address.slice(-10);
        },
        netTypeName(): string {
            return this.isTestnet ? 'test' : 'main';
        },
        explorerUrl(): string {
            const tmp = PARAMS.networks[this.network];
            const paramsForNetwork = tmp[this.netTypeName as keyof typeof tmp];

            if (paramsForNetwork) {
                const url = paramsForNetwork.explorerUrl as string;
                return url.replace('<ADDRESS>', this.address) as string;
            } else {
                return '';
            }
        },
        dataRendered(): Array<TransferItemRendered> {
            return this.data.map((item: TransferItem): TransferItemRendered => {
                const tmp = PARAMS.networks[this.network];
                const paramsForNetwork = tmp[this.netTypeName as keyof typeof tmp];

                const date = new Date(parseInt(item.dateTime, 10) * 1000);
                const addressTon = item.addressTon.slice(0, 10) + '…' + item.addressTon.slice(-10);
                const addressEvm = item.addressEvm.slice(0, 10) + '…' + item.addressEvm.slice(-10);

                const amountFromCoin = this.$t(`Bridge.networks.${item.isFromTon ? 'ton' : item.network}.${this.netTypeName}.coin`) as string;
                const addressFrom = item.isFromTon ? addressTon : addressEvm;
                const addressFromUrl = item.isFromTon ?
                    PARAMS.tonExplorerUrl[this.netTypeName as keyof typeof PARAMS.tonExplorerUrl].replace('<ADDRESS>', item.addressTon) :
                    paramsForNetwork.explorerUrl?.replace('<ADDRESS>', item.addressEvm);
                const networkFrom = this.$t(`Bridge.networks.${item.isFromTon ? 'ton' : item.network}.${this.netTypeName}.nameShort`) as string;

                const amountTo = fromNano((new BN(item.amount)).sub(new BN(item.bridgeFeeAmount)));
                const amountToCoin = this.$t(`Bridge.networks.${item.isFromTon ? item.network : 'ton'}.${this.netTypeName}.coin`) as string;
                const addressTo = item.isFromTon ? addressEvm : addressTon;
                const addressToUrl = item.isFromTon ?
                    paramsForNetwork.explorerUrl?.replace('<ADDRESS>', item.addressEvm) :
                    PARAMS.tonExplorerUrl[this.netTypeName as keyof typeof PARAMS.tonExplorerUrl].replace('<ADDRESS>', item.addressTon);
                const networkTo = this.$t(`Bridge.networks.${item.isFromTon ? item.network : 'ton'}.${this.netTypeName}.nameShort`) as string;

                const bridgeFeeCoin = this.$t(`Bridge.networks.${item.isFromTon ? 'ton' : item.network}.${this.netTypeName}.coinShort`) as string;
                let statusLabel = '';

                if (item.status === 'completed') {
                    statusLabel = this.$t(`Bridge.history.completed`) as string;
                }

                if (item.status === 'pending') {
                    statusLabel = (this.$t(`Bridge.history.oracles`) as string)
                        .replace('<COUNT>', `${String(item.oraclesConfirmed)}/${String(item.oraclesTotal)}`);
                }

                if (item.status === 'mint') {
                    statusLabel = this.provider ?
                        this.$t(`Bridge.history.getToncoin`) as string :
                        this.$t(`Bridge.history.connect`) as string;
                }

                return {
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString(),
                    amountFrom: `${fromNano(item.amount)} ${amountFromCoin}`,
                    addressFrom,
                    addressFromUrl,
                    networkFrom,
                    amountTo: `${amountTo} ${amountToCoin}`,
                    addressTo,
                    addressToUrl,
                    networkTo,
                    gasAmount: item.gasAmount,
                    gasCurrency: this.$t(`Bridge.networks.${item.network}.currency`) as string,
                    bridgeFeeAmount: fromNano(item.bridgeFeeAmount),
                    bridgeFeeCoin,
                    status: item.status,
                    statusLabel
                }
            });
        },
        testData(): Array<TransferItem> {
            let list = [
                {
                    dateTime: '1643706947',
                    amount: '90000000000',
                    isFromTon: false,
                    addressTon: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    addressEvm: '0xA55dA913b57494560DC685b51B9a7206b8EEb291',
                    network: 'bsc',
                    gasAmount: '0.0044',
                    bridgeFeeAmount: '5255000000',
                    status: 'completed',
                    oraclesConfirmed: 6,
                    oraclesTotal: 6,
                    lt: 0,
                    hash: ''
                },
                {
                    dateTime: '1643705947',
                    amount: '2000000000000',
                    isFromTon: true,
                    addressTon: 'EZjLgQrfmzk5EQB899nFaitiwG-TXs0HTga6U6F4fl1sza3b',
                    addressEvm: '0xebf42867bcc9edab168365543f4f8f5335972607',
                    network: 'eth',
                    gasAmount: '0.00044',
                    bridgeFeeAmount: '5100000000',
                    status: 'completed',
                    oraclesConfirmed: 6,
                    oraclesTotal: 6,
                    lt: 24870118000001,
                    hash: '724489be66b315c3c9f3c0a507f2441223c1bc05c2ca46bbe35ba4a5d0e30d08'
                },
                {
                    dateTime: '1643503347',
                    amount: '2000000000000',
                    isFromTon: true,
                    addressTon: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    addressEvm: '0xebf42867bcc9edab168365543f4f8f5335972607',
                    network: 'eth',
                    gasAmount: '0.0034',
                    bridgeFeeAmount: '5123000000',
                    status: 'completed',
                    oraclesConfirmed: 6,
                    oraclesTotal: 6,
                    lt: 24869357000001,
                    hash: 'cc611db35b842fe010ab04d714d6ea365dff3ee4c7c24dd2676f0220f9feb8bc'
                }
            ];

            list = [...list, ...list];
            list = [...list, ...list];
            list = [...list, ...list];
            list = [...list, ...list];
            list = [...list, ...list];

            list[0] = {...list[0]};
            list[1] = {...list[1]};
            list[2] = {...list[2]};
            list[0].status = 'pending';
            list[0].oraclesConfirmed = 4;
            list[1].status = 'mint';
            list[2].status = 'mint';

            return list;
        }
    },

    created(): void {
    },

    mounted(): void {
        this.loadData();
    },

    methods: {
        async loadData(): Promise<void> {
            this.isLoading = true;

            try {
                // const response = await fetch(TRANSFER_URL, {
                //     method: 'GET',
                //     headers: {
                //         'Cache-Control': 'no-store, max-age=0'
                //     }
                // });
                // if (!response.ok) {
                //     throw new Error(`An error has occured: ${response.status}`);
                // }
                // this.data = await response.json();

                const response: Array<TransferItem> = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(this.testData);
                    }, 1500);
                });
                this.data = response;
            } catch (e) {}

            this.isLoading = false;
        },
        mint(index: number): void {
            if (this.transactionInProgress > -1) {
                return;
            }

            if (!this.data[index].lt || !this.data[index].hash) {
                return;
            }

            if (!this.provider) {
                this.$emit('open-wallets-popup');
                return;
            }

            this.transactionInProgress = index;

            const transactionData = this.data[index];
            this.bridge.isActive = true;
            this.bridge.lt = transactionData.lt;
            this.bridge.hash = transactionData.hash;
            this.bridge.pair = transactionData.network;
            this.bridge.amount = new BN(transactionData.amount);
            this.bridge.toAddress = transactionData.addressEvm;
        },
        async onBridgeProcessorReady(): Promise<void> {
            //prepare for minting, collect oracles votes and so on
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignoree
            const bridgeProcessorinitState = await this.$refs.bridgeProcessor!.loadState({ step: 1 });

            if (!bridgeProcessorinitState) {
                this.bridge.isActive = false;
                this.transactionInProgress = -1;
            }
        },
        onReadyToMint(): void {
            console.log('ready to mint');

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.$refs.bridgeProcessor!.mint();
        },
        onMintFailed(): void {
            console.log('mint failed');
            this.bridge.isActive = false;
            this.transactionInProgress = -1;
        },
        onMintedSuccessfully(): void {
            console.log('minted successfully');
            this.bridge.isActive = false;
            this.transactionInProgress = -1;
            this.loadData(); // reload data to update transaction states
        }
    }
})
</script>


<style lang="less" scoped>
@r: .History;

@{r} {
    position: relative;
    z-index: @z-history;
    background: @c-background;
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;

    &-content {
        padding: 120px 44px;
        max-width: 936px;
        box-sizing: content-box;
        width: 100%;

        @media (max-width: 850px) {
            padding: 100px 16px 40px;
        }
    }

    &-header {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 30px;

        @media (max-width: 850px) {
            display: block;
        }

        h2 {
            font-weight: bold;
            font-size: 25px;
            line-height: 34px;
            color: @c-text-light;
            margin-right: 20px;

            @media (max-width: 850px) {
                font-size: 20px;
                line-height: 30px;
                margin-right: 0;
            }
        }

        &Address,
        &AddressShort {
            height: 20px;
            font-size: 15px;
            color: @c-label;

            a {
                display: inline-block;
                text-decoration: underline;
                color: @c-label;

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
                }
            }
        }

        @media (max-width: 850px) {
            &Address {
                display: none;
            }
        }

        @media (min-width: 851px) {
            &AddressShort {
                display: none;
            }
        }
    }

    &-grid {
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100%;
        font-weight: 600;
        font-size: 15px;
        line-height: 20px;
        color: @c-text;

        tr {
            border-bottom: 1px solid rgba(#888, 0.2);
        }

        th {
            font-weight: bold;
            font-size: 15px;
            line-height: 20px;
            letter-spacing: -0.3px;
            color: @c-text-light;
            padding: 20px 15px;
            text-align: left;
            vertical-align: top;
        }

        td {
            padding: 10px 15px;
            text-align: left;
            vertical-align: top;
        }
    }

    &-list {
        width: 100%;
        font-weight: 600;
        font-size: 14px;
        line-height: 18px;
        color: @c-text;

        &Row {
            border-top: 1px solid rgba(#888, 0.2);
            padding: 12px 0 2px;
        }

        &Title {
            font-weight: bold;
            color: @c-text-light;
            letter-spacing: -0.2px;
            margin-bottom: 2px;
        }

        &Value {
            color: @c-text;
            margin-bottom: 16px;
        }
    }

    &-grid,
    &-list {
        a {
            color: @c-text-light;
            text-decoration: underline;

            .isPointer &:hover,
            .isTouch &:active {
                text-decoration: none;
            }
        }

        span,
        button {
            &.mint {
                position: relative;
                display: inline-block;
                -webkit-appearance: none;
                background-color: @c-primary;
                border-radius: 25px;
                font-weight: 700;
                color: white;
                font-size: 15px;
                line-height: 19px;
                border: none;
                padding: 8px 16px 8px;
                white-space: nowrap;

                &.blocked {
                    pointer-events: none;
                }

                &.showLoader {
                    color: transparent;

                    &:after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        margin-left: -6px;
                        margin-top: -6px;
                        width: 12px;
                        height: 12px;
                        border: 3px solid white;
                        border-left: 3px solid transparent;
                        border-radius: 50%;
                        animation: loading-animation-spin @d-loader infinite linear;

                        @keyframes loading-animation-spin {
                            to {
                                transform: rotate(1turn);
                            }
                        }
                    }
                }

                .isPointer &:hover,
                .isTouch &:active {
                    background-color: rgba(@c-primary, 0.85);
                }

                @media (max-width: 850px) {
                    font-size: 14px;
                }
            }

            &.pending,
            &.completed {
                display: inline-block;
                padding: 4px 10px 6px;
                background: rgba(@c-text-light, 7%);
                border-radius: 8px;
            }

            &.pending {
                color: @c-primary;
                background: rgba(@c-primary, 7%);
            }
        }
    }

    @media (max-width: 850px) {
        &-grid {
            display: none;
        }
    }

    @media (min-width: 851px) {
        &-list {
            display: none;
        }
    }


    &-loader {
        position: relative;
        display: block;
        left: 50%;
        margin-left: -18px;
        top: 40px;
        width: 36px;
        height: 36px;
        border: 5px solid @c-primary;
        border-right-color: white;
        border-radius: 50%;
        animation: loading-animation-spin 1500ms infinite linear;

        @keyframes loading-animation-spin {
            to {
                transform: rotate(1turn);
            }
        }
    }

    &-noTransfers {
        text-align: center;
        color: @c-text-light;
        font-weight: bold;
        line-height: 1.25;
        font-size: 25px;
        margin-top: 40px;

        @media (max-width: 850px) {
            font-size: 20px;
            line-height: 30px;
            margin-right: 0;
            text-align: left;
        }
    }


    &Transition-enter,
    &Transition-leave-to {
        opacity: 0;
    }
    &Transition-enter-active {
        transition: @d-modal opacity;
    }
    &Transition-enter-to,
    &Transition-leave, {
        opacity: 1;
    }
}
</style>
