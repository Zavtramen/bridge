declare module "tonweb" {
    import { BN } from 'types-bn'

    declare class Address {
        constructor(anyForm: string | Address)
        static isValid(anyForm: string | Address): boolean
        toString(isUserFriendly?: boolean, isUrlSafe?: boolean, isBounceable?: boolean, isTestOnly?: boolean): string
        hashPart: Uint8Array
        wc: number
    }

    declare class HttpProvider {
        constructor(host?: string, options?: {apiKey: string})
        sendImpl(apiUrl: string, request: any): Promise<any>
        send(method: string, params: any): Promise<any>
        getAddressInfo(address: string): Promise<any>
        getExtendedAddressInfo(address: string): Promise<any>
        getWalletInfo(address: string): Promise<any>
        getTransactions(address: string, limit?: number, lt?: number, hash?: string, to_lt?: number, archival?: boolean): Promise<any[]>
        getBalance(address: string): Promise<any>
        sendBoc(base64: string): Promise<any>
        sendQuery(query: any): Promise<any>
        getEstimateFee(query: any): Promise<any>
        call(address: string, method: string | number, params?: any[][]): Promise<any>
    }

    declare class TonWeb {
        constructor(provider: HttpProvider)
        provider: HttpProvider

        static utils: {
            BN: typeof BN,
            Address: typeof Address,
            base64ToBytes(base64: string): Uint8Array,
            bytesToHex(buffer: Uint8Array): string
        }

        static Address: typeof Address
        static boc: any // TODO
        static HttpProvider: typeof HttpProvider
    }

    export default TonWeb;
}
