<template>
    <header class="Header" :class="{ isScrolled }">
        <div class="Header-testnet" v-if="isTestnet">{{ $t(`Bridge.testnetMessage`) }}</div>
        <div class="Header-wrapper">
            <component
                :is="isHistoryShown ? 'NuxtLink' : 'div'"
                :to="parentUrl"
                class="Header-logo"
                :class="{ isHistoryShown }">
                <span class="Header-logoIcon"></span>
                <span class="Header-logoLabel">{{ $t(`Bridge.logoLabel`) }}</span>
            </component>
            <div class="Header-menu">
                <template v-if="showMenu">
                    <nuxt-link :to="historyUrl" class="Header-menuHistory" v-if="historyUrl && !isHistoryShown">{{$t(`Bridge.transferHistory`)}}</nuxt-link>
                    <div class="Header-menuWrapper">
                        <div class="Header-menuAddress" :data-icon="provider.name"><span>{{ address }}</span></div>
                        <ul class="Header-menuList">
                            <li data-id="address"><span>{{ address }}</span></li>
                            <li data-id="history"><nuxt-link :to="historyUrl" v-if="historyUrl && !isHistoryShown">{{$t(`Bridge.transferHistory`)}}</nuxt-link></li>
                            <li data-id="disconnect"><button @click="onDisconnectClick" :disabled="disableDisconnect">{{$t(`Bridge.disconnectWallet`)}}</button></li>
                        </ul>
                    </div>
                </template>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import Vue from 'vue';
import { PARAMS } from '~/utils/constants';

type ComponentData = {
    isScrolled: boolean
}

export default Vue.extend({
    props: {
        isTestnet: {
            type: Boolean,
            default: false
        },
        showMenu: {
            type: Boolean,
            required: true
        },
        provider: {
            type: Object
        },
        disableDisconnect: {
            type: Boolean,
            default: false
        },
        isHistoryShown: {
            type: Boolean,
            default: false
        }
    },

    data(): ComponentData {
        return {
            isScrolled: window.pageYOffset > 0
        }
    },

    computed: {
        address(): string {
            if (!this.provider) {
                return '';
            }
            return this.provider.myAddress.slice(0, 6) + '…' + this.provider.myAddress.slice(-4);
        },
        parentUrl(): string {
            const {historyAddress, historyNetwork, ...query} = this.$nuxt.$route.query;
            return this.generateUrlWithQuery(query);
        },
        historyUrl(): string {
            if (!this.provider || !this.provider.myAddress) {
                return '';
            }

            let network = '';
            Object.keys(PARAMS.networks).forEach((netKey: string) => {
                const net = PARAMS.networks[netKey as keyof typeof PARAMS.networks];
                Object.keys(net).forEach((subnetKey: string) => {
                    const subnet = net[subnetKey as keyof typeof net];
                    if (subnet.chainId === this.provider.chainId) {
                        network = netKey;
                    }
                });
            });

            const query = {
                ...this.$nuxt.$route.query,
                historyAddress: this.provider.myAddress,
                historyNetwork: network
            };
            return this.generateUrlWithQuery(query);
        }
    },

    created(): void {
        window.addEventListener('scroll', this.onScroll);
    },

    beforeDestroy(): void {
        window.removeEventListener('scroll', this.onScroll);
    },

    methods: {
        generateUrlWithQuery(query: any): string {
            const urlVars: string[] = Object.keys(query).map((key: string) => {
                return key + '=' + encodeURIComponent(query[key]);
            });

            return this.localePath('/' + (urlVars ? '?' + urlVars.join('&') : ''));
        },
        onScroll(): void {
            this.isScrolled = window.pageYOffset > 0;
        },
        close(): void {
            this.$emit('close');
        },
        onDisconnectClick(): void {
            this.provider.disconnect();
        }
    }
})
</script>


<style lang="less" scoped>
@r: .Header;

