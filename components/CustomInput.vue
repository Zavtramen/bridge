<template>
    <div class="CustomInput" :class="{ hasData, disabled, error: !!error && hasData, isDropdownOpened }">
        <input
            :disabled="disabled"
            :readonly="hasDropdown"
            :type="type"
            :id="'CustomInput-' + uuid"
            :inputmode="type === 'number' ? 'decimal' : 'text'"
            @input="$emit('changed')"
            @click="isDropdownOpened = true"
            @focus="isDropdownOpened = true"
            @blur="$emit('blur')"
            @focusout="onInputFocusOut"
            v-model="model">
        <div class="CustomInput-labelWrapper">
            <label :for="'CustomInput-' + uuid">{{ hasData && error || label }}</label>
        </div>
        <div class="CustomInput-arrow" v-if="hasDropdown"></div>
        <ul class="CustomInput-dropdown" v-if="hasDropdown">
            <li v-for="(item, index) in dropdown" :key="index">
                <button @click="onOptionClick(item.value)">{{ item.label }}</button>
            </li>
        </ul>
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
                type Item = {
                    label: string,
                    value: string
                };
                if (this.hasDropdown) {
                    const item: Item | undefined = (this.dropdown as Array<Item>).find((item: Item) => item.value === this.value);
                    return item?.label || '';
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
        onOptionClick(value: string): void {
            this.model = value;
            this.isDropdownOpened = false;
        },
        onInputFocusOut(e: FocusEvent): void {
            if (!this.hasDropdown) {
                return;
            }

            let elem = e.relatedTarget;
            for ( ; elem && elem !== document; elem = (<HTMLElement>elem).parentNode ) {
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
    @color-placeholders: #757575;
    @color-primary: rgb(51,144,236);
    @color-error: #e53935;
    @color-text-secondary: rgb(112,117,121);
    @color-borders-input: #AAA;
    @color-text: #222222;

    position: relative;
    margin-bottom: 30px;
    width: 100%;
    line-height: 1.5;

    @media (max-width: 800px) {
        margin-bottom: 28px;
    }

    @media (max-width: 400px) {
        margin-bottom: 26px;
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
        padding: 0 8px;
        position: absolute;
        left: 12px;
        top: 22px;
        background-color: @color-background;
        font-size: 17px;
        color: @color-placeholders;
        transition: transform .15s ease-out,color .15s ease-out;
        cursor: text;
        pointer-events: none;
        transform-origin: left center;
        white-space: nowrap;
        pointer-events: all;

        @media (max-width: 800px) {
            font-size: 15px;
            left: 8px;
            top: 21px;
            padding: 0 6px;
        }

        @media (max-width: 400px) {
            font-size: 14px;
            top: 22px;
        }
    }

    input {
        display: block;
        width: 100%;
        height: 50px;
        padding: 9px 18px;
        border: 1px solid @color-borders-input;
        border-radius: 8px;
        color: @color-text;
        background-color: @color-background;
        outline: none;
        transition: border-color .15s ease, 9999s background-color; // 9999s to skip browser styles for values
        word-break: break-word;
        -webkit-appearance: none;
        font-size: 17px;
        line-height: 20px;

         &[disabled] {
            color: @color-text-secondary;
            -webkit-text-fill-color: @color-text-secondary;
        }

        @media (max-width: 800px) {
            font-size: 15px;
            padding: 7px 14px;
            height: 46px;
        }

        @media (max-width: 400px) {
            font-size: 14px;
            padding: 7px 14px;
            height: 46px;
        }
    }

    &-arrow {
        position: absolute;
        top: 50%;
        bottom: 0;
        right: 22px;
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

        @media (max-width: 800px) {
            right: 18px;
        }

        @media (max-width: 400px) {
            right: 16px;
        }
    }

    &-dropdown {
        background: #FFF;
        border-radius: 16px;
        box-shadow: 0px 8px 24px rgba(48, 55, 87, 0.12);
        box-sizing: border-box;
        color: #303757;
        font-size: 17px;
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

        @media (max-width: 800px) {
            font-size: 15px;
            padding: 10px 20px;
        }

        @media (max-width: 400px) {
            font-size: 14px;
        }

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

                @media (max-width: 800px) {
                    padding: 8px 0;
                }

                @media (max-width: 400px) {
                    padding: 6px 0;
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
        transform: scale(0.85) translate(3px, -31px);

        @media (max-width: 800px) {
            transform: scale(0.85) translate(3px, -27px);
        }

        @media (max-width: 400px) {

        }
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
}
</style>
