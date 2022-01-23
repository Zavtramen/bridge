import TonWeb from 'tonweb';

export {
    getScript,
    getNumber,
    getBool,
    decToHex,
    parseAddressFromDec,
    supportsLocalStorage,
    parseChainId,
    getLegacyQueryString
};

function getScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        let script: HTMLScriptElement = document.createElement('script');
        const prior = document.getElementsByTagName('script')[0];
        script.async = true;

        script.onload = () => {
            script.onload = null;
            script.onerror = null;
            setTimeout(resolve, 0);
        };

        script.onerror = () => {
            script.onload = null;
            script.onerror = null;
            setTimeout(reject, 0);
        };

        script.src = src;
        prior.parentNode!.insertBefore(script, prior);
    })
}

function supportsLocalStorage(): boolean {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
}

function parseChainId(chainId: string | number): number {
    if (typeof chainId === 'number') {
        return chainId;
    } if (typeof chainId === 'string') {
        return parseInt(chainId, chainId.toLowerCase().startsWith('0x') ? 16 : 10);
    } else {
        return 0;
    }
}

function getNumber(pair: Array<string>): number {
    return parseInt(pair[1], 16);
}

function getBool(pair: Array<string>): boolean {
    return getNumber(pair) === 1;
}

function decToHex(dec: number): string {
    return '0x' + new TonWeb.utils.BN(dec).toString(16);
}

function parseAddressFromDec(data: any): string {
    return decToHex(data.number.number);
}


// web3@1.3.4 has an error in the algo for computing SHA
// it doesn't strictly check input string for valid HEX relying only for 0x prefix
// but the query string is formed that way: 0xBLOCKHASH + '_' + 0xTRANSACTIONHASH + '_' + LOGINDEX
// the keccak algo splits string to pairs of symbols, and treats them as hex bytes
// so _0 becames NaN, x7 becames NaN, d_ becames 13 (it only sees first d and skips invalid _)
// web3@1.6.1 has this error fixed, but for our case this means that we've got different hashes for different web3 versions
// and getLegacyQueryString code transforms query string in the way, that SHA from web3@1.6.1 can return the same exact value as web3@1.3.4
// for example:
// old one: 0xcad62a0e0090e30e0133586f86ed8b7d0d2eac5fa8ded73b8180931ff379b113_0x77e5617841b2d355fe588716b6f8f506b683e985fc98fdb819ddf566594d4cfd_64
// new one: 0xcad62a0e0090e30e0133586f86ed8b7d0d2eac5fa8ded73b8180931ff379b11300007e5617841b2d355fe588716b6f8f506b683e985fc98fdb819ddf566594d4cf0d64
// diff   :                                                                   ^^^^                                                              ^^
// btw, it's definitially a very bad idea for hash function to treat input as something other than string,
// have no idea why they are trying to work with 0x strings in a special way, like they are HEX numbers
function getLegacyQueryString(str: string): string {
    const strArr = str.split('');
    strArr[66] = '0';
    strArr[67] = '0';
    strArr[68] = '0';
    strArr[69] = '0';
    strArr[133] = strArr[132];
    strArr[132] = '0';
    return strArr.join('');
}
