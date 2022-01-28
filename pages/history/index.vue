<template>
    <div class="History">
        <div class="History-grid">
            <template v-for="item in transferList">
                <span>{{ item.dateTime }}</span>
                <span>{{ item.amount }} TON</span>
                <span>{{ item.address }}</span>
                <span class="completed" v-if="item.status === 'completed'" title="completed"></span>
                <span class="pending" v-if="item.status === 'pending'" title="pending"></span>
                <button class="mint" v-if="item.status === 'mint'">{{$t(`Bridge.getToncoin`)}}</button>
            </template>
        </div>

    </div>
</template>

<script lang="ts">
import Vue from 'vue';

type ComponentData = {
    isTestnet: boolean,
    toAddress: string
}

type TransferItem = {
    dateTime: string,
    amount: number,
    address: string,
    status: string
    // TODO state for minting ...
}

export default Vue.extend({
    name: 'History',

    head(): object {
        return {
            title: this.$t(`Bridge.historyPageTitle`) as string
        }
    },

    data(): ComponentData {
        return {
            isTestnet: false,
            toAddress: ''
        }
    },

    computed: {
        transferList(): Array<TransferItem> {
            return [
                {
                    dateTime: '09.01.2022 08:30',
                    amount: 357,
                    address: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    status: 'pending'
                },
                {
                    dateTime: '09.01.2022 08:11',
                    amount: 48,
                    address: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    status: 'mint'
                },
                {
                    dateTime: '08.01.2022 16:01',
                    amount: 15,
                    address: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    status: 'completed'
                },
                {
                    dateTime: '07.01.2022 13:56',
                    amount: 100,
                    address: 'EQB899nFaitiwZjLgQrfmzk5EG-TXsza3b0HTga6U6F4fl1s',
                    status: 'completed'
                },
            ]
        }
    },

    created(): void {
        if (this.$route.query.testnet) {
            this.isTestnet = (this.$route.query.testnet as string).toLowerCase() === 'true';
        }
        if (this.$route.query.toAddress) {
            this.toAddress = this.$route.query.toAddress as string;
        }
    },

    mounted(): void {
        console.log(this.isTestnet, this.toAddress);
    }
})
</script>


<style lang="less" scoped>
@r: .History;

@{r} {
    height: 100%;

    &-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 2fr 1fr;

        span,
        button {
            padding: 16px 4px;

            &.completed {
                display: inline-block;
                margin-top: 8px;
                transform: rotate(45deg);
                height: 14px;
                width: 7px;
                border-bottom: 2px solid #1d98dc;
                border-right: 2px solid #1d98dc;
                margin: 16px 16px 0;
                padding: 0;
            }

            &.mint {
                display: inline-block;
                -webkit-appearance: none;
                background-color: #1d98dc;
                border-radius: 25px;
                color: white;
                font-size: 16px;
                line-height: 19px;
                border: none;
                padding: 8px 16px 8px;
                margin: 8px 16px 0;
                height: 34px;
                width: fit-content;
                white-space: nowrap;

                .isPointer &:hover,
                .isTouch &:active {
                    background-color: #5fb8ea;
                }
            }

            &.pending {
                display: inline-block;
                width: 16px;
                height: 16px;
                padding: 0;
                margin: 16px 16px 0;
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
    }
}
</style>
