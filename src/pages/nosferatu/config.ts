import { networkId } from "config/customConfig";
import { convertTokenIdentifierToTicker } from "./z/utils";

const ELROND_GATEWAY_URLS = {
    mainnet: "https://gateway.multiversx.com",
    devnet: "https://devnet-gateway.multiversx.com",
    testnet: "https://testnet-gateway.multiversx.com",
};
export const ELROND_GATEWAY_URL = ELROND_GATEWAY_URLS[networkId];
const ELROND_API_URLS = {
    mainnet: "https://api.multiversx.com",
    devnet: "https://devnet-api.multiversx.com",
    testnet: "https://testnet-api.multiversx.com",
};
export const ELROND_API_URL = ELROND_API_URLS[networkId];
const ELROND_EXPLORER_URLS = {
    mainnet: "https://explorer.multiversx.com",
    devnet: "https://devnet-explorer.multiversx.com",
    testnet: "https://testnet-explorer.multiversx.com",
};
export const ELROND_EXPLORER_URL = ELROND_EXPLORER_URLS[networkId];

export const ELROND_ACCESS_TIMEOUT = 10_000; // 10s

const IS_DEV = networkId as string != 'mainnet';
export const EGLD_WRAPPER_ADDRESS = [
    IS_DEV ? 'erd1qqqqqqqqqqqqqpgqd77fnev2sthnczp2lnfx0y5jdycynjfhzzgq6p3rax' : 'erd1qqqqqqqqqqqqqpgqvc7gdl0p4s97guh498wgz75k8sav6sjfjlwqh679jy', // shard 0
    IS_DEV ? 'erd1qqqqqqqqqqqqqpgq7ykazrzd905zvnlr88dpfw06677lxe9w0n4suz00uh' : 'erd1qqqqqqqqqqqqqpgqhe8t5jewej70zupmh44jurgn29psua5l2jps3ntjj3', // shard 1
    IS_DEV ? 'erd1qqqqqqqqqqqqqpgqfj3z3k4vlq7dc2928rxez0uhhlq46s6p4mtqerlxhc' : 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgutxm4teywre6dl8wqf58xamqdrukln', // shard 2
];

export const NOSFERATU_SC_ADDRESS = IS_DEV ? 'erd1qqqqqqqqqqqqqpgqsgn8hs6vrm75ptn6kkz5nlxhd6y3kxmt03asmzn4n7' : '';

export const FEE_DENOMINATOR = 10000;

export const USDC_DECIMALS = 6;

export const PRESALE_BUY_GAS_LIMIT = 50_000_000;

//
const DECIMALS_MAP: Record<string, number> = {
    'EGLD': 18,
    'WEGLD': 18,
    'USDC': 6,
    'VEGLD': 18,
    'MEX': 18,
    'ASH': 18,
    'CPA': 6,
};
export function getTokenDecimals(tokenId: string): number {
    const ticker = convertTokenIdentifierToTicker(tokenId);
    return DECIMALS_MAP[ticker] ? DECIMALS_MAP[ticker] : 18;
}
