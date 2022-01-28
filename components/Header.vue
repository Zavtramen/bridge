<template>
    <header class="Header" :class="{ isScrolled }">
        <div class="Header-testnet" v-if="isTestnet">{{ $t(`Bridge.testnetMessage`) }}</div>
        <div class="Header-wrapper">
            <component
                :is="!hasLogoLink ? 'div' : 'NuxtLink'"
                :to="localePath('/')"
                class="Header-logo"
                :class="{ hasLogoLink }">
                <span class="Header-logoIcon"></span>
                <span class="Header-logoLabel">{{ $t(`Bridge.logoLabel`) }}</span>
            </component>
            <div class="Header-menu">
                <template v-if="showMenu">
                    <nuxt-link :to="historyUrl" class="Header-menuHistory">{{$t(`Bridge.transferHistory`)}}</nuxt-link>
                    <div class="Header-menuWrapper">
                        <div class="Header-menuAddress" :data-icon="provider.name"><span>{{ address }}</span></div>
                        <ul class="Header-menuList">
                            <li data-id="address"><span>{{ address }}</span></li>
                            <li data-id="history"><nuxt-link :to="historyUrl">{{$t(`Bridge.transferHistory`)}}</nuxt-link></li>
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
        }
    },

    data(): ComponentData {
        return {
            isScrolled: window.pageYOffset > 0
        }
    },

    computed: {
        hasLogoLink(): boolean {
            return this.$route.path !== '/';
        },
        address(): string {
            if (!this.provider) {
                return '';
            }
            return this.provider.myAddress.slice(0, 6) + '…' + this.provider.myAddress.slice(-4);
        },
        historyUrl(): string {
            if (!this.provider) {
                return '';
            }

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

    created(): void {
        window.addEventListener('scroll', this.onScroll);
    },

    beforeDestroy(): void {
        window.removeEventListener('scroll', this.onScroll);
    },

    methods: {
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
    z-index: 2;

    &.isScrolled &-wrapper {
        transform: translateY(-10px);
        border-bottom: 1px solid #ccc;

        @media (max-width: 560px) {
            transform: translateY(-10px);
        }
    }

    &-testnet {
        position: relative;
        background: #e53935;
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
        transition: 0.25s transform, 0.25s border;
        border-bottom: 1px solid transparent;
        background: white;

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
            color: #303757;
            display: inline-block;
            font-size: 18px;
            transition: 0.15s color;

            // @media (max-width: 560px) {
            //     display: none;
            // }

            @media (max-width: 560px) {
                font-size: 14px;
            }
        }

        &.hasLogoLink &Label {
            color: #1d98dc;
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
            color: #303757;
            font-size: 18px;
            margin-right: 25px;
            display: inline-block;

            .isPointer &:hover,
            .isTouch &:active {
                color: #1d98dc;
            }

            @media (max-width: 800px) {
                display: none;
            }
        }

        &Address {
            position: relative;
            color: #303757;
            cursor: pointer;
            display: flex;
            align-items: center;
            width: fit-content;
            font-weight: 700;

            .isPointer &:hover,
            .isTouch &:active {
                color: #1d98dc;
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
            transition: opacity 0.15s ease-in-out;
            opacity: 1;
            visibility: inherit;
        }

        &List {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0px 8px 24px rgba(48, 55, 87, 0.12);
            box-sizing: border-box;
            color: #303757;
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
                        color: #F72B50;

                        .isPointer &:hover,
                        .isTouch &:active {
                            color: #F72B50;
                        }
                    }
                }

                button, a {
                    display: inline-block;
                    width: fit-content;
                    padding: 10px 0;
                    color: #303757;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 16px;

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

}
</style>
