<template>
    <div class="LayoutDefault">
        <Nuxt/>

        <Alert
            v-if="alert"
            :title="alert.title"
            :message="alert.message"
            :buttonLabel="alert.buttonLabel"
            @close="alert = null"
        ></Alert>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { primaryInput } from 'detect-it';
import Alert from '~/components/Alert.vue';

type ComponentData = {
    alert: {title: string, message: string, buttonLabel: string} | null
}

export default Vue.extend({
    name: 'LayoutDefault',

    components: { Alert },

    head(): object {
        const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true });
        const canonicalUrl: string = i18nHead.link.filter((item: any) => item.rel === 'canonical')[0].href;

        return {
            htmlAttrs: {
              lang: 'en',
              translate: 'no',
              ...i18nHead.htmlAttrs
            },
            meta: [
                {
                    hid: 'google',
                    name: 'google',
                    content: 'notranslate'
                },
                {
                    hid: 'og:url',
                    name: 'og:url',
                    content: canonicalUrl
                },
                ...i18nHead.meta
            ],
            link: [
                {
                    hid: 'Google Fonts Apis Preconnect',
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com'
                },
                {
                    hid: 'Google Fonts Static Preconnect',
                    rel: 'preconnect',
                    crossorigin: true,
                    href: 'https://fonts.gstatic.com'
                },
                {
                    hid: 'Open Sans Font',
                    rel: 'stylesheet',
                    href: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@600;700&display=swap`
                },
                ...i18nHead.link
            ]
        }
    },

    data(): ComponentData {
        return {
            alert: null
        }
    },

    mounted() {
        // for active/hovers on touch/mouse devices
        document.documentElement.classList.add(primaryInput === 'touch' ? 'isTouch' : 'isPointer');

        this.$nuxt.$on('alert', (params: {title: string, message: string, buttonLabel: string}) => {
            this.alert = {...params};
        });
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
        -webkit-text-size-adjust: 100%;
        color: @c-text-light;
    }

    body, input, button {
        font-family: 'Open Sans', sans-serif;
        font-weight: 600;
    }

    a, a:hover, a:active {
        text-decoration: none;
        word-break: break-all;
    }
</style>
