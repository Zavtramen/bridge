<template>
    <div class="LayoutDefault">
        <Nuxt />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { primaryInput } from 'detect-it';

export default Vue.extend({
    name: 'LayoutDefault',

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

    body {
        font-family: 'Helvetica', 'Arial', 'sans-serif';
        -webkit-text-size-adjust: 100%;
    }

    a, a:hover, a:after, a:active, a:focus {
        color: #1d98dc;
        text-decoration: none;
        word-break: break-all;
    }

</style>
