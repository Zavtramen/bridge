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
        background-color: @c-background;
        font-size: 17px;
        color: @c-label;
        transition: transform @d-hover ease-out,color @d-hover ease-out;
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
        border: 1px solid @c-outline;
        border-radius: 8px;
        color: @c-text;
        background-color: @c-background;
        outline: none;
        transition: border-color @d-hover ease, 9999s background-color; // 9999s to skip browser styles for values
        word-break: break-word;
        -webkit-appearance: none;
        font-size: 17px;
        line-height: 20px;

         &[disabled] {
            color: @c-text-secondary;
            -webkit-text-fill-color: @c-text-secondary;
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
        color: @c-text;
        border: solid currentColor;
        border-radius: 1px;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 5px;
        vertical-align: middle;
        margin-top: -9px;
        transform: rotate(45deg);
        transition: @d-hover all;
        pointer-events: none;

        @media (max-width: 800px) {
            right: 18px;
        }

        @media (max-width: 400px) {
            right: 16px;
        }
    }

    &.disabled &-arrow {
        color: @c-text-secondary;
    }

    &-dropdown {
        background: @c-background;
        border-radius: 16px;
        box-shadow: 0px 8px 24px @c-panel-shadow;
        box-sizing: border-box;
        color: @c-text-light;
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
        z-index: @z-input-dropdown;
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
                color: @c-text-light;
                font-weight: 700;
                cursor: pointer;
                width: 100%;

                .isPointer &:hover,
                .isTouch &:active,
                &:focus {
                    color: @c-primary;
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
        color: @c-primary;
    }

    &:not(.disabled) input:hover {
        border-color: @c-primary;
    }

    &:not(.disabled) input:focus {
        border-color: @c-primary;
        box-shadow: inset 0 0 0 1px @c-primary;
        caret-color: @c-primary;
    }

    &.isDropdownOpened &-arrow {
        color: @c-primary;
        margin-top: -4px;
        transform: rotate(225deg);
    }

    &.isDropdownOpened &-dropdown {
        transition: opacity @d-hover ease-in-out;
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
        color: @c-primary;
    }

    &:not(.disabled).hasData label {
        color: @c-label;
    }

    &:not(.disabled).error input {
        border-color: @c-error;
        box-shadow: inset 0 0 0 1px @c-error;
        caret-color: @c-error;
    }

    &:not(.disabled).error label {
        color: @c-error !important;
    }
}
</style>
