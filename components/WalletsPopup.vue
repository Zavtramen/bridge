<template>
    <transition name="WalletsPopupTransition" appear>
        <aside class="WalletsPopup" :class="{ isLoading }">
            <div class="WalletsPopup-overlay" @click="close"></div>

            <div class="WalletsPopup-panel">
                <ul>
                    <li
                        v-for="item in providersList"
                        :key="item"
                        @click="onProviderClick(item)">
                        <button
                            :data-icon="item"
                            :disabled="isLoading"
                            :class="{ showLoader: isLoading && loadingProviderName === item}">{{$t(`Bridge.providers.${item}`)}}<em></em></button>
                    </li>
                </ul>
                <button class="WalletsPopup-panelClose" v-if="!uncancellable" @click="close"></button>
            </div>
        </aside>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { Provider } from '~/utils/providers/provider';

const PROVIDERS = {
    'metamask': 'Metamask',
    'walletConnect': 'WalletConnect',
    'walletLink': 'WalletLink'
};

type ComponentData = {
    isLoading: boolean,
    loadingProviderName: string
}


export default Vue.extend({
    props: {
        params: {
            type: Object,
            required: true
        },
        uncancellable: {
            type: Boolean,
            default: false
        }
    },

    data(): ComponentData {
        return {
            isLoading: false,
            loadingProviderName: ''
        }
    },

    computed: {
        providersList(): string[] {
            return Object.keys(PROVIDERS);
        },
    },

    created(): void {
        document.addEventListener('keydown', this.onKeyDown);
    },

    beforeDestroy(): void {
        document.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
        onKeyDown(e: KeyboardEvent): void {
            if (e.keyCode === 27) {
                this.close();
            }
        },
        close(): void {
            if (this.uncancellable) return;
            if (this.isLoading) return;
            this.$emit('cancel');
        },
        async onProviderClick(providerName: string): Promise<void> {
            if (this.isLoading) return;

            this.isLoading = true;
            this.loadingProviderName = providerName;

            const providerComponentName: string = PROVIDERS[providerName as keyof typeof PROVIDERS];
            const ProviderComponent = await import(`~/utils/providers/${providerName}/index`);

            try {
                const provider = new ProviderComponent[providerComponentName]() as Provider;

                const result = await provider.connect({
                    rpcEndpoint: this.params.rpcEndpoint,
                    chainId: this.params.chainId
                });

                this.isLoading = false;

                if (!result) {
                    return;
                }

                this.$emit('wallet-connected', provider);
            } catch (e) {
                const message = this.$te(e.message) ? this.$t(e.message) : e.message;
                console.error(message);
                alert(message);
                this.isLoading = false;
                return;
            }
        }
    }
})
</script>


<style lang="less" scoped>
@r: .WalletsPopup;

@{r} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: @z-wallet-popup;

    &-panel {
        position: relative;
        background: @c-background;
        border-radius: 20px;
        box-shadow: 0px 8px 24px @c-panel-shadow;
        box-sizing: border-box;
        padding: 53px 16px 24px 16px;
        width: 260px;

        ul {
            list-style-type: none;
            margin: 0;
            word-break: break-word;
            white-space: normal;
            text-align: left;
        }

        li + li {
            margin-top: 10px;
        }

        li {
            button {
                position: relative;
                padding: 0 16px;
                color: @c-text-light;
                font-size: 15px;
                line-height: 56px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                border: 1px solid @c-provider-border;
                background: @c-provider-background;
                border-radius: 16px;

                &[disabled] {
                    pointer-events: none;
                }

                .isPointer &:hover,
                .isTouch &:active {
                    color: @c-primary;
                }

                em {
                    content: '';
                    position: relative;
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 24px;
                    height: 24px;
                }

                &[data-icon="metamask"] em {
                    background-image: url('~assets/pics/providers/metamask.svg');
                }

                &[data-icon="walletConnect"] em {
                    background-image: url('~assets/pics/providers/walletConnect.svg');
                }

                &[data-icon="walletLink"] em {
                    background-image: url('~assets/pics/providers/walletlink.svg');
                }

                &.showLoader:after {
                    content: '';
                    position: absolute;
                    right: 50px;
                    margin-top: 1px;
                    width: 12px;
                    height: 12px;
                    border: 3px solid @c-primary;
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
        }

        &Close {
            position: absolute;
            right: 16px;
            top: 16px;
            background-image: url('~assets/pics/close.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 24px;
            height: 24px;
        }
    }

    &-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: @c-overlay;
    }

    &Transition-enter,
    &Transition-leave-to {
        opacity: 0;
    }
    &Transition-enter-active,
    &Transition-leave-active, {
        transition: @d-modal opacity;
    }
    &Transition-enter-to,
    &Transition-leave, {
        opacity: 1;
    }
}
</style>
