<template>
    <transition name="AlertTransition" appear>
        <aside class="Alert">
            <div class="Alert-overlay" @click="close"></div>
            <div class="Alert-panel">
                <h2>{{ title }}</h2>
                <p>{{ message }}</p>
                <button @click="close">{{ buttonLabel }}</button>
            </div>
        </aside>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        buttonLabel: {
            type: String,
            required: true
        }
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
            this.$emit('close');
        },

    }
})
</script>


<style lang="less" scoped>
@r: .Alert;

@{r} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 4;
    padding: 16px;

    &-panel {
        position: relative;
        background: #FFF;
        box-sizing: border-box;
        padding: 16px;
        margin: 32px auto;
        box-shadow: 0px 8px 24px rgba(48, 55, 87, 0.12);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        max-width: 400px;

        h2 {
            font-size: 20px;
            text-align: left;
            margin-bottom: 16px;
        }

        p {
            font-size: 16px;
            text-align: left;
            margin-bottom: 16px;
        }

        button {
            align-self: flex-end;
            color: rgb(51, 144, 236);
            font-size: 16px;
            outline: none !important;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            border-radius: 12px;
            background-color: transparent;
            background-size: cover;
            padding: 10px;
            line-height: 1.2;
            cursor: pointer;
            text-transform: uppercase;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            transition: background-color .15s,color .15s;
            text-decoration: none !important;

            .isPointer &:hover,
            .isTouch &:active {
                background-color: rgba(74, 149, 214, 0.08);
            }
        }
    }

    &-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .25);
    }

    &Transition-enter,
    &Transition-leave-to {
        opacity: 0;
    }
    &Transition-enter-active,
    &Transition-leave-active, {
        transition: 0.1s opacity;
    }
    &Transition-enter-to,
    &Transition-leave, {
        opacity: 1;
    }
}
</style>
