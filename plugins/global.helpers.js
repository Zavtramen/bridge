import Vue from 'vue'

let uuid = 0;

const Helpers = {
    install(Vue) {
        Vue.mixin({
            beforeCreate() {
                this.uuid = uuid.toString();
                uuid += 1;
            }
        })
    }
}

export default ({ store }) => {
    Vue.use(Helpers);
}
