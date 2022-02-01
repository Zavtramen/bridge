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
    z-index: @z-alert;
    padding: 16px;

    &-panel {
        position: relative;
        background: @c-background;
        box-sizing: border-box;
        padding: 16px;
        margin: 32px auto;
        box-shadow: 0px 8px 24px @c-panel-shadow;
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
            color: @c-primary;
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
            transition: background-color @d-hover, color @d-hover;
            text-decoration: none !important;

            .isPointer &:hover,
            .isTouch &:active {
                background-color: rgba(@c-primary, 0.08);
            }
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
