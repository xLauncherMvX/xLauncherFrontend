export interface TokenInfoType {
    type: string,
    identifier: string,
    name: string,
    ticker: string,
    owner: string,
    decimals: number,
    assets: {
        website: string,
        pngUrl: string,
        svgUrl: string,
    },
    price: number,
    marketCap: number,
    supply: string,
    circulatingSupply: string,
    
    poolIndex: number,
}

export type TokenInfoMapType = Record<string, TokenInfoType>;
