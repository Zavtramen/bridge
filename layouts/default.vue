<template>
    <div class="LayoutDefault">
        <header class="LayoutDefault-header" v-if="isTestnet">{{$t('Bridge.testnet')}}</header>

        <main class="LayoutDefault-content">
            <Nuxt/>
        </main>

        <footer class="LayoutDefault-footer">
            v2.03,
            <a href="https://github.com/ton-blockchain/bridge" target="_blank">{{$t('Bridge.sourceCode')}}</a>,
            <a href="https://ton.org/how-it-works/bridge" target="_blank">{{$t('Bridge.howItWorks')}}</a>,
            <a href="https://github.com/newton-blockchain/TIPs/issues/24" target="_blank">{{$t('Bridge.documentation')}}</a>.
        </footer>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { primaryInput } from 'detect-it';

type ComponentData = {
    isTestnet: boolean
}

export default Vue.extend({
    name: 'LayoutDefault',

    head(): object {
        return {
            htmlAttrs: {
              lang: 'en',
              translate: 'no'
            },
            meta: [
                {
                    hid: 'google',
                    name: 'google',
                    content: 'notranslate'
                }
            ],
        }
    },

    data(): ComponentData {
        return {
            isTestnet: false
        }
    },

    created(): void {
        if (this.$route.query.testnet) {
            this.isTestnet = (this.$route.query.testnet as string).toLowerCase() === 'true';
        }
    },

    mounted() {
        // for active/hovers on touch/mouse devices
        document.documentElement.classList.add(primaryInput === 'touch' ? 'isTouch' : 'isPointer');
    }
});
</script>

<style lang="less">
    * {
        box-sizing: border-box;
    }

    html,
    body,
    #__nuxt,
    #__layout,
    .LayoutDefault {
        width: 100%;
        height: 100%;
    }

    body {
        font-family: 'Helvetica', 'Arial', 'sans-serif';
        -webkit-text-size-adjust: 100%;
    }

    a, a:hover, a:after, a:active, a:focus {
        color: #1d98dc;
        text-decoration: none;
        word-break: break-all;
    }

    .LayoutDefault {
        position: relative;
        min-height: 100%;
        display: grid;
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 100%;

        &-header {
            color: white;
            width: 100%;
            padding: 8px 0;
            text-align: center;
            background: red;
            font-weight: bold;
        }

        &-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 40px 100px;

            @media (max-width: 800px) {
                padding: 48px 16px 50px;
            }
        }

        &-footer {
            text-align: center;
            font-size: 12px;
            color: #666666;
            padding-bottom: 10px;

            a {
                color: #666666;
                text-decoration: underline;

                .isPointer &:hover,
                .isTouch &:active {
                    text-decoration: none;
                }
            }
        }
    }
</style>
