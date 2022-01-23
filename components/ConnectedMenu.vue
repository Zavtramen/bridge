<template>
    <aside class="ConnectedMenu">
        <div class="ConnectedMenu-address" :data-icon="provider.name">{{ address }}</div>
        <ul class="ConnectedMenu-list">
            <li><nuxt-link :to="historyUrl">{{$t(`Bridge.transferHistory`)}}</nuxt-link></li>
            <li><button @click="onDisconnectClick" :disabled="disableDisconnect">{{$t(`Bridge.disconnectWallet`)}}</button></li>
        </ul>
    </aside>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        provider: {
            type: Object,
            required: true
        },
        isTestnet: {
            type: Boolean,
            default: false
        },
        disableDisconnect: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        address(): string {
            return this.provider.myAddress.slice(0, 6) + '…' + this.provider.myAddress.slice(-4);
        },
        historyUrl(): string {
            const urlVars = [];
            if (this.isTestnet) {
                urlVars.push('testnet=true');
            }
            if (this.provider.myAddress) {
                urlVars.push('toAddress=' + encodeURIComponent(this.provider.myAddress));
            }
            return this.localePath('/history' + (urlVars ? '?' + urlVars.join('&') : ''));
        }
    },

    methods: {
        onDisconnectClick(): void {
            this.provider.disconnect();
        }
    }
})
</script>


<style lang="less" scoped>
@r: .ConnectedMenu;

@{r} {
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 3;

    &-address {
        position: relative;
        color: #303757;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        width: fit-content;
        padding: 8px 12px 8px 8px;
        border-radius: 999px;
        background: white;
        border: 1px solid #aaa;

        .isPointer &:hover,
        .isTouch &:active {
            color: #1d98dc;
            border: 1px solid #1d98dc;
        }

        &:before {
            content: '';
            position: relative;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 32px;
            height: 32px;
            margin-right: 12px;
        }

        &[data-icon="metamask"]:before {
            background-image: url('~assets/pics/providers/metamask.svg');
        }

        &[data-icon="walletConnect"]:before {
            background-image: url('~assets/pics/providers/walletConnect.svg');
        }

        &[data-icon="walletLink"]:before {
            background-image: url('~assets/pics/providers/walletlink.svg');
        }
    }

    &:hover &-list {
        transition: opacity 0.15s ease-in-out;
        opacity: 1;
        visibility: inherit;
    }

    &-list {
        background: #FFF;
        border-radius: 16px;
        box-shadow: 0px 8px 24px rgb(48 55 87 / 12%);
        box-sizing: border-box;
        color: #303757;
        font-size: 16px;
        line-height: 20px;
        list-style-type: none;
        margin: 0;
        padding: 12px 24px;
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        white-space: nowrap;

        transition: all 0 ease-in-out;
        opacity: 0;
        visibility: hidden;

        &:before {
            content: '';
            position: absolute;
            top: -8px;
            width: 100%;
            left: 0;
            height: 8px;
        }

        li {
            button, a {
                display: inline-block;
                width: fit-content;
                padding: 10px 0;
                color: #303757;
                font-weight: 700;
                cursor: pointer;

                &[disabled] {
                    pointer-events: none;
                    color: gray;
                }


                .isPointer &:hover,
                .isTouch &:active {
                    color: #1d98dc;
                }
            }
        }
    }
}
</style>
