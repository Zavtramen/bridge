<template>
    <div class="CustomInput" :class="{ hasData, disabled, error: !!error, hasCopy, isDropdownOpened }">
        <input
            :disabled="disabled"
            :readonly="hasDropdown"
            :type="type"
            :id="'CustomInput-' + uuid"
            :inputmode="type === 'number' ? 'decimal' : 'text'"
            @input="$emit('changed')"
            @click="isDropdownOpened = true"
            @focus="isDropdownOpened = true"
            @focusout="onInputFocusOut"
            v-model="model">
        <div class="CustomInput-labelWrapper">
            <label :for="'CustomInput-' + uuid">{{ error || label }}</label>
        </div>
        <div class="CustomInput-arrow" v-if="hasDropdown"></div>
        <ul class="CustomInput-dropdown" v-if="hasDropdown">
            <li v-for="(item, index) in dropdown" :key="index">
                <button @click="onOptionClick(item.value)">{{ item.label }}</button>
            </li>
        </ul>
        <button class="CustomInput-copy" v-if="hasCopy" aria-label="copy" @click="onCopyClick"></button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

type ComponentData = {
    isDropdownOpened: boolean
}

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
        },
        dropdown: {
            type: Array,
            default: () => []
        }
    },

    data(): ComponentData {
        return {
            isDropdownOpened: false
        }
    },

    computed: {
        hasData(): boolean {
            return !!this.value;
        },
        model: {
            get(): string {
                if (this.hasDropdown) {
                    const item = this.dropdown.find(item => item.value === this.value);
                    return item?.label;
                } else {
                    return this.value;
                }
            },
            set(value: string): void {
                this.$emit('input', value);
            }
        },
        hasDropdown(): boolean {
            return !!this.dropdown?.length;
        }
    },

    methods: {
        onCopyClick(): void {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.value);
            }
        },
        onOptionClick(value: string): void {
            this.model = value;
            this.isDropdownOpened = false;
        },
        onInputFocusOut(e: FocusEvent): void {
            if (!this.hasDropdown) {
                return;
            }

            let elem = e.relatedTarget;
            for ( ; elem && elem !== document; elem = elem.parentNode ) {
                if ( elem === this.$el ) return;
            }

            this.isDropdownOpened = false;
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

    &-arrow {
        position: absolute;
        top: 50%;
        bottom: 0;
        right: 21px;
        height: 0;
        width: 0;
        color: @color-borders-input;
        border: solid currentColor;
        border-radius: 1px;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 5px;
        vertical-align: middle;
        margin-top: -9px;
        transform: rotate(45deg);
        transition: .2s all;
        pointer-events: none;
    }

    &-dropdown {
        background: #FFF;
        border-radius: 16px;
        box-shadow: 0px 8px 24px rgb(48 55 87 / 12%);
        box-sizing: border-box;
        color: #303757;
        font-size: 16px;
        left: 0;
        line-height: 20px;
        list-style-type: none;
        margin: 0;
        padding: 12px 24px;
        position: absolute;
        right: 0;
        top: 100%;
        word-break: break-word;
        white-space: normal;
        z-index: 1;
        text-align: left;

        transition: all 0 ease-in-out;
        opacity: 0;
        visibility: hidden;

        li {
            button {
                padding: 10px 0;
                color: #303757;
                font-weight: 700;
                cursor: pointer;
                width: 100%;

                .isPointer &:hover,
                .isTouch &:active,
                &:focus {
                    color: #1d98dc;
                }
            }
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

    &:not(.disabled) input:hover + &-labelWrapper label,
    &:not(.disabled) input:hover ~ &-arrow {
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

    &.isDropdownOpened &-arrow {
        color: @color-primary;
        margin-top: -4px;
        transform: rotate(225deg);
    }

    &.isDropdownOpened &-dropdown {
        transition: opacity 0.15s ease-in-out;
        opacity: 1;
        visibility: inherit;
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

    &-copy {
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
