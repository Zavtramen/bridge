export default () => {
    return new Promise(function(resolve) {
        resolve({
            'Bridge': require('@/lang/en/bridge.json')
        });
    });
};
