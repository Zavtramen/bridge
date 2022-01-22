<template>
    <div class="CustomInput" :class="{ hasData, disabled, error: !!error, hasCopy }">
        <input
            :disabled="disabled"
            :type="type"
            :id="'CustomInput-' + uuid"
            :inputmode="type === 'number' ? 'decimal' : 'text'"
            @input="$emit('changed')"
            v-model="model">
        <div class="CustomInput-labelWrapper">
            <label :for="'CustomInput-' + uuid">{{ error || label }}</label>
        </div>
        <button v-if="hasCopy" aria-label="copy" @click="onCopyClick"></button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        hasCopy: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        hasData(): boolean {
            return !!this.value;
        },
        model: {
            get(): string {
                return this.value;
            },
            set(value: string): void {
                this.$emit('input', value);
            }
        }
    },

    methods: {
        onCopyClick(): void {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.value);
            }
        }
    }
})


</script>


<style lang="less" scoped>
@r: .CustomInput;

@{r} {
    @color-background: #FFF;
    @color-placeholders: #A2ACB4;
    @color-primary: rgb(51,144,236);
    @color-error: #e53935;
    @color-text-secondary: rgb(112,117,121);
    @color-borders-input: rgb(218,220,224);
    @color-text: #000;

    position: relative;
    margin-bottom: 24px;
    width: 100%;
    line-height: 1.5;


    @media (max-width: 600px) {
        &.hasCopy {
            width: calc(100% - 30px);
            align-self: flex-start;
        }
    }

    &-labelWrapper {
        position: absolute;
        left: 0;
        top: -10px;
        right: 16px;
        bottom: 0;
        overflow: hidden;
        pointer-events: none;
    }

    label {
        display: block;
        padding: 0 4px;
        position: absolute;
        left: 12px;
        top: 25.2px;
        background-color: @color-background;
        font-size: 16px;
        font-weight: 400;
        color: @color-placeholders;
        transition: transform .15s ease-out,color .15s ease-out;
        cursor: text;
        pointer-events: none;
        transform-origin: left center;
        white-space: nowrap;
        pointer-events: all;
    }

    input {
        display: block;
        width: 100%;
        height: 54px;
        padding: calc(12px - 1px) calc(14.4px - 1px);
        border: 1px solid @color-borders-input;
        border-radius: 12px;
        color: @color-text;
        background-color: @color-background;
        outline: none;
        transition: border-color .15s ease, 9999s background-color; // 9999s to skip browser styles for values
        word-break: break-word;
        -webkit-appearance: none;
        font-size: 16px;
        line-height: 20px;

         &[disabled] {
            color: @color-text-secondary;
        }
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }

    &:not(.disabled) input:hover + &-labelWrapper label {
        color: @color-primary;
    }

    &:not(.disabled) input:hover {
        border-color: @color-primary;
    }

    &:not(.disabled) input:focus {
        border-color: @color-primary;
        box-shadow: inset 0 0 0 1px @color-primary;
        caret-color: @color-primary;
    }

    &.hasData label,
    &.error label,
    &:not(.disabled) input:focus + &-labelWrapper label {
        transform: scale(0.75) translate(-8px, -36px);
    }

    &:not(.disabled) input:focus + &-labelWrapper label {
        color: @color-primary;
    }

    &:not(.disabled).hasData label {
        color: @color-text-secondary;
    }

    &:not(.disabled).error input {
        border-color: @color-error;
        box-shadow: inset 0 0 0 1px @color-error;
        caret-color: @color-error;
    }

    &:not(.disabled).error label {
        color: @color-error !important;
    }

    button {
        position: absolute;
        right: -30px;
        top: 50%;
        margin-top: -12px;
        -webkit-appearance: none;
        height: 24px;
        width: 24px;
        border: none;
        transition: 0.15s opacity;
        background-image: url('~assets/pics/copy.svg');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: 0 0;
        opacity: 0.4;

        .isPointer &:hover,
        .isTouch &:active {
            opacity: 0.75;
        }
    }
}
</style>
