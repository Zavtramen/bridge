<template>
    <div class="ConnectWallet">
        <div class="ConnectWallet-connectedWrapper">
            <button
                class="ConnectWallet-connected"
                @click="onConnectClick">{{$t('Bridge.connectWallet')}}</button>

            <ul class="ConnectWallet-providersList" :class="{visible: isProvidersVisible}">
                <li
                    v-for="item in providersList"
                    :key="item"
                    @click="onProviderClick(item)">
                    <button :data-icon="item">{{$t(`Bridge.providers.${item}`)}}</button>
                </li>
            </ul>
        </div>

        <div
            class="ConnectWallet-connectedOverlay"
            @click="isProvidersVisible = false"
            :class="{visible: isProvidersVisible}"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Provider } from '~/utils/providers/provider';

const PROVIDERS = {
    'metamask': 'Metamask',
    'walletConnect': 'WalletConnect',
    'walletLink': 'WalletLink'
};

declare interface IComponentData {
    isProvidersVisible: boolean
}

export default Vue.extend({
    props: {
        params: {
            type: Object,
            required: true
        }
    },

    data(): IComponentData {
        return {
            isProvidersVisible: false
        }
    },

    computed: {
        providersList(): string[] {
            return Object.keys(PROVIDERS);
        },
    },

    methods: {
        onConnectClick(): void {
            this.isProvidersVisible = true;
        },
        async onProviderClick(providerName: string): Promise<void> {
            this.isProvidersVisible = false;

            const providerComponentName: string = PROVIDERS[providerName as keyof typeof PROVIDERS];
            const ProviderComponent = await import(`~/utils/providers/${providerName}/index`);

            try {
                const provider = new ProviderComponent[providerComponentName]() as Provider;

                const result = await provider.connect({
                    rpcEndpoint: this.params.rpcEndpoint,
                    chainId: this.params.chainId
                });

                if (!result) {
                    return;
                }

                this.$emit('wallet-connected', provider);
            } catch (e) {
                const message = this.$te(e.message) ? this.$t(e.message) : e.message;
                console.error(message);
                alert(message);
                return;
            }

        }
    }
})
</script>


<style lang="less" scoped>
@r: .ConnectWallet;

@{r} {
    &-connectedWrapper {
        margin-top: 20px;
        position: relative;
    }

    &-connectedOverlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;

        transition: all 0 ease-in-out;
        opacity: 0;
        visibility: hidden;

        &.visible {
            transition: opacity 0.15s ease-in-out;
            opacity: 1;
            visibility: inherit;
        }
    }

    &-connected {
        -webkit-appearance: none;
        background-color: #1d98dc;
        border-radius: 25px;
        color: white;
        font-size: 16px;
        line-height: 19px;
        border: none;
        padding: 15px 35px 14px;

        .isPointer &:hover,
        .isTouch &:active {
            background-color: #5fb8ea;
        }
    }

    &-providersList {
        background: #FFF;
        border-radius: 16px;
        box-shadow: 0px 8px 24px rgb(48 55 87 / 12%);
        box-sizing: border-box;
        color: #303757;
        font-size: 16px;
        line-height: 20px;
        list-style-type: none;
        margin: 0;
        padding: 18px 36px;
        position: absolute;
        left: 50%;
        margin-left: -125px;
        width: 250px;
        bottom: 70px;
        word-break: break-word;
        white-space: normal;
        text-align: left;
        z-index: 2;

        transition: all 0 ease-in-out;
        opacity: 0;
        visibility: hidden;

        &.visible {
            transition: opacity 0.15s ease-in-out;
            opacity: 1;
            visibility: inherit;
        }

        li {
            button {
                padding: 10px 0;
                color: #303757;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;

                .isPointer &:hover,
                .isTouch &:active {
                    color: #1d98dc;
                }

                &:before {
                    content: '';
                    position: relative;
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 32px;
                    height: 32px;
                    margin-right: 16px;
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
        }
    }

}
</style>