@{r} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: @z-header;

    &.isScrolled &-wrapper {
        transform: translateY(-10px);
        border-bottom: 1px solid @c-outline;

        @media (max-width: 560px) {
            transform: translateY(-10px);
        }
    }

    &-testnet {
        position: relative;
        background: @c-error;
        padding: 10px 16px;
        z-index: 1;

        text-align: center;
        width: 100%;
        color: white;

        @media (max-width: 560px) {
            padding: 8px 16px;
            font-size: 14px;
            line-height: 18px;
        }
    }

    &-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 44px 10px;
        transition: @d-header-collapse transform, @d-header-collapse border;
        border-bottom: 1px solid transparent;
        background: @c-background;

        @media (max-width: 560px) {
            padding: 20px 24px 10px;
        }
    }

    &-logo {
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        // width: 250px;

        // @media (max-width: 800px) {
        //     width: 160px;
        // }

        // @media (max-width: 560px) {
        //     width: 40px;
        // }


        &Icon {
            display: inline-block;
            background-image: url('~assets/pics/logo.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 32px;
            height: 32px;

            @media (max-width: 560px) {
                width: 20px;
                height: 20px;
            }
        }

        &Label {
            margin-left: 12px;
            color: @c-text-light;
            display: inline-block;
            font-size: 18px;
            transition: @d-hover color;

            // @media (max-width: 560px) {
            //     display: none;
            // }

            @media (max-width: 560px) {
                font-size: 14px;
            }
        }
    }

    &-menu {
        position: relative;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        // width: 250px;

        // @media (max-width: 800px) {
        //     width: 160px;
        // }

        // @media (max-width: 560px) {
        //     width: 40px;
        // }

        &History {
            position: relative;
            color: @c-text-light;
            font-size: 18px;
            margin-right: 25px;
            display: inline-block;

            .isPointer &:hover,
            .isTouch &:active {
                color: @c-primary;
            }

            @media (max-width: 800px) {
                display: none;
            }
        }

        &Address {
            position: relative;
            color: @c-text-light;
            cursor: pointer;
            display: flex;
            align-items: center;
            width: fit-content;
            font-weight: 700;

            .isPointer &:hover,
            .isTouch &:active {
                color: @c-primary;
            }

            span {
                display: inline-block;
                margin-left: 10px;
                font-size: 15px;

                @media (max-width: 560px) {
                    // display: none;
                    font-size: 13px;
                }
            }

            &:before {
                content: '';
                position: relative;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                width: 20px;
                height: 20px;
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

        &Wrapper:hover &List {
            transition: opacity @d-hover ease-in-out;
            opacity: 1;
            visibility: inherit;
        }

        &List {
            background: @c-background;
            border-radius: 16px;
            box-shadow: 0px 8px 24px @c-panel-shadow;
            box-sizing: border-box;
            color: @c-text-light;
            font-size: 16px;
            line-height: 20px;
            list-style-type: none;
            margin: 0;
            padding: 2px 46px;
            position: absolute;
            right: -9px;
            top: calc(100% + 13px);
            white-space: nowrap;

            transition: all 0 ease-in-out;
            opacity: 0;
            visibility: hidden;

            @media (max-width: 800px) {
                padding: 2px 24px;
            }

            &:before {
                content: '';
                position: absolute;
                top: -18px;
                left: 0;
                right: 0;
                height: 18px;
            }

            li {

                &[data-id="address"] {
                    display: none;

                    // span {
                    //     display: inline-block;
                    //     padding: 10px 0 2px;
                    //     color: #303757;
                    //     font-weight: 700;
                    //     font-size: 11px;
                    //     color: #757575;
                    // }

                    // @media (max-width: 560px) {
                    //     display: list-item;
                    // }
                }

                &[data-id="history"] {
                    display: none;

                    @media (max-width: 800px) {
                        display: list-item;
                    }
                }

                &[data-id="disconnect"] {
                    button {
                        color: @c-error;
                    }
                }

                button, a {
                    display: inline-block;
                    width: fit-content;
                    padding: 10px 0;
                    color: @c-text-light;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 16px;

                    &[disabled] {
                        pointer-events: none;
                        color: @c-text-secondary;
                    }

                    .isPointer &:hover,
                    .isTouch &:active {
                        color: @c-primary;
                    }
                }
            }
        }
    }

}
</style>
