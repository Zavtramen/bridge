import TonWeb from 'tonweb';

export { httpGet, toUnit, fromUnit, getNumber, getBool, decToHex, parseAddressFromDec, supportsLocalStorage };

function supportsLocalStorage(): boolean {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
}

function httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Cache-Control', 'no-store, max-age=0');
        xhr.onload = e => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.statusText);
                }
            }
        }
        xhr.onerror = e => {
            reject(xhr.statusText);
        };
        xhr.send(null);
    })
}

function toUnit(n: number): number {
    return n * 1e9; // todo: BN
}

function fromUnit(n: number): number {
    return n / 1e9; // todo: BN
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

