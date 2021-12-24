import TonWeb from 'tonweb';

export { toUnit, fromUnit, getNumber, getBool, decToHex, parseAddressFromDec, supportsLocalStorage, parseChainId };

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
        return parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
    } else {
        return 0;
    }
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

