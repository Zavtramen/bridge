<template>
    <footer class="Footer">
        v2.0.4,
        <a href="https://github.com/ton-blockchain/bridge" target="_blank">{{$t('Bridge.sourceCode')}}</a>,
        <a href="https://ton.org/how-it-works/bridge" target="_blank">{{$t('Bridge.howItWorks')}}</a>,
        <a href="https://github.com/newton-blockchain/TIPs/issues/24" target="_blank">{{$t('Bridge.documentation')}}</a>.
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({})
</script>


<style lang="less" scoped>
@r: .Footer;

@{r} {
    text-align: center;
    font-size: 12px;
    color: @c-label;
    padding-bottom: 10px;

    a {
        color: @c-label;
        text-decoration: underline;

        .isPointer &:hover,
        .isTouch &:active {
            text-decoration: none;
        }
    }
}
</style>
